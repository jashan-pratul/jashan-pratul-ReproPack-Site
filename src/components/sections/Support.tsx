import { useState } from "react";
import { LINKS } from "../../config/links";
import { copyText } from "../../lib/clipboard";
import { IconArrowRight, IconCheck, IconCopy, IconExternal, IconGithub, IconMail } from "../ui/Icons";
import { AppLink, Section } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

export function Support() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const onCopyEmail = async () => {
    const ok = await copyText(LINKS.supportEmail);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.show({ tone: "success", title: "Support email copied", detail: LINKS.supportEmail });
    } else {
      toast.show({ tone: "warn", title: "Clipboard unavailable", detail: LINKS.supportEmail });
    }
  };

  return (
    <Section
      id="support"
      index="09"
      eyebrow="Support & Contact"
      title="Get in touch with our support team."
      lede="Need help, have feedback, or found an issue? Get in touch with our support team."
      aside={
        <AppLink className="btn btn--secondary btn--sm" href={LINKS.supportPage}>
          Visit Support Page
          <IconArrowRight size={12} />
        </AppLink>
      }
    >
      <div className="support-grid">
        <article className="card support-card support-card--primary">
          <div className="support-card__head">
            <span className="support-card__icon" aria-hidden="true">
              <IconMail size={18} />
            </span>
            <span className="badge badge--accent">Direct Support</span>
          </div>

          <div className="support-card__body">
            <h3>Official Support Email</h3>
            <p>
              Reach us directly for questions about instrumentation, diagnostic session exports, developer installation, or product feedback. If
              attaching an exported <code>.json</code> bundle, review its contents beforehand.
            </p>
          </div>

          <address className="support-email-box">
            <span className="support-email-box__label mono">Official email</span>
            <a
              className="support-email-link mono"
              href={LINKS.supportMailto}
              aria-label={`Email ReproPack support at ${LINKS.supportEmail}`}
            >
              {LINKS.supportEmail}
            </a>
          </address>

          <div className="support-card__actions">
            <a
              className="btn btn--primary"
              href={LINKS.supportMailto}
              aria-label={`Compose an email to ${LINKS.supportEmail}`}
            >
              <IconMail size={15} />
              Email Support
            </a>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onCopyEmail}
              aria-label={`Copy support email address ${LINKS.supportEmail}`}
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              {copied ? "Copied" : "Copy address"}
            </button>
          </div>
        </article>

        <article className="card support-card">
          <div className="support-card__head">
            <span className="support-card__icon support-card__icon--neutral" aria-hidden="true">
              <IconGithub size={18} />
            </span>
            <span className="badge">Open Source</span>
          </div>

          <div className="support-card__body">
            <h3>Issue Tracker & Documentation</h3>
            <p>
              Prefer tracking reproducible bug reports or reviewing build instructions in public? Browse the canonical repository README,
              privacy disclosures, and open issues on GitHub.
            </p>
          </div>

          <div className="support-card__actions support-card__actions--bottom">
            <a className="btn btn--secondary" href={LINKS.support} target="_blank" rel="noopener noreferrer">
              <IconGithub size={15} />
              GitHub Issue Tracker
              <IconExternal size={12} />
            </a>
            <a className="btn btn--ghost" href={LINKS.docs} target="_blank" rel="noopener noreferrer">
              Documentation
              <IconExternal size={12} />
            </a>
          </div>
        </article>
      </div>
    </Section>
  );
}
