import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../../config/site";
import { LINKS } from "../../config/links";
import { StoreButton } from "../StoreButton";
import { IconArrowRight, IconGithub, IconLock, IconShield } from "../ui/Icons";

interface HeroTraceRow {
  id: string;
  ts: string;
  delta: string;
  severity: "info" | "warn" | "error";
  namespace: string;
  summary: string;
  redactedToken?: string;
  snippet: string;
}

const HERO_TRACE: HeroTraceRow[] = [
  {
    id: "evt_00138",
    ts: "14:08:11.042",
    delta: "+0ms",
    severity: "info",
    namespace: "session.attach",
    summary: 'Explicit recorder bound → route="/checkout"',
    snippet: '{ "source": "manual", "route": "/checkout", "build": "web@4.12.0" }',
  },
  {
    id: "evt_00139",
    ts: "14:08:11.418",
    delta: "+376ms",
    severity: "info",
    namespace: "auth.token_refresh",
    summary: "Authorization: Bearer ",
    redactedToken: "[REDACTED_BEARER_TOKEN]",
    snippet: '{ "header": "Authorization", "value": "Bearer [REDACTED_BEARER_TOKEN]", "ttlSec": 900 }',
  },
  {
    id: "evt_00140",
    ts: "14:08:13.904",
    delta: "+2,486ms",
    severity: "warn",
    namespace: "network.slow_response",
    summary: "POST /api/checkout/quote → 200 (2840ms > 1500ms budget)",
    snippet: '{ "method": "POST", "status": 200, "durationMs": 2840, "thresholdMs": 1500 }',
  },
  {
    id: "evt_00141",
    ts: "14:08:15.112",
    delta: "+1,208ms",
    severity: "error",
    namespace: "network.upstream_502",
    summary: "POST /api/payments/confirm → 502 Bad Gateway",
    redactedToken: "[REDACTED_IPV4]",
    snippet: '{ "method": "POST", "status": 502, "upstream": "[REDACTED_IPV4]", "retryable": true }',
  },
  {
    id: "evt_00142",
    ts: "14:08:15.119",
    delta: "+7ms",
    severity: "error",
    namespace: "checkout.unhandled_error",
    summary: "TypeError: Cannot read properties of undefined (reading 'clientSecret')",
    snippet: '{ "name": "TypeError", "at": "checkout/payment.ts:118:27", "email": "[REDACTED_EMAIL]" }',
  },
];

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Hero() {
  const [selectedId, setSelectedId] = useState<string>("evt_00139");
  const [elapsedSec, setElapsedSec] = useState<number>(258); // 00:04:18

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setElapsedSec((s) => (s + 1) % 3600);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const activeRow = HERO_TRACE.find((r) => r.id === selectedId) ?? HERO_TRACE[1]!;
  const bufferCount = 142;
  const bufferMax = SITE_CONFIG.bufferMaxEvents;
  const bufferPct = (bufferCount / bufferMax) * 100;

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__inner">
          <div className="hero__copy">
            <div className="hero__eyebrow mono">[ RECORDER :: LOCAL-FIRST :: ZERO-CLOUD ]</div>

            <h1 id="hero-title" className="hero__title">
              Debugging data. <span className="hero__title-dim">Organised locally.</span>
            </h1>

            <p className="hero__lede">
              Capture, inspect, filter, and export diagnostic events with a local-first workflow built for developers. Structured bug
              investigation without passive background surveillance.
            </p>

            <div className="hero__ctas">
              <StoreButton size="lg" labelOverride="Install ReproPack" />
              <a className="btn btn--secondary btn--lg" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                <IconGithub size={16} />
                View on GitHub
              </a>
            </div>
          </div>

          {/* Centerpiece Product Visual: Authentic Chromium Extension Diagnostic Frame */}
          <div className="ext-frame" role="region" aria-label="ReproPack diagnostic recorder preview">
            {/* Top Window / Extension Chrome */}
            <div className="ext-frame__titlebar">
              <div className="ext-frame__lights" aria-hidden="true">
                <span className="ext-frame__light ext-frame__light--close" />
                <span className="ext-frame__light ext-frame__light--min" />
                <span className="ext-frame__light ext-frame__light--max" />
              </div>

              <div className="ext-frame__tab mono">
                <img src="/logo.png" alt="" className="w-4 h-4 rounded-sm" />
                <span className="ext-frame__brand">ReproPack</span>
                <span className="ext-frame__sep" aria-hidden="true" />
                <span className="ext-frame__rec-dot" aria-hidden="true" />
                <span className="ext-frame__tab-host">shop.example.test/checkout</span>
                <span className="ext-frame__tab-scope">explicit scope</span>
              </div>

              <div className="ext-frame__telemetry mono">
                <span className="ext-frame__timer" title="Active recording session duration">
                  <span className="text-muted">REC</span> {formatDuration(elapsedSec)}
                </span>
                <span className="ext-frame__sep" aria-hidden="true" />
                <span className="ext-frame__gauge" title={`Bounded FIFO session buffer (${bufferCount} of ${bufferMax} events)`}>
                  <span className="ext-frame__gauge-bar" aria-hidden="true">
                    <span className="ext-frame__gauge-fill" style={{ width: `${bufferPct}%` }} />
                  </span>
                  <span>
                    <strong>{bufferCount}</strong> <span className="text-muted">/ {bufferMax} events</span>
                  </span>
                </span>
              </div>
            </div>

            {/* Sub-header column labels */}
            <div className="ext-frame__cols mono" aria-hidden="true">
              <span>timestamp</span>
              <span>delta</span>
              <span>level</span>
              <span>namespace</span>
              <span>diagnostic trace</span>
            </div>

            {/* Realistic Diagnostic Trace Rows */}
            <div className="ext-frame__rows mono" role="listbox" aria-label="Sample recorded events">
              {HERO_TRACE.map((row) => {
                const selected = row.id === activeRow.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`ext-row ${selected ? "is-selected" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <span className="ext-row__ts">{row.ts}</span>
                    <span className="ext-row__delta">{row.delta}</span>
                    <span className={`badge badge--${row.severity} ext-row__sev`}>{row.severity.toUpperCase()}</span>
                    <span className="ext-row__ns">{row.namespace}</span>
                    <span className="ext-row__msg">
                      <span>{row.summary}</span>
                      {row.redactedToken && <span className="ext-row__redacted">{row.redactedToken}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Event Sanitized Inspector Strip */}
            <div className="ext-frame__inspector mono">
              <div className="ext-frame__inspector-meta">
                <span className="badge badge--redacted">
                  <IconShield size={11} /> heuristic redaction: active
                </span>
                <span className="ext-frame__inspector-code">{activeRow.snippet}</span>
              </div>

              <div className="ext-frame__inspector-actions">
                <span className="ext-frame__local-tag">
                  <IconLock size={11} /> 0 bytes sent externally
                </span>
                <a className="ext-frame__jump" href="#playground">
                  Open live workbench <kbd>/</kbd> <IconArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
