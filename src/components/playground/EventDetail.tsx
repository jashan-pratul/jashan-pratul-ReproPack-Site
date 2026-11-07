import { useState } from "react";
import { SEVERITY_LABEL } from "../../lib/events";
import { formatClock, formatOffset } from "../../lib/format";
import { RULE_BY_ID, summarizeFindings } from "../../lib/redaction";
import { copyText } from "../../lib/clipboard";
import { usePlayground } from "../../state/playground";
import { IconCode, IconCopy, IconFilter, IconShield, IconTree } from "../ui/Icons";
import { useToast } from "../ui/Toast";
import { JsonTreeView, JsonView } from "./JsonView";

type InspectorTab = "tree" | "raw";

export function EventDetail({ hiddenByFilter }: { hiddenByFilter: boolean }) {
  const pg = usePlayground();
  const toast = useToast();
  const [viewTab, setViewTab] = useState<InspectorTab>("tree");
  const { selected, state } = pg;

  if (!selected) {
    return (
      <aside className="pg__detail pg__detail--empty" aria-label="Event detail">
        <p>No event selected.</p>
        <p className="text-muted">
          Use <kbd>↑</kbd> / <kbd>↓</kbd> or click a row to inspect its payload.
        </p>
      </aside>
    );
  }

  const { event, displayPayload, displayMessage, findings, potentialFindings } = selected;
  const summary = summarizeFindings(state.redaction ? findings : potentialFindings);

  const copyId = async () => {
    const ok = await copyText(event.id);
    toast.show(ok ? { tone: "success", title: "Event ID copied", detail: event.id } : { tone: "warn", title: "Clipboard unavailable" });
  };

  return (
    <aside className="pg__detail" aria-label="Event detail" aria-live="polite">
      {hiddenByFilter && (
        <div className="pg__detail-note">
          <IconFilter size={12} /> Selected event is hidden by the current filters.
        </div>
      )}

      <div className="detail__head">
        <div className="detail__badges">
          <span className={`badge badge--${event.severity}`}>{SEVERITY_LABEL[event.severity]}</span>
          <span className="badge">{event.source}</span>
          <span className="badge">{event.category}</span>
        </div>
        {state.redaction ? (
          <span className="badge badge--redacted">
            <IconShield size={11} /> sanitized
          </span>
        ) : (
          <span className="badge badge--warn">unmasked</span>
        )}
      </div>

      <h3 className="detail__title">{displayMessage}</h3>

      <dl className="detail__meta">
        <div>
          <dt>id</dt>
          <dd>
            <button type="button" className="detail__id mono" onClick={copyId} title="Copy event ID">
              {event.id}
              <IconCopy size={11} />
            </button>
          </dd>
        </div>
        <div>
          <dt>time</dt>
          <dd className="mono">{formatClock(event.ts)}</dd>
        </div>
        <div>
          <dt>delta</dt>
          <dd className="mono">{formatOffset(event.ts - state.sessionStartedAt)}</dd>
        </div>
        <div>
          <dt>seq</dt>
          <dd className="mono">#{event.seq}</dd>
        </div>
      </dl>

      {/* Tabbed Payload Inspector: Formatted Tree vs. Raw JSON */}
      <div className="detail__tabs-bar">
        <div className="detail__tabs" role="tablist" aria-label="Payload display format">
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === "tree"}
            className={`detail__tab ${viewTab === "tree" ? "is-active" : ""}`}
            onClick={() => setViewTab("tree")}
          >
            <IconTree size={12} />
            Formatted Tree
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === "raw"}
            className={`detail__tab ${viewTab === "raw" ? "is-active" : ""}`}
            onClick={() => setViewTab("raw")}
          >
            <IconCode size={12} />
            Raw JSON
          </button>
        </div>
        <span className="mono detail__schema-tag">payload</span>
      </div>

      {viewTab === "tree" ? (
        <JsonTreeView key={event.id} value={displayPayload} mode={state.redaction ? "redacted" : "raw"} />
      ) : (
        <JsonView value={displayPayload} mode={state.redaction ? "redacted" : "raw"} />
      )}

      <div className="detail__findings">
        {Object.keys(summary).length === 0 ? (
          <p className="text-muted">No values matched heuristic patterns in this event.</p>
        ) : (
          <>
            <p className="detail__findings-title">
              {state.redaction
                ? `${findings.length} value${findings.length === 1 ? "" : "s"} redacted`
                : `${potentialFindings.length} value${potentialFindings.length === 1 ? "" : "s"} would be redacted`}
            </p>
            <ul>
              {(state.redaction ? findings : potentialFindings).map((f, i) => (
                <li key={`${f.path}-${i}`}>
                  <code>{f.path}</code>
                  <span className="badge badge--redacted">{RULE_BY_ID[f.rule]?.label ?? f.rule}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
