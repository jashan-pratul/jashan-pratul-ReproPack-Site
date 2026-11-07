import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { navigate } from "../../lib/router";

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

/**
 * Internal navigation link that preserves native browser behavior for modified
 * clicks (new tab / middle-click) while using History API routing on left-click.
 */
export function AppLink({ href, onClick, children, ...rest }: AppLinkProps) {
  const resolvedHref = href.startsWith("#") ? (href === "#top" ? "/" : `/${href}`) : href;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={resolvedHref} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export function Logo({ className = "w-6 h-6 rounded-md object-contain" }: { className?: string }) {
  return <img src="/logo.png" alt="ReproPack" className={className} />;
}

export function Wordmark({ iconClassName }: { iconClassName?: string }) {
  return (
    <span className="wordmark">
      <Logo className={iconClassName} />
      <span>ReproPack</span>
    </span>
  );
}

export function Kbd({ children, label }: { children: ReactNode; label?: string }) {
  return <kbd aria-label={label}>{children}</kbd>;
}

export function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="kbd-group">
      {keys.map((k) => (
        <kbd key={k}>{k}</kbd>
      ))}
    </span>
  );
}

interface SectionProps {
  id: string;
  index?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ id, index, eyebrow, title, lede, aside, children, className }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className={`section ${className ?? ""}`} aria-labelledby={title ? headingId : undefined}>
      <div className="container">
        <div className="section__inner">
          {(eyebrow || title) && (
            <header className={`section-head ${aside ? "section-head--split" : ""}`}>
              <div style={{ display: "grid", gap: 16 }}>
                {eyebrow && (
                  <span className="eyebrow">
                    {index && <span className="eyebrow__index">{index}</span>}
                    <span>{eyebrow}</span>
                  </span>
                )}
                {title && <h2 id={headingId}>{title}</h2>}
                {lede && <p>{lede}</p>}
              </div>
              {aside}
            </header>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
