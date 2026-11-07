/**
 * Heuristic redaction engine (website demo implementation).
 *
 * This is pattern-based and best-effort by design. It WILL miss sensitive data
 * that does not match a known shape, and it can occasionally redact harmless
 * values that look sensitive. It is not a security or compliance control.
 */
import type { JsonValue } from "./events";

export type RedactionRuleId =
  | "sensitive-key"
  | "jwt"
  | "bearer"
  | "api-key"
  | "url-secret"
  | "email"
  | "card"
  | "phone"
  | "ipv4";

export interface RedactionRule {
  id: RedactionRuleId;
  label: string;
  description: string;
  /** Example input that triggers the rule (used by docs and tests). */
  example: string;
}

export const RULES: readonly RedactionRule[] = [
  {
    id: "sensitive-key",
    label: "Sensitive key names",
    description: "Whole value replaced when the key looks like password, secret, token, api_key, authorization, cookie, cvv…",
    example: '{ "password": "hunter2" }',
  },
  { id: "jwt", label: "JSON Web Tokens", description: "Three base64url segments starting with eyJ.", example: "eyJhbGciOi.eyJzdWIi.c2ln" },
  { id: "bearer", label: "Bearer credentials", description: "Values following the Bearer scheme.", example: "Bearer abc123.def" },
  {
    id: "api-key",
    label: "Known key prefixes",
    description: "Common provider prefixes such as sk_live_, sk_test_, ghp_, github_pat_, xoxb-, AKIA…",
    example: "sk_test_51Abc…",
  },
  {
    id: "url-secret",
    label: "Secret query params",
    description: "Query parameter values whose name contains token, key, secret, password, auth, session or sig.",
    example: "?session_token=abc",
  },
  { id: "email", label: "Email addresses", description: "Typical local@domain.tld shapes.", example: "dana@example.com" },
  {
    id: "card",
    label: "Payment card numbers",
    description: "13–19 digit sequences (spaces/dashes allowed) that pass a Luhn checksum.",
    example: "4242 4242 4242 4242",
  },
  { id: "phone", label: "E.164 phone numbers", description: "International format: + followed by 8–15 digits.", example: "+447700900123" },
  { id: "ipv4", label: "IPv4 addresses", description: "Dotted quads with octets 0–255.", example: "10.20.4.17" },
] as const;

export const RULE_BY_ID: Record<RedactionRuleId, RedactionRule> = Object.fromEntries(RULES.map((r) => [r.id, r])) as Record<
  RedactionRuleId,
  RedactionRule
>;

export const REDACTED_PREFIX = "[REDACTED:";

export function redactionMarker(rule: RedactionRuleId): string {
  return `${REDACTED_PREFIX}${rule}]`;
}

const MARKER_RE = /^\[REDACTED:([a-z0-9-]+)\]$/;
export function parseMarker(value: string): RedactionRuleId | null {
  const m = MARKER_RE.exec(value);
  return m ? (m[1] as RedactionRuleId) : null;
}

/* ------------------------------------------------------------------------ */
/* Key-name heuristic                                                       */
/* ------------------------------------------------------------------------ */

const SENSITIVE_KEY_RE =
  /(pass(word|wd|phrase)?|secret|token|api[-_]?key|apikey|access[-_]?key|private[-_]?key|auth(orization)?|cookie|session[-_]?id|^sid$|credential|cvv|cvc|ssn|card[-_]?number)/i;

/** Keys that contain a sensitive substring but are known to be harmless. */
const SAFE_KEYS = new Set(["author", "authorName", "authored", "tokens_used", "tokenCount"]);

export function isSensitiveKey(key: string): boolean {
  if (SAFE_KEYS.has(key)) return false;
  return SENSITIVE_KEY_RE.test(key);
}

/* ------------------------------------------------------------------------ */
/* Value patterns                                                           */
/* ------------------------------------------------------------------------ */

export function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

interface PatternRule {
  id: RedactionRuleId;
  /** Must be global. */
  re: RegExp;
  /** Optional: which capture group contains the secret (defaults to whole match). */
  group?: number;
  validate?: (match: string) => boolean;
}

