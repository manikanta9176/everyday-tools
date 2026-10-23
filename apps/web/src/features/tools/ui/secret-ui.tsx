"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ErrorNote, Toggle } from "@/components/ui/feedback";
import { OutputBlock } from "@/components/ui/output";
import { generateApiKey } from "@tools/api-key-generator";
import { generatePassphrase } from "@tools/passphrase-generator";
import { generatePassword } from "@tools/password-generator";
import { buildOpensslCommand, generateSecret, type SecretFormat } from "@tools/random-secret-generator";
import { generateUuids } from "@tools/uuid-generator";
import { useToolHotkeys } from "./use-hotkeys";

export default function SecretTools({ slug }: { slug: string }) {
  if (slug === "password-generator") return <PasswordTool />;
  if (slug === "passphrase-generator") return <PassphraseTool />;
  if (slug === "uuid-generator") return <UuidTool />;
  if (slug === "api-key-generator") return <ApiKeyTool />;
  return <TokenTool />;
}

function TokenTool() {
  const [bytes, setBytes] = useState(32);
  const [format, setFormat] = useState<SecretFormat>("base64");
  const [alphabet, setAlphabet] = useState("abcdef");
  const [count, setCount] = useState(1);
  const [commandBytes, setCommandBytes] = useState(32);
  const [commandEncoding, setCommandEncoding] = useState<"base64" | "hex">("base64");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const command = useMemo(() => {
    try {
      return buildOpensslCommand(commandBytes, commandEncoding);
    } catch (reason) {
      return reason instanceof Error ? reason.message : "";
    }
  }, [commandBytes, commandEncoding]);

  function run() {
    try {
      const result = generateSecret({ bytes, format, alphabet, count });
      setOutput(result.values.join("\n"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate a token.");
    }
  }
  useToolHotkeys(run, output);
  const characterMode = format === "alphanumeric" || format === "custom";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {[16, 24, 32, 48, 64].map((preset) => (
            <Button key={preset} size="sm" variant={bytes === preset ? "primary" : "secondary"} onClick={() => setBytes(preset)}>
              {preset} {characterMode ? "characters" : "bytes"}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={characterMode ? "Character count" : "Byte count"} htmlFor="bytes" hint={characterMode ? "This count is characters, not encoded length." : "Bytes, encoded length, and entropy are different. 32 bytes is 256 bits before encoding."}>
            <Input id="bytes" type="number" min={1} max={1024} value={bytes} onChange={(event) => setBytes(Number(event.target.value))} />
          </Field>
          <Field label="Format" htmlFor="format">
            <Select id="format" value={format} onChange={(event) => setFormat(event.target.value as SecretFormat)}>
              <option value="base64">Base64</option>
              <option value="base64url">Base64URL</option>
              <option value="hex">Hexadecimal</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="custom">Custom alphabet</option>
            </Select>
          </Field>
          <Field label="How many" htmlFor="count">
            <Input id="count" type="number" min={1} max={50} value={count} onChange={(event) => setCount(Number(event.target.value))} />
          </Field>
        </div>
        {format === "custom" ? <Field label="Alphabet" htmlFor="alphabet"><Input id="alphabet" value={alphabet} onChange={(event) => setAlphabet(event.target.value)} /></Field> : null}
        <Button variant="primary" onClick={run}>Generate locally</Button>
        <ErrorNote message={error} />
        <OutputBlock value={output} empty="Choose a size and generate a token. It is created with crypto.getRandomValues() and is not saved." />
      </section>
      <section className="grid gap-3 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-medium">OpenSSL command</h2>
        <p className="text-sm text-muted-foreground">This builds a command you can run on your own machine. It does not reproduce the token generated above.</p>
        <div className="flex flex-wrap gap-2">
          {["openssl rand -base64 32", "openssl rand -hex 32", "openssl rand -base64 16"].map((preset) => (
            <Button key={preset} size="sm" onClick={() => {
              const parts = preset.split(" ");
              setCommandEncoding(parts[2] === "-hex" ? "hex" : "base64");
              setCommandBytes(Number(parts[3]));
            }}>{preset}</Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Command bytes" htmlFor="command-bytes"><Input id="command-bytes" type="number" min={1} max={1024} value={commandBytes} onChange={(event) => setCommandBytes(Number(event.target.value))} /></Field>
          <Field label="Command encoding" htmlFor="command-encoding">
            <Select id="command-encoding" value={commandEncoding} onChange={(event) => setCommandEncoding(event.target.value as "base64" | "hex")}>
              <option value="base64">base64</option>
              <option value="hex">hex</option>
            </Select>
          </Field>
        </div>
        <OutputBlock label="Command" value={command} />
      </section>
    </div>
  );
}

function PasswordTool() {
  const [length, setLength] = useState(20);
  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);
  const [output, setOutput] = useState("");
  const [bits, setBits] = useState<number | null>(null);
  const [error, setError] = useState("");
  function run() {
    try {
      const result = generatePassword({ length, lowercase, uppercase, digits, symbols, avoidAmbiguous });
      setOutput(result.values.join("\n"));
      setBits(result.entropyBits);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate a password.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <Field label="Length" htmlFor="length" hint="Length is characters. Entropy depends on the alphabet as well."><Input id="length" type="number" min={8} max={128} value={length} onChange={(event) => setLength(Number(event.target.value))} /></Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle id="lower" label="Lowercase" checked={lowercase} onCheckedChange={setLowercase} />
        <Toggle id="upper" label="Uppercase" checked={uppercase} onCheckedChange={setUppercase} />
        <Toggle id="digits" label="Digits" checked={digits} onCheckedChange={setDigits} />
        <Toggle id="symbols" label="Symbols" checked={symbols} onCheckedChange={setSymbols} />
        <Toggle id="ambiguous" label="Exclude ambiguous characters" checked={avoidAmbiguous} onCheckedChange={setAvoidAmbiguous} />
      </div>
      <Button variant="primary" onClick={run}>Generate password</Button>
      {bits !== null ? <p className="text-sm text-muted-foreground">About {bits.toFixed(1)} bits if every character is chosen uniformly.</p> : null}
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function PassphraseTool() {
  const [wordCount, setWordCount] = useState(6);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(false);
  const [output, setOutput] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      const result = generatePassphrase({ wordCount, separator, capitalize, addNumber });
      setOutput(result.phrase);
      setNote(`${result.wordlistSize.toLocaleString()} words, about ${result.bitsPerWord.toFixed(1)} bits each before a number is added.`);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate a passphrase.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <Field label="Words" htmlFor="words" hint="The list is the EFF Short Wordlist 2.0. Six words is a practical default."><Input id="words" type="number" min={4} max={12} value={wordCount} onChange={(event) => setWordCount(Number(event.target.value))} /></Field>
      <Field label="Separator" htmlFor="separator"><Input id="separator" value={separator} maxLength={3} onChange={(event) => setSeparator(event.target.value)} /></Field>
      <Toggle id="cap" label="Capitalize words" checked={capitalize} onCheckedChange={setCapitalize} />
      <Toggle id="num" label="Append a number" checked={addNumber} onCheckedChange={setAddNumber} />
      <Button variant="primary" onClick={run}>Generate passphrase</Button>
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function UuidTool() {
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(generateUuids(version, count).join("\n"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate UUIDs.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <Field label="Version" htmlFor="version" hint="v4 is random. v7 starts with the current Unix time in milliseconds, then random bits.">
        <Select id="version" value={version} onChange={(event) => setVersion(event.target.value as "v4" | "v7")}>
          <option value="v4">UUID v4</option>
          <option value="v7">UUID v7</option>
        </Select>
      </Field>
      <Field label="How many" htmlFor="uuid-count"><Input id="uuid-count" type="number" min={1} max={50} value={count} onChange={(event) => setCount(Number(event.target.value))} /></Field>
      <Button variant="primary" onClick={run}>Generate</Button>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}

function ApiKeyTool() {
  const [prefix, setPrefix] = useState("sk");
  const [bytes, setBytes] = useState(32);
  const [encoding, setEncoding] = useState<"base64url" | "hex" | "alphanumeric">("base64url");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  function run() {
    try {
      setOutput(generateApiKey({ prefix, bytes, encoding }).values.join("\n"));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate a key.");
    }
  }
  useToolHotkeys(run, output);
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Prefix" htmlFor="prefix"><Input id="prefix" value={prefix} onChange={(event) => setPrefix(event.target.value)} /></Field>
        <Field label="Random bytes" htmlFor="api-bytes"><Input id="api-bytes" type="number" min={1} max={128} value={bytes} onChange={(event) => setBytes(Number(event.target.value))} /></Field>
        <Field label="Encoding" htmlFor="api-encoding">
          <Select id="api-encoding" value={encoding} onChange={(event) => setEncoding(event.target.value as typeof encoding)}>
            <option value="base64url">Base64URL</option>
            <option value="hex">Hex</option>
            <option value="alphanumeric">Alphanumeric</option>
          </Select>
        </Field>
      </div>
      <Button variant="primary" onClick={run}>Generate API key</Button>
      <ErrorNote message={error} />
      <OutputBlock value={output} />
    </div>
  );
}
