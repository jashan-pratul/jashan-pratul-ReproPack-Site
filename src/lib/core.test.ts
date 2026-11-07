import { describe, expect, it } from "vitest";
import { bufferLevel, pushBounded } from "./buffer";
import { DEFAULT_FILTER, filterItems, parseQuery, type FilterState, type Searchable } from "./filter";
import { createSeedEvents, generateEvent, mulberry32 } from "./events";
import { redactValue } from "./redaction";
import { buildExport, exportFilename } from "./export";
import { SITE_CONFIG } from "../config/site";
import { LINKS } from "../config/links";

describe("pushBounded", () => {
  it("appends while under capacity", () => {
    expect(pushBounded([1, 2], [3], 5)).toEqual({ items: [1, 2, 3], evicted: 0 });
  });
  it("evicts oldest first when over capacity", () => {
    expect(pushBounded([1, 2, 3, 4], [5, 6, 7], 5)).toEqual({ items: [3, 4, 5, 6, 7], evicted: 2 });
  });
  it("handles bursts larger than capacity", () => {
    const r = pushBounded([1], [2, 3, 4, 5, 6, 7, 8], 3);
    expect(r.items).toEqual([6, 7, 8]);
    expect(r.evicted).toBe(5);
  });
  it("reports buffer level", () => {
    expect(bufferLevel(10, 500)).toBe("ok");
    expect(bufferLevel(400, 500)).toBe("high");
    expect(bufferLevel(500, 500)).toBe("full");
  });
});

const toSearchable = (redact: boolean): Searchable[] =>
  createSeedEvents(0).map((event) => ({
    event,
    displayPayload: redact ? redactValue(event.payload).value : event.payload,
    displayMessage: event.message,
  }));

const withQuery = (query: string, base: FilterState = DEFAULT_FILTER): FilterState => ({ ...base, query });

describe("parseQuery", () => {
  it("parses qualifiers, exclusions, fields and phrases", () => {
    const q = parseQuery('level:err src:man cat:net -retry status:502 "pay button"');
    expect(q.severities).toEqual(["error"]);
    expect(q.sources).toEqual(["manual"]);
    expect(q.categories).toEqual(["net"]);
    expect(q.exclude).toEqual(["retry"]);
    expect(q.fields).toEqual([{ key: "status", value: "502", negated: false }]);
    expect(q.include).toEqual(["pay button"]);
  });
});

describe("filterItems", () => {
  const items = toSearchable(true);

  it("returns everything with the default filter", () => {
    expect(filterItems(items, DEFAULT_FILTER)).toHaveLength(items.length);
  });
  it("respects severity chips", () => {
    const f: FilterState = { ...DEFAULT_FILTER, severities: new Set(["error"]) };
    expect(filterItems(items, f).every((i) => i.event.severity === "error")).toBe(true);
  });
  it("filters by payload field", () => {
    const r = filterItems(items, withQuery("status:502"));
    expect(r.length).toBe(2);
  });
  it("supports exclusion", () => {
    const r = filterItems(items, withQuery('status:502 -"retry 1"'));
    expect(r.length).toBe(1);
  });
  it("cannot surface redacted values while redaction is on", () => {
    expect(filterItems(items, withQuery("hunter2"))).toHaveLength(0);
    expect(filterItems(toSearchable(false), withQuery("hunter2"))).toHaveLength(1);
  });
});

describe("generateEvent", () => {
  it("is deterministic for a given seed", () => {
    const a = generateEvent(1, 0, mulberry32(42));
    const b = generateEvent(1, 0, mulberry32(42));
    expect(a).toEqual(b);
  });
});

describe("buildExport", () => {
  it("produces a labelled, redaction-aware document", () => {
    const items = toSearchable(true).map((s) => ({ ...s, findings: redactValue(s.event.payload).findings }));
    const doc = buildExport(items, {
      redactionEnabled: true,
      sessionId: "ses_test",
      sessionStartedAt: 0,
      capacity: 500,
      evictedCount: 0,
      bufferedCount: items.length,
      filter: { severities: ["info", "warn", "error"], sources: ["integration", "manual"], query: "" },
      now: 0,
    });
    expect(doc.format).toBe("repropack-site-demo-export");
    expect(doc.eventCount).toBe(items.length);
    expect(doc.redaction.findingsCount).toBeGreaterThan(0);
    expect(JSON.stringify(doc)).not.toContain("hunter2");
    expect(exportFilename("ses_test", 0)).toBe("repropack-ses_test-1970-01-01T00-00-00Z.json");
  });
});

describe("support configuration", () => {
  it("exposes official support email and mailto link", () => {
    expect(SITE_CONFIG.supportEmail).toBe("repropacksupport@gmail.com");
    expect(LINKS.supportEmail).toBe("repropacksupport@gmail.com");
    expect(LINKS.supportMailto).toBe("mailto:repropacksupport@gmail.com");
  });
});
