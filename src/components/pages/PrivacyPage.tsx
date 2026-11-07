import { useState } from "react";
import { LINKS } from "../../config/links";
import { copyText } from "../../lib/clipboard";
import {
  IconAlert,
  IconArrowLeft,
  IconCheck,
  IconClock,
  IconCommit,
  IconCopy,
  IconDatabase,
  IconExternal,
  IconGithub,
  IconInfo,
  IconLock,
  IconMail,
  IconRadio,
  IconShield,
} from "../ui/Icons";
import { AppLink } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

const LAST_UPDATED_ISO = "2026-11-07";
const LAST_UPDATED_LABEL = "November 7, 2026";
const EXTENSION_VERSION = "0.3.0";

const POLICY_SECTIONS = [
  { id: "overview", num: "01", label: "Scope & Local-First Role" },
  { id: "information-handled", num: "02", label: "Information Handled" },
  { id: "storage-retention", num: "03", label: "Storage, Buffer & Retention" },
  { id: "redaction", num: "04", label: "Heuristic Redaction Limits" },
  { id: "export-deletion", num: "05", label: "Export, Copy & Deletion" },
  { id: "network-third-parties", num: "06", label: "Network, Analytics & Sharing" },
  { id: "permissions", num: "07", label: "Extension Permissions" },
  { id: "updates", num: "08", label: "Policy Updates" },
  { id: "contact", num: "09", label: "Support & Contact" },
] as const;

const SUMMARY_CARDS = [
  {
    code: "01",
    icon: IconLock,
    title: "Local-First Execution",
    body: "ReproPack operates no cloud backend or ingestion server. Event capture, search, heuristic masking, and JSON formatting run locally inside your browser.",
    meta: "extension_egress: 0 requests",
  },
  {
    code: "02",
    icon: IconRadio,
    title: "On-Device Data Handling",
    body: "Local processing still handles diagnostic data—including error stacks, URLs, and any personal or authentication values present in developer-supplied events.",
    meta: "capture_scope: explicit only",
  },
  {
    code: "03",
    icon: IconDatabase,
    title: "Bounded Session Buffer",
    body: "Events are stored in an in-memory ring buffer (default 1,000-event cap, 64 KiB per event) and chrome.storage.session with FIFO eviction and 24-hour expiration.",
    meta: "retention: <= 1,000 events · 24h",
  },
  {
    code: "04",
    icon: IconAlert,
    title: "Heuristic Redaction",
    body: "Pattern and key-name rules mask common tokens, keys, URL credentials, and emails, but cannot guarantee complete removal of sensitive or custom data.",
    meta: "redaction: best-effort regex",
  },
] as const;

