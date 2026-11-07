import { useEffect, useState } from "react";
import { LINKS } from "../config/links";
import { NAV_ITEMS } from "../config/site";
import { MOD_KEY_LABEL } from "../lib/keyboard";
import { StoreButton } from "./StoreButton";
import { IconCommand, IconCommit, IconGithub, IconMenu, IconX } from "./ui/Icons";

function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter((x): x is HTMLElement => Boolean(x));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header__inner">
        <div className="header__left">
          <a href="#top" className="header__brand" aria-label="ReproPack home">
            <span className="wordmark">
              <img src="/logo.png" alt="ReproPack" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
              <span>ReproPack</span>
            </span>
          </a>
        </div>

        <nav className="header__nav" aria-label="Primary">
          {NAV_ITEMS.map((n) => {
            const isCurrent = active === n.id;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={isCurrent ? "is-active" : ""}
                aria-current={isCurrent ? "true" : undefined}
              >
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="header__actions">
          <button type="button" className="header__cmd" onClick={onOpenPalette} aria-label="Open command menu">
            <IconCommand size={12} />
            <span className="kbd-group" aria-hidden="true">
              <kbd>{MOD_KEY_LABEL}</kbd>
              <kbd>K</kbd>
            </span>
          </button>

          <a
            className="header__repo mono"
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ReproPack GitHub repository"
            title="View source on GitHub"
          >
            <IconGithub size={14} />
            <span className="header__repo-meta">
              <IconCommit size={12} />
              <span>main</span>
            </span>
          </a>

          <span className="header__cta">
            <StoreButton size="sm" labelOverride="Get ReproPack" />
          </span>

          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <IconX size={16} /> : <IconMenu size={16} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          {NAV_ITEMS.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)}>
              {n.label}
            </a>
          ))}
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
            GitHub Repository
          </a>
          <div className="mobile-nav__store" onClick={() => setMenuOpen(false)}>
            <StoreButton size="md" labelOverride="Get ReproPack" />
          </div>
        </nav>
      )}
    </header>
  );
}
