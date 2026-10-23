"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { average, convertBase, convertUnit, discount, fromRoman, gst, percentageChange, percentageOf, randomInteger, roundTo, toRoman, unitCategories, type UnitCategory } from "@/features/tools/converters/units";

export default function MathTools({ slug }: { slug: string }) {
  if (slug === "percentage-calculator") return <PercentTool />;
  if (slug === "number-base") return <BaseTool />;
  if (slug === "roman-numerals") return <RomanTool />;
  return <UnitTool />;
}

function UnitTool() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const units = unitCategories[category].units;
  const [from, setFrom] = useState<string>(units[0]!.id);
  const [to, setTo] = useState<string>(units[1]!.id);
  const [value, setValue] = useState(1);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="Category" htmlFor="category"><Select id="category" value={category} onChange={(event) => { const next = event.target.value as UnitCategory; setCategory(next); setFrom(unitCategories[next].units[0]!.id); setTo(unitCategories[next].units[1]!.id); }}>{Object.entries(unitCategories).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</Select></Field><p className="text-sm text-muted-foreground">KB means 1000 bytes. KiB means 1024 bytes. Temperature uses Celsius as the internal base.</p><div className="grid gap-4 md:grid-cols-3"><Field label="Amount" htmlFor="amount"><Input id="amount" type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} /></Field><Field label="From" htmlFor="from"><Select id="from" value={from} onChange={(event) => setFrom(event.target.value)}>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}</Select></Field><Field label="To" htmlFor="to"><Select id="to" value={to} onChange={(event) => setTo(event.target.value)}>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}</Select></Field></div><Button variant="primary" onClick={() => { try { setOutput(String(convertUnit(category, from, to, value))); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not convert."); } }}>Convert</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function PercentTool() {
  const [part, setPart] = useState(25);
  const [total, setTotal] = useState(200);
  const [from, setFrom] = useState(80);
  const [to, setTo] = useState(100);
  const [price, setPrice] = useState(50);
  const [rate, setRate] = useState(18);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const share = percentageOf(part, total);
      const change = percentageChange(from, to);
      const sale = discount(price, 10);
      const tax = gst(price, rate, "add");
      setOutput(`${part} is ${share}% of ${total}\n${from} to ${to} is a ${change.change}% ${change.direction}\n10% off ${price} is ${sale.total}\n${rate}% added to ${price} gives ${tax.gross} (tax ${tax.tax}). The rate is an example, not tax advice.\nAverage of 2, 4, 6 is ${average([2, 4, 6])}\nRandom integer 1–6: ${randomInteger(1, 6)}\nRounded ${price / 3} to 2 places: ${roundTo(price / 3, 2)}`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not calculate.");
    }
  }
  return <div className="grid gap-4 md:grid-cols-2"><Field label="Part" htmlFor="part"><Input id="part" type="number" value={part} onChange={(event) => setPart(Number(event.target.value))} /></Field><Field label="Total" htmlFor="total"><Input id="total" type="number" value={total} onChange={(event) => setTotal(Number(event.target.value))} /></Field><Field label="Change from" htmlFor="from"><Input id="from" type="number" value={from} onChange={(event) => setFrom(Number(event.target.value))} /></Field><Field label="Change to" htmlFor="to"><Input id="to" type="number" value={to} onChange={(event) => setTo(Number(event.target.value))} /></Field><Field label="Price" htmlFor="price"><Input id="price" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></Field><Field label="GST-style rate %" htmlFor="rate"><Input id="rate" type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></Field><div className="md:col-span-2"><Button variant="primary" onClick={run}>Calculate</Button><ErrorNote message={error} /><OutputBlock value={output} /></div></div>;
}

function BaseTool() {
  const [value, setValue] = useState("255");
  const [from, setFrom] = useState<2 | 8 | 10 | 16>(10);
  const [to, setTo] = useState<2 | 8 | 10 | 16>(16);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="Number" htmlFor="number"><Input id="number" value={value} onChange={(event) => setValue(event.target.value)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="From base" htmlFor="from-base"><Select id="from-base" value={from} onChange={(event) => setFrom(Number(event.target.value) as 2 | 8 | 10 | 16)}><option value={2}>2</option><option value={8}>8</option><option value={10}>10</option><option value={16}>16</option></Select></Field><Field label="To base" htmlFor="to-base"><Select id="to-base" value={to} onChange={(event) => setTo(Number(event.target.value) as 2 | 8 | 10 | 16)}><option value={2}>2</option><option value={8}>8</option><option value={10}>10</option><option value={16}>16</option></Select></Field></div><Button variant="primary" onClick={() => { try { setOutput(convertBase(value, from, to)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not convert."); } }}>Convert</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}

function RomanTool() {
  const [input, setInput] = useState("1990");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><Field label="Integer or Roman numeral" htmlFor="roman"><Input id="roman" value={input} onChange={(event) => setInput(event.target.value)} /></Field><Button variant="primary" onClick={() => { try { setOutput(/^\d+$/.test(input.trim()) ? toRoman(Number(input)) : String(fromRoman(input))); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not convert."); } }}>Convert</Button><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}
