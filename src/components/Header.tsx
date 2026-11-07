import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LINKS } from "../config/links";
import { NAV_ITEMS } from "../config/site";
import { MOD_KEY_LABEL } from "../lib/keyboard";
import {
  normalizeRoute,
  pickActiveSectionId,
  resolveSectionIdFromHash,
  ROUTE_EVENT,
  useRoute,
  type ParsedTarget,
  type RoutePath,
} from "../lib/router";
import { StoreButton } from "./StoreButton";
import { IconCommand, IconCommit, IconGithub, IconMenu, IconX } from "./ui/Icons";
import { AppLink } from "./ui/Primitives";

const SECTION_IDS: readonly string[] = NAV_ITEMS.map((n) => n.id);
const OBSERVED_IDS: readonly string[] = ["top", ...SECTION_IDS];
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/**
 * Tracks the currently active home-page section using IntersectionObserver,
 * accounting for the sticky header height and avoiding multi-section flicker.
 */
function useActiveSection(route: RoutePath): string | null {
  const [active, setActive] = useState<string | null>(() => {
    if (typeof window === "undefined" || route !== "/") return null;
    return resolveSectionIdFromHash(window.location.hash, SECTION_IDS);
  });

  useEffect(() => {
    if (route !== "/" || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setActive(null);
      return;
    }

    let io: IntersectionObserver | null = null;
    let lockTarget: string | null = null;
    let lockStartedAt = 0;
    let lockUntil = 0;
    let unlockTimer: number | undefined;
    const intersecting = new Set<string>();

    const getHeaderHeight = (): number => {
      const headerEl = document.querySelector<HTMLElement>(".header");
      return headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 60;
    };

    const getTopOffset = (): number => getHeaderHeight() + 36;

    const findSectionAtOffset = (topOffset: number): string | null => {
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= topOffset && rect.bottom > topOffset) {
          return id;
        }
      }
      return null;
    };

    const reconcile = () => {
      if (performance.now() < lockUntil) {
        setActive(lockTarget);
        return;
      }

      const headerH = getHeaderHeight();
      const topOffset = headerH + 36;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      if (atBottom) {
        if (window.location.hash) {
          const hashId = resolveSectionIdFromHash(window.location.hash, SECTION_IDS);
          const targetEl = hashId ? document.getElementById(hashId) : null;
          if (hashId && targetEl) {
            const rect = targetEl.getBoundingClientRect();
            if (Math.abs(rect.top - (headerH + 16)) <= 96) {
              setActive(hashId);
              return;
            }
          }
        }
        const lastId = SECTION_IDS[SECTION_IDS.length - 1];
        const lastEl = lastId ? document.getElementById(lastId) : null;
        if (lastId && lastEl && lastEl.getBoundingClientRect().top < window.innerHeight * 0.55) {
          setActive(lastId);
          return;
        }
      }

      if (intersecting.size > 0) {
        setActive(pickActiveSectionId(OBSERVED_IDS, intersecting));
        return;
      }

      setActive(findSectionAtOffset(topOffset));
    };

    const clearLock = () => {
      if (unlockTimer !== undefined) {
        window.clearTimeout(unlockTimer);
        unlockTimer = undefined;
      }
      lockUntil = 0;
    };

    const lockToHash = (hash: string, durationMs: number) => {
      clearLock();
      const reduced = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      const effectiveMs = reduced ? Math.min(durationMs, 120) : durationMs;
      lockTarget = resolveSectionIdFromHash(hash, SECTION_IDS);
      lockStartedAt = performance.now();
      lockUntil = lockStartedAt + effectiveMs;
      setActive(lockTarget);
      unlockTimer = window.setTimeout(() => {
        lockUntil = 0;
        reconcile();
      }, effectiveMs + 16);
    };

    const buildObserver = () => {
      io?.disconnect();
      intersecting.clear();

      const topOffset = getTopOffset();
      const bandBottom = Math.max(topOffset + 80, Math.round(window.innerHeight * 0.35));
      const bottomMargin = Math.max(0, window.innerHeight - bandBottom);

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              intersecting.add(entry.target.id);
            } else {
              intersecting.delete(entry.target.id);
            }
          }
          reconcile();
        },
        {
          rootMargin: `-${topOffset}px 0px -${bottomMargin}px 0px`,
          threshold: [0, 0.05],
        },
      );

      for (const id of OBSERVED_IDS) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
    };

    if (window.location.hash) {
      lockToHash(window.location.hash, 550);
    }

    buildObserver();

    const onRouteChange = (e: Event) => {
      const detail = (e as CustomEvent<ParsedTarget | undefined>).detail;
      if (!detail || detail.path !== "/") return;
      lockToHash(detail.hash, 720);
    };

    const onHashChange = () => {
      if (normalizeRoute(window.location.pathname) !== "/") return;
      lockToHash(window.location.hash, 720);
    };

    const onPopState = () => {
      if (normalizeRoute(window.location.pathname) !== "/") return;
      lockToHash(window.location.hash, 320);
    };

    const onManualScrollIntent = (e: Event) => {
      if (e.type === "keydown" && !SCROLL_KEYS.has((e as KeyboardEvent).key)) return;
      if (lockUntil > 0) {
        clearLock();
        reconcile();
      }
    };

    const onScrollEnd = () => {
      if (lockUntil > 0 && performance.now() - lockStartedAt > 80) {
        clearLock();
        reconcile();
      }
    };

    let resizeRaf = 0;
    const onResize = () => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(buildObserver);
    };

    window.addEventListener(ROUTE_EVENT, onRouteChange);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("wheel", onManualScrollIntent, { passive: true });
    window.addEventListener("touchmove", onManualScrollIntent, { passive: true });
    window.addEventListener("keydown", onManualScrollIntent);
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      clearLock();
      window.cancelAnimationFrame(resizeRaf);
      io?.disconnect();
      window.removeEventListener(ROUTE_EVENT, onRouteChange);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("wheel", onManualScrollIntent);
      window.removeEventListener("touchmove", onManualScrollIntent);
      window.removeEventListener("keydown", onManualScrollIntent);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", onResize);
    };
  }, [route]);

  return active;
}

