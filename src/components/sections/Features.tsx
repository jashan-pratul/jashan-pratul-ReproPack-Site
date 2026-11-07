import { useState } from "react";
import { SITE_CONFIG } from "../../config/site";
import {
  IconAlert,
  IconClock,
  IconDatabase,
  IconFileJson,
  IconFilter,
  IconRadio,
  IconShield,
} from "../ui/Icons";
import { Section } from "../ui/Primitives";

const MINI_EVENTS = [
  { id: 1, sev: "info" as const, cat: "auth", text: "token_refresh ok" },
  { id: 2, sev: "warn" as const, cat: "network", text: "quote latency 2840ms" },
  { id: 3, sev: "error" as const, cat: "checkout", text: "confirm 502 gateway" },
];

export function Features() {
  // Interactive state for functional micro-UI illustrations
  const [emittedCount, setEmittedCount] = useState(3);
  const [activeDeltaIdx, setActiveDeltaIdx] = useState(2);
  const [miniSev, setMiniSev] = useState<"all" | "warn" | "error">("all");
  const [miniMasked, setMiniMasked] = useState(true);
  const [fifoEvicted, setFifoEvicted] = useState(12);

  const deltas = [
    { step: "session.start", offset: "00.000s", delta: "Δ 0ms" },
    { step: "cart.fetch", offset: "00.182s", delta: "Δ +182ms" },
    { step: "payment.confirm", offset: "02.602s", delta: "Δ +2,420ms" },
    { step: "error.boundary", offset: "02.610s", delta: "Δ +8ms" },
  ];

  const filteredMini = MINI_EVENTS.filter((e) => miniSev === "all" || e.sev === miniSev);

  return (
    <Section
      id="features"
      index="03"
      eyebrow="Core Capabilities"
      title="Six diagnostic primitives. Zero cloud overhead."
      lede="Every capability is scoped to local developer investigation — intentional event capture, millisecond inspection, fast filtering, heuristic masking, and clean JSON export."
    >
      <div className="bento">
        {/* 1. Diagnostic Event Recording (Span 4) */}
        <article className="card bento__card bento__card--span-4">
          <div className="bento__head">
            <span className="bento__icon">
              <IconRadio size={15} />
            </span>
            <span className="mono bento__index">01 :: EXPLICIT CAPTURE</span>
          </div>
          <h3>Diagnostic Event Recording</h3>
          <p>
            Events enter the session only through supported integrations or explicit manual instrumentation calls — never via passive background
            tab scraping.
          </p>

          {/* Micro-UI: Explicit Instrumentation Signal Diagram + Trigger */}
          <div className="micro-ui micro-capture mono">
            <div className="micro-capture__code">
              <span className="text-muted">// illustrative instrumentation call</span>
              <div>
                <span className="json-key">repropack</span>.<span className="json-bool">record</span>(
                <span className="json-string">"checkout.retry"</span>, {"{ "}
                <span className="json-key">attempt</span>: <span className="json-number">{emittedCount}</span>
                {" })"}
              </div>
            </div>
            <div className="micro-capture__flow">
              <svg className="micro-capture__svg" viewBox="0 0 220 48" fill="none" aria-hidden="true">
                <line x1="8" y1="14" x2="148" y2="14" stroke="rgba(129,140,248,0.55)" strokeWidth="1.5" />
                <circle cx="148" cy="14" r="3" fill="#818CF8" />
                <line x1="8" y1="36" x2="112" y2="36" stroke="rgba(255,255,255,0.14)" strokeWidth="1.25" strokeDasharray="3 3" />
                <path d="M117 32l8 8M125 32l-8 8" stroke="#F87171" strokeWidth="1.5" />
                <rect x="156" y="5" width="58" height="18" rx="3" fill="#141720" stroke="rgba(129,140,248,0.35)" />
                <text x="185" y="17" fill="#A5B4FC" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                  BUFFER
                </text>
                <text x="134" y="39" fill="#64748B" fontSize="8" fontFamily="monospace">
                  uninstrumented tab
                </text>
              </svg>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEmittedCount((n) => n + 1)}>
                Record (+1) · {emittedCount}
              </button>
            </div>
          </div>
        </article>

        {/* 2. Chronological Inspection (Span 2) */}
        <article className="card bento__card bento__card--span-2">
          <div className="bento__head">
            <span className="bento__icon">
              <IconClock size={15} />
            </span>
            <span className="mono bento__index">02 :: TIMELINE</span>
          </div>
          <h3>Chronological Inspection</h3>
          <p>Inspect ordered event sequences with tabular timestamps and millisecond timing deltas between consecutive steps.</p>

          {/* Micro-UI: Interactive Delta Timeline */}
          <div className="micro-ui micro-timeline mono" role="group" aria-label="Sample timing deltas">
            {deltas.map((d, idx) => (
              <button
                key={d.step}
                type="button"
                className={`micro-timeline__row ${activeDeltaIdx === idx ? "is-active" : ""}`}
                onClick={() => setActiveDeltaIdx(idx)}
              >
                <span className="micro-timeline__node" aria-hidden="true" />
                <span className="micro-timeline__step">{d.step}</span>
                <span className="micro-timeline__delta">{d.delta}</span>
              </button>
            ))}
          </div>
        </article>

        {/* 3. Multi-Criteria Filtering (Span 2) */}
        <article className="card bento__card bento__card--span-2">
          <div className="bento__head">
            <span className="bento__icon">
              <IconFilter size={15} />
            </span>
            <span className="mono bento__index">03 :: QUERY</span>
          </div>
          <h3>Multi-Criteria Filtering</h3>
          <p>Combine severity pills, source filters, category prefixes, and negated keywords to isolate relevant failure events.</p>

          {/* Micro-UI: Functional Mini Filter */}
          <div className="micro-ui micro-filter mono">
            <div className="micro-filter__bar" role="group" aria-label="Preview severity filter">
              {(["all", "warn", "error"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`micro-filter__pill ${miniSev === mode ? "is-on" : ""}`}
                  onClick={() => setMiniSev(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
              <span className="micro-filter__count">{filteredMini.length}/3</span>
            </div>
            <div className="micro-filter__rows">
              {filteredMini.map((item) => (
                <div key={item.id} className="micro-filter__row">
                  <span className={`sev-text--${item.sev}`}>{item.sev.toUpperCase()}</span>
                  <span className="text-muted">{item.cat}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* 4. Heuristic Sensitive-Data Redaction (Span 4) */}
        <article className="card bento__card bento__card--span-4">
          <div className="bento__head">
            <span className="bento__icon bento__icon--redacted">
              <IconShield size={15} />
            </span>
            <span className="mono bento__index">04 :: HEURISTIC MASKING</span>
          </div>
          <h3>Heuristic Sensitive-Data Redaction</h3>
          <p>
            Applies pattern-based rules across sensitive key names (<code>password</code>, <code>token</code>, <code>authorization</code>,{" "}
            <code>cookie</code>) and common credential, email, phone, IPv4, and Luhn-valid card formats.
          </p>

          {/* Micro-UI: Live Masking Toggle + Honest Limitation Note */}
          <div className="micro-ui micro-redact mono">
            <div className="micro-redact__top">
              <span className="text-muted">payload preview</span>
              <button
                type="button"
                className={`micro-redact__btn ${miniMasked ? "is-on" : ""}`}
                onClick={() => setMiniMasked((v) => !v)}
              >
                {miniMasked ? "Masked (ON)" : "Raw Demo (OFF)"}
              </button>
            </div>
            <div className="micro-redact__line">
              <span className="json-key">"authorization"</span>:{" "}
              {miniMasked ? (
                <span className="json-redacted">"[REDACTED:jwt]"</span>
              ) : (
                <span className="json-sensitive">"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIi..."</span>
              )}
            </div>
            <div className="micro-redact__line">
              <span className="json-key">"customerEmail"</span>:{" "}
              {miniMasked ? (
                <span className="json-redacted">"[REDACTED:email]"</span>
              ) : (
                <span className="json-sensitive">"dana.reyes@example.com"</span>
              )}
            </div>
          </div>

          <div className="bento__note" role="note">
            <IconAlert size={13} />
            <span>
              Best-effort pattern matching only — cannot guarantee 100% PII/secret detection or compliance. Review JSON before sharing.
            </span>
          </div>
        </article>

        {/* 5. Structured JSON Export (Span 3) */}
        <article className="card bento__card bento__card--span-3">
          <div className="bento__head">
            <span className="bento__icon">
              <IconFileJson size={15} />
            </span>
            <span className="mono bento__index">05 :: SCHEMA EXPORT</span>
          </div>
          <h3>Structured JSON Export</h3>
          <p>
            Generate clean, self-describing <code>.json</code> bundles containing session metadata, active filter state, and ordered event
            payloads ready for bug reports — strictly local until you export.
          </p>

          {/* Micro-UI: Export Schema Envelope */}
          <div className="micro-ui micro-schema mono" aria-hidden="true">
            <div>
              <span className="json-punct">{"{"}</span> <span className="json-key">"formatVersion"</span>:{" "}
              <span className="json-number">1</span>,
            </div>
            <div>
              {"  "}
              <span className="json-key">"session"</span>: {"{ "}
              <span className="json-key">"bufferCapacity"</span>: <span className="json-number">{SITE_CONFIG.bufferMaxEvents}</span>
              {" },"}
            </div>
            <div>
              {"  "}
              <span className="json-key">"redaction"</span>: {"{ "}
              <span className="json-key">"method"</span>: <span className="json-string">"heuristic"</span>
              {" },"}
            </div>
            <div>
              {"  "}
              <span className="json-key">"events"</span>: <span className="json-punct">[ /* ordered DiagnosticEvent[] */ ]</span>{" "}
              <span className="json-punct">{"}"}</span>
            </div>
          </div>
        </article>

        {/* 6. Bounded Session Retention (Span 3) */}
        <article className="card bento__card bento__card--span-3">
          <div className="bento__head">
            <span className="bento__icon">
              <IconDatabase size={15} />
            </span>
            <span className="mono bento__index">06 :: FIFO RETENTION</span>
          </div>
          <h3>Bounded Session Retention</h3>
          <p>
            Caps each session at <code>{SITE_CONFIG.bufferMaxEvents}</code> events in local browser memory. When full, oldest entries roll off
            automatically first (FIFO) to prevent unbounded memory growth.
          </p>

          {/* Micro-UI: Interactive 20-Slot FIFO Ring Visualizer */}
          <div className="micro-ui micro-fifo mono">
            <div className="micro-fifo__cells" aria-hidden="true">
              {Array.from({ length: 20 }, (_, i) => {
                const isOldest = i === 0;
                const isNewest = i === 19;
                return (
                  <span
                    key={i}
                    className={`micro-fifo__cell ${isOldest ? "is-evict" : ""} ${isNewest ? "is-head" : ""}`}
                  />
                );
              })}
            </div>
            <div className="micro-fifo__foot">
              <span>
                cap <strong>{SITE_CONFIG.bufferMaxEvents}</strong> · rolled off: <span className="micro-fifo__evicted">−{fifoEvicted}</span>
              </span>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setFifoEvicted((n) => n + 1)}>
                Push at cap (+1)
              </button>
            </div>
          </div>
        </article>
      </div>
    </Section>
  );
}
