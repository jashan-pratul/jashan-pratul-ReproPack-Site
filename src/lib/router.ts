import { useEffect, useState } from "react";

export type RoutePath = "/" | "/support" | "/privacy";

export const ROUTE_EVENT = "repropack:routechange";

export interface ParsedTarget {
  path: RoutePath;
  hash: string;
}

/**
 * Normalizes a URL pathname to a known application route.
 */
export function normalizeRoute(pathname: string): RoutePath {
  const cleaned = pathname.trim().replace(/\/+$/, "") || "/";
  if (cleaned === "/support") return "/support";
  if (cleaned === "/privacy") return "/privacy";
  return "/";
}

/**
 * Parses an internal href such as "/", "/support", "#install", or "/#install".
 */
export function parseInternalHref(href: string): ParsedTarget {
  const trimmed = href.trim();
  if (!trimmed || trimmed === "/") {
    return { path: "/", hash: "" };
  }
  if (trimmed.startsWith("#")) {
    return { path: "/", hash: trimmed };
  }
  const hashIdx = trimmed.indexOf("#");
  if (hashIdx === -1) {
    return { path: normalizeRoute(trimmed), hash: "" };
  }
  const rawPath = trimmed.slice(0, hashIdx) || "/";
  const hash = trimmed.slice(hashIdx);
  return { path: normalizeRoute(rawPath), hash };
}

/**
 * Extracts a validated section ID from a URL hash (e.g. "#scope" -> "scope"),
 * returning null for empty hashes, "#top", or unknown anchors.
 */
export function resolveSectionIdFromHash(hash: string, validIds: readonly string[]): string | null {
  const raw = hash.trim().replace(/^#/, "");
  if (!raw || raw === "top") return null;
  return validIds.includes(raw) ? raw : null;
}

/**
 * Deterministically selects the active section from the currently intersecting
 * observed elements in document order ("top" represents the Hero above sections).
 */
export function pickActiveSectionId(orderedIds: readonly string[], intersecting: ReadonlySet<string>): string | null {
  for (const id of orderedIds) {
    if (intersecting.has(id)) {
      return id === "top" ? null : id;
    }
  }
  return null;
}

function getCurrentRoute(): RoutePath {
  if (typeof window === "undefined") return "/";
  return normalizeRoute(window.location.pathname);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function scrollToSectionHash(hash: string, smooth: boolean): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const behavior: ScrollBehavior = smooth && !prefersReducedMotion() ? "smooth" : "instant";
  if (!hash || hash === "#" || hash === "#top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  const id = hash.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior, block: "start" });
  }
}

/**
 * Performs client-side navigation without full page reloads, preserving smooth
 * hash scrolling on the home route and instant top reset on page transitions.
 */
export function navigate(href: string): void {
  if (typeof window === "undefined") return;

  const target = parseInternalHref(href);
  const currentPath = getCurrentRoute();
  const nextUrl = target.path === "/" ? (target.hash && target.hash !== "#top" ? `/${target.hash}` : "/") : `${target.path}${target.hash}`;

  if (currentPath !== target.path) {
    window.history.pushState(null, "", nextUrl);
    window.dispatchEvent(new CustomEvent<ParsedTarget>(ROUTE_EVENT, { detail: target }));

    if (target.hash && target.hash !== "#top") {
      // Allow React to commit the target route DOM before scrolling to the anchor.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSectionHash(target.hash, false);
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    return;
  }

  if (window.location.pathname + window.location.hash !== nextUrl) {
    window.history.pushState(null, "", nextUrl);
  }
  window.dispatchEvent(new CustomEvent<ParsedTarget>(ROUTE_EVENT, { detail: target }));
  scrollToSectionHash(target.hash, true);
}

/**
 * Subscribes to the current normalized pathname across pushState and browser Back/Forward.
 */
export function useRoute(): RoutePath {
  const [route, setRoute] = useState<RoutePath>(() => getCurrentRoute());

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const sync = () => {
      const next = getCurrentRoute();
      setRoute(next);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener(ROUTE_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(ROUTE_EVENT, sync);
    };
  }, []);

  return route;
}
