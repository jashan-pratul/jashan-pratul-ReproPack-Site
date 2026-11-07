/** Keyboard helpers shared by global and scoped shortcut handlers. */
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return !["checkbox", "radio", "button", "submit", "reset", "range"].includes(type);
  }
  return false;
}

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const MOD_KEY_LABEL = isMac ? "⌘" : "Ctrl";

export function hasModifier(e: KeyboardEvent | ReactKeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey || e.altKey;
}

export interface ShortcutDef {
  keys: string[];
  label: string;
  scope: "Site" | "Playground";
}

export const SHORTCUTS: ShortcutDef[] = [
  { keys: [MOD_KEY_LABEL, "K"], label: "Open command menu", scope: "Site" },
  { keys: ["?"], label: "Show keyboard shortcuts", scope: "Site" },
  { keys: ["Esc"], label: "Close dialog / clear search", scope: "Site" },
  { keys: ["J", "↓"], label: "Next event", scope: "Playground" },
  { keys: ["K", "↑"], label: "Previous event", scope: "Playground" },
  { keys: ["G"], label: "First event", scope: "Playground" },
  { keys: ["⇧", "G"], label: "Last event", scope: "Playground" },
  { keys: ["/"], label: "Focus search", scope: "Playground" },
  { keys: ["1"], label: "Toggle INFO", scope: "Playground" },
  { keys: ["2"], label: "Toggle WARN", scope: "Playground" },
  { keys: ["3"], label: "Toggle ERROR", scope: "Playground" },
  { keys: ["R"], label: "Toggle heuristic redaction", scope: "Playground" },
  { keys: ["C"], label: "Copy filtered export (JSON)", scope: "Playground" },
  { keys: ["D"], label: "Download filtered export", scope: "Playground" },
  { keys: ["Space"], label: "Pause / resume simulated stream", scope: "Playground" },
  { keys: ["E"], label: "Simulate burst (+5 events)", scope: "Playground" },
  { keys: ["B"], label: "Burst 100 events", scope: "Playground" },
  { keys: ["X"], label: "Clear session buffer", scope: "Playground" },
];
