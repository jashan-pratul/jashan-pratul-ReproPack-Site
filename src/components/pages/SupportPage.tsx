import { useState } from "react";
import { LINKS } from "../../config/links";
import { copyText } from "../../lib/clipboard";
import { IconArrowLeft, IconCheck, IconCopy, IconExternal, IconGithub, IconMail, IconShield } from "../ui/Icons";
import { AppLink } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

export function SupportPage() {
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
    <section className="section support-page" aria-labelledby="support-page-title">
      <div className="container">
        <div className="support-page__inner">
          <header className="support-page__header">
            <AppLink href="/" className="support-page__back mono">
              <IconArrowLeft size={13} />
              <span>Back to ReproPack</span>
            </AppLink>

            <span className="eyebrow">Support &amp; Contact</span>

            <h1 id="support-page-title" className="support-page__title">
              How can we help?
            </h1>

            <p className="support-page__intro">
              Contact ReproPack for technical support, bug reports, and product feedback. Everything in ReproPack runs locally in your
              browser with zero background telemetry—share only the context needed to help us reproduce or answer your question.
            </p>
          </header>

          <div className="support-page__grid">
            <article className="card support-card support-card--primary">
              <div className="support-card__head">
                <span className="support-card__icon" aria-hidden="true">
                  <IconMail size={18} />
                </span>
                <span className="badge badge--accent">Email Support</span>
              </div>

              <div className="support-card__body">
                <h2>Direct Email Support</h2>
                <p>
                  Email our team directly for technical troubleshooting, developer installation help, instrumentation guidance, or general
                  feedback. Heuristic redaction is best-effort, so please review any exported <code>.json</code> session bundle before
                  attaching it.
                </p>
              </div>

              <address className="support-email-box">
                <span className="support-email-box__label mono">Official support email</span>
                <a
                  className="support-email-link mono"
                  href={LINKS.supportMailto}
                  aria-label={`Email ReproPack support at ${LINKS.supportEmail}`}
                >
                  {LINKS.supportEmail}
                </a>
              </address>

              <div className="support-card__actions support-card__actions--bottom">
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
                <h2>GitHub Bug Reports &amp; Feature Requests</h2>
                <p>
                  Source code, documentation, and public issue tracking live in the official repository at{" "}
                  <a className="text-link mono" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                    github.com/jashan-pratul/ReproPack
                  </a>
                  .
                </p>
              </div>

              <dl className="support-guide">
                <div className="support-guide__item">
                  <dt>Reporting a bug</dt>
                  <dd>
                    Open an issue with steps to reproduce, expected vs. actual behavior, your Chrome and ReproPack versions, and an optional
                    sanitized <code>.json</code> export reviewed for sensitive values.
                  </dd>
                </div>
                <div className="support-guide__item">
                  <dt>Requesting a feature</dt>
                  <dd>
                    Open an issue describing your debugging workflow, integration use case, or filter and redaction ideas so enhancements can
                    be discussed openly.
                  </dd>
                </div>
              </dl>

              <div className="support-card__actions support-card__actions--bottom">
                <a className="btn btn--secondary" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                  <IconGithub size={15} />
                  View on GitHub
                  <IconExternal size={12} />
                </a>
                <a className="btn btn--ghost" href={LINKS.support} target="_blank" rel="noopener noreferrer">
                  Open GitHub Issues
                  <IconExternal size={12} />
                </a>
              </div>
            </article>
          </div>

          <aside className="card support-privacy" aria-label="Privacy policy and documentation">
            <div className="support-privacy__copy">
              <div className="support-privacy__title-row">
                <span className="support-privacy__icon" aria-hidden="true">
                  <IconShield size={16} />
                </span>
                <h2>Privacy Policy</h2>
              </div>
              <p>
                ReproPack captures events only from supported integrations or explicit instrumentation, keeps them in a bounded local
                session buffer, and transmits zero telemetry to external servers. Read our full privacy policy for storage scope and
                redaction disclosures.
              </p>
            </div>

            <div className="support-privacy__actions">
              <a className="btn btn--secondary" href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
                Read Privacy Policy
                <IconExternal size={13} />
              </a>
              <AppLink className="btn btn--ghost" href="/#privacy">
                Privacy Architecture
              </AppLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
