import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { LINKS } from "../../config/links";
import { NAV_ITEMS } from "../../config/site";
import { SHORTCUTS } from "../../lib/keyboard";
import { usePlayground } from "../../state/playground";
import {
  IconArrowRight,
  IconCopy,
  IconDownload,
  IconExternal,
  IconGithub,
  IconKeyboard,
  IconSearch,
  IconShield,
  IconTrash,
  IconX,
  IconZap,
} from "../ui/Icons";
import { Keys } from "../ui/Primitives";

interface CommandItem {
  id: string;
  group: "Playground Actions" | "Navigate" | "External Links";
  label: string;
  hint?: string;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onOpenShortcuts,
}: {
  open: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
}) {
  const pg = usePlayground();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<CommandItem[]>(() => {
    const jumpTo = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    const openUrl = (url: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
    };

    return [
      {
        id: "focus-demo-search",
        group: "Playground Actions",
        label: "Filter diagnostic events in Playground",
        hint: "/",
        run: () => {
          jumpTo("playground");
          window.setTimeout(() => {
            const el = document.getElementById("playground-search-input") as HTMLInputElement | null;
            el?.focus();
            el?.select();
          }, 120);
        },
      },
      {
        id: "toggle-redaction",
        group: "Playground Actions",
        label: pg.state.redaction ? "Turn heuristic redaction OFF (reveal raw demo data)" : "Turn heuristic redaction ON",
        hint: "R",
        run: () => {
          pg.toggleRedaction();
          jumpTo("playground");
        },
      },
      {
        id: "copy-json",
        group: "Playground Actions",
        label: `Copy filtered Playground JSON (${pg.visible.length} events)`,
        hint: "C",
        run: () => {
          void pg.copyExport("visible");
        },
      },
      {
        id: "download-json",
        group: "Playground Actions",
        label: "Download filtered Playground JSON file",
        hint: "D",
        run: () => pg.downloadExport(),
      },
      {
        id: "burst-100",
        group: "Playground Actions",
        label: "Emit burst of 100 simulated events (test FIFO buffer)",
        hint: "B",
        run: () => {
          pg.emit(100);
          jumpTo("playground");
        },
      },
      {
        id: "clear-buffer",
        group: "Playground Actions",
        label: "Clear simulated session buffer",
        hint: "X",
        run: () => pg.clear(),
      },
      {
        id: "show-shortcuts",
        group: "Playground Actions",
        label: "Show keyboard shortcuts reference",
        hint: "?",
        run: () => onOpenShortcuts(),
      },
      ...NAV_ITEMS.map(
        (n): CommandItem => ({
          id: `nav-${n.id}`,
          group: "Navigate",
          label: `Go to ${n.label}`,
          hint: `#${n.id}`,
          run: () => jumpTo(n.id),
        }),
      ),
      {
        id: "ext-github",
        group: "External Links",
        label: "Open GitHub Repository",
        hint: "jashan-pratul/ReproPack",
        run: () => openUrl(LINKS.github),
      },
      {
        id: "ext-docs",
        group: "External Links",
        label: "Open Documentation (README)",
        hint: "GitHub",
        run: () => openUrl(LINKS.docs),
      },
      {
        id: "ext-privacy",
        group: "External Links",
        label: "Open Privacy Policy (PRIVACY.md)",
        hint: "GitHub",
        run: () => openUrl(LINKS.privacy),
      },
      {
        id: "ext-support",
        group: "External Links",
        label: "Report an Issue on GitHub",
        hint: "Issues",
        run: () => openUrl(LINKS.support),
      },
    ];
  }, [pg, onOpenShortcuts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || (c.hint ?? "").toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(0);
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  const execute = (item: CommandItem | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(filtered[activeIdx]);
    }
  };

  const iconFor = (c: CommandItem) => {
    if (c.id === "toggle-redaction") return <IconShield size={14} />;
    if (c.id === "copy-json") return <IconCopy size={14} />;
    if (c.id === "download-json") return <IconDownload size={14} />;
    if (c.id === "burst-100") return <IconZap size={14} />;
    if (c.id === "clear-buffer") return <IconTrash size={14} />;
    if (c.id === "show-shortcuts") return <IconKeyboard size={14} />;
    if (c.id === "focus-demo-search") return <IconSearch size={14} />;
    if (c.group === "External Links") return c.id === "ext-github" ? <IconGithub size={14} /> : <IconExternal size={14} />;
    return <IconArrowRight size={14} />;
  };

  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette__search">
          <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
          <IconSearch size={15} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to a section…"
            aria-label="Filter commands"
            spellCheck={false}
          />
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} aria-label="Close command menu">
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className="palette__list" role="listbox" aria-label="Commands">
          {filtered.length === 0 ? (
            <div className="palette__empty text-muted">No matching commands.</div>
          ) : (
            filtered.map((item, i) => {
              const prevGroup = i > 0 ? filtered[i - 1]?.group : null;
              const showGroup = item.group !== prevGroup;
              const active = i === activeIdx;
              return (
                <div key={item.id}>
                  {showGroup && <div className="palette__group mono">{item.group}</div>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`palette__item ${active ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => execute(item)}
                  >
                    <span className="palette__item-icon">{iconFor(item)}</span>
                    <span className="palette__item-label">{item.label}</span>
                    {item.hint && <span className="palette__item-hint mono">{item.hint}</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const siteShortcuts = SHORTCUTS.filter((s) => s.scope === "Site");
  const pgShortcuts = SHORTCUTS.filter((s) => s.scope === "Playground");

  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
      >
        <div className="modal__head">
          <div className="modal__title-wrap">
            <IconKeyboard size={16} />
            <h2 id="shortcuts-modal-title">Keyboard shortcuts</h2>
          </div>
          <button ref={closeRef} type="button" className="btn btn--ghost btn--sm btn--icon" onClick={onClose} aria-label="Close keyboard shortcuts">
            <IconX size={15} />
          </button>
        </div>

        <div className="shortcuts-modal__body">
          <div>
            <h3 className="shortcuts-modal__group mono">Global</h3>
            <ul className="shortcuts-list">
              {siteShortcuts.map((s) => (
                <li key={s.label}>
                  <span>{s.label}</span>
                  <Keys keys={s.keys} />
                </li>
              ))}
              <li>
                <span>Jump to Playground filter</span>
                <Keys keys={["/"]} />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="shortcuts-modal__group mono">Interactive Playground</h3>
            <ul className="shortcuts-list">
              {pgShortcuts.map((s) => (
                <li key={s.label}>
                  <span>{s.label}</span>
                  <Keys keys={s.keys} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
