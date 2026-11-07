import { useEffect, useState } from "react";

export type RoutePath = "/" | "/support";

const ROUTE_EVENT = "repropack:routechange";

/**
 * Normalizes a URL pathname to a known application route.
 */
export function normalizeRoute(pathname: string): RoutePath {
  const cleaned = pathname.trim().replace(/\/+$/, "") || "/";
  if (cleaned === "/support") return "/support";
  return "/";
}

export interface ParsedTarget {
  path: RoutePath;
  hash: string;
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

function getCurrentRoute(): RoutePath {
  if (typeof window === "undefined") return "/";
  return normalizeRoute(window.location.pathname);
}

function scrollToSectionHash(hash: string, smooth: boolean): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!hash || hash === "#" || hash === "#top") {
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    return;
  }
  const id = hash.slice(1);
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
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
    window.dispatchEvent(new Event(ROUTE_EVENT));

    if (target.hash && target.hash !== "#top") {
      // Allow React to commit the target route DOM before scrolling to the anchor.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSectionHash(target.hash, false);
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    return;
  }

  if (window.location.pathname + window.location.hash !== nextUrl) {
    window.history.pushState(null, "", nextUrl);
  }
  scrollToSectionHash(target.hash, true);
}

/**
 * Subscribes to the current normalized pathname across pushState and browser Back/Forward.
 */
export function useRoute(): RoutePath {
  const [route, setRoute] = useState<RoutePath>(() => getCurrentRoute());

  useEffect(() => {
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