interface IndicatorState {
  x: number;
  width: number;
  visible: boolean;
  animate: boolean;
  ready: boolean;
}

function useUnderlineIndicator(navRef: React.RefObject<HTMLElement | null>, activeNavId: string | null): IndicatorState {
  const [state, setState] = useState<IndicatorState>({
    x: 0,
    width: 0,
    visible: false,
    animate: false,
    ready: false,
  });

  const measure = useCallback(
    (allowAnimate: boolean) => {
      const navEl = navRef.current;
      if (!navEl || !activeNavId) {
        setState((prev) => (prev.visible ? { ...prev, visible: false, animate: false } : prev));
        return;
      }

      const linkEl = navEl.querySelector<HTMLElement>(`[data-nav-id="${activeNavId}"]`);
      const labelEl = linkEl?.querySelector<HTMLElement>(".header__nav-label");
      if (!linkEl || !labelEl || labelEl.offsetWidth === 0) {
        setState((prev) => (prev.ready ? { ...prev, visible: false, animate: false, ready: false } : prev));
        return;
      }

      const x = linkEl.offsetLeft + labelEl.offsetLeft;
      const width = labelEl.offsetWidth;

      setState((prev) => {
        const shouldAnimate = allowAnimate && prev.visible && prev.ready;
        if (prev.x === x && prev.width === width && prev.visible && prev.animate === shouldAnimate && prev.ready) {
          return prev;
        }
        return {
          x,
          width,
          visible: true,
          animate: shouldAnimate,
          ready: true,
        };
      });
    },
    [navRef, activeNavId],
  );

  useLayoutEffect(() => {
    measure(true);
  }, [measure]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const remeasureStatic = () => measure(false);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(remeasureStatic);
      ro.observe(navEl);
    }

    void document.fonts?.ready.then(remeasureStatic);
    window.addEventListener("resize", remeasureStatic, { passive: true });

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", remeasureStatic);
    };
  }, [navRef, measure]);

  return state;
}

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const route = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeSection = useActiveSection(route);
  const activeNavId = route === "/support" ? "support" : route === "/privacy" ? "privacy" : activeSection;
  const indicator = useUnderlineIndicator(navRef, activeNavId);

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
          <AppLink href="#top" className="header__brand" aria-label="ReproPack home">
            <span className="wordmark">
              <img src="/logo.png" alt="ReproPack" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
              <span>ReproPack</span>
            </span>
          </AppLink>
        </div>

        <nav
          ref={navRef}
          className={`header__nav ${indicator.ready ? "has-indicator-metrics" : ""}`}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((n) => {
            const dedicatedHref =
              n.id === "support" ? LINKS.supportPage : n.id === "privacy" ? LINKS.privacyPage : null;
            const href = dedicatedHref ?? `#${n.id}`;
            const isCurrent = activeNavId === n.id;
            const isDedicatedRoute =
              (n.id === "support" && route === "/support") || (n.id === "privacy" && route === "/privacy");
            const ariaCurrent = isCurrent ? (isDedicatedRoute ? "page" : "location") : undefined;
            return (
              <AppLink
                key={n.id}
                href={href}
                data-nav-id={n.id}
                className={isCurrent ? "is-active" : ""}
                aria-current={ariaCurrent}
              >
                <span className="header__nav-label">{n.label}</span>
              </AppLink>
            );
          })}
          <span
            className={`header__nav-indicator ${indicator.visible ? "is-visible" : ""} ${indicator.animate ? "is-animated" : ""}`}
            style={{
              transform: `translate3d(${indicator.x}px, 0, 0)`,
              width: `${indicator.width}px`,
            }}
            aria-hidden="true"
          />
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
          {NAV_ITEMS.map((n) => {
            const dedicatedHref =
              n.id === "support" ? LINKS.supportPage : n.id === "privacy" ? LINKS.privacyPage : null;
            const href = dedicatedHref ?? `#${n.id}`;
            const isCurrent = activeNavId === n.id;
            const isDedicatedRoute =
              (n.id === "support" && route === "/support") || (n.id === "privacy" && route === "/privacy");
            const ariaCurrent = isCurrent ? (isDedicatedRoute ? "page" : "location") : undefined;
            return (
              <AppLink
                key={n.id}
                href={href}
                className={isCurrent ? "is-active" : ""}
                aria-current={ariaCurrent}
                onClick={() => setMenuOpen(false)}
              >
                <span className="header__nav-label">{n.label}</span>
              </AppLink>
            );
          })}
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