// Order matters only as a tie-breaker; overlap resolution prefers the earliest, then longest match.
const PATTERNS: PatternRule[] = [
  { id: "jwt", re: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g },
  { id: "bearer", re: /\bBearer\s+([A-Za-z0-9._~+/-]{6,}=*)/gi, group: 1 },
  {
    id: "api-key",
    re: /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{8,}|\bgh[pousr]_[A-Za-z0-9]{20,}|\bgithub_pat_[A-Za-z0-9_]{20,}|\bxox[abprs]-[A-Za-z0-9-]{10,}|\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: "url-secret",
    re: /[?&#][^=&#\s]*(?:token|key|secret|password|passwd|auth|session|sig)[^=&#\s]*=([^&#\s"']+)/gi,
    group: 1,
  },
  { id: "email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  {
    id: "card",
    re: /\b(?:\d[ -]?){12,18}\d\b/g,
    validate: (m) => {
      const digits = m.replace(/[ -]/g, "");
      return digits.length >= 13 && digits.length <= 19 && luhnValid(digits);
    },
  },
  { id: "phone", re: /(?<![\w+])\+[1-9]\d{7,14}\b/g },
  {
    id: "ipv4",
    re: /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g,
  },
];

export interface StringMatch {
  start: number;
  end: number;
  rule: RedactionRuleId;
  original: string;
}

export interface RedactionOptions {
  /** Restrict to these rules. Omit to run every rule. */
  rules?: ReadonlySet<RedactionRuleId>;
}

const ruleOn = (id: RedactionRuleId, opts?: RedactionOptions) => !opts?.rules || opts.rules.has(id);

/** Find all non-overlapping sensitive spans in a string. */
export function findMatches(input: string, opts?: RedactionOptions): StringMatch[] {
  const candidates: StringMatch[] = [];
  PATTERNS.forEach((p) => {
    if (!ruleOn(p.id, opts)) return;
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(input)) !== null) {
      if (m[0].length === 0) {
        p.re.lastIndex++;
        continue;
      }
      let start = m.index;
      let text = m[0];
      if (p.group !== undefined && m[p.group] !== undefined) {
        const groupText = m[p.group] as string;
        start = m.index + m[0].lastIndexOf(groupText);
        text = groupText;
      }
      if (p.validate && !p.validate(text)) continue;
      candidates.push({ start, end: start + text.length, rule: p.id, original: text });
    }
  });

  candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const result: StringMatch[] = [];
  let cursor = -1;
  for (const c of candidates) {
    if (c.start >= cursor) {
      result.push(c);
      cursor = c.end;
    }
  }
  return result;
}

export interface Segment {
  text: string;
  /** Set when this segment is a redaction marker (in redacted mode) or the sensitive original (in reveal mode). */
  rule?: RedactionRuleId;
  original?: string;
}

/**
 * Split a string into plain and redacted segments.
 * @param reveal when true, sensitive segments keep their original text (still tagged with the rule).
 */
export function segmentString(input: string, reveal = false, opts?: RedactionOptions): Segment[] {
  const matches = findMatches(input, opts);
  if (matches.length === 0) return [{ text: input }];
  const out: Segment[] = [];
  let pos = 0;
  for (const m of matches) {
    if (m.start > pos) out.push({ text: input.slice(pos, m.start) });
    out.push({ text: reveal ? m.original : redactionMarker(m.rule), rule: m.rule, original: m.original });
    pos = m.end;
  }
  if (pos < input.length) out.push({ text: input.slice(pos) });
  return out;
}

export function redactString(input: string, opts?: RedactionOptions): { output: string; matches: StringMatch[] } {
  const matches = findMatches(input, opts);
  if (matches.length === 0) return { output: input, matches };
  let output = "";
  let pos = 0;
  for (const m of matches) {
    output += input.slice(pos, m.start) + redactionMarker(m.rule);
    pos = m.end;
  }
  output += input.slice(pos);
  return { output, matches };
}

/* ------------------------------------------------------------------------ */
/* Deep JSON redaction                                                      */
/* ------------------------------------------------------------------------ */

export interface Finding {
  /** JSON path, e.g. `payload.headers.authorization`. */
  path: string;
  rule: RedactionRuleId;
}

export interface RedactionResult<T extends JsonValue = JsonValue> {
  value: T;
  findings: Finding[];
}

function joinPath(base: string, key: string | number): string {
  if (typeof key === "number") return `${base}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key) ? (base ? `${base}.${key}` : key) : `${base}[${JSON.stringify(key)}]`;
}

export function redactValue<T extends JsonValue>(value: T, path = "", opts?: RedactionOptions): RedactionResult<T> {
  const findings: Finding[] = [];

  const walk = (v: JsonValue, p: string, keyHint?: string): JsonValue => {
    if (keyHint !== undefined && ruleOn("sensitive-key", opts) && isSensitiveKey(keyHint) && v !== null && typeof v !== "object" && v !== "") {
      findings.push({ path: p, rule: "sensitive-key" });
      return redactionMarker("sensitive-key");
    }
    if (typeof v === "string") {
      const { output, matches } = redactString(v, opts);
      matches.forEach((m) => findings.push({ path: p, rule: m.rule }));
      return output;
    }
    if (Array.isArray(v)) return v.map((item, i) => walk(item, joinPath(p, i)));
    if (v !== null && typeof v === "object") {
      const out: { [k: string]: JsonValue } = {};
      for (const [k, child] of Object.entries(v)) out[k] = walk(child, joinPath(p, k), k);
      return out;
    }
    return v;
  };

  return { value: walk(value, path) as T, findings };
}

export function summarizeFindings(findings: Finding[]): Partial<Record<RedactionRuleId, number>> {
  const out: Partial<Record<RedactionRuleId, number>> = {};
  for (const f of findings) out[f.rule] = (out[f.rule] ?? 0) + 1;
  return out;
}

/** Split a string that may contain `[REDACTED:rule]` markers into display segments. */
export function segmentMarkers(input: string): Segment[] {
  const re = /\[REDACTED:([a-z0-9-]+)\]/g;
  const out: Segment[] = [];
  let pos = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    if (m.index > pos) out.push({ text: input.slice(pos, m.index) });
    out.push({ text: m[0], rule: m[1] as RedactionRuleId });
    pos = m.index + m[0].length;
  }
  if (pos < input.length || out.length === 0) out.push({ text: input.slice(pos) });
  return out;
}
