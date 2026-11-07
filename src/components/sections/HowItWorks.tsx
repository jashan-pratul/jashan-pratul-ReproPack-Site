import { SITE_CONFIG } from "../../config/site";
import { IconDatabase, IconFileJson, IconRadio, IconShield } from "../ui/Icons";
import { Section } from "../ui/Primitives";

function CaptureVisual() {
  return (
    <div className="viz viz--capture mono" aria-hidden="true">
      <div className="viz-cap__row">
        <span className="viz-cap__src">integration</span>
        <span className="viz-cap__line" />
      </div>
      <div className="viz-cap__row">
        <span className="viz-cap__src">manual</span>
        <span className="viz-cap__line" />
      </div>
      <div className="viz-cap__row viz-cap__row--muted">
        <span className="viz-cap__src">other tabs</span>
        <span className="viz-cap__line viz-cap__line--blocked" />
        <span className="viz-cap__x">✕</span>
      </div>
      <span className="viz-cap__sink">recorder</span>
    </div>
  );
}

function BufferVisual() {
  const cells = 20;
  return (
    <div className="viz viz--buffer" aria-hidden="true">
      <div className="viz-buf__cells">
        {Array.from({ length: cells }, (_, i) => (
          <span key={i} className={`viz-buf__cell ${i === 0 ? "is-evicting" : ""} ${i === cells - 1 ? "is-new" : ""}`} />
        ))}
      </div>
      <div className="viz-buf__legend mono">
        <span>oldest → evicted</span>
        <span>
          cap {SITE_CONFIG.bufferMaxEvents}
        </span>
      </div>
    </div>
  );
}

function RedactVisual() {
  return (
    <div className="viz viz--redact mono" aria-hidden="true">
      <div>
        <span className="json-key">"email"</span>: <span className="viz-red__orig">"dana@example.com"</span>
      </div>
      <div>
        <span className="json-key">"email"</span>: <span className="json-redacted">"[REDACTED:email]"</span>
      </div>
      <div className="viz-red__gap" />
      <div>
        <span className="json-key">"note"</span>: <span className="json-string">"call Dana at home"</span>
        <span className="viz-red__miss">← not detected</span>
      </div>
    </div>
  );
}

function ExportVisual() {
  return (
    <div className="viz viz--export mono" aria-hidden="true">
      <div>
        <span className="json-punct">{"{"}</span>
      </div>
      <div>
        {"  "}
        <span className="json-key">"redaction"</span>: <span className="json-punct">{"{"}</span> <span className="json-key">"method"</span>:{" "}
        <span className="json-string">"heuristic"</span> <span className="json-punct">{"}"}</span>,
      </div>
      <div>
        {"  "}
        <span className="json-key">"eventCount"</span>: <span className="json-number">42</span>,
      </div>
      <div>
        {"  "}
        <span className="json-key">"events"</span>: <span className="json-punct">[ … ]</span>
      </div>
      <div>
        <span className="json-punct">{"}"}</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    icon: IconRadio,
    title: "Capture",
    body: "Events enter through a supported integration or explicit manual instrumentation. Nothing is scraped from pages you haven't wired up.",
    visual: <CaptureVisual />,
  },
  {
    n: "02",
    icon: IconDatabase,
    title: "Buffer",
    body: `Events land in a session-scoped, bounded buffer. At ${SITE_CONFIG.bufferMaxEvents} events the oldest are evicted first, so memory stays predictable.`,
    visual: <BufferVisual />,
  },
  {
    n: "03",
    icon: IconShield,
    title: "Redact",
    body: "Pattern-based heuristics mask values that look sensitive. Useful by default — but not exhaustive, so review before you share.",
    visual: <RedactVisual />,
  },
  {
    n: "04",
    icon: IconFileJson,
    title: "Export",
    body: "When you're ready, export structured JSON — copy it to a bug report or download a file. Export only happens when you ask for it.",
    visual: <ExportVisual />,
  },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      index="04"
      eyebrow="Pipeline"
      title="Four stages. All on your machine."
      lede="A narrow pipeline with clear boundaries: events in, bounded storage, best-effort masking, explicit export."
    >
      <ol className="pipeline">
        {STEPS.map(({ n, icon: Icon, title, body, visual }) => (
          <li key={n} className="card pipeline__step">
            <div className="pipeline__head">
              <span className="pipeline__icon">
                <Icon size={15} />
              </span>
              <span className="mono pipeline__n">{n}</span>
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
            {visual}
          </li>
        ))}
      </ol>
    </Section>
  );
}
