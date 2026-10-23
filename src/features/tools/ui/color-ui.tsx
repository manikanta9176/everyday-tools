"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, TextArea } from "@/components/ui/field";
import { CopyButton, ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { contrastRatio } from "@/features/tools/colors/contrast";
import { convertColor, cssVariablesToJson, gradientCss, harmonies, jsonToCssVariables, simulateColorVision, tintsAndShades } from "@/features/tools/colors/color-engine";

export default function ColorTools({ slug }: { slug: string }) {
  if (slug === "contrast-checker") return <ContrastTool />;
  if (slug === "palette-generator") return <PaletteTool />;
  if (slug === "gradient-generator") return <GradientTool />;
  if (slug === "css-variables") return <CssVarTool />;
  return <Converter />;
}

function Converter() {
  const [input, setInput] = useState("#8B5CF6");
  const [precision, setPrecision] = useState(3);
  const [recent, setRecent] = useState<string[]>([]);
  const result = useMemo(() => {
    try {
      return { value: convertColor(input, precision), error: "" };
    } catch (reason) {
      return { value: null, error: reason instanceof Error ? reason.message : "Invalid color." };
    }
  }, [input, precision]);

  function keep() {
    if (!result.value) return;
    const next = [result.value.hex, ...recent.filter((item) => item !== result.value?.hex)].slice(0, 8);
    setRecent(next);
    window.localStorage.setItem("everyday-tools:colors", JSON.stringify(next));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="grid content-start gap-3">
        <div className="h-40 rounded-xl border" style={{ background: result.value?.hex ?? "transparent" }} />
        <Field label="Any CSS color" htmlFor="color">
          <Input id="color" value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <input aria-label="Color picker" type="color" value={result.value?.hex.slice(0, 7) ?? "#8b5cf6"} onChange={(event) => setInput(event.target.value)} className="h-10 w-full" />
        <Field label="Decimal places" htmlFor="precision"><Input id="precision" type="number" min={0} max={6} value={precision} onChange={(event) => setPrecision(Number(event.target.value))} /></Field>
        <Button onClick={keep}>Keep this color on this device</Button>
        {recent.length ? <div className="flex flex-wrap gap-2">{recent.map((color) => <button key={color} type="button" aria-label={color} className="size-8 rounded-md border" style={{ background: color }} onClick={() => setInput(color)} />)}</div> : null}
      </div>
      <div className="grid gap-3">
        <ErrorNote message={result.error} />
        {result.value?.outOfSrgbGamut ? <p className="text-sm text-muted-foreground">This color is outside sRGB. HEX and RGB use gamut mapping, so they are approximate.</p> : null}
        <ul className="grid gap-2">
          {result.value?.values.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-mono text-sm break-all">{item.value}</p>
                {item.note ? <p className="text-xs text-muted-foreground">{item.note}</p> : null}
              </div>
              <CopyButton value={item.value} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Swatches({ colors }: { colors: string[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <li key={color} className="grid gap-1 text-xs">
          <span className="h-16 w-20 rounded-md border" style={{ background: color }} />
          <span className="font-mono">{color}</span>
        </li>
      ))}
    </ul>
  );
}

function PaletteTool() {
  const [input, setInput] = useState("#8B5CF6");
  const sets = useMemo(() => {
    try {
      return { harmonies: harmonies(input), tones: tintsAndShades(input), vision: {
        protanopia: simulateColorVision(input, "protanopia"),
        deuteranopia: simulateColorVision(input, "deuteranopia"),
        tritanopia: simulateColorVision(input, "tritanopia"),
      } };
    } catch {
      return null;
    }
  }, [input]);
  return (
    <div className="grid gap-5">
      <Field label="Base color" htmlFor="base"><Input id="base" value={input} onChange={(event) => setInput(event.target.value)} /></Field>
      {!sets ? <ErrorNote message="Enter a valid color." /> : (
        <>
          {Object.entries(sets.harmonies).map(([name, colors]) => <section key={name}><h2 className="mb-2 text-sm font-medium capitalize">{name}</h2><Swatches colors={colors} /></section>)}
          <section><h2 className="mb-2 text-sm font-medium">Tints</h2><Swatches colors={sets.tones.tints} /></section>
          <section><h2 className="mb-2 text-sm font-medium">Shades</h2><Swatches colors={sets.tones.shades} /></section>
          <section>
            <h2 className="mb-2 text-sm font-medium">Color-vision simulation</h2>
            <p className="mb-2 text-xs text-muted-foreground">Machado, Oliveira, and Fernandes 2009 matrices. A simulation, not a diagnosis.</p>
            <Swatches colors={[input, sets.vision.protanopia, sets.vision.deuteranopia, sets.vision.tritanopia]} />
          </section>
        </>
      )}
    </div>
  );
}

function ContrastTool() {
  const [foreground, setForeground] = useState("#1c1917");
  const [background, setBackground] = useState("#f6f4ef");
  const result = useMemo(() => {
    try {
      return { value: contrastRatio(foreground, background), error: "" };
    } catch (reason) {
      return { value: null, error: reason instanceof Error ? reason.message : "Invalid color." };
    }
  }, [background, foreground]);
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Foreground" htmlFor="fg"><Input id="fg" value={foreground} onChange={(event) => setForeground(event.target.value)} /></Field>
        <Field label="Background" htmlFor="bg"><Input id="bg" value={background} onChange={(event) => setBackground(event.target.value)} /></Field>
      </div>
      <div className="rounded-xl border p-6" style={{ background, color: foreground }}>
        <p className="text-base">Normal text sample</p>
        <p className="text-2xl font-medium">Large text sample</p>
      </div>
      <ErrorNote message={result.error} />
      {result.value ? <ul className="grid gap-1 text-sm"><li>Contrast ratio: {result.value.ratio.toFixed(2)}:1</li><li>AA normal text (4.5:1): {result.value.aaNormal ? "Pass" : "Fail"}</li><li>AA large text or UI (3:1): {result.value.aaLarge ? "Pass" : "Fail"}</li><li>AAA normal text (7:1): {result.value.aaaNormal ? "Pass" : "Fail"}</li></ul> : null}
    </div>
  );
}

function GradientTool() {
  const [first, setFirst] = useState("#8B5CF6");
  const [second, setSecond] = useState("#f6f4ef");
  const [angle, setAngle] = useState(120);
  const css = useMemo(() => {
    try {
      return { value: gradientCss([first, second], angle), error: "" };
    } catch (reason) {
      return { value: "", error: reason instanceof Error ? reason.message : "Enter two valid colors." };
    }
  }, [angle, first, second]);
  return <div className="grid gap-4"><div className="h-28 rounded-xl border" style={{ background: css.value || "transparent" }} /><div className="grid gap-4 md:grid-cols-3"><Field label="First stop" htmlFor="g1"><Input id="g1" value={first} onChange={(event) => setFirst(event.target.value)} /></Field><Field label="Second stop" htmlFor="g2"><Input id="g2" value={second} onChange={(event) => setSecond(event.target.value)} /></Field><Field label="Angle" htmlFor="angle"><Input id="angle" type="number" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></Field></div><ErrorNote message={css.error} /><OutputBlock value={css.value ? `background: ${css.value};` : ""} /></div>;
}

function CssVarTool() {
  const [input, setInput] = useState("--ink: #1c1917;\n--accent: #8B5CF6;");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><TextArea aria-label="CSS or JSON" value={input} onChange={(event) => setInput(event.target.value)} /><div className="flex gap-2"><Button variant="primary" onClick={() => { try { setOutput(JSON.stringify(cssVariablesToJson(input), null, 2)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not parse CSS."); } }}>CSS to JSON</Button><Button onClick={() => { try { setOutput(jsonToCssVariables(input)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not parse JSON."); } }}>JSON to CSS</Button></div><ErrorNote message={error} /><OutputBlock value={output} /></div>;
}