export function PrivacyPage() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const onCopyEmail = async () => {
    const ok = await copyText(LINKS.supportEmail);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      toast.show({ tone: "success", title: "Support email copied", detail: LINKS.supportEmail });
    } else {
      toast.show({ tone: "warn", title: "Clipboard unavailable", detail: LINKS.supportEmail });
    }
  };

  return (
    <section className="section privacy-page" aria-labelledby="privacy-page-title">
      <div className="container">
        <div className="privacy-page__inner">
          <header className="privacy-page__header">
            <AppLink href="/" className="support-page__back mono">
              <IconArrowLeft size={13} />
              <span>Back to ReproPack</span>
            </AppLink>

            <span className="eyebrow">
              <IconShield size={13} className="eyebrow__index" />
              <span>Privacy Policy</span>
            </span>

            <h1 id="privacy-page-title" className="privacy-page__title">
              Privacy Policy
            </h1>

            <p className="privacy-page__intro">
              ReproPack is an open-source, local-first diagnostic event recorder for developers and QA engineers. This Privacy Policy
              describes what diagnostic and user-supplied information the ReproPack Chrome extension and public website handle, how session
              storage and retention limits work, the capabilities and limits of heuristic redaction, and how you control export and deletion.
            </p>

            <div className="privacy-page__meta mono" aria-label="Policy metadata">
              <span className="badge badge--accent">
                <IconClock size={11} />
                <span>
                  Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_LABEL}</time>
                </span>
              </span>
              <span className="badge">
                <IconCommit size={11} />
                <span>Extension :: v{EXTENSION_VERSION} (Manifest V3)</span>
              </span>
              <span className="badge badge--ok">
                <span className="dot" />
                <span>telemetry :: 0 outbound</span>
              </span>
              <span className="badge">
                <span>permissions :: [&quot;storage&quot;]</span>
              </span>
            </div>
          </header>

          <div className="privacy-grid" aria-label="Privacy architecture summary">
            {SUMMARY_CARDS.map(({ code, icon: Icon, title, body, meta }) => (
              <article key={code} className="card privacy-card">
                <div className="privacy-card__head">
                  <span className="privacy-card__icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span className="mono privacy-card__code">S-{code}</span>
                </div>
                <h2>{title}</h2>
                <p>{body}</p>
                <div className="privacy-card__foot mono">{meta}</div>
              </article>
            ))}
          </div>

          <div className="privacy-page__layout">
            <aside className="privacy-page__rail" aria-label="On this page">
              <div className="card privacy-toc">
                <div className="privacy-toc__title mono">Contents</div>
                <nav aria-label="Privacy policy sections">
                  <ol className="privacy-toc__list">
                    {POLICY_SECTIONS.map((s) => (
                      <li key={s.id}>
                        <AppLink href={`/privacy#${s.id}`} className="privacy-toc__link">
                          <span className="privacy-toc__num mono">{s.num}</span>
                          <span>{s.label}</span>
                        </AppLink>
                      </li>
                    ))}
                  </ol>
                </nav>
                <div className="privacy-toc__foot">
                  <a className="text-link mono" href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
                    View PRIVACY.md on GitHub <IconExternal size={11} />
                  </a>
                </div>
              </div>
            </aside>

            <article className="privacy-doc">
              {/* 01 */}
              <section id="overview" className="card privacy-section" aria-labelledby="heading-overview">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">01</span>
                  <h2 id="heading-overview">Scope &amp; Local-First Architecture</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    This Privacy Policy applies to the <strong>ReproPack Chrome Extension</strong> (Manifest V3, version{" "}
                    <code>{EXTENSION_VERSION}</code>) and the public ReproPack website at <code>repropack.vercel.app</code>.
                  </p>
                  <p>
                    ReproPack is a <strong>local-first diagnostic event recorder</strong> built to help developers and QA engineers capture,
                    inspect, filter, sanitize, and export structured runtime diagnostic records for bug reproduction. ReproPack does not
                    operate any backend ingestion API, cloud sync database, crash-reporting service, or analytics server.
                  </p>
                  <div className="callout callout--info">
                    <IconInfo size={16} />
                    <div>
                      <strong>Local processing still involves data handling:</strong> Because ReproPack records diagnostic events supplied by
                      extension contexts or developer instrumentation inside your browser, the extension handles technical diagnostic payloads
                      on-device—and may handle personal or authentication-related values if they appear inside those user- or
                      application-supplied events. All such handling occurs locally on your device solely to provide ReproPack&apos;s
                      debugging and export features.
                    </div>
                  </div>
                </div>
              </section>

              {/* 02 */}
              <section id="information-handled" className="card privacy-section" aria-labelledby="heading-information-handled">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">02</span>
                  <h2 id="heading-information-handled">Diagnostic Information ReproPack Can Handle</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    Installing ReproPack does <strong>not</strong> enable passive surveillance across your browser. The extension does not
                    inject content scripts into arbitrary websites, monitor open tabs, record keystrokes or form inputs, read browser
                    cookies, or passively intercept browser-wide <code>console.*</code> or network traffic.
                  </p>
                  <p>
                    Diagnostic records enter ReproPack only from explicit sources: internal Chrome runtime messages (
                    <code>chrome.runtime.sendMessage</code> actions <code>REPROPACK_INGEST</code>, <code>REPROPACK_CAPTURE_CONSOLE</code>,
                    and <code>REPROPACK_CAPTURE_NETWORK</code>) sent by extension views or explicitly integrated developer code; optional
                    probe helpers (<code>instrumentedFetch</code>, <code>formatConsoleError</code>, <code>formatUnhandledException</code>,{" "}
                    <code>formatNetworkFailure</code>) when explicitly invoked; and ReproPack&apos;s own service-worker lifecycle and
                    unhandled error listeners.
                  </p>

                  <h3>Categories of Data Processed On-Device</h3>
                  <ul className="privacy-list">
                    <li>
                      <strong>Runtime &amp; Console Diagnostic Events:</strong> Event identifiers, millisecond epoch timestamps, categories (
                      <code>console</code>, <code>network</code>, <code>dom</code>, <code>navigation</code>, <code>error</code>,{" "}
                      <code>lifecycle</code>, <code>storage</code>, <code>custom</code>), severities (<code>debug</code>, <code>info</code>,{" "}
                      <code>warn</code>, <code>error</code>), subsystem source names, event names, error messages, JavaScript stack traces,
                      source file URLs, line and column numbers, structured JSON-compatible <code>payload</code> objects, and flat primitive{" "}
                      <code>metadata</code> tags (capped at 50 entries).
                    </li>
                    <li>
                      <strong>Failed Network Request Metadata (Instrumented Contexts Only):</strong> When reported through{" "}
                      <code>REPROPACK_CAPTURE_NETWORK</code> or <code>instrumentedFetch</code> (which records failed requests with HTTP status{" "}
                      <code>&gt;= 400</code> or thrown network errors and ignores <code>2xx</code>/<code>3xx</code> responses), ReproPack
                      handles the sanitized request URL, HTTP method, response status code, status text, failure message, elapsed duration (
                      <code>durationMs</code>), and request type. Built-in network probes never collect request bodies, response bodies,{" "}
                      <code>Cookie</code> / <code>Set-Cookie</code> headers, or <code>Authorization</code> /{" "}
                      <code>Proxy-Authorization</code> headers.
                    </li>
                    <li>
                      <strong>Potentially Identifiable Information (PII) in User-Supplied Events:</strong> Because{" "}
                      <code>REPROPACK_INGEST</code> payloads, error strings, stack traces, and request URLs reflect the diagnostic inputs
                      supplied by the developer or application under test, captured events can contain potentially identifiable information if
                      present in those inputs—such as email addresses, usernames, user or account identifiers, IP addresses, URL parameters,
                      or user-entered strings echoed in an application error message.
                    </li>
                    <li>
                      <strong>Authentication- &amp; Credential-Related Values in User-Supplied Events:</strong> Although ReproPack does not
                      read browser cookie stores or HTTP auth headers, caller-supplied event payloads, error messages, or URLs may include
                      authentication-related values if passed by the caller—such as Bearer tokens, JSON Web Tokens (JWTs), API keys, OAuth
                      codes, session identifiers, passwords, or URL-embedded credentials. Automated heuristic sanitization runs before events
                      are buffered, subject to the limitations in Section 04.
                    </li>
                    <li>
                      <strong>Extension Lifecycle &amp; Local UI State:</strong> When the extension is installed or updated,{" "}
                      <code>chrome.runtime.onInstalled</code> records a local <code>extension.installed</code> event containing the install{" "}
                      <code>reason</code> and <code>previousVersion</code>. Dismissing the informational notice banner in the popup stores a
                      single UI preference flag (<code>repropack:dismiss_notice = &quot;1&quot;</code>) in the extension origin&apos;s{" "}
                      <code>localStorage</code>.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 03 */}
              <section id="storage-retention" className="card privacy-section" aria-labelledby="heading-storage-retention">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">03</span>
                  <h2 id="heading-storage-retention">Session Storage, Buffer Limits, Retention &amp; FIFO Eviction</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    ReproPack bounds both how much diagnostic data can be held in memory and how long it remains available during a debugging
                    session:
                  </p>

                  <div className="privacy-spec-table-wrap" role="region" aria-label="Storage and retention limits" tabIndex={0}>
                    <table className="privacy-spec-table">
                      <thead>
                        <tr>
                          <th scope="col">Mechanism</th>
                          <th scope="col">Extension Implementation</th>
                          <th scope="col">Behavior &amp; Boundary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Primary Buffer</td>
                          <td>
                            <code>RingBuffer</code> (Service Worker)
                          </td>
                          <td>In-memory circular buffer with defensive deep cloning; rejects DOM nodes and functions.</td>
                        </tr>
                        <tr>
                          <td>Session Checkpoint</td>
                          <td>
                            <code>chrome.storage.session</code>
                          </td>
                          <td>
                            Debounced (<code>50ms</code>) snapshot under key <code>repropack:telemetry_snapshot</code> so active events
                            survive Manifest V3 service-worker idle sleep cycles without writing telemetry to disk.
                          </td>
                        </tr>
                        <tr>
                          <td>Buffer Capacity Limit</td>
                          <td>
                            <code>1,000</code> events (default)
                          </td>
                          <td>
                            Instantiated at <code>1,000</code> events in the extension service worker (configurable in code up to{" "}
                            <code>50,000</code>).
                          </td>
                        </tr>
                        <tr>
                          <td>Capacity Eviction</td>
                          <td>First-In, First-Out (FIFO)</td>
                          <td>
                            When the <code>1,000</code>-event buffer is full, each newly ingested event overwrites and evicts the oldest
                            buffered event in <code>O(1)</code> order.
                          </td>
                        </tr>
                        <tr>
                          <td>Time Retention</td>
                          <td>
                            <code>24 hours</code> (<code>86,400,000 ms</code>)
                          </td>
                          <td>
                            Events older than 24 hours are automatically evicted during new event ingestion, batch export, and service-worker
                            hydration from <code>chrome.storage.session</code>.
                          </td>
                        </tr>
                        <tr>
                          <td>Event &amp; String Caps</td>
                          <td>
                            <code>64 KiB</code> / <code>4,096</code> chars
                          </td>
                          <td>
                            Strings over <code>4,096</code> chars are truncated; object depth beyond <code>12</code> levels becomes{" "}
                            <code>[MAX_DEPTH_EXCEEDED]</code>; events exceeding <code>64 KiB</code> serialized UTF-8 replace their payload
                            with a static <code>PAYLOAD_OVERFLOW</code> descriptor.
                          </td>
                        </tr>
                        <tr>
                          <td>Persistent Disk / Sync</td>
                          <td>Not used for telemetry</td>
                          <td>
                            Diagnostic events are never written to <code>chrome.storage.local</code>, <code>chrome.storage.sync</code>,{" "}
                            <code>IndexedDB</code>, or cookies. Closing the browser ends the session and clears{" "}
                            <code>chrome.storage.session</code>.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="privacy-note text-secondary">
                    <em>Website interactive demo note:</em> The interactive Workbench and Redaction Lab on{" "}
                    <code>repropack.vercel.app</code> run strictly in page memory inside your open tab using synthetic sample events (capped at{" "}
                    <code>500</code> demo events) and do not read from or connect to an installed ReproPack extension.
                  </p>
                </div>
              </section>

              {/* 04 */}
              <section id="redaction" className="card privacy-section" aria-labelledby="heading-redaction">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">04</span>
                  <h2 id="heading-redaction">Heuristic Redaction &amp; Its Limitations</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    During ingestion—before an event is stored in the in-memory ring buffer or checkpointed to{" "}
                    <code>chrome.storage.session</code>—ReproPack runs a synchronous client-side heuristic sanitizer (
                    <code>redactor.ts</code>) across event strings, URLs, payload keys, and metadata:
                  </p>

                  <ul className="privacy-list">
                    <li>
                      <strong>Sensitive Object &amp; Metadata Keys:</strong> Values assigned to keys matching <code>auth</code>,{" "}
                      <code>token</code>, <code>access_token</code>, <code>refresh_token</code>, <code>api_key</code>, <code>secret</code>,{" "}
                      <code>client_secret</code>, <code>password</code>, <code>passwd</code>, <code>user_password</code>, <code>code</code>,{" "}
                      <code>session</code>, <code>session_id</code>, <code>jwt</code>, <code>credential</code>, <code>authorization</code>,{" "}
                      <code>cookie</code>, <code>auth_token</code>, or <code>id_token</code> (case-insensitive, including <code>_</code> and{" "}
                      <code>-</code> variants) are replaced with <code>[REDACTED]</code>.
                    </li>
                    <li>
                      <strong>Known Token &amp; Credential Formats:</strong> Scrubs <code>Bearer &lt;token&gt;</code> values (
                      <code>Bearer [REDACTED]</code>), JSON Web Tokens starting with <code>eyJ...</code> (<code>[REDACTED_JWT]</code>), AWS
                      Access Key IDs starting with <code>AKIA</code> (<code>[REDACTED_AWS_KEY]</code>), GitHub tokens (<code>ghp_</code>,{" "}
                      <code>gho_</code>, <code>ghu_</code>, <code>ghs_</code>, <code>ghr_</code> → <code>[REDACTED_GITHUB_TOKEN]</code>), and
                      Slack tokens (<code>xoxb-</code>, <code>xoxp-</code>, <code>xoxa-</code>, <code>xoxr-</code>, <code>xoxs-</code> →{" "}
                      <code>[REDACTED_SLACK_TOKEN]</code>).
                    </li>
                    <li>
                      <strong>Email Addresses:</strong> Standard email address strings are masked as <code>[REDACTED_EMAIL]</code>.
                    </li>
                    <li>
                      <strong>URL Credentials &amp; Query Parameters:</strong> Strips HTTP Basic Auth userinfo (
                      <code>//user:pass@host</code>) and masks URL query parameters or hash fragments whose keys match the sensitive-key
                      pattern above while preserving hostnames and route paths.
                    </li>
                  </ul>

                  <div className="callout callout--warn">
                    <IconAlert size={16} />
                    <div>
                      <strong>Important limitation — redaction is best-effort and cannot guarantee complete removal:</strong> Heuristic
                      sanitization relies on fixed regular expressions and property-name matching. It is a defense-in-depth convenience,{" "}
                      <strong>not</strong> a complete data-loss-prevention (DLP) engine, security boundary, or compliance certification (such
                      as GDPR, HIPAA, PCI-DSS, or SOC 2). Specifically, extension redaction will <strong>not</strong> detect custom or
                      unprefixed secrets stored under generic key names (e.g., <code>data</code>, <code>value</code>, <code>body</code>),
                      free-form personal names, phone numbers, IP addresses, payment card numbers, physical addresses, or Base64/URL-encoded
                      and split credentials. <strong>Always manually inspect exported JSON before sharing it externally.</strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* 05 */}
              <section id="export-deletion" className="card privacy-section" aria-labelledby="heading-export-deletion">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">05</span>
                  <h2 id="heading-export-deletion">Export, Clipboard Copy &amp; Data Deletion</h2>
                </div>
                <div className="privacy-section__body">
                  <h3>User-Initiated Export Only</h3>
                  <p>
                    Buffered events never leave ReproPack unless you explicitly trigger an export action in the popup or full-tab dashboard:
                  </p>
                  <ul className="privacy-list">
                    <li>
                      <strong>Export JSON:</strong> Serializes the current session batch (<code>TelemetryBatch</code>) as 2-space indented
                      JSON in memory, constructs a local <code>Blob</code> (<code>application/json;charset=utf-8</code>), and initiates a
                      browser download (<code>repropack-telemetry-YYYY-MM-DD-HHMMSS.json</code>) via a temporary{" "}
                      <code>URL.createObjectURL</code> anchor—without requiring Chrome&apos;s <code>downloads</code> permission.
                    </li>
                    <li>
                      <strong>Copy JSON:</strong> Writes the currently selected event&apos;s formatted JSON directly to your operating system
                      clipboard via <code>navigator.clipboard.writeText</code> when you click <strong>Copy JSON</strong> in the detail
                      drawer.
                    </li>
                  </ul>
                  <p>
                    Once you save a <code>.json</code> file to disk or copy event text to your clipboard, that copy resides outside the
                    extension under your operating system&apos;s control, and any subsequent sharing (such as attaching a file to GitHub
                    Issues, emailing support, or pasting into an AI coding assistant) is governed by your own choices and the receiving
                    service&apos;s policies.
                  </p>

                  <h3>Deleting Recorded Data</h3>
                  <ul className="privacy-list">
                    <li>
                      <strong>Immediate Manual Clear:</strong> Click <strong>Clear</strong> in the ReproPack toolbar and confirm{" "}
                      <strong>Clear All Telemetry</strong>. This sends <code>REPROPACK_CLEAR</code>, immediately wiping the in-memory{" "}
                      <code>RingBuffer</code> and removing <code>repropack:telemetry_snapshot</code> from{" "}
                      <code>chrome.storage.session</code>.
                    </li>
                    <li>
                      <strong>Closing the Browser Session:</strong> Closing all Chrome windows terminates the browser session and purges{" "}
                      <code>chrome.storage.session</code> automatically.
                    </li>
                    <li>
                      <strong>Uninstalling the Extension:</strong> Removing ReproPack from <code>chrome://extensions</code> deletes the
                      extension and clears all associated extension storage, including session snapshots and the popup notice-dismissal flag.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 06 */}
              <section id="network-third-parties" className="card privacy-section" aria-labelledby="heading-network-third-parties">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">06</span>
                  <h2 id="heading-network-third-parties">External Servers, Analytics, Telemetry &amp; Third Parties</h2>
                </div>
                <div className="privacy-section__body">
                  <dl className="privacy-dl">
                    <div className="privacy-dl__item">
                      <dt>Transmission to External Servers</dt>
                      <dd>
                        <strong>None by the Chrome extension.</strong> The ReproPack extension initiates zero network requests to ReproPack
                        servers or third-party endpoints. All ingestion, indexing, redaction, and JSON export run locally on your machine.
                      </dd>
                    </div>
                    <div className="privacy-dl__item">
                      <dt>Analytics &amp; Telemetry</dt>
                      <dd>
                        <strong>None.</strong> Neither the ReproPack Chrome extension nor the ReproPack website embeds analytics SDKs,
                        behavioral trackers, crash-reporting beacons, telemetry collectors, or advertising cookies.
                      </dd>
                    </div>
                    <div className="privacy-dl__item">
                      <dt>Third-Party Data Sharing &amp; Limited Use</dt>
                      <dd>
                        <strong>None.</strong> ReproPack does not sell, rent, license, transfer, or disclose extension diagnostic or user
                        data to third parties, and does not use data for advertising, profiling, creditworthiness, or lending. On-device data
                        handling complies with the Chrome Web Store User Data Policy, including Limited Use requirements, and is used solely
                        to provide user-facing local debugging and export functionality.
                      </dd>
                    </div>
                    <div className="privacy-dl__item">
                      <dt>Public Website Hosting &amp; Voluntary Support Contact</dt>
                      <dd>
                        When you visit <code>repropack.vercel.app</code>, static web pages are served over HTTPS by Vercel, which processes
                        standard HTTP connection metadata (such as IP address, requested path, timestamp, and browser user-agent) at the
                        infrastructure layer to deliver pages and maintain network security. Following external links to GitHub is governed
                        by GitHub&apos;s privacy policy. If you voluntarily email support or file a GitHub issue, we receive only the
                        contact details, message, and attachments you choose to send, used solely to respond to and resolve your request.
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* 07 */}
              <section id="permissions" className="card privacy-section" aria-labelledby="heading-permissions">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">07</span>
                  <h2 id="heading-permissions">Chrome Extension Permissions</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    ReproPack&apos;s <code>manifest.json</code> requests a single Chrome permission:
                  </p>
                  <ul className="privacy-list">
                    <li>
                      <strong>
                        <code>storage</code>:
                      </strong>{" "}
                      Used exclusively to checkpoint and hydrate active diagnostic batches in <code>chrome.storage.session</code> across
                      Manifest V3 background service-worker sleep/wake cycles.
                    </li>
                  </ul>
                  <p>
                    ReproPack requests <strong>no</strong> <code>host_permissions</code> (no <code>&lt;all_urls&gt;</code>),{" "}
                    <strong>no</strong> content-script injection permissions (<code>scripting</code>), and <strong>no</strong>{" "}
                    <code>webRequest</code>, <code>declarativeNetRequest</code>, <code>cookies</code>, <code>tabs</code>,{" "}
                    <code>downloads</code>, <code>history</code>, <code>management</code>, or <code>nativeMessaging</code> permissions.
                    Opening the full-tab view launches the extension&apos;s own internal <code>popup.html?view=tab</code> page without
                    accessing external browser tab URLs or titles.
                  </p>
                </div>
              </section>

              {/* 08 */}
              <section id="updates" className="card privacy-section" aria-labelledby="heading-updates">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">08</span>
                  <h2 id="heading-updates">Changes to This Privacy Policy</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    If a future version of ReproPack changes its extension permissions, storage behavior, redaction rules, or data practices,
                    we will update both this page (<code>/privacy</code>) and{" "}
                    <a className="text-link mono" href={LINKS.privacy} target="_blank" rel="noopener noreferrer">
                      PRIVACY.md
                    </a>{" "}
                    in the source repository and revise the <strong>Last updated</strong> date at the top of the policy before publishing the
                    update.
                  </p>
                </div>
              </section>

              {/* 09 */}
              <section id="contact" className="card privacy-section privacy-section--contact" aria-labelledby="heading-contact">
                <div className="privacy-section__head">
                  <span className="mono privacy-section__num">09</span>
                  <h2 id="heading-contact">Support &amp; Privacy Contact</h2>
                </div>
                <div className="privacy-section__body">
                  <p>
                    For questions about this Privacy Policy, Chrome Web Store disclosures, or ReproPack&apos;s data-handling architecture,
                    contact us directly by email or inspect the open-source codebase on GitHub. Please review and sanitize any exported{" "}
                    <code>.json</code> session bundle before attaching it to an email or public issue.
                  </p>

                  <address className="support-email-box">
                    <span className="support-email-box__label mono">Official privacy &amp; support contact</span>
                    <a
                      className="support-email-link mono"
                      href={LINKS.supportMailto}
                      aria-label={`Email ReproPack privacy and support at ${LINKS.supportEmail}`}
                    >
                      {LINKS.supportEmail}
                    </a>
                  </address>

                  <div className="support-card__actions">
                    <a
                      className="btn btn--primary"
                      href={LINKS.supportMailto}
                      aria-label={`Compose an email to ${LINKS.supportEmail}`}
                    >
                      <IconMail size={15} />
                      Email Support
                    </a>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={onCopyEmail}
                      aria-label={`Copy support email address ${LINKS.supportEmail}`}
                    >
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <AppLink className="btn btn--secondary" href={LINKS.supportPage}>
                      Support Page
                    </AppLink>
                    <a className="btn btn--ghost" href={LINKS.github} target="_blank" rel="noopener noreferrer">
                      <IconGithub size={15} />
                      Source Repository
                      <IconExternal size={12} />
                    </a>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
