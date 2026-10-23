"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { explainCron, nextCronRuns } from "@/features/tools/dates/cron";
import { addCalendar, convertDuration, dateDifference, formatInstant, parseTimestamp, timeZones } from "@/features/tools/dates/time";
import { useToolHotkeys } from "./use-hotkeys";

export default function TimeTools({ slug }: { slug: string }) {
  if (slug === "date-calculator") return <DateTool />;
  if (slug === "cron-helper") return <CronTool />;
  if (slug === "duration-converter") return <DurationTool />;
  return <TimestampTool />;
}

function TimestampTool() {
  const [input, setInput] = useState("1700000000");
  const [zone, setZone] = useState("UTC");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const parsed = parseTimestamp(input);
      const formatted = formatInstant(parsed.date, zone);
      setOutput(`Detected ${parsed.unit}\nISO ${formatted.iso}\nUnix seconds ${formatted.seconds}\nUnix milliseconds ${formatted.milliseconds}\n${zone}: ${formatted.zone}\nRelative: ${formatted.relative}`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read that time.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4"><Field label="Timestamp or date" htmlFor="time" hint="Numbers of 11 digits or more are treated as milliseconds. Smaller integers are seconds. Your zone is not assumed to be UTC."><Input id="time" value={input} onChange={(event) => setInput(event.target.value)} /></Field><Field label="Display time zone" htmlFor="zone"><Select id="zone" value={zone} onChange={(event) => setZone(event.target.value)}>{timeZones().map((item) => <option key={item}>{item}</option>)}</Select></Field><Button variant="primary" onClick={run}>Convert</Button><Button onClick={() => setInput(new Date().toISOString())}>Use current time</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function DateTool() {
  const [start, setStart] = useState("2024-02-28");
  const [end, setEnd] = useState("2024-03-01");
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<"days" | "weeks" | "months" | "years">("days");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const from = new Date(`${start}T00:00:00.000Z`);
      const to = new Date(`${end}T00:00:00.000Z`);
      const diff = dateDifference(from, to);
      const added = addCalendar(from, amount, unit);
      setOutput(`Difference: ${diff.days} days (${diff.hours} hours)\n${start} plus ${amount} ${unit}: ${added.toISOString().slice(0, 10)} UTC`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Invalid date.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4 md:grid-cols-2"><Field label="Start" htmlFor="start"><Input id="start" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></Field><Field label="End" htmlFor="end"><Input id="end" type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></Field><Field label="Add" htmlFor="amount"><Input id="amount" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></Field><Field label="Unit" htmlFor="unit"><Select id="unit" value={unit} onChange={(event) => setUnit(event.target.value as typeof unit)}><option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option><option value="years">Years</option></Select></Field><div className="md:col-span-2"><Button variant="primary" onClick={run}>Calculate</Button><ErrorNote message={error} /><OutputBlock value={output} /></div></div>;
}

function CronTool() {
  const [input, setInput] = useState("0 9 * * 1-5");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(`${explainCron(input)}\n\nNext UTC runs:\n${nextCronRuns(input).join("\n")}`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read that cron expression.");
    }
  }
  useToolHotkeys(run, output);
  return <div className="grid gap-4"><Field label="Cron expression" htmlFor="cron" hint="5 fields, or 6 with seconds first. L, W, and # are explained by the parser when possible, but next-run calculation supports stars, lists, ranges, and steps."><Input id="cron" value={input} onChange={(event) => setInput(event.target.value)} /></Field><Button variant="primary" onClick={run}>Explain</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function DurationTool() {
  const [value, setValue] = useState(90);
  const [from, setFrom] = useState<"ms" | "s" | "min" | "h" | "d">("min");
  const [output, setOutput] = useState("");
  return <div className="grid gap-4"><Field label="Amount" htmlFor="duration"><Input id="duration" type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} /></Field><Field label="From" htmlFor="from"><Select id="from" value={from} onChange={(event) => setFrom(event.target.value as typeof from)}><option value="ms">Milliseconds</option><option value="s">Seconds</option><option value="min">Minutes</option><option value="h">Hours</option><option value="d">Days</option></Select></Field><Button variant="primary" onClick={() => { const result = convertDuration(value, from); setOutput(Object.entries(result).map(([unit, amount]) => `${unit}: ${amount}`).join("\n")); }}>Convert</Button><OutputBlock value={output} /></div>;
}
