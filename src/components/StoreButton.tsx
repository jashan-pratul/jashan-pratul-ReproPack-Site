import { getPrimaryInstallCta } from "../config/site";
import { IconArrowRight, IconChrome } from "./ui/Icons";

interface StoreButtonProps {
  size?: "sm" | "md" | "lg";
  labelOverride?: string;
}

/**
 * Primary installation CTA.
 * Smooth-scrolls to `#install` while pending Chrome Web Store review, and
 * automatically upgrades to the external Chrome Web Store link once live.
 */
export function StoreButton({ size = "md", labelOverride }: StoreButtonProps) {
  const sizeClass = size === "lg" ? "btn--lg" : size === "sm" ? "btn--sm" : "";
  const iconSize = size === "lg" ? 16 : size === "sm" ? 13 : 14;
  const cta = getPrimaryInstallCta();
  const label = labelOverride ?? cta.label;

  if (cta.external) {
    return (
      <a className={`btn btn--primary ${sizeClass}`} href={cta.href} target="_blank" rel="noopener noreferrer">
        <IconChrome size={iconSize} />
        {label}
      </a>
    );
  }

  return (
    <a className={`btn btn--primary ${sizeClass}`} href={cta.href}>
      {label}
      <IconArrowRight size={iconSize - 2} />
    </a>
  );
}
