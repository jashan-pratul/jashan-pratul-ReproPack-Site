/**
 * Diagnostic event model used by the interactive playground.
 *
 * NOTE: This is the *website demo* model. It mirrors the concepts ReproPack
 * works with (severity, source, bounded session, structured payload) but it is
 * not a published API contract. The repository README is authoritative for
 * the extension's own data format.
 */

export type Severity = "info" | "warn" | "error";
export const SEVERITIES: readonly Severity[] = ["info", "warn", "error"] as const;

/**
 * How an event entered the recorder. ReproPack does not passively capture
 * arbitrary pages: events come from a supported integration or from explicit
 * manual instrumentation.
 */
export type EventSource = "integration" | "manual";
export const SOURCES: readonly EventSource[] = ["integration", "manual"] as const;

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export interface DiagnosticEvent {
  /** Stable, sortable identifier. */
  id: string;
  /** Monotonic sequence number within the session. */
  seq: number;
  /** Epoch milliseconds. */
  ts: number;
  severity: Severity;
  source: EventSource;
  /** Free-form grouping label, e.g. "checkout" or "auth". */
  category: string;
  message: string;
  payload: JsonObject;
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
};

export const SOURCE_LABEL: Record<EventSource, string> = {
  integration: "integration",
  manual: "manual",
};

/* ------------------------------------------------------------------------ */
/* Deterministic PRNG so demo sessions are reproducible across reloads.     */
/* ------------------------------------------------------------------------ */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)] as T;
}

