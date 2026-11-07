import { SITE_CONFIG } from "../../config/site";
import { IconAlert, IconDatabase, IconExternal, IconLock, IconRadio, IconShield } from "../ui/Icons";
import { Section } from "../ui/Primitives";

const CARDS = [
  {
    code: "P-01",
    icon: IconLock,
    title: "Zero Cloud Telemetry",
    body: "ReproPack operates no ingestion backend, analytics collector, or cloud-sync service. Event recording, search indexing, heuristic masking, and JSON formatting execute locally inside your browser.",
    meta: "network_egress: none",
  },
  {
    code: "P-02",
    icon: IconRadio,
    title: "Explicit Scope Only",
    body: "Installing the extension does not turn on global tab monitoring or passive console/network scraping. Diagnostic events are recorded only from supported integrations or explicit manual instrumentation.",
    meta: "capture_mode: opt-in",
  },
  {
    code: "P-03",
    icon: IconDatabase,
    title: "Ephemeral Session Lifecycle",
    body: `Events live in a session-scoped buffer capped at ${SITE_CONFIG.bufferMaxEvents} entries with automatic FIFO eviction. You can clear the buffer at any moment, and nothing is exported unless you explicitly copy or download it.`,
    meta: `max_retention: ${SITE_CONFIG.bufferMaxEvents} events`,
  },
  {
    code: "P-04",
    icon: IconAlert,
    title: "Honest Redaction Boundaries",
    body: "Heuristic redaction masks common patterns (sensitive key names, JWTs, bearer tokens, emails, Luhn-valid card numbers), but pattern matching is best-effort. It cannot guarantee 100% PII removal or compliance.",
    meta: "redaction: best-effort heuristic",
  },
] as const;

export function Privacy() {
  return (
    <Section
      id="privacy"
      index="06"
      eyebrow="Privacy & Architecture"
      title="Technical boundaries, documented honestly."
      lede="No vague assurances or invented compliance badges — just clear architectural constraints you can verify in the open-source repository."
      aside={
        <a className="btn btn--secondary btn--sm" href={SITE_CONFIG.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
          <IconShield size={14} />
          Read PRIVACY.md
          <IconExternal size={12} />
        </a>
      }
    >
      <div className="privacy-grid">
        {CARDS.map(({ code, icon: Icon, title, body, meta }) => (
          <article key={code} className="card privacy-card">
            <div className="privacy-card__head">
              <span className="privacy-card__icon">
                <Icon size={15} />
              </span>
              <span className="mono privacy-card__code">{code}</span>
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
            <div className="privacy-card__foot mono">{meta}</div>
          </article>
        ))}
      </div>

      <div className="privacy-policy-bar card">
        <div className="privacy-policy-bar__copy">
          <strong>Full privacy documentation</strong>
          <p className="text-secondary">
            Review data handling details, browser storage scope, and heuristic redaction disclosures in the repository privacy policy.
          </p>
        </div>
        <a className="btn btn--secondary" href={SITE_CONFIG.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
          View Privacy Policy
          <IconExternal size={14} />
        </a>
      </div>
    </Section>
  );
}
