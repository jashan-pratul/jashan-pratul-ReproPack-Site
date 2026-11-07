/**
 * Playground state: one simulated recording session shared by the hero
 * inspector, the command menu and the docs. Everything here runs in-memory in
 * this browser tab — nothing is persisted or transmitted.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { SITE_CONFIG } from "../config/site";
import { pushBounded } from "../lib/buffer";
import { copyText, downloadText, formatBytes } from "../lib/clipboard";
import {
  createSeedEvents,
  generateEvent,
  mulberry32,
  SEVERITIES,
  SOURCES,
  type DiagnosticEvent,
  type EventSource,
  type JsonObject,
  type Severity,
} from "../lib/events";
import { buildExport, exportFilename, serializeExport, type ExportItem } from "../lib/export";
import { DEFAULT_FILTER, filterItems, type FilterState } from "../lib/filter";
import { redactValue, redactString, type Finding } from "../lib/redaction";
import { useToast } from "../components/ui/Toast";

export interface ViewItem extends ExportItem {
  /** Findings regardless of mode, so raw view can preview what would be redacted. */
  potentialFindings: Finding[];
}

interface State {
  sessionId: string;
  sessionStartedAt: number;
  events: DiagnosticEvent[];
  nextSeq: number;
  evicted: number;
  redaction: boolean;
  filter: FilterState;
  selectedId: string | null;
  streaming: boolean;
}

type Action =
  | { type: "append"; events: DiagnosticEvent[] }
  | { type: "clear" }
  | { type: "toggleRedaction"; value?: boolean }
  | { type: "setQuery"; query: string }
  | { type: "toggleSeverity"; severity: Severity }
  | { type: "toggleSource"; source: EventSource }
  | { type: "resetFilter" }
  | { type: "select"; id: string | null }
  | { type: "setStreaming"; value: boolean };

const CAPACITY = SITE_CONFIG.bufferMaxEvents;

function makeSessionId(now: number): string {
  return `ses_${now.toString(36).slice(-6)}`;
}

function init(now: number): State {
  const events = createSeedEvents(now - 4200);
  return {
    sessionId: makeSessionId(now),
    sessionStartedAt: now - 4200,
    events,
    nextSeq: events.length + 1,
    evicted: 0,
    redaction: true,
    filter: DEFAULT_FILTER,
    selectedId: events.find((e) => e.severity === "error")?.id ?? events[0]?.id ?? null,
    streaming: false,
  };
}

function toggleInSet<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "append": {
      const { items, evicted } = pushBounded(state.events, action.events, CAPACITY);
      const last = action.events[action.events.length - 1];
      const selectedStillPresent = state.selectedId !== null && items.some((e) => e.id === state.selectedId);
      return {
        ...state,
        events: items,
        evicted: state.evicted + evicted,
        nextSeq: last ? last.seq + 1 : state.nextSeq,
        selectedId: selectedStillPresent ? state.selectedId : (items[0]?.id ?? null),
      };
    }
    case "clear":
      return { ...state, events: [], evicted: 0, selectedId: null };
    case "toggleRedaction":
      return { ...state, redaction: action.value ?? !state.redaction };
    case "setQuery":
      return { ...state, filter: { ...state.filter, query: action.query } };
    case "toggleSeverity":
      return { ...state, filter: { ...state.filter, severities: toggleInSet(state.filter.severities, action.severity) } };
    case "toggleSource":
      return { ...state, filter: { ...state.filter, sources: toggleInSet(state.filter.sources, action.source) } };
    case "resetFilter":
      return { ...state, filter: DEFAULT_FILTER };
    case "select":
      return { ...state, selectedId: action.id };
    case "setStreaming":
      return { ...state, streaming: action.value };
    default:
      return state;
  }
}

/* Redaction is pure, so cache per event object. */
const redactionCache = new WeakMap<DiagnosticEvent, { payload: JsonObject; message: string; findings: Finding[] }>();
function redactEvent(e: DiagnosticEvent) {
  let hit = redactionCache.get(e);
  if (!hit) {
    const p = redactValue(e.payload, "payload");
    const m = redactString(e.message);
    hit = {
      payload: p.value,
      message: m.output,
      findings: [...m.matches.map((x) => ({ path: "message", rule: x.rule })), ...p.findings],
    };
    redactionCache.set(e, hit);
  }
  return hit;
}

interface PlaygroundApi {
  state: State;
  capacity: number;
  items: ViewItem[];
  visible: ViewItem[];
  selected: ViewItem | null;
  dispatch: Dispatch<Action>;
  emit: (count?: number) => void;
  clear: () => void;
  toggleRedaction: () => void;
  toggleStreaming: () => void;
  /** Called by the viewport observer: streams only while visible, unless the user paused it. */
  setAutoStreaming: (visible: boolean) => void;
  copyExport: (scope?: "visible" | "single") => Promise<void>;
  downloadExport: () => void;
  moveSelection: (delta: number | "first" | "last") => void;
}