export function makeEventId(seq: number, rng: Rng): string {
  const suffix = Math.floor(rng() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `evt_${seq.toString(36).padStart(5, "0")}${suffix}`;
}

/* ------------------------------------------------------------------------ */
/* Seed scenario: a checkout flow that degrades and fails.                  */
/* Values are fabricated demo data; secrets are syntactically plausible     */
/* but not real.                                                            */
/* ------------------------------------------------------------------------ */

type Template = Omit<DiagnosticEvent, "id" | "seq" | "ts"> & { dt: number };

const SCENARIO: Template[] = [
  {
    dt: 0,
    severity: "info",
    source: "manual",
    category: "session",
    message: "Recording session started",
    payload: {
      route: "/cart",
      viewport: "1440x900",
      locale: "en-GB",
      build: "web@4.12.0",
      referrer: "https://shop.example.test/sso/callback#id=eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6ImRlbW8ifQ.RGVtb09ubHlTaWduYXR1cmU",
    },
  },
  {
    dt: 182,
    severity: "info",
    source: "integration",
    category: "network",
    message: "GET /api/cart → 200",
    payload: {
      method: "GET",
      url: "https://shop.example.test/api/cart?session_token=st_8f2kq9w1x7&currency=GBP",
      status: 200,
      durationMs: 143,
    },
  },
  {
    dt: 410,
    severity: "info",
    source: "manual",
    category: "auth",
    message: "User identified",
    payload: { userId: "u_10482", email: "dana.reyes@example.com", plan: "team" },
  },
  {
    dt: 655,
    severity: "info",
    source: "integration",
    category: "ui",
    message: "Route change /cart → /checkout",
    payload: { from: "/cart", to: "/checkout", trigger: "click#proceed" },
  },
  {
    dt: 902,
    severity: "warn",
    source: "integration",
    category: "network",
    message: "POST /api/checkout/quote slow response",
    payload: {
      method: "POST",
      url: "https://shop.example.test/api/checkout/quote",
      status: 200,
      durationMs: 2840,
      thresholdMs: 1500,
      headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1XzEwNDgyIn0.Qm9ndXNEZW1vU2lnbmF0dXJl" },
    },
  },
  {
    dt: 1210,
    severity: "info",
    source: "manual",
    category: "checkout",
    message: "Shipping address submitted",
    payload: {
      step: "shipping",
      contact: { email: "dana.reyes@example.com", phone: "+447700900123" },
      country: "GB",
      valid: true,
    },
  },
  {
    dt: 1544,
    severity: "info",
    source: "manual",
    category: "checkout",
    message: "Payment form rendered",
    payload: { step: "payment", provider: "card", fields: ["number", "expiry", "cvc"] },
  },
  {
    dt: 1981,
    severity: "warn",
    source: "manual",
    category: "checkout",
    message: "Card validation retried",
    payload: {
      attempt: 2,
      cardNumber: "4242 4242 4242 4242",
      reason: "client_validation_timeout",
      note: "card 4111-1111-1111-1111 also tried in a previous session",
    },
  },
  {
    dt: 2270,
    severity: "info",
    source: "integration",
    category: "network",
    message: "POST /api/payments/intent → 201",
    payload: {
      method: "POST",
      url: "https://shop.example.test/api/payments/intent",
      status: 201,
      durationMs: 388,
      config: { api_key: ["sk", "test", "51DemoKeyNotReal9xQ2"].join("_"), mode: "test" },
    },
  },
  {
    dt: 2602,
    severity: "error",
    source: "integration",
    category: "network",
    message: "POST /api/payments/confirm → 502",
    payload: {
      method: "POST",
      url: "https://shop.example.test/api/payments/confirm",
      status: 502,
      durationMs: 30012,
      upstream: "10.20.4.17",
      response: { error: "bad_gateway", retryable: true },
    },
  },
  {
    dt: 2610,
    severity: "error",
    source: "manual",
    category: "checkout",
    message: "Uncaught TypeError in confirmPayment()",
    payload: {
      name: "TypeError",
      message: "Cannot read properties of undefined (reading 'clientSecret')",
      stack: [
        "at confirmPayment (checkout/payment.ts:118:27)",
        "at async onSubmit (checkout/PaymentForm.tsx:64:5)",
      ],
      context: { intentId: "pi_demo_3Nq8", password: "hunter2-demo" },
    },
  },
  {
    dt: 2934,
    severity: "warn",
    source: "manual",
    category: "ui",
    message: "Error boundary rendered fallback",
    payload: { boundary: "CheckoutBoundary", recovered: false, supportEmail: "help@example.com" },
  },
  {
    dt: 3320,
    severity: "info",
    source: "manual",
    category: "storage",
    message: "Cart snapshot persisted",
    payload: { key: "cart:v3", bytes: 2184, items: 3, ghToken: ["ghp", "DemoTokenOnlyForTheWebsite0000000000"].join("_") },
  },
  {
    dt: 3871,
    severity: "error",
    source: "integration",
    category: "network",
    message: "POST /api/payments/confirm → 502 (retry 1)",
    payload: {
      method: "POST",
      url: "https://shop.example.test/api/payments/confirm",
      status: 502,
      durationMs: 30004,
      cookie: "sid=s%3A9f8e7d6c5b4a; theme=dark",
    },
  },
  {
    dt: 4102,
    severity: "info",
    source: "manual",
    category: "session",
    message: "Marker: user reported 'pay button does nothing'",
    payload: { marker: "user-report", channel: "support-chat" },
  },
];

export function createSeedEvents(startTs: number, seed = 20261107): DiagnosticEvent[] {
  const rng = mulberry32(seed);
  return SCENARIO.map(({ dt, ...rest }, i) => ({
    ...rest,
    id: makeEventId(i + 1, rng),
    seq: i + 1,
    ts: startTs + dt,
  }));
}

/* ------------------------------------------------------------------------ */
/* Procedural generator for "Emit event" and "Burst" demo actions.          */
/* ------------------------------------------------------------------------ */

const ENDPOINTS = ["/api/cart", "/api/search", "/api/profile", "/api/orders", "/api/inventory", "/api/flags"];
const UI_ACTIONS = ["click#add-to-cart", "submit#search", "toggle#theme", "open#filters", "scroll#results"];
const CATEGORIES_MANUAL = ["checkout", "ui", "storage", "auth", "session"];
const EMAILS = ["sam.k@example.com", "ops@example.org", "lee+qa@example.net"];

export function generateEvent(seq: number, ts: number, rng: Rng): DiagnosticEvent {
  const roll = rng();
  const severity: Severity = roll < 0.66 ? "info" : roll < 0.88 ? "warn" : "error";
  const source: EventSource = rng() < 0.55 ? "integration" : "manual";
  const id = makeEventId(seq, rng);

  if (source === "integration") {
    const endpoint = pick(rng, ENDPOINTS);
    const method = rng() < 0.6 ? "GET" : "POST";
    const status = severity === "error" ? pick(rng, [500, 502, 503, 504]) : severity === "warn" ? pick(rng, [200, 429]) : 200;
    const durationMs = severity === "warn" ? 1500 + Math.floor(rng() * 2500) : 40 + Math.floor(rng() * 400);
    const payload: JsonObject = {
      method,
      url: `https://shop.example.test${endpoint}`,
      status,
      durationMs,
    };
    if (rng() < 0.3) payload.headers = { authorization: `Bearer tok_${Math.floor(rng() * 1e12).toString(36)}demo` };
    return {
      id,
      seq,
      ts,
      severity,
      source,
      category: "network",
      message: `${method} ${endpoint} → ${status}${severity === "warn" && status === 200 ? " (slow)" : ""}`,
      payload,
    };
  }

  const category = pick(rng, CATEGORIES_MANUAL);
  const payload: JsonObject = { action: pick(rng, UI_ACTIONS), seq };
  if (rng() < 0.35) payload.email = pick(rng, EMAILS);
  if (rng() < 0.15) payload.token = `sk_live_${Math.floor(rng() * 1e14).toString(36)}DEMO`;
  const message =
    severity === "error"
      ? `Unhandled rejection in ${category} handler`
      : severity === "warn"
        ? `Degraded ${category} state detected`
        : `${category} event recorded`;
  return { id, seq, ts, severity, source, category, message, payload };
}
