"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { downloadText } from "@/lib/downloads";
import { styledQrSvg } from "@/features/tools/qr/styled-qr";
import { placeholderSvg } from "@/features/tools/web/web-tools";
import { QrShareTool } from "./qr-share-ui";
import { useToolHotkeys } from "./use-hotkeys";

export default function GeneratorTools({ slug }: { slug: string }) {
  if (slug === "placeholder-image") return <Placeholder />;
  if (slug === "qr-file-share") return <QrShareTool />;
  return <QrTool />;
}

function QrTool() {
  const [text, setText] = useState("https://example.com");
  const [dark, setDark] = useState("#141311");
  const [light, setLight] = useState("#fffdf8");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  async function run() {
    try {
      setSvg(await styledQrSvg(text, { dark, light, errorCorrectionLevel: "M" }));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create a QR code.");
    }
  }
  useToolHotkeys(() => void run(), "");
  return <div className="grid gap-4"><TextArea aria-label="QR text" value={text} onChange={(event) => setText(event.target.value)} /><div className="grid gap-4 md:grid-cols-2"><Field label="Foreground" htmlFor="dark"><Input id="dark" value={dark} onChange={(event) => setDark(event.target.value)} /></Field><Field label="Background" htmlFor="light"><Input id="light" value={light} onChange={(event) => setLight(event.target.value)} /></Field></div><p className="text-xs text-muted-foreground">A logo is not embedded. Covering the code can make it unscannable.</p><Button variant="primary" onClick={() => void run()}>Generate</Button><ErrorNote message={error} />{svg ? <div className="w-full max-w-xs overflow-hidden rounded-[28px] border border-border shadow-[var(--shadow)]" dangerouslySetInnerHTML={{ __html: svg }} /> : null}<Button disabled={!svg} onClick={() => downloadText("qr-code.svg", svg, "image/svg+xml")}>Download SVG</Button></div>;
}

function Placeholder() {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(630);
  const [background, setBackground] = useState("#d6d3d1");
  const [label, setLabel] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  return <div className="grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Width" htmlFor="width"><Input id="width" type="number" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></Field><Field label="Height" htmlFor="height"><Input id="height" type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></Field></div><Field label="Background" htmlFor="bg"><Input id="bg" value={background} onChange={(event) => setBackground(event.target.value)} /></Field><Field label="Label" htmlFor="label"><Input id="label" value={label} onChange={(event) => setLabel(event.target.value)} /></Field><Button variant="primary" onClick={() => { try { setSvg(placeholderSvg(width, height, background, label)); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create an image."); } }}>Generate</Button><ErrorNote message={error} />{svg ? <div className="max-w-xl" dangerouslySetInnerHTML={{ __html: svg }} /> : null}<Button disabled={!svg} onClick={() => downloadText("placeholder.svg", svg, "image/svg+xml")}>Download SVG</Button></div>;
}
