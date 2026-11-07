import { LINKS } from "../../config/links";
import { IconAlert, IconArrowRight, IconDatabase, IconExternal, IconLock, IconRadio, IconShield } from "../ui/Icons";
import { AppLink, Section } from "../ui/Primitives";

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
    body: "Installing the extension does not turn on global tab monitoring or passive console/network scraping. Diagnostic events are recorded only from supported integrations or explicit runtime instrumentation.",
    meta: "capture_mode: opt-in",
  },
  {
    code: "P-03",
    icon: IconDatabase,
    title: "Ephemeral Session Lifecycle",
    body: "In the Chrome extension, events live in an in-memory ring buffer and chrome.storage.session capped at 1,000 entries with FIFO eviction and 24-hour expiration. Nothing is exported unless you explicitly copy or download it.",
    meta: "max_retention: 1,000 events · 24h",
  },
  {
    code: "P-04",
    icon: IconAlert,
    title: "Honest Redaction Boundaries",
    body: "Heuristic redaction masks common patterns (sensitive key names, Bearer tokens, JWTs, AWS/GitHub/Slack tokens, emails, and URL auth parameters), but pattern matching is best-effort and cannot guarantee complete PII or secret removal.",
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
        <AppLink className="btn btn--secondary btn--sm" href={LINKS.privacyPage}>
          <IconShield size={14} />
          Privacy Policy
          <IconArrowRight size={12} />
        </AppLink>
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
          <strong>Full privacy policy &amp; Chrome Web Store disclosures</strong>
          <p className="text-secondary">
            Review complete details on diagnostic data handled, session storage limits, heuristic redaction boundaries, export, and deletion.
          </p>
        </div>
        <div className="privacy-policy-bar__actions">
          <AppLink className="btn btn--secondary" href={LINKS.privacyPage}>
            Read Privacy Policy
            <IconArrowRight size={14} />
          </AppLink>
          <a className="btn btn--ghost" href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
            PRIVACY.md
            <IconExternal size={13} />
          </a>
        </div>
      </div>
    </Section>
  );
}
