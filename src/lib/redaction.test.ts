import { describe, expect, it } from "vitest";
import { findMatches, isSensitiveKey, luhnValid, redactString, redactValue, segmentString, parseMarker } from "./redaction";
import { createSeedEvents } from "./events";

describe("luhnValid", () => {
  it("accepts known test card numbers", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4111111111111111")).toBe(true);
  });
  it("rejects near misses", () => {
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("")).toBe(false);
  });
});

describe("pattern rules", () => {
  const demoStripeKey = ["sk", "test", "51DemoKeyNotReal9xQ2"].join("_");
  const demoGhToken = ["ghp", "DemoTokenOnlyForTheWebsite0000000000"].join("_");
  const cases: Array<[string, string, string]> = [
    ["email", "contact dana.reyes@example.com now", "dana.reyes@example.com"],
    ["jwt", "t=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1In0.c2lnbmF0dXJl", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1In0.c2lnbmF0dXJl"],
    ["bearer", "Authorization: Bearer abc123def456", "abc123def456"],
    ["api-key", `key ${demoStripeKey} here`, demoStripeKey],
    ["api-key", demoGhToken, demoGhToken],
    ["url-secret", "https://x.test/a?session_token=st_8f2k&currency=GBP", "st_8f2k"],
    ["card", "card 4111-1111-1111-1111 tried", "4111-1111-1111-1111"],
    ["phone", "call +447700900123", "+447700900123"],
    ["ipv4", "upstream 10.20.4.17 failed", "10.20.4.17"],
  ];
  it.each(cases)("detects %s", (rule, input, secret) => {
    const matches = findMatches(input);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.rule).toBe(rule);
    expect(matches[0]?.original).toBe(secret);
  });

  it("does not flag non-Luhn digit runs or version strings", () => {
    expect(findMatches("order 1234567890123 shipped")).toHaveLength(0);
    expect(findMatches("build web@4.12.0")).toHaveLength(0);
  });

  it("prefers the JWT over the bearer match when they overlap", () => {
    const m = findMatches("Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1In0.c2lnbmF0dXJl");
    expect(m).toHaveLength(1);
    expect(m[0]?.rule).toBe("jwt");
  });

  it("replaces matches with typed markers and keeps surrounding text", () => {
    const { output } = redactString("mail dana@example.com from 10.0.0.1");
    expect(output).toBe("mail [REDACTED:email] from [REDACTED:ipv4]");
    expect(parseMarker("[REDACTED:email]")).toBe("email");
    expect(parseMarker("hello")).toBeNull();
  });

  it("segments strings in reveal mode without altering the text", () => {
    const input = "mail dana@example.com ok";
    const segs = segmentString(input, true);
    expect(segs.map((s) => s.text).join("")).toBe(input);
    expect(segs.find((s) => s.rule)?.rule).toBe("email");
  });
});

describe("isSensitiveKey", () => {
  it.each(["password", "api_key", "apiKey", "authorization", "cookie", "ghToken", "cardNumber", "cvv", "client_secret"])("flags %s", (k) =>
    expect(isSensitiveKey(k)).toBe(true),
  );
  it.each(["author", "email", "status", "durationMs", "url"])("ignores %s", (k) => expect(isSensitiveKey(k)).toBe(false));
});

describe("redactValue", () => {
  it("redacts by key and by value pattern, reporting JSON paths", () => {
    const { value, findings } = redactValue({
      password: "hunter2",
      user: { email: "a@b.co", tags: ["ok", "10.1.2.3"] },
      count: 3,
      empty: null,
    });
    expect(value).toEqual({
      password: "[REDACTED:sensitive-key]",
      user: { email: "[REDACTED:email]", tags: ["ok", "[REDACTED:ipv4]"] },
      count: 3,
      empty: null,
    });
    expect(findings.map((f) => f.path).sort()).toEqual(["password", "user.email", "user.tags[1]"]);
  });

  it("finds every seeded secret in the demo scenario", () => {
    const events = createSeedEvents(0);
    const all = events.flatMap((e) => redactValue(e.payload).findings);
    const rules = new Set(all.map((f) => f.rule));
    for (const r of ["sensitive-key", "jwt", "email", "card", "phone", "ipv4", "url-secret"] as const) {
      expect(rules.has(r)).toBe(true);
    }
    // Nothing that looks like a raw secret should survive redaction.
    const serialized = JSON.stringify(events.map((e) => redactValue(e.payload).value));
    expect(serialized).not.toMatch(/hunter2|sk_test_|ghp_|eyJhbGci|4242 4242|dana\.reyes@/);
  });
});
