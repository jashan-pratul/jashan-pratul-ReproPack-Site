/**
 * Centralized external links. Derived from SITE_CONFIG so there is exactly one
 * source of truth. Import from here (or site.ts) — never inline a URL.
 */
import { SITE_CONFIG, getPrimaryInstallCta } from "./site";

export const GITHUB_URL = SITE_CONFIG.githubUrl;
export const CHROME_WEB_STORE_URL = SITE_CONFIG.chromeWebStoreUrl;
export const DOCS_URL = SITE_CONFIG.docsUrl;
export const PRIVACY_POLICY_URL = SITE_CONFIG.privacyPolicyUrl;
export const SUPPORT_URL = SITE_CONFIG.supportUrl;
export const SUPPORT_EMAIL = SITE_CONFIG.supportEmail;
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
export const SUPPORT_PAGE_PATH = SITE_CONFIG.supportPagePath;

/** Derived repository links. */
export const GITHUB_RELEASES_URL = `${GITHUB_URL}/releases`;
export const GITHUB_NEW_ISSUE_URL = `${SUPPORT_URL}/new`;

/** Active primary installation destination derived from SITE_CONFIG. */
export const PRIMARY_INSTALL_URL = getPrimaryInstallCta().href;

export const LINKS = {
  github: GITHUB_URL,
  releases: GITHUB_RELEASES_URL,
  chromeWebStore: CHROME_WEB_STORE_URL,
  docs: DOCS_URL,
  privacy: PRIVACY_POLICY_URL,
  support: SUPPORT_URL,
  supportEmail: SUPPORT_EMAIL,
  supportMailto: SUPPORT_MAILTO,
  supportPage: SUPPORT_PAGE_PATH,
  newIssue: GITHUB_NEW_ISSUE_URL,
  primaryInstall: PRIMARY_INSTALL_URL,
} as const;
