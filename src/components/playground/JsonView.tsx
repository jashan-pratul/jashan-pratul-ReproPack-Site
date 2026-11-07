import { Fragment, useState, type ReactNode } from "react";
import type { JsonValue } from "../../lib/events";
import { isSensitiveKey, RULE_BY_ID, segmentMarkers, segmentString, type Segment } from "../../lib/redaction";
import { IconChevron } from "../ui/Icons";

interface JsonViewProps {
  value: JsonValue;
  /**
   * "redacted": value already contains [REDACTED:*] markers — render them as chips.
   * "raw": value is unredacted — underline spans the heuristics *would* redact.
   */
  mode: "redacted" | "raw";
}

const INDENT = "  ";

function Segments({ segments, mode }: { segments: Segment[]; mode: JsonViewProps["mode"] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.rule ? (
          mode === "redacted" ? (
            <span key={i} className="json-redacted" title={`Redacted by rule: ${RULE_BY_ID[s.rule]?.label ?? s.rule}`}>
              {s.text}
            </span>
          ) : (
            <span key={i} className="json-sensitive" title={`Would be redacted: ${RULE_BY_ID[s.rule]?.label ?? s.rule}`}>
              {s.text}
            </span>
          )
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )}
    </>
  );
}

function renderString(v: string, mode: JsonViewProps["mode"], keyHint?: string): ReactNode {
  const escaped = JSON.stringify(v).slice(1, -1);
  if (mode === "raw" && keyHint !== undefined && isSensitiveKey(keyHint) && v !== "") {
    return (
      <span className="json-string">
        "<span className="json-sensitive" title="Would be redacted: Sensitive key names">{escaped}</span>"
      </span>
    );
  }
  const segments = mode === "redacted" ? segmentMarkers(escaped) : segmentString(escaped, true);
  return (
    <span className="json-string">
      "<Segments segments={segments} mode={mode} />"
    </span>
  );
}

function renderPrimitive(v: JsonValue, mode: JsonViewProps["mode"], keyHint?: string): ReactNode {
  if (v === null) return <span className="json-null">null</span>;
  if (typeof v === "string") return renderString(v, mode, keyHint);
  if (typeof v === "number") {
    if (mode === "raw" && keyHint !== undefined && isSensitiveKey(keyHint)) {
      return <span className="json-number json-sensitive">{String(v)}</span>;
    }
    return <span className="json-number">{String(v)}</span>;
  }
  if (typeof v === "boolean") return <span className="json-bool">{String(v)}</span>;
  return null;
}

/* --------------------------------------------------------------------------
   1. Raw JSON (syntax-highlighted code block)
   -------------------------------------------------------------------------- */

function RawNode({
  value,
  depth,
  mode,
  keyHint,
  trailingComma,
}: {
  value: JsonValue;
  depth: number;
  mode: JsonViewProps["mode"];
  keyHint?: string;
  trailingComma: boolean;
}): ReactNode {
  const pad = INDENT.repeat(depth);
  const comma = trailingComma ? <span className="json-punct">,</span> : null;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <>
          <span className="json-punct">[]</span>
          {comma}
        </>
      );
    }
    return (
      <>
        <span className="json-punct">[</span>
        {"\n"}
        {value.map((item, i) => (
          <Fragment key={i}>
            {pad + INDENT}
            <RawNode value={item} depth={depth + 1} mode={mode} trailingComma={i < value.length - 1} />
            {"\n"}
          </Fragment>
        ))}
        {pad}
        <span className="json-punct">]</span>
        {comma}
      </>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return (
        <>
          <span className="json-punct">{"{}"}</span>
          {comma}
        </>
      );
    }
    return (
      <>
        <span className="json-punct">{"{"}</span>
        {"\n"}
        {entries.map(([k, v], i) => (
          <Fragment key={k}>
            {pad + INDENT}
            <span className="json-key">"{k}"</span>
            <span className="json-punct">: </span>
            <RawNode value={v} depth={depth + 1} mode={mode} keyHint={k} trailingComma={i < entries.length - 1} />
            {"\n"}
          </Fragment>
        ))}
        {pad}
        <span className="json-punct">{"}"}</span>
        {comma}
      </>
    );
  }

  return (
    <>
      {renderPrimitive(value, mode, keyHint)}
      {comma}
    </>
  );
}

export function JsonView({ value, mode }: JsonViewProps) {
  return (
    <pre className="json" tabIndex={0} aria-label="Raw JSON payload">
      <code>
        <RawNode value={value} depth={0} mode={mode} trailingComma={false} />
      </code>
    </pre>
  );
}

/* --------------------------------------------------------------------------
   2. Formatted Tree (interactive collapsible key-value inspector)
   -------------------------------------------------------------------------- */

function TreeBranch({
  label,
  value,
  mode,
  defaultOpen = true,
}: {
  label?: string;
  value: JsonValue;
  mode: JsonViewProps["mode"];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (Array.isArray(value)) {
    return (
      <div className="jtree__branch">
        <button type="button" className="jtree__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className={`jtree__chev ${open ? "is-open" : ""}`}>
            <IconChevron size={11} />
          </span>
          {label !== undefined && <span className="json-key">{label}</span>}
          <span className="jtree__hint">Array[{value.length}]</span>
        </button>
        {open && value.length > 0 && (
          <div className="jtree__children">
            {value.map((item, idx) => (
              <TreeBranch key={idx} label={String(idx)} value={item} mode={mode} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    return (
      <div className="jtree__branch">
        {label !== undefined && (
          <button type="button" className="jtree__toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span className={`jtree__chev ${open ? "is-open" : ""}`}>
              <IconChevron size={11} />
            </span>
            <span className="json-key">{label}</span>
            <span className="jtree__hint">
              {"{"}
              {entries.length} {entries.length === 1 ? "field" : "fields"}
              {"}"}
            </span>
          </button>
        )}
        {(label === undefined || open) && (
          <div className={label !== undefined ? "jtree__children" : "jtree__root"}>
            {entries.map(([k, child]) => (
              <TreeBranch key={k} label={k} value={child} mode={mode} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="jtree__leaf">
      {label !== undefined && (
        <>
          <span className="json-key">{label}</span>
          <span className="json-punct">: </span>
        </>
      )}
      <span className="jtree__val">{renderPrimitive(value, mode, label)}</span>
    </div>
  );
}

export function JsonTreeView({ value, mode }: JsonViewProps) {
  return (
    <div className="jtree mono" tabIndex={0} aria-label="Formatted payload tree">
      <TreeBranch value={value} mode={mode} defaultOpen />
    </div>
  );
}
