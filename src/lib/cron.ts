// Dependency-free standard 5-field cron parser + explainer.
//
// Fields:  minute hour day-of-month month day-of-week
// Supports: *  */n  a-b  a,b,c  a-b/n  named months (JAN..DEC) and
//           days (SUN..SAT, 0 or 7 = Sunday), and the @-macros.
//
// IMPORTANT: never calls `new Date()` at module load — callers pass a `from`.

export type CronParseResult =
  | { valid: true; description: string; nextRuns: Date[] }
  | { valid: false; error: string };

export const CRON_PRESETS: { label: string; expr: string }[] = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Hourly", expr: "0 * * * *" },
  { label: "Daily at 09:00", expr: "0 9 * * *" },
  { label: "Weekdays at 18:00", expr: "0 18 * * 1-5" },
  { label: "Every Monday", expr: "0 9 * * 1" },
  { label: "1st of month", expr: "0 0 1 * *" },
];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

type FieldSpec = {
  name: string;
  min: number;
  max: number;
  // raw, wildcard-aware: whether the user wrote "*" (matters for dom/dow).
  isWildcard: boolean;
  // sorted, de-duplicated set of allowed values.
  values: number[];
  raw: string;
};

const FIELD_DEFS: { name: string; min: number; max: number }[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12 },
  { name: "day-of-week", min: 0, max: 7 },
];

function resolveName(token: string, fieldName: string): string {
  const upper = token.toUpperCase();
  if (fieldName === "month") {
    const idx = MONTH_NAMES.indexOf(upper);
    if (idx !== -1) return String(idx + 1);
  } else if (fieldName === "day-of-week") {
    const idx = DAY_NAMES.indexOf(upper);
    if (idx !== -1) return String(idx);
  }
  return token;
}

