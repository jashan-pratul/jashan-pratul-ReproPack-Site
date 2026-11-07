import { useState } from "react";
import { isStoreLive, SITE_CONFIG } from "../../config/site";
import { LINKS } from "../../config/links";
import { copyText } from "../../lib/clipboard";
import {
  IconCheck,
  IconChrome,
  IconClock,
  IconCopy,
  IconExternal,
  IconGithub,
  IconInfo,
  IconTerminal,
} from "../ui/Icons";
import { Section } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

function CopySnippet({ label, command }: { label: string; command: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(command);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.show({ tone: "success", title: "Copied to clipboard", detail: label });
    } else {
      toast.show({ tone: "warn", title: "Clipboard unavailable", detail: "Select and copy the text manually." });
    }
  };

  return (
    <div className="code">
      <div className="code__head">
        <span>{label}</span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCopy} aria-label={`Copy ${label}`}>
          {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{command}</code>
      </pre>
    </div>
  );
}

export function Install() {
  const storeLive = isStoreLive();
  const cloneCommand = `git clone ${SITE_CONFIG.githubUrl}.git\ncd ReproPack`;
  const chromeExtensionsUrl = "chrome://extensions";

  return (
    <Section
      id="install"
      index="07"
      eyebrow="Installation & Distribution"
      title="Run ReproPack locally from source."
      lede="Inspect the open-source codebase, build locally, and load the unpacked extension directly into Chrome Developer Mode."
    >
      <div className="install-grid">
        {/* Column 1: Chrome Web Store Status Transparency Card */}
        <article className="card install-card install-card--store">
          <div className="install-card__brand-stack">
            <img src="/logo.png" alt="ReproPack" className="w-12 h-12 rounded-xl object-contain shadow-md" />
            <div className="install-card__brand-meta">
              <h3>ReproPack</h3>
              <span className="text-muted mono" style={{ fontSize: 11.5 }}>
                Chrome Web Store · Extension distribution channel
              </span>
            </div>
          </div>

          <div className="install-status-banner">
            {storeLive ? (
              <span className="badge badge--ok" role="status">
                <span className="dot" />
                Status: Available on Chrome Web Store
              </span>
            ) : (
              <span className="badge badge--warn" role="status">
                <IconClock size={11} />
                Status: Pending Chrome Web Store Review
              </span>
            )}
          </div>

          <p className="install-card__desc">
            {storeLive
              ? "ReproPack is published on the Chrome Web Store. Install the packaged extension directly or build from source on the right."
              : "The Chrome Web Store listing is currently awaiting review. Rather than rendering an inactive store button, direct Developer Mode installation from the canonical GitHub repository is available alongside this card."}
          </p>

          <div className="install-card__cta">
            {storeLive ? (
              <a className="btn btn--primary btn--lg" href={SITE_CONFIG.chromeWebStoreUrl} target="_blank" rel="noopener noreferrer">
                <IconChrome size={16} />
                Add to Chrome
                <IconExternal size={13} />
              </a>
            ) : (
              <a className="btn btn--secondary" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                <IconGithub size={15} />
                Inspect Repository on GitHub
                <IconExternal size={12} />
              </a>
            )}
          </div>

          <div className="callout callout--info install-card__note">
            <IconInfo size={15} />
            <div>
              <strong>Verifiable source.</strong> Review manifest permissions, storage boundaries, and heuristic redaction rules directly in{" "}
              <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                jashan-pratul/ReproPack
              </a>{" "}
              before loading unpacked.
            </div>
          </div>
        </article>

        {/* Column 2: Direct 3-Step Developer Installation Instructions */}
        <article className="card install-card install-card--source">
          <div className="install-card__top">
            <div className="install-card__head">
              <span className="install-card__icon install-card__icon--accent">
                <IconTerminal size={18} />
              </span>
              <div>
                <h3>Developer Mode Installation</h3>
                <span className="text-muted mono" style={{ fontSize: 11.5 }}>
                  Google Chrome / Chromium · Load Unpacked
                </span>
              </div>
            </div>
            <span className="badge badge--accent">3 steps</span>
          </div>

          <ol className="install-steps">
            <li>
              <span className="install-steps__num mono">01</span>
              <div className="install-steps__body">
                <strong>Clone the repository</strong>
                <p>Clone the canonical ReproPack repository to your local machine.</p>
                <CopySnippet label="terminal — clone repo" command={cloneCommand} />
              </div>
            </li>

            <li>
              <span className="install-steps__num mono">02</span>
              <div className="install-steps__body">
                <strong>Build per the repository README</strong>
                <p>
                  Install dependencies and execute the build steps documented in the project README to produce the unpacked extension bundle.
                </p>
                <div className="install-panel__links">
                  <a className="btn btn--secondary btn--sm" href={SITE_CONFIG.docsUrl} target="_blank" rel="noopener noreferrer">
                    <IconGithub size={13} />
                    Read Build Guide (README.md)
                    <IconExternal size={11} />
                  </a>
                </div>
              </div>
            </li>

            <li>
              <span className="install-steps__num mono">03</span>
              <div className="install-steps__body">
                <strong>Load unpacked in Chrome Extensions</strong>
                <p>
                  Open <code>chrome://extensions</code> in your address bar, enable <strong>Developer mode</strong> (top-right toggle), click{" "}
                  <strong>Load unpacked</strong>, and select the built extension directory.
                </p>
                <CopySnippet label="chrome address bar" command={chromeExtensionsUrl} />
              </div>
            </li>
          </ol>
        </article>
      </div>
    </Section>
  );
}
