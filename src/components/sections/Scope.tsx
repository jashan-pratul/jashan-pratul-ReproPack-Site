import { SITE_CONFIG } from "../../config/site";
import { IconAlert, IconCheck, IconShield, IconX } from "../ui/Icons";
import { Section } from "../ui/Primitives";

export function Scope() {
  return (
    <Section
      id="scope"
      index="01"
      eyebrow="Architecture Comparison"
      title="Deliberate instrumentation over console chaos."
      lede="Copying raw DevTools logs into bug tickets mixes third-party noise with unformatted objects and exposed credentials. ReproPack isolates only the diagnostic events you explicitly route to it."
    >
      <div className="blueprint">
        {/* Left: Ad-Hoc Log Sprawl */}
        <article className="card blueprint__col blueprint__col--sprawl">
          <div className="blueprint__head">
            <div className="blueprint__title-group">
              <span className="blueprint__icon blueprint__icon--no">
                <IconX size={14} />
              </span>
              <div>
                <h3>Ad-Hoc Log Sprawl</h3>
                <span className="mono text-muted blueprint__sub">Raw browser console &amp; manual copy-paste</span>
              </div>
            </div>
            <span className="badge badge--error">UNFILTERED</span>
          </div>

          {/* Visual simulation of cluttered browser DevTools console */}
          <div className="console-sim mono" aria-label="Simulated unstructured browser console output">
            <div className="console-sim__bar">
              <span>Console</span>
              <span className="text-muted">All levels · 1,842 messages</span>
            </div>
            <div className="console-sim__lines">
              <div className="console-sim__line console-sim__line--noise">
                <span className="console-sim__src">vendor-analytics.js:1</span>
                <span>[beacon] flushed 18 metrics (third-party noise)</span>
              </div>
              <div className="console-sim__line console-sim__line--warn">
                <span className="console-sim__src">index.js:209</span>
                <span>ResizeObserver loop completed with undelivered notifications.</span>
              </div>
              <div className="console-sim__line console-sim__line--leak">
                <span className="console-sim__src">checkout.ts:88</span>
                <span>
                  debug state: [object Object] {`{"user":"dana@example.com","auth":"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIi..."}`}
                </span>
                <span className="console-sim__leak-tag">
                  <IconAlert size={10} /> LEAKED SECRET
                </span>
              </div>
              <div className="console-sim__line console-sim__line--noise">
                <span className="console-sim__src">content_script.js:4</span>
                <span>[injected-ext] MutationObserver tick (312 nodes)</span>
              </div>
              <div className="console-sim__line console-sim__line--err">
                <span className="console-sim__src">payment.ts:118</span>
                <span>Uncaught (in promise) TypeError: Cannot read properties of undefined</span>
              </div>
            </div>
          </div>

          <ul className="blueprint__points">
            <li>
              <IconX size={14} className="blueprint__mark blueprint__mark--no" />
              <div>
                <strong>Interleaved third-party clutter</strong>
                <p>Analytics beacons, unrelated extension scripts, and layout warnings drown out actual failure signals.</p>
              </div>
            </li>
            <li>
              <IconX size={14} className="blueprint__mark blueprint__mark--no" />
              <div>
                <strong>Truncated blobs &amp; accidental secret leaks</strong>
                <p>Serialized objects collapse into <code>[object Object]</code> while raw bearer tokens get pasted straight into issue trackers.</p>
              </div>
            </li>
            <li>
              <IconX size={14} className="blueprint__mark blueprint__mark--no" />
              <div>
                <strong>No passive global surveillance in ReproPack</strong>
                <p>ReproPack refuses to monitor every website/tab or passively scrape all console/network traffic out-of-the-box.</p>
              </div>
            </li>
          </ul>
        </article>

        {/* Right: ReproPack Controlled Stream */}
        <article className="card blueprint__col blueprint__col--stream">
          <div className="blueprint__head">
            <div className="blueprint__title-group">
              <span className="blueprint__icon blueprint__icon--yes">
                <IconCheck size={14} />
              </span>
              <div>
                <h3>ReproPack Controlled Stream</h3>
                <span className="mono text-muted blueprint__sub">Explicit instrumentation · Bounded local FIFO</span>
              </div>
            </div>
            <span className="badge badge--accent">STRUCTURED</span>
          </div>

          {/* Visual simulation of ReproPack structured stream */}
          <div className="stream-sim mono" aria-label="Simulated ReproPack structured event stream">
            <div className="stream-sim__bar">
              <span className="stream-sim__pills">
                <span className="badge badge--info">INFO</span>
                <span className="badge badge--warn">WARN</span>
                <span className="badge badge--error">ERROR</span>
              </span>
              <span className="text-muted">FIFO ≤ {SITE_CONFIG.bufferMaxEvents} · local</span>
            </div>

            <div className="stream-sim__events">
              <div className="stream-sim__event">
                <span className="text-muted">+02.602s</span>
                <span className="sev-text--error">ERROR</span>
                <span className="stream-sim__ns">network.confirm</span>
                <span>POST /api/payments/confirm → 502</span>
              </div>
              <div className="stream-sim__event is-active">
                <span className="text-muted">+02.610s</span>
                <span className="sev-text--error">ERROR</span>
                <span className="stream-sim__ns">checkout.submit</span>
                <span>Uncaught TypeError in confirmPayment()</span>
              </div>
            </div>

            <div className="stream-sim__tree">
              <div>
                <span className="json-punct">{"{"}</span>
              </div>
              <div>
                {"  "}
                <span className="json-key">"source"</span>: <span className="json-string">"manual"</span>,
              </div>
              <div>
                {"  "}
                <span className="json-key">"authorization"</span>: <span className="json-redacted">"[REDACTED:jwt]"</span>,
              </div>
              <div>
                {"  "}
                <span className="json-key">"contactEmail"</span>: <span className="json-redacted">"[REDACTED:email]"</span>
              </div>
              <div>
                <span className="json-punct">{"}"}</span>
              </div>
            </div>
          </div>

          <ul className="blueprint__points">
            <li>
              <IconCheck size={14} className="blueprint__mark blueprint__mark--yes" />
              <div>
                <strong>Intentional signal only</strong>
                <p>Captures events solely from supported integrations or explicit manual instrumentation you wire into your workflow.</p>
              </div>
            </li>
            <li>
              <IconCheck size={14} className="blueprint__mark blueprint__mark--yes" />
              <div>
                <strong>Bounded {SITE_CONFIG.bufferMaxEvents}-event FIFO session buffer</strong>
                <p>Oldest events roll off automatically when capacity is reached, keeping browser memory predictable.</p>
              </div>
            </li>
            <li>
              <IconShield size={14} className="blueprint__mark blueprint__mark--redact" />
              <div>
                <strong>Pre-export heuristic sanitization (best-effort)</strong>
                <p>
                  Pattern rules mask common token, email, and card shapes before JSON export — helpful protection, though never a 100% PII or
                  compliance guarantee.
                </p>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </Section>
  );
}
