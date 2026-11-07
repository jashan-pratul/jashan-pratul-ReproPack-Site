/**
 * ReproPack — centralized site configuration.
 *
 * Every external URL and the Chrome Web Store publication state live here so
 * they can be changed in one place. Components must never hard-code URLs.
 *
 * When the Chrome Web Store listing is approved:
 *   1. Set `chromeWebStoreUrl` to the published Chrome Web Store URL.
 *   2. Set `chromeWebStoreStatus` to "live".
 * All installation CTAs and status indicators update automatically.
 */

export type ChromeWebStoreStatus = "live" | "pending_review";

export interface PrimaryInstallCta {
  label: string;
  href: string;
  external: boolean;
  channel: "chrome_web_store" | "source";
}

export const SITE_CONFIG = {
  name: "ReproPack",
  tagline: "Debugging data. Organised locally.",
  description:
    "A local-first diagnostic event recorder for developers. Capture events from supported integrations or explicit instrumentation, keep them in a bounded session buffer, apply heuristic redaction, and export structured JSON.",
  githubUrl: "https://github.com/jashan-pratul/ReproPack",
  /** Empty string = Pending Chrome Web Store Review mode; populate when live. */
  chromeWebStoreUrl: "",
  chromeWebStoreStatus: "pending_review" as ChromeWebStoreStatus,
  storeInstallLabel: "Add to Chrome",
  sourceInstallLabel: "Install ReproPack",
  docsUrl: "https://github.com/jashan-pratul/ReproPack#readme",
  privacyPolicyUrl: "https://github.com/jashan-pratul/ReproPack/blob/main/PRIVACY.md",
  privacyPagePath: "/privacy",
  supportUrl: "https://github.com/jashan-pratul/ReproPack/issues",
  supportEmail: "repropacksupport@gmail.com",
  supportPagePath: "/support",
  /** Maximum number of events retained in a single session buffer. */
  bufferMaxEvents: 500,
} as const;

export const NAV_ITEMS = [
  { id: "scope", label: "Architecture" },
  { id: "playground", label: "Workbench" },
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "Pipeline" },
  { id: "redaction", label: "Redaction" },
  { id: "privacy", label: "Privacy" },
  { id: "install", label: "Install" },
  { id: "faq", label: "FAQ" },
  { id: "support", label: "Support" },
] as const;

/**
 * The store listing is only treated as live when BOTH the status flag is "live"
 * AND a non-empty URL is configured.
 */
export function isStoreLive(
  config: Pick<typeof SITE_CONFIG, "chromeWebStoreStatus" | "chromeWebStoreUrl"> = SITE_CONFIG,
): boolean {
  return config.chromeWebStoreStatus === "live" && config.chromeWebStoreUrl.trim().length > 0;
}

/**
 * Resolves the primary installation CTA label and destination from centralized config.
 */
export function getPrimaryInstallCta(config: typeof SITE_CONFIG = SITE_CONFIG): PrimaryInstallCta {
  if (isStoreLive(config)) {
    return {
      label: config.storeInstallLabel,
      href: config.chromeWebStoreUrl,
      external: true,
      channel: "chrome_web_store",
    };
  }
  return {
    label: config.sourceInstallLabel,
    href: "#install",
    external: false,
    channel: "source",
  };
}
