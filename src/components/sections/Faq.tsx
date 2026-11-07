import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { isStoreLive, SITE_CONFIG } from "../../config/site";
import { LINKS } from "../../config/links";
import { IconChevron } from "../ui/Icons";
import { AppLink, Section } from "../ui/Primitives";

interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

const ITEMS: FaqItem[] = [
  {
    id: "monitor-tabs",
    question: "Does ReproPack automatically monitor every website or browser tab?",
    answer: (
      <>
        No. {SITE_CONFIG.name} does not monitor arbitrary tabs or perform passive background surveillance. Diagnostic events are captured only
        through supported integrations or explicit manual instrumentation you configure.
      </>
    ),
  },
  {
    id: "passive-capture",
    question: "Does it passively capture all browser console logs and network traffic out of the box?",
    answer: (
      <>
        No. {SITE_CONFIG.name} does not intercept every <code>console.*</code> call or network request out of the box. Without a supported
        integration or explicit instrumentation wired up, nothing enters the session buffer.
      </>
    ),
  },
  {
    id: "local-storage",
    question: "Where is diagnostic data stored, and is anything synced to the cloud?",
    answer: (
      <>
        All session data stays locally inside your browser. {SITE_CONFIG.name} has no cloud-sync service, remote ingestion server, or telemetry
        collector. Nothing leaves your machine unless you explicitly export JSON.
      </>
    ),
  },
  {
    id: "bounded-buffer",
    question: "How does bounded session retention protect browser memory?",
    answer: (
      <>
        Each recording session uses a bounded ring buffer capped at <code>{SITE_CONFIG.bufferMaxEvents}</code> events. Once full, the oldest
        events roll off automatically first (FIFO) so long debugging sessions never accumulate unbounded memory.
      </>
    ),
  },
  {
    id: "redaction-limits",
    question: "Does heuristic redaction guarantee 100% detection of PII and secrets?",
    answer: (
      <>
        No. Heuristic redaction is pattern-based and best-effort — masking common shapes such as sensitive key names, JWTs, bearer tokens, known
        API key prefixes, emails, Luhn-valid card numbers, E.164 phone numbers, and IPv4 addresses. It cannot detect free-form names, custom
        token formats, or encoded values, and is not a security or compliance guarantee. Always review JSON before sharing.
      </>
    ),
  },
  {
    id: "export-format",
    question: "What schema does Structured JSON Export produce?",
    answer: (
      <>
        Exporting generates structured, human-readable JSON containing session metadata, redaction status, active filter context, and the ordered
        array of diagnostic events with timestamps, severities, namespaces/categories, messages, and payloads. See the{" "}
        <a className="text-link" href={LINKS.docs} target="_blank" rel="noopener noreferrer">
          repository README
        </a>{" "}
        for exact schema documentation.
      </>
    ),
  },
  {
    id: "installation",
    question: "How do I install ReproPack while Chrome Web Store review is pending?",
    answer: isStoreLive() ? (
      <>
        Install directly from the{" "}
        <a className="text-link" href={LINKS.chromeWebStore} target="_blank" rel="noopener noreferrer">
          Chrome Web Store
        </a>{" "}
        or build from source via{" "}
        <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        and load it unpacked in Chrome Developer Mode.
      </>
    ) : (
      <>
        While the Chrome Web Store listing is pending review, clone{" "}
        <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
          jashan-pratul/ReproPack
        </a>
        , follow the build commands in the{" "}
        <a className="text-link" href={LINKS.docs} target="_blank" rel="noopener noreferrer">
          README
        </a>
        , open <code>chrome://extensions</code> with <strong>Developer mode</strong> enabled, and click <strong>Load unpacked</strong>.
      </>
    ),
  },
  {
    id: "source-and-support",
    question: "Where can I inspect the source code, privacy policy, or contact support?",
    answer: (
      <>
        Visit our{" "}
        <AppLink className="text-link" href={LINKS.supportPage}>
          Support page
        </AppLink>{" "}
        for full contact and issue-reporting guidance. Source code and documentation live at{" "}
        <a className="text-link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
          github.com/jashan-pratul/ReproPack
        </a>
        , privacy disclosures are in{" "}
        <a className="text-link" href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
          PRIVACY.md
        </a>
        , bug reports are tracked via{" "}
        <a className="text-link" href={LINKS.support} target="_blank" rel="noopener noreferrer">
          GitHub Issues
        </a>
        , and direct support is available by email at{" "}
        <a className="text-link" href={LINKS.supportMailto}>
          {LINKS.supportEmail}
        </a>
        .
      </>
    ),
  },
];

export function Faq() {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set([ITEMS[0]?.id ?? ""]));
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOpen = openIds.size === ITEMS.length;
  const toggleAll = () => {
    setOpenIds(allOpen ? new Set() : new Set(ITEMS.map((i) => i.id)));
  };

  const onHeaderKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = ITEMS.length;
    let nextIndex: number | null = null;
    if (e.key === "ArrowDown") nextIndex = (index + 1) % count;
    else if (e.key === "ArrowUp") nextIndex = (index - 1 + count) % count;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = count - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      triggerRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <Section
      id="faq"
      index="08"
      eyebrow="Technical FAQ"
      title="Direct answers. Strict technical boundaries."
      lede="Navigate questions with Up / Down arrow keys, toggle with Enter or Space."
      aside={
        <button type="button" className="btn btn--ghost btn--sm" onClick={toggleAll}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      }
    >
      <div className="faq card">
        {ITEMS.map((item, idx) => {
          const isOpen = openIds.has(item.id);
          const triggerId = `faq-trigger-${item.id}`;
          const panelId = `faq-panel-${item.id}`;
          return (
            <div key={item.id} className={`faq__item ${isOpen ? "is-open" : ""}`}>
              <h3 className="faq__heading">
                <button
                  ref={(el) => {
                    triggerRefs.current[idx] = el;
                  }}
                  id={triggerId}
                  type="button"
                  className="faq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(e) => onHeaderKeyDown(e, idx)}
                >
                  <span className="faq__num mono">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="faq__q">{item.question}</span>
                  <span className="faq__chevron" aria-hidden="true">
                    <IconChevron size={14} />
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen} className="faq__panel">
                <p className="faq__a">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
