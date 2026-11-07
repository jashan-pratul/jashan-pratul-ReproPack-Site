/**
 * Live event filtering with a tiny query language.
 *
 *   level:error        severity filter (aliases: severity:, sev:, l:)
 *   source:manual      source filter (alias: src:)
 *   cat:network        category filter (alias: category:)
 *   status:502         any other key:value matches a payload field at any depth
 *   -text              exclude events containing "text"
 *   "quoted phrase"    exact phrase
 *   anything else      case-insensitive substring over message, id, category and payload
 *
 * Filtering always runs over the *displayed* representation — when redaction
 * is enabled, searching cannot surface values that are hidden on screen.
 */
import { SEVERITIES, SOURCES, type DiagnosticEvent, type EventSource, type JsonObject, type Severity } from "./events";

export interface ParsedQuery {
  severities: Severity[];
  sources: EventSource[];
  categories: string[];
  include: string[];
  exclude: string[];
  fields: { key: string; value: string; negated: boolean }[];
}

const SEVERITY_ALIASES: Record<string, Severity> = {
  info: "info",
  i: "info",
  warn: "warn",
  warning: "warn",
  w: "warn",
  error: "error",
  err: "error",
  e: "error",
};

export function tokenize(query: string): string[] {
  const tokens: string[] = [];
  const re = /(-?)(?:([a-z]+):)?(?:"([^"]*)"|(\S+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(query)) !== null) {
    const [, neg, key, quoted, bare] = m;
    const value = quoted ?? bare ?? "";
    tokens.push(`${neg ?? ""}${key ? `${key.toLowerCase()}:` : ""}${quoted !== undefined ? `"${value}"` : value}`);
  }
  return tokens;
}

function unquote(v: string): string {
  return v.startsWith('"') && v.endsWith('"') && v.length >= 2 ? v.slice(1, -1) : v;
}

export function parseQuery(query: string): ParsedQuery {
  const parsed: ParsedQuery = { severities: [], sources: [], categories: [], include: [], exclude: [], fields: [] };
  for (const raw of tokenize(query.trim())) {
    const negated = raw.startsWith("-") && raw.length > 1;
    const token = negated ? raw.slice(1) : raw;
    const colon = token.indexOf(":");
    const key = colon > 0 && !token.startsWith('"') ? token.slice(0, colon) : "";
    const value = unquote(key ? token.slice(colon + 1) : token).toLowerCase();
    if (!value) continue;

    if (!negated && ["level", "severity", "sev", "l"].includes(key)) {
      const sev = SEVERITY_ALIASES[value];
      if (sev && !parsed.severities.includes(sev)) parsed.severities.push(sev);
      continue;
    }
    if (!negated && ["source", "src"].includes(key)) {
      const src = SOURCES.find((s) => s.startsWith(value));
      if (src && !parsed.sources.includes(src)) parsed.sources.push(src);
      continue;
    }
    if (!negated && ["cat", "category"].includes(key)) {
      parsed.categories.push(value);
      continue;
    }
    if (key) {
      parsed.fields.push({ key: key.toLowerCase(), value, negated });
      continue;
    }
    (negated ? parsed.exclude : parsed.include).push(value);
  }
  return parsed;
}

export interface FilterState {
  /** Severities toggled on via chips. Empty = none shown. */
  severities: ReadonlySet<Severity>;
  sources: ReadonlySet<EventSource>;
  query: string;
}

export const DEFAULT_FILTER: FilterState = {
  severities: new Set(SEVERITIES),
  sources: new Set(SOURCES),
  query: "",
};

export interface Searchable {
  event: DiagnosticEvent;
  /** Payload as displayed (redacted or raw). */
  displayPayload: JsonObject;
  displayMessage: string;
}

export function haystack(item: Searchable): string {
  const { event } = item;
  return `${item.displayMessage}\n${event.id}\n${event.category}\n${event.source}\n${event.severity}\n${JSON.stringify(item.displayPayload)}`.toLowerCase();
}

/** Collect stringified values of every field named `key` (case-insensitive) at any depth. */
export function fieldValues(value: unknown, key: string, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => fieldValues(v, key, out));
  else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k.toLowerCase() === key) out.push((typeof v === "string" ? v : JSON.stringify(v)).toLowerCase());
      fieldValues(v, key, out);
    }
  }
  return out;
}

export function matchesFilter(item: Searchable, filter: FilterState, parsed: ParsedQuery = parseQuery(filter.query)): boolean {
  const { event } = item;
  if (!filter.severities.has(event.severity)) return false;
  if (!filter.sources.has(event.source)) return false;
  if (parsed.severities.length && !parsed.severities.includes(event.severity)) return false;
  if (parsed.sources.length && !parsed.sources.includes(event.source)) return false;
  if (parsed.categories.length && !parsed.categories.some((c) => event.category.toLowerCase().startsWith(c))) return false;
  if (parsed.include.length || parsed.exclude.length) {
    const text = haystack(item);
    if (!parsed.include.every((t) => text.includes(t))) return false;
    if (parsed.exclude.some((t) => text.includes(t))) return false;
  }
  for (const f of parsed.fields) {
    const hit = fieldValues(item.displayPayload, f.key).some((v) => v.includes(f.value));
    if (hit === f.negated) return false;
  }
  return true;
}

export function filterItems<T extends Searchable>(items: readonly T[], filter: FilterState): T[] {
  const parsed = parseQuery(filter.query);
  return items.filter((item) => matchesFilter(item, filter, parsed));
}

export function countBySeverity(items: readonly Searchable[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { info: 0, warn: 0, error: 0 };
  for (const { event } of items) counts[event.severity]++;
  return counts;
}

export function isFilterActive(filter: FilterState): boolean {
  return filter.query.trim() !== "" || filter.severities.size !== SEVERITIES.length || filter.sources.size !== SOURCES.length;
}
