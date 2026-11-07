import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { bufferLevel } from "../../lib/buffer";
import { SEVERITIES, SEVERITY_LABEL, SOURCES, SOURCE_LABEL, type Severity } from "../../lib/events";
import { countBySeverity, isFilterActive } from "../../lib/filter";
import { formatOffset, plural } from "../../lib/format";
import { hasModifier, isTypingTarget } from "../../lib/keyboard";
import { usePlayground, type ViewItem } from "../../state/playground";
import {
  IconCopy,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconInfo,
  IconPause,
  IconPlay,
  IconShield,
  IconTrash,
  IconX,
  IconZap,
} from "../ui/Icons";
import { EventDetail } from "./EventDetail";

const SEV_KEY: Record<string, Severity> = { "1": "info", "2": "warn", "3": "error" };

export function Playground() {
  const pg = usePlayground();
  const { state, visible, items, capacity } = pg;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);

  const counts = countBySeverity(items);
  const level = bufferLevel(state.events.length, capacity);
  const filtered = isFilterActive(state.filter);
  const selectedVisible = visible.some((v) => v.event.id === state.selectedId);

  /* Stream only while the playground is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => pg.setAutoStreaming(Boolean(entry?.isIntersecting)), { threshold: 0.2 });
    io.observe(el);
    return () => {
      io.disconnect();
      pg.setAutoStreaming(false);
    };
  }, [pg]);

  /* Keep the newest events in view while the user is parked at the bottom. */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [visible.length]);

  /* Keep the selected row visible during keyboard navigation (without scrolling the page). */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !state.selectedId) return;
    const row = list.querySelector<HTMLElement>(`[data-id="${state.selectedId}"]`);
    if (!row) return;
    const header = 30;
    const top = row.offsetTop - header;
    const bottom = row.offsetTop + row.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [state.selectedId]);

  const onListScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
  };

  const focusList = () => listRef.current?.focus({ preventScroll: true });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (hasModifier(e)) return;
    if ((e.key === " " || e.key === "Enter") && e.target instanceof HTMLButtonElement) return;
    if (isTypingTarget(e.target)) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (state.filter.query) pg.dispatch({ type: "setQuery", query: "" });
        else focusList();
      } else if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        focusList();
        if (!selectedVisible) pg.moveSelection("first");
      }
      return;
    }
    const handled = (() => {
      switch (e.key) {
        case "j":
        case "ArrowDown":
          pg.moveSelection(1);
          return true;
        case "k":
        case "ArrowUp":
          pg.moveSelection(-1);
          return true;
        case "g":
        case "Home":
          pg.moveSelection("first");
          return true;
        case "G":
        case "End":
          pg.moveSelection("last");
          return true;
        case "PageDown":
          pg.moveSelection(10);
          return true;
        case "PageUp":
          pg.moveSelection(-10);
          return true;
        case "/":
          searchRef.current?.focus({ preventScroll: true });
          searchRef.current?.select();
          return true;
        case "1":
        case "2":
        case "3":
          pg.dispatch({ type: "toggleSeverity", severity: SEV_KEY[e.key] as Severity });
          return true;
        case "r":
          pg.toggleRedaction();
          return true;
        case "c":
          void pg.copyExport("visible");
          return true;
        case "d":
          pg.downloadExport();
          return true;
        case " ":
          pg.toggleStreaming();
          return true;
        case "e":
          pg.emit(5);
          return true;
        case "b":
          pg.emit(100);
          return true;
        case "x":
          pg.clear();
          return true;
        case "Escape":
          if (filtered) {
            pg.dispatch({ type: "resetFilter" });
            return true;
          }
          return false;
        default:
          return false;
      }
    })();
    if (handled) e.preventDefault();
  };

  return (
    <div className="pg" ref={rootRef} onKeyDown={onKeyDown} role="region" aria-label="ReproPack diagnostic workbench (simulated data)">
      {/* Top IDE Workbench Chrome */}
      <div className="pg__chrome">
        <div className="pg__chrome-left">
          <span className={`pg__rec ${state.streaming ? "is-live" : ""}`}>
            <span className="dot" />
            {state.streaming ? "STREAMING" : "PAUSED"}
          </span>
          <span className="pg__chrome-sep" />
          <span className="mono pg__session" title="Simulated session identifier">
            {state.sessionId}
          </span>
          <span className="badge pg__sim-badge" title="All events in this workbench are generated locally in your browser.">
            sandbox · simulated
          </span>
        </div>
        <BufferMeter size={state.events.length} capacity={capacity} evicted={state.evicted} level={level} />
      </div>

      {/* Filter & Sanitization Toolbar */}
      <div className="pg__toolbar">
        <label className="pg__search">
          <span className="sr-only">Filter events</span>
          <span className="mono pg__search-prefix">filter</span>
          <input
            id="playground-search-input"
            ref={searchRef}
            type="text"
            spellCheck={false}
            autoComplete="off"
            placeholder="level:error  status:502  cat:checkout  -retry"
            value={state.filter.query}
            onChange={(e) => pg.dispatch({ type: "setQuery", query: e.target.value })}
            aria-describedby="pg-result-count"
          />
          {state.filter.query ? (
            <button
              type="button"
              className="pg__search-clear"
              aria-label="Clear search"
              onClick={() => {
                pg.dispatch({ type: "setQuery", query: "" });
                searchRef.current?.focus();
              }}
            >
              <IconX size={12} />
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
        </label>

        <div className="pg__chips" role="group" aria-label="Severity">
          {SEVERITIES.map((sev, i) => {
            const on = state.filter.severities.has(sev);
            return (
              <button
                key={sev}
                type="button"
                className={`chip chip--${sev} ${on ? "is-on" : ""}`}
                aria-pressed={on}
                onClick={() => pg.dispatch({ type: "toggleSeverity", severity: sev })}
                title={`Toggle ${SEVERITY_LABEL[sev]} (${i + 1})`}
              >
                <span className="dot" />
                {SEVERITY_LABEL[sev]}
                <span className="chip__count">{counts[sev]}</span>
              </button>
            );
          })}
        </div>

        <div className="pg__chips" role="group" aria-label="Source">
          {SOURCES.map((src) => {
            const on = state.filter.sources.has(src);
            return (
              <button
                key={src}
                type="button"
                className={`chip chip--source ${on ? "is-on" : ""}`}
                aria-pressed={on}
                onClick={() => pg.dispatch({ type: "toggleSource", source: src })}
                title={src === "manual" ? "Events from explicit manual instrumentation" : "Events from a supported integration"}
              >
                {SOURCE_LABEL[src]}
              </button>
            );
          })}
        </div>

        {/* Redaction Micro-Switch with Accessible Explanatory Tooltip */}
        <div className="redact-wrap">
          <button
            type="button"
            role="switch"
            aria-checked={state.redaction}
            aria-describedby="redaction-tooltip"
            className={`redact-switch ${state.redaction ? "is-on" : ""}`}
            onClick={pg.toggleRedaction}
          >
            <span className="redact-switch__track">
              <span className="redact-switch__thumb" />
            </span>
            {state.redaction ? <IconShield size={13} /> : <IconEyeOff size={13} />}
            <span>Heuristic Redaction</span>
            <span className="redact-switch__state mono">{state.redaction ? "ON" : "OFF"}</span>
            <IconInfo size={12} className="redact-switch__info" />
          </button>
          <div id="redaction-tooltip" role="tooltip" className="redact-tooltip">
            Heuristic pattern matching assists developers but does not guarantee 100% detection—review JSON before sharing.
          </div>
        </div>
      </div>

      {!state.redaction && (
        <div className="pg__banner" role="note">
          <IconEye size={14} />
          <span>
            <strong>Unmasked view active.</strong> Underlined tokens indicate values that heuristic rules mask when enabled. Exports created now
            contain raw demo values.
          </span>
        </div>
      )}

      {/* Dense Split Workbench */}
      <div className="pg__body">
        <div className="pg__list-wrap">
          <div className="pg__list-head mono" aria-hidden="true">
            <span>delta</span>
            <span>level</span>
            <span>source</span>
            <span>event</span>
          </div>
          <div
            ref={listRef}
            className="pg__list"
            role="listbox"
            tabIndex={0}
            aria-label="Diagnostic events"
            aria-activedescendant={selectedVisible && state.selectedId ? `row-${state.selectedId}` : undefined}
            onScroll={onListScroll}
          >
            {visible.map((item) => (
              <EventRow
                key={item.event.id}
                item={item}
                startedAt={state.sessionStartedAt}
                selected={item.event.id === state.selectedId}
                onSelect={() => {
                  pg.dispatch({ type: "select", id: item.event.id });
                  focusList();
                }}
              />
            ))}
            {visible.length === 0 && (
              <div className="pg__empty">
                {state.events.length === 0 ? (
                  <>
                    <p>Session buffer is empty.</p>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => pg.emit(5)}>
                      <IconZap size={13} /> Simulate Burst (+5 events)
                    </button>
                  </>
                ) : (
                  <>
                    <p>No events match active filters.</p>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => pg.dispatch({ type: "resetFilter" })}>
                      Reset filters <kbd>Esc</kbd>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <EventDetail hiddenByFilter={Boolean(state.selectedId) && !selectedVisible} />
      </div>

      {/* Workbench Quick Action Toolbar */}
      <div className="pg__status">
        <div className="pg__hints mono" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> cursor
          </span>
          <span>
            <kbd>/</kbd> filter
          </span>
          <span>
            <kbd>R</kbd> redact
          </span>
          <span>
            <kbd>?</kbd> keys
          </span>
        </div>

        <span id="pg-result-count" className="pg__count mono" aria-live="polite">
          {visible.length === items.length ? plural(items.length, "event") : `${visible.length} / ${plural(items.length, "event")}`}
        </span>

        <div className="pg__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={pg.toggleStreaming} title="Pause or resume background event stream (Space)">
            {state.streaming ? <IconPause size={12} /> : <IconPlay size={12} />}
            {state.streaming ? "Pause" : "Stream"}
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => pg.emit(5)} title="Append 5 simulated events (E)">
            <IconZap size={12} /> Simulate Burst (+5 events)
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => pg.emit(100)} title="Burst 100 events to test 500-event FIFO eviction (B)">
            +100 FIFO
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={pg.clear} title="Clear session buffer (X)">
            <IconTrash size={12} /> Clear
          </button>

          <span className="pg__actions-sep" />

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            disabled={!pg.selected}
            onClick={() => void pg.copyExport("single")}
            title="Copy selected event JSON to clipboard"
          >
            <IconCopy size={12} /> Copy Selected
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={pg.downloadExport} title="Download filtered events as a .json file (D)">
            <IconDownload size={12} /> Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}

function EventRow({ item, startedAt, selected, onSelect }: { item: ViewItem; startedAt: number; selected: boolean; onSelect: () => void }) {
  const { event, displayMessage, findings } = item;
  return (
    <div
      id={`row-${event.id}`}
      data-id={event.id}
      role="option"
      aria-selected={selected}
      className={`row row--${event.severity} ${selected ? "is-selected" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
    >
      <span className="row__time mono">{formatOffset(event.ts - startedAt)}</span>
      <span className={`row__sev mono sev-text--${event.severity}`}>{SEVERITY_LABEL[event.severity]}</span>
      <span className="row__src mono">{event.source === "manual" ? "manual" : "integr."}</span>
      <span className="row__msg">
        <span className="row__cat mono">{event.category}</span>
        <span className="row__text">{displayMessage}</span>
      </span>
      {findings.length > 0 && (
        <span className="row__redacted mono" title={`${findings.length} value(s) redacted`}>
          <IconShield size={10} />
          {findings.length}
        </span>
      )}
    </div>
  );
}

function BufferMeter({ size, capacity, evicted, level }: { size: number; capacity: number; evicted: number; level: string }) {
  const pct = Math.min(100, (size / capacity) * 100);
  return (
    <div className={`meter meter--${level}`} title={`Bounded FIFO session buffer: oldest events roll off after ${capacity}.`}>
      <span className="meter__label mono">FIFO buffer</span>
      <span
        className="meter__bar"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={size}
        aria-label="Session buffer usage"
      >
        <span className="meter__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="meter__value mono">
        {size}
        <span className="text-muted"> / {capacity}</span>
      </span>
      {evicted > 0 && <span className="meter__evicted mono">−{evicted} rolled off</span>}
    </div>
  );
}
