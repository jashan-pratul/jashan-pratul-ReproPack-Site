import { useMemo, useState } from "react";
import type { JsonValue } from "../../lib/events";
import { copyText } from "../../lib/clipboard";
import { findMatches, redactString, redactValue, RULES, segmentMarkers, type RedactionRuleId } from "../../lib/redaction";
import { IconAlert, IconCheck, IconCopy } from "../ui/Icons";
import { Section } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

const DEMO_STRIPE_KEY = ["sk", "test", "51DemoOnlyNotARealKey123"].join("_");

const PRESETS: { id: string; label: string; value: string }[] = [
  {
    id: "log",
    label: "Log lines",
    value: `[auth] login ok for dana.reyes@example.com from 192.168.1.24
[http] GET https://api.example.test/v1/me?access_token=at_9Qm2xL7p&lang=en
[http] Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vIn0.ZGVtb3NpZw
[billing] retry with card 4242 4242 4242 4242 (exp 04/29)
[support] customer said: "I'm Dana, I live at 14 Elm Road" — call +447700900123
[config] STRIPE=${DEMO_STRIPE_KEY}`,
  },
  {
    id: "json",
    label: "JSON payload",
    value: `{
  "user": { "id": "u_10482", "email": "dana.reyes@example.com", "name": "Dana Reyes" },
  "request": {
    "url": "https://api.example.test/checkout?session_id=s_8812&step=2",
    "headers": { "authorization": "Bearer tok_live_demo_abc123", "x-request-id": "req_77a1" }
  },
  "password": "correct horse battery staple",
  "card": { "number": "4111 1111 1111 1111", "cvc": "123" },
  "upstream": "10.20.4.17",
  "notes": "base64: ZGFuYUBleGFtcGxlLmNvbQ=="
}`,
  },
  {
    id: "clean",
    label: "Nothing sensitive",
    value: `[ui] route change /cart → /checkout in 182ms
[perf] LCP 1.9s, CLS 0.02
[build] web@4.12.0 (commit 3fa9c1e)`,
  },
];

type LabResult = {
  mode: "text" | "json";
  output: string;
  findings: { rule: RedactionRuleId; where: string; original?: string }[];
};

function runLab(input: string, rules: ReadonlySet<RedactionRuleId>): LabResult {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as JsonValue;
      const { value, findings } = redactValue(parsed, "$", { rules });
      return { mode: "json", output: JSON.stringify(value, null, 2), findings: findings.map((f) => ({ rule: f.rule, where: f.path })) };
    } catch {
      /* not JSON — fall through to text mode */
    }
  }
  const { output } = redactString(input, { rules });
  const lines = input.split("\n");
  const lineStarts: number[] = [];
  lines.reduce((acc, l) => {
    lineStarts.push(acc);
    return acc + l.length + 1;
  }, 0);
  const findings = findMatches(input, { rules }).map((m) => {
    let line = 0;
    while (line + 1 < lineStarts.length && (lineStarts[line + 1] as number) <= m.start) line++;
    return { rule: m.rule, where: `L${line + 1}:${m.start - (lineStarts[line] as number) + 1}`, original: m.original };
  });
  return { mode: "text", output, findings };
}

export function RedactionLab() {
  const toast = useToast();
  const [input, setInput] = useState(PRESETS[0]?.value ?? "");
  const [enabled, setEnabled] = useState<Set<RedactionRuleId>>(() => new Set(RULES.map((r) => r.id)));
  const result = useMemo(() => runLab(input, enabled), [input, enabled]);

  const counts = useMemo(() => {
    // Count with every rule on, so disabled rules still show what they *would* catch.
    const all = runLab(input, new Set(RULES.map((r) => r.id)));
    const c: Partial<Record<RedactionRuleId, number>> = {};
    all.findings.forEach((f) => (c[f.rule] = (c[f.rule] ?? 0) + 1));
    return c;
  }, [input]);

  const toggleRule = (id: RedactionRuleId) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const segments = segmentMarkers(result.output);

  return (
    <Section
      id="redaction"
      index="05"
      eyebrow="Heuristic redaction"
      title="Best-effort masking you can see working."
      lede="Paste a log line or JSON payload. The same pattern rules used by the playground run live in your browser — including where they fall short."
    >
      <div className="lab card">
        <div className="lab__pane">
          <div className="lab__pane-head">
            <span className="mono">input</span>
            <div className="lab__presets" role="group" aria-label="Sample inputs">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`chip chip--source ${input === p.value ? "is-on" : ""}`}
                  aria-pressed={input === p.value}
                  onClick={() => setInput(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label className="sr-only" htmlFor="lab-input">
            Text or JSON to redact
          </label>
          <textarea
            id="lab-input"
            className="lab__input mono"
            value={input}
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste text or JSON…"
          />
        </div>

        <div className="lab__pane lab__pane--out">
          <div className="lab__pane-head">
            <span className="mono">
              output <span className="text-muted">· {result.mode === "json" ? "parsed as JSON (keys + values)" : "text (values)"}</span>
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={async () => {
                const ok = await copyText(result.output);
                toast.show(ok ? { tone: "success", title: "Redacted output copied" } : { tone: "warn", title: "Clipboard unavailable" });
              }}
            >
              <IconCopy size={13} /> Copy
            </button>
          </div>
          <pre className="lab__output mono" aria-live="polite" tabIndex={0}>
            {segments.map((s, i) =>
              s.rule ? (
                <span key={i} className="json-redacted">
                  {s.text}
                </span>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
          </pre>
          <div className="lab__summary mono">
            {result.findings.length === 0 ? (
              <span className="text-muted">No matches. That doesn't mean the input is safe — see limitations below.</span>
            ) : (
              <span>
                <span className="text-redacted">{result.findings.length}</span> value{result.findings.length === 1 ? "" : "s"} masked
              </span>
            )}
          </div>
        </div>

        <div className="lab__rules">
          <div className="lab__rules-head">
            <span className="mono">rules</span>
            <span className="text-muted">Toggle a rule to see what it's responsible for.</span>
          </div>
          <ul className="rules">
            {RULES.map((r) => {
              const on = enabled.has(r.id);
              const n = counts[r.id] ?? 0;
              return (
                <li key={r.id}>
                  <button type="button" className={`rule ${on ? "is-on" : ""}`} aria-pressed={on} onClick={() => toggleRule(r.id)}>
                    <span className="rule__check">{on && <IconCheck size={11} />}</span>
                    <span className="rule__body">
                      <span className="rule__label">{r.label}</span>
                      <span className="rule__desc">{r.description}</span>
                    </span>
                    <span className={`rule__count mono ${n > 0 ? "has-hits" : ""}`}>{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="lab__caveat callout callout--warn">
        <IconAlert size={16} />
        <div>
          <strong>Heuristic means incomplete.</strong> In the samples above, the name “Dana Reyes”, the street address and the base64-encoded
          email pass straight through. Pattern rules can't recognise free-form personal details, unusual secret formats, encoded or compressed
          values, or data inside images. Redaction reduces accidental exposure; it does not guarantee that an export is free of sensitive data,
          and it is not a security or compliance control. Review exports before you share them.
        </div>
      </div>
    </Section>
  );
}
