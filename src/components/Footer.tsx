import { isStoreLive, NAV_ITEMS, SITE_CONFIG } from "../config/site";
import { LINKS } from "../config/links";
import { IconCommit, IconExternal, IconGithub } from "./ui/Icons";
import { Crosshairs } from "./ui/Primitives";

export function Footer({ onOpenShortcuts }: { onOpenShortcuts: () => void }) {
  const storeLive = isStoreLive();

  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container rails footer__container">
        <Crosshairs />
        <div className="footer__grid">
          <div className="footer__brand-col">
            <a href="#top" className="footer__brand" aria-label="ReproPack top of page">
              <span className="wordmark">
                <img src="/logo.png" alt="ReproPack" className="w-6 h-6 rounded-md opacity-90" />
                <span>ReproPack</span>
              </span>
            </a>
            <p className="footer__tagline">{SITE_CONFIG.tagline}</p>
            <p className="footer__desc">
              Local-first browser diagnostic event recorder. Bounded {SITE_CONFIG.bufferMaxEvents}-event FIFO session buffer, best-effort
              heuristic redaction, structured JSON export.
            </p>
            <div className="footer__telemetry mono" aria-label="System metadata">
              <span className="badge">
                <IconCommit size={11} /> build :: v1.0.0-local
              </span>
              <span className="badge badge--ok">
                <span className="dot" /> telemetry :: 0 outbound
              </span>
              <span className={`badge ${storeLive ? "badge--ok" : "badge--warn"}`}>
                <span className="dot" /> {storeLive ? "store :: live" : "store :: pending review"}
              </span>
            </div>
          </div>

          <nav className="footer__col" aria-label="On this page">
            <h3 className="footer__heading mono">Sections</h3>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
              <li>
                <button type="button" className="footer__link-btn" onClick={onOpenShortcuts}>
                  Keyboard shortcuts <kbd>?</kbd>
                </button>
              </li>
            </ul>
          </nav>

          <nav className="footer__col" aria-label="External resources">
            <h3 className="footer__heading mono">Resources</h3>
            <ul>
              <li>
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                  <IconGithub size={13} />
                  GitHub Repository
                  <IconExternal size={11} />
                </a>
              </li>
              <li>
                <a href={LINKS.docs} target="_blank" rel="noopener noreferrer">
                  Documentation (README)
                  <IconExternal size={11} />
                </a>
              </li>
              <li>
                <a href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
                  Privacy Policy (PRIVACY.md)
                  <IconExternal size={11} />
                </a>
              </li>
              <li>
                <a href={LINKS.support} target="_blank" rel="noopener noreferrer">
                  Issue Tracker
                  <IconExternal size={11} />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer__bottom mono">
          <span>
            {SITE_CONFIG.name} :: Local-first developer diagnostics · Explicit instrumentation only
          </span>
          <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
            github.com/jashan-pratul/ReproPack
          </a>
        </div>
      </div>
    </footer>
  );
}
