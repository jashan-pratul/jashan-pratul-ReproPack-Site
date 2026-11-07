import { Playground } from "../playground/Playground";
import { isFilterActive } from "../../lib/filter";
import { usePlayground } from "../../state/playground";
import { IconKeyboard } from "../ui/Icons";
import { Section } from "../ui/Primitives";

const QUICK_QUERIES = [
  { label: "Errors only", query: "level:error" },
  { label: "502 responses", query: "status:502" },
  { label: "Checkout flow", query: "cat:checkout" },
  { label: "Manual instrumentation", query: "source:manual" },
] as const;

export function PlaygroundSection({ onOpenShortcuts }: { onOpenShortcuts: () => void }) {
  const pg = usePlayground();
  const activeQuery = pg.state.filter.query;
  const filtered = isFilterActive(pg.state.filter);

  return (
    <Section
      id="playground"
      index="02"
      eyebrow="Interactive Workbench"
      title="Test the diagnostic recorder in-browser."
      lede="Navigate rows with Up / Down arrows, switch between Formatted Tree and Raw JSON, toggle heuristic redaction, simulate bursts, and export a structured .json bundle."
      aside={
        <button type="button" className="btn btn--secondary btn--sm" onClick={onOpenShortcuts}>
          <IconKeyboard size={14} />
          Keymap <kbd>?</kbd>
        </button>
      }
    >
      <div className="pg-presets">
        <span className="mono text-muted pg-presets__label">Preset queries:</span>
        <div className="pg-presets__list" role="group" aria-label="Sample filter queries">
          {QUICK_QUERIES.map((q) => {
            const isCurrent = activeQuery === q.query;
            return (
              <button
                key={q.query}
                type="button"
                className={`chip chip--source ${isCurrent ? "is-on" : ""}`}
                aria-pressed={isCurrent}
                onClick={() => pg.dispatch({ type: "setQuery", query: isCurrent ? "" : q.query })}
              >
                <span>{q.label}</span>
                <code className="pg-presets__code">{q.query}</code>
              </button>
            );
          })}
          {filtered && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => pg.dispatch({ type: "resetFilter" })}>
              Reset all
            </button>
          )}
        </div>
      </div>

      <Playground />
    </Section>
  );
}
