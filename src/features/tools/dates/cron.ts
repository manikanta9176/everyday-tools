import cronstrue from "cronstrue";

type Field = { values: Set<number> | "*"; min: number; max: number };

function parseField(source: string, min: number, max: number): Field {
  if (source === "*" || source === "?") return { values: "*", min, max };
  const values = new Set<number>();
  for (const part of source.split(",")) {
    const [range, stepSource] = part.split("/");
    const step = stepSource ? Number(stepSource) : 1;
    if (!Number.isInteger(step) || step <= 0) throw new Error(`Invalid step in “${source}”.`);
    if (range === "*") {
      for (let value = min; value <= max; value += step) values.add(value);
      continue;
    }
    const [startSource, endSource] = range!.split("-");
    const start = Number(startSource);
    const end = endSource === undefined ? start : Number(endSource);
    if (![start, end].every((value) => Number.isInteger(value) && value >= min && value <= max)) {
      throw new Error(`“${source}” is outside ${min}–${max}.`);
    }
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return { values, min, max };
}

function matches(field: Field, value: number) {
  return field.values === "*" || field.values.has(value);
}

export function explainCron(expression: string) {
  const fields = expression.trim().split(/\s+/);
  if (fields.length < 5 || fields.length > 6) {
    throw new Error("Use 5 fields (minute hour day month weekday) or 6 fields with seconds first.");
  }
  return cronstrue.toString(expression, { throwExceptionOnParseError: true, use24HourTimeFormat: true });
}

export function nextCronRuns(expression: string, count = 5, from = new Date()) {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5 && fields.length !== 6) {
    throw new Error("Next-run calculation supports 5 or 6 numeric cron fields, including *, ranges, lists, and steps.");
  }
  const hasSeconds = fields.length === 6;
  const [second, minute, hour, day, month, weekday] = hasSeconds ? fields : ["0", ...fields];
  if ([second, minute, hour, day, month, weekday].some((field) => /[LW#]/.test(field ?? ""))) {
    throw new Error("This calculator supports *, numbers, lists, ranges, and steps. It does not support L, W, or #.");
  }
  const weekdaySource = weekday === "7" ? "0" : weekday!.replaceAll("7", "0");
  const parsed = {
    second: parseField(second!, 0, 59),
    minute: parseField(minute!, 0, 59),
    hour: parseField(hour!, 0, 23),
    day: parseField(day!, 1, 31),
    month: parseField(month!, 1, 12),
    weekday: parseField(weekdaySource, 0, 6),
  };
  const runs: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), from.getUTCHours(), from.getUTCMinutes()),
  );
  if (cursor.getTime() <= from.getTime()) cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  for (let i = 0; i < 366 * 24 * 60 && runs.length < count; i += 1) {
    const dayOk = matches(parsed.day, cursor.getUTCDate());
    const weekOk = matches(parsed.weekday, cursor.getUTCDay());
    const dayRestricted = parsed.day.values !== "*";
    const weekRestricted = parsed.weekday.values !== "*";
    const dateOk = dayRestricted && weekRestricted ? dayOk || weekOk : dayOk && weekOk;
    if (
      matches(parsed.month, cursor.getUTCMonth() + 1) &&
      dateOk &&
      matches(parsed.hour, cursor.getUTCHours()) &&
      matches(parsed.minute, cursor.getUTCMinutes())
    ) {
      if (!hasSeconds) {
        runs.push(cursor.toISOString());
      } else {
        for (let value = 0; value < 60 && runs.length < count; value += 1) {
          if (!matches(parsed.second, value)) continue;
          const candidate = new Date(cursor.getTime() + value * 1000);
          if (candidate.getTime() > from.getTime()) runs.push(candidate.toISOString());
        }
      }
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }
  if (!runs.length) throw new Error("No run was found in the next year. Check the day and month fields.");
  return runs;
}