const PlaygroundContext = createContext<PlaygroundApi | null>(null);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, Date.now(), init);
  const rngRef = useRef(mulberry32(0x5eed));
  const toast = useToast();
  const stateRef = useRef(state);
  stateRef.current = state;

  const items = useMemo<ViewItem[]>(
    () =>
      state.events.map((event) => {
        const r = redactEvent(event);
        return state.redaction
          ? { event, displayPayload: r.payload, displayMessage: r.message, findings: r.findings, potentialFindings: r.findings }
          : { event, displayPayload: event.payload, displayMessage: event.message, findings: [], potentialFindings: r.findings };
      }),
    [state.events, state.redaction],
  );

  const visible = useMemo(() => filterItems(items, state.filter), [items, state.filter]);
  const selected = useMemo(() => items.find((i) => i.event.id === state.selectedId) ?? null, [items, state.selectedId]);

  const emit = useCallback((count = 1) => {
    const s = stateRef.current;
    const now = Date.now();
    const batch: DiagnosticEvent[] = [];
    for (let i = 0; i < count; i++) {
      // Spread burst timestamps over the last ~second so ordering stays meaningful.
      const ts = count > 1 ? now - (count - i) * 7 : now;
      batch.push(generateEvent(s.nextSeq + i, ts, rngRef.current));
    }
    dispatch({ type: "append", events: batch });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    toast.show({ tone: "info", title: "Session buffer cleared", detail: "Simulated events removed from this tab." });
  }, [toast]);

  const toggleRedaction = useCallback(() => {
    const next = !stateRef.current.redaction;
    dispatch({ type: "toggleRedaction", value: next });
    toast.show(
      next
        ? { tone: "success", title: "Heuristic redaction on", detail: "Likely-sensitive values are masked in view, search and export." }
        : { tone: "warn", title: "Redaction off — raw values visible", detail: "Demo data only. Exports will include raw values." },
    );
  }, [toast]);

  const pausedByUserRef = useRef(
    typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const toggleStreaming = useCallback(() => {
    const next = !stateRef.current.streaming;
    pausedByUserRef.current = !next;
    dispatch({ type: "setStreaming", value: next });
  }, []);
  const setAutoStreaming = useCallback((visible: boolean) => {
    const next = visible && !pausedByUserRef.current;
    if (next !== stateRef.current.streaming) dispatch({ type: "setStreaming", value: next });
  }, []);

  const buildDoc = useCallback(
    (list: ViewItem[]) => {
      const s = stateRef.current;
      return buildExport(list, {
        redactionEnabled: s.redaction,
        sessionId: s.sessionId,
        sessionStartedAt: s.sessionStartedAt,
        capacity: CAPACITY,
        evictedCount: s.evicted,
        bufferedCount: s.events.length,
        filter: {
          severities: SEVERITIES.filter((x) => s.filter.severities.has(x)),
          sources: SOURCES.filter((x) => s.filter.sources.has(x)),
          query: s.filter.query,
        },
      });
    },
    [],
  );

  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const copyExport = useCallback(
    async (scope: "visible" | "single" = "visible") => {
      const list = scope === "single" ? (selectedRef.current ? [selectedRef.current] : []) : visibleRef.current;
      if (list.length === 0) {
        toast.show({ tone: "warn", title: "Nothing to export", detail: "No events match the current filters." });
        return;
      }
      const text = serializeExport(buildDoc(list));
      const ok = await copyText(text);
      const redacted = stateRef.current.redaction;
      toast.show(
        ok
          ? {
              tone: redacted ? "success" : "warn",
              title: `Copied ${list.length} event${list.length === 1 ? "" : "s"} as JSON`,
              detail: `${formatBytes(new Blob([text]).size)} · ${redacted ? "heuristic redaction applied" : "raw values — redaction off"}`,
            }
          : { tone: "warn", title: "Clipboard unavailable", detail: "Your browser blocked clipboard access. Try Download instead." },
      );
    },
    [buildDoc, toast],
  );

  const downloadExport = useCallback(() => {
    const list = visibleRef.current;
    if (list.length === 0) {
      toast.show({ tone: "warn", title: "Nothing to export", detail: "No events match the current filters." });
      return;
    }
    const text = serializeExport(buildDoc(list));
    downloadText(exportFilename(stateRef.current.sessionId), text);
    toast.show({ tone: "success", title: `Downloaded ${list.length} events`, detail: formatBytes(new Blob([text]).size) });
  }, [buildDoc, toast]);

  const moveSelection = useCallback((delta: number | "first" | "last") => {
    const list = visibleRef.current;
    if (list.length === 0) return;
    const currentId = stateRef.current.selectedId;
    const idx = list.findIndex((i) => i.event.id === currentId);
    let next: number;
    if (delta === "first") next = 0;
    else if (delta === "last") next = list.length - 1;
    else if (idx === -1) next = delta > 0 ? 0 : list.length - 1;
    else next = Math.min(list.length - 1, Math.max(0, idx + delta));
    dispatch({ type: "select", id: list[next]?.event.id ?? null });
  }, []);

  // Simulated live stream.
  useEffect(() => {
    if (!state.streaming) return;
    const id = window.setInterval(() => emit(1), 1400);
    return () => window.clearInterval(id);
  }, [state.streaming, emit]);

  const api = useMemo<PlaygroundApi>(
    () => ({
      state,
      capacity: CAPACITY,
      items,
      visible,
      selected,
      dispatch,
      emit,
      clear,
      toggleRedaction,
      toggleStreaming,
      setAutoStreaming,
      copyExport,
      downloadExport,
      moveSelection,
    }),
    [state, items, visible, selected, emit, clear, toggleRedaction, toggleStreaming, setAutoStreaming, copyExport, downloadExport, moveSelection],
  );

  return <PlaygroundContext.Provider value={api}>{children}</PlaygroundContext.Provider>;
}

export function usePlayground(): PlaygroundApi {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error("usePlayground must be used inside <PlaygroundProvider>");
  return ctx;
}