// Parse a single field into a sorted set of allowed integers.
function parseField(
  raw: string,
  def: { name: string; min: number; max: number },
): { values: number[]; isWildcard: boolean } | { error: string } {
  const { name, min, max } = def;
  const set = new Set<number>();
  let isWildcard = false;

  const parts = raw.split(",");
  for (const part of parts) {
    if (part === "") {
      return { error: `Empty value in ${name} field.` };
    }

    // Split off an optional step: "<range>/<step>".
    let rangePart = part;
    let step = 1;
    const slashIdx = part.indexOf("/");
    if (slashIdx !== -1) {
      rangePart = part.slice(0, slashIdx);
      const stepStr = part.slice(slashIdx + 1);
      const stepNum = Number(stepStr);
      if (!/^\d+$/.test(stepStr) || !Number.isInteger(stepNum) || stepNum < 1) {
        return { error: `Invalid step "${stepStr}" in ${name} field.` };
      }
      step = stepNum;
    }

    let lo: number;
    let hi: number;

    if (rangePart === "*") {
      isWildcard = true;
      lo = min;
      hi = max;
    } else if (rangePart.includes("-")) {
      const [aRaw, bRaw, ...rest] = rangePart.split("-");
      if (rest.length > 0 || aRaw === undefined || bRaw === undefined) {
        return { error: `Invalid range "${rangePart}" in ${name} field.` };
      }
      const a = Number(resolveName(aRaw, name));
      const b = Number(resolveName(bRaw, name));
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        return { error: `Invalid range "${rangePart}" in ${name} field.` };
      }
      lo = a;
      hi = b;
    } else {
      const v = Number(resolveName(rangePart, name));
      if (!Number.isInteger(v)) {
        return { error: `Invalid value "${rangePart}" in ${name} field.` };
      }
      lo = v;
      hi = slashIdx !== -1 ? max : v; // "5/15" means "from 5 to max, step 15"
    }

    if (lo < min || lo > max || hi < min || hi > max) {
      return {
        error: `${name} value out of range (${min}-${max}): "${part}".`,
      };
    }
    if (lo > hi) {
      return { error: `Inverted range "${rangePart}" in ${name} field.` };
    }

    for (let i = lo; i <= hi; i += step) {
      // Normalise day-of-week: 7 -> 0 (Sunday).
      set.add(name === "day-of-week" && i === 7 ? 0 : i);
    }
  }

  return { values: [...set].sort((a, b) => a - b), isWildcard };
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// Format a Date in UTC as "YYYY-MM-DD HH:MM UTC".
export function formatUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ` +
    `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} UTC`
  );
}

// --- Human description ---------------------------------------------------

function listToText(values: number[], labels: string[]): string {
  const names = values.map((v) => labels[v]);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function describeTime(minute: FieldSpec, hour: FieldSpec): string {
  // Both single values -> "At HH:MM".
  if (
    !minute.isWildcard &&
    minute.values.length === 1 &&
    !hour.isWildcard &&
    hour.values.length === 1
  ) {
    return `At ${pad2(hour.values[0])}:${pad2(minute.values[0])}`;
  }

  // Every minute.
  if (minute.isWildcard && hour.isWildcard) {
    return "Every minute";
  }

  // Step minutes, wildcard hours -> "Every N minutes".
  if (isStep(minute) && hour.isWildcard) {
    return `Every ${minuteStep(minute)} minutes`;
  }

  // Fixed minute, wildcard hours -> "At minute M past every hour".
  if (!minute.isWildcard && minute.values.length === 1 && hour.isWildcard) {
    return `At minute ${minute.values[0]} past every hour`;
  }

  // Fixed minute, specific hours.
  if (!minute.isWildcard && minute.values.length === 1 && !hour.isWildcard) {
    const hrs = hour.values.map((h) => `${pad2(h)}:${pad2(minute.values[0])}`);
    return `At ${joinAnd(hrs)}`;
  }

  // Fallback: field-by-field.
  return `At ${describeFieldGeneric(minute, "minute")} past ${describeFieldGeneric(hour, "hour")}`;
}

function joinAnd(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Detect a pure "*/n" style step that covers the whole range evenly from min.
function isStep(f: FieldSpec): boolean {
  if (f.isWildcard) return false;
  if (f.values.length < 2) return false;
  const diff = f.values[1] - f.values[0];
  if (f.values[0] !== f.min) return false;
  for (let i = 1; i < f.values.length; i++) {
    if (f.values[i] - f.values[i - 1] !== diff) return false;
  }
  // Must actually look like a step (not a full contiguous run already covered
  // by the wildcard path).
  return diff > 1;
}

function minuteStep(f: FieldSpec): number {
  return f.values[1] - f.values[0];
}

function describeFieldGeneric(f: FieldSpec, unit: string): string {
  if (f.isWildcard) return `every ${unit}`;
  if (f.values.length === 1) return `${unit} ${f.values[0]}`;
  return `${unit}s ${joinAnd(f.values.map(String))}`;
}

function buildDescription(fields: FieldSpec[]): string {
  const [minute, hour, dom, month, dow] = fields;

  const parts: string[] = [describeTime(minute, hour)];

  // Day-of-month.
  if (!dom.isWildcard) {
    if (dom.values.length === 1) {
      parts.push(`on day-of-month ${dom.values[0]}`);
    } else {
      parts.push(`on day-of-month ${joinAnd(dom.values.map(String))}`);
    }
  }

  // Month.
  if (!month.isWildcard) {
    parts.push(`in ${listToText(month.values.map((m) => m - 1), MONTH_LABELS)}`);
  }

  // Day-of-week.
  if (!dow.isWildcard) {
    parts.push(`on ${listToText(dow.values, DAY_LABELS)}`);
  }

  return parts.join(", ");
}

// --- Next-run computation ------------------------------------------------

function matches(date: Date, fields: FieldSpec[]): boolean {
  const [minute, hour, dom, month, dow] = fields;

  if (!minute.values.includes(date.getUTCMinutes())) return false;
  if (!hour.values.includes(date.getUTCHours())) return false;
  if (!month.values.includes(date.getUTCMonth() + 1)) return false;

  const domMatch = dom.values.includes(date.getUTCDate());
  const dowMatch = dow.values.includes(date.getUTCDay());

  // Cron semantics: if BOTH dom and dow are restricted (not wildcard), the
  // job runs when EITHER matches. If only one is restricted, that one must
  // match. If both are wildcard, always matches.
  if (!dom.isWildcard && !dow.isWildcard) {
    return domMatch || dowMatch;
  }
  if (!dom.isWildcard) return domMatch;
  if (!dow.isWildcard) return dowMatch;
  return true;
}

const MAX_FORWARD_MS = 4 * 366 * 24 * 60 * 60 * 1000; // ~4 years cap.

function computeNextRuns(
  fields: FieldSpec[],
  from: Date,
  count: number,
): Date[] | { error: string } {
  const runs: Date[] = [];

  // Start at the next whole minute (strictly after `from`).
  const cursor = new Date(from.getTime());
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);

  const limit = from.getTime() + MAX_FORWARD_MS;

  while (runs.length < count && cursor.getTime() <= limit) {
    if (matches(cursor, fields)) {
      runs.push(new Date(cursor.getTime()));
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  if (runs.length === 0) {
    return {
      error: "No matching run times within the next 4 years.",
    };
  }
  return runs;
}

// --- Public API ----------------------------------------------------------

export function explainCron(
  expr: string,
  opts?: { count?: number; from?: Date },
): CronParseResult {
  const count = opts?.count ?? 5;
  const from = opts?.from ?? new Date();

  if (typeof expr !== "string") {
    return { valid: false, error: "Expression must be a string." };
  }

  let normalized = expr.trim();
  if (normalized === "") {
    return { valid: false, error: "Enter a cron expression." };
  }

  // Expand macros.
  if (normalized.startsWith("@")) {
    const macro = MACROS[normalized.toLowerCase()];
    if (!macro) {
      return {
        valid: false,
        error: `Unknown macro "${normalized}". Supported: ${Object.keys(MACROS).join(", ")}.`,
      };
    }
    normalized = macro;
  }

  const tokens = normalized.split(/\s+/);
  if (tokens.length !== 5) {
    return {
      valid: false,
      error: `Expected 5 fields (minute hour day-of-month month day-of-week), got ${tokens.length}.`,
    };
  }

  const fields: FieldSpec[] = [];
  for (let i = 0; i < 5; i++) {
    const def = FIELD_DEFS[i];
    const parsed = parseField(tokens[i], def);
    if ("error" in parsed) {
      return { valid: false, error: parsed.error };
    }
    fields.push({
      name: def.name,
      min: def.min,
      max: def.max,
      isWildcard: parsed.isWildcard,
      values: parsed.values,
      raw: tokens[i],
    });
  }

  const description = buildDescription(fields);

  const nextRuns = computeNextRuns(fields, from, count);
  if ("error" in nextRuns) {
    return { valid: false, error: nextRuns.error };
  }

  return { valid: true, description, nextRuns };
}
