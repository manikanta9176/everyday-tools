import { describe, expect, it } from "vitest";
import { explainCron, nextCronRuns } from "./cron";
import { addCalendar, convertDuration, dateDifference, detectTimestampUnit, formatInstant, parseTimestamp } from "./time";

describe("time", () => {
  it("distinguishes seconds from milliseconds", () => {
    expect(detectTimestampUnit(1_700_000_000)).toBe("seconds");
    expect(detectTimestampUnit(1_700_000_000_000)).toBe("milliseconds");
    const fromSeconds = parseTimestamp("1700000000");
    const fromMs = parseTimestamp("1700000000000");
    expect(fromSeconds.date.toISOString()).toBe("2023-11-14T22:13:20.000Z");
    expect(fromMs.date.toISOString()).toBe(fromSeconds.date.toISOString());
    expect(formatInstant(fromSeconds.date, "UTC").seconds).toBe(1700000000);
  });

  it("handles leap day and month boundaries in UTC", () => {
    const leap = new Date("2024-02-28T00:00:00.000Z");
    expect(addCalendar(leap, 1, "days").toISOString()).toBe("2024-02-29T00:00:00.000Z");
    expect(addCalendar(new Date("2024-01-31T00:00:00.000Z"), 1, "months").toISOString()).toBe(
      "2024-02-29T00:00:00.000Z",
    );
    expect(dateDifference(leap, addCalendar(leap, 2, "days")).days).toBe(2);
  });

  it("converts durations and explains cron", () => {
    expect(convertDuration(1.5, "h").min).toBe(90);
    expect(explainCron("0 9 * * 1-5")).toMatch(/09:00/);
    const runs = nextCronRuns("0 0 1 1 *", 1, new Date("2026-01-01T00:00:00.000Z"));
    expect(runs[0]).toBe("2027-01-01T00:00:00.000Z");
  });
});
