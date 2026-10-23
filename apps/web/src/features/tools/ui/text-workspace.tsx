"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { useToolHotkeys } from "./use-hotkeys";

export function TextWorkspace({
  action = "Run",
  placeholder,
  controls,
  run,
  outputLabel = "Output",
}: {
  action?: string;
  placeholder: string;
  controls?: ReactNode;
  outputLabel?: string;
  run: (input: string) => string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function go() {
    try {
      setOutput(run(input));
      setError("");
    } catch (reason) {
      setOutput("");
      setError(reason instanceof Error ? reason.message : "Could not complete that operation.");
    }
  }
  useToolHotkeys(go, output);
  return (
    <div className="grid gap-4">
      <TextArea aria-label="Input" value={input} placeholder={placeholder} onChange={(event) => setInput(event.target.value)} />
      {controls}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={go}>{action}</Button>
        <Button onClick={() => { setInput(""); setOutput(""); setError(""); }}>Clear</Button>
      </div>
      <ErrorNote message={error} />
      <OutputBlock label={outputLabel} value={output} />
    </div>
  );
}
