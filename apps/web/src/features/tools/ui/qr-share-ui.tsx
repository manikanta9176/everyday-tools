"use client";

import { useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/ui/file-drop";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/ui/feedback";
import { TextArea } from "@/components/ui/field";
import { styledQrDataUrl, styledQrSvg } from "@/features/tools/qr/styled-qr";
import { fitsInQr, packSignal, unpackSignal } from "@/features/tools/share/signal";
import { acceptAnswer, createAnswer, createOffer, receiveFiles, saveDownload, sendFiles } from "@/features/tools/share/session";
import type { ShareProgress } from "@/features/tools/share/session";

type Role = "send" | "receive";

export function QrShareTool() {
  const [role, setRole] = useState<Role>("send");
  const [files, setFiles] = useState<File[]>([]);
  const [code, setCode] = useState("");
  const [image, setImage] = useState("");
  const [paste, setPaste] = useState("");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("Choose the files, then create a code.");
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [error, setError] = useState("");
  const sender = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopScan = useRef<(() => void) | null>(null);

  useEffect(() => () => stopScan.current?.(), []);

  function chooseRole(next: Role) {
    if (next === role) return;
    stopScan.current?.();
    stopScan.current = null;
    sender.current?.close();
    sender.current = null;
    channel.current?.close();
    channel.current = null;
    setRole(next);
    setCode("");
    setImage("");
    setPaste("");
    setScanning(false);
    setProgress(null);
    setError("");
    setStatus(next === "send" ? "Choose the files, then create a code." : "");
  }

  async function showCode(sdp: string) {
    const packed = await packSignal(sdp);
    setCode(packed);
    if (!fitsInQr(packed)) {
      setImage("");
      setStatus("This connection code is too long for a QR image. Copy the text code instead.");
      return;
    }
    const svg = await styledQrSvg(packed, { dark: "#141311", light: "#ffffff", errorCorrectionLevel: "L" });
    setImage(styledQrDataUrl(svg));
  }

  async function startSending() {
    setError("");
    setProgress(null);
    if (!files.length) {
      setError("Choose at least one file.");
      return;
    }
    try {
      setStatus("Creating a direct connection…");
      const offer = await createOffer();
      sender.current = offer.peer;
      channel.current = offer.channel;
      offer.channel.addEventListener("open", () => {
        setStatus("Connected. Sending…");
        void sendFiles(offer.channel, files, setProgress).then(() => setStatus("Sent. The other device can save the files."));
      });
      await showCode(offer.sdp);
      setStatus("On the other device, open QR File Share, choose Receive, and scan this code.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start the transfer.");
    }
  }

  async function applyCode(packed: string) {
    setError("");
    stopScan.current?.();
    setScanning(false);
    try {
      const sdp = await unpackSignal(packed.trim());
      if (role === "receive") {
        setStatus("Connecting…");
        const answer = await createAnswer(sdp);
        void answer.incoming.then((incoming) => {
          receiveFiles(incoming, setProgress, (meta, bytes) => {
            saveDownload(meta, bytes);
            setStatus(`Saved ${meta.name}.`);
          });
        });
        await showCode(answer.sdp);
        setStatus("Show this reply code to the sender so they can finish the connection.");
        return;
      }
      if (!sender.current || !channel.current) throw new Error("Create your code before scanning the reply.");
      await acceptAnswer(sender.current, sdp);
      setStatus("Reply accepted. Waiting for the connection to open…");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read that code.");
    }
  }

  async function scan() {
    setError("");
    const video = videoRef.current;
    if (!video) return;
    if (!("BarcodeDetector" in window)) {
      setError("This browser cannot scan a QR code. Paste the code instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      let stopped = false;
      stopScan.current = () => {
        stopped = true;
        stream.getTracks().forEach((track) => track.stop());
        setScanning(false);
      };
      const loop = async () => {
        if (stopped) return;
        const codes = await detector.detect(video);
        const value = codes[0]?.rawValue;
        if (value) {
          await applyCode(value);
          return;
        }
        requestAnimationFrame(() => void loop());
      };
      void loop();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open the camera.");
    }
  }

  const percent = progress && progress.size > 0 ? Math.round((progress.received / progress.size) * 100) : 0;

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        The QR code only introduces the two devices. The file then moves directly between them, which is why a video can transfer quickly on the same Wi-Fi. Nothing is uploaded to Tools.
      </p>
      <div className="flex gap-2">
        <Button variant={role === "send" ? "primary" : "secondary"} onClick={() => chooseRole("send")}>Send</Button>
        <Button variant={role === "receive" ? "primary" : "secondary"} onClick={() => chooseRole("receive")}>Receive</Button>
      </div>
      {role === "send" ? (
        <>
          <FileDrop accept="*/*" multiple label="Choose files or a video" hint="Both devices should stay on this page until the transfer finishes." files={files} onFiles={setFiles} />
          <Button variant="primary" className="w-full sm:w-fit" onClick={() => void startSending()}>Create code</Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Scan the sender’s code. Then let the sender scan the reply that appears here.</p>
      )}
      {image ? (
        <figure className="grid w-full max-w-xs gap-3 rounded-[28px] border border-border bg-[#fffdf8] p-4 shadow-[var(--shadow)]">
          {/* The code is drawn in the browser. White keeps the camera able to read it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Transfer QR code" className="w-full bg-white" />
          <figcaption className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-[#5c564e]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#2a4bff]" />
            {role === "send" ? "The other device scans this code" : "The sender scans this reply"}
          </figcaption>
        </figure>
      ) : null}
      {code && !image ? <TextArea readOnly value={code} aria-label="Transfer code" /> : null}
      <div className="grid gap-2">
        <video ref={videoRef} className={scanning ? "max-h-64 w-full rounded-2xl bg-black" : "hidden"} muted playsInline />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void scan()}>{role === "send" ? "Scan reply code" : "Scan sender code"}</Button>
          <Button onClick={() => void applyCode(paste)} disabled={!paste.trim()}>Use pasted code</Button>
        </div>
        <TextArea aria-label="Pasted transfer code" value={paste} onChange={(event) => setPaste(event.target.value)} placeholder="Paste a transfer code if the camera cannot scan it." />
      </div>
      {status ? <p className="text-sm">{status}</p> : null}
      {progress ? (
        <div className="grid gap-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progress.name} · {percent}%</p>
        </div>
      ) : null}
      <ErrorNote message={error} />
    </div>
  );
}

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  detect(source: HTMLVideoElement): Promise<{ rawValue?: string }[]>;
}
