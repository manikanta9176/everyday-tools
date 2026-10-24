"use client";

import { useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/ui/file-drop";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/ui/feedback";
import { TextArea } from "@/components/ui/field";
import { downloadBlob } from "@/lib/downloads";
import { styledQrDataUrl, styledQrSvg } from "@/features/tools/qr/styled-qr";
import { cameraErrorMessage } from "@/features/tools/share/camera";
import { readSharePayload, sharePageUrl } from "@/features/tools/share/share-link";
import { fitsInQr, packSignal, unpackSignal } from "@/features/tools/share/signal";
import { acceptAnswer, createAnswer, createOffer, receiveFiles, saveDownload, sendFiles } from "@/features/tools/share/session";
import type { ShareProgress } from "@/features/tools/share/session";
import { useHostAddresses } from "@/features/tools/web/use-host-addresses";

type Role = "send" | "receive";

export function QrShareTool() {
  const { addresses } = useHostAddresses();
  const [role, setRole] = useState<Role>("send");
  const [files, setFiles] = useState<File[]>([]);
  const [code, setCode] = useState("");
  const [svg, setSvg] = useState("");
  const [image, setImage] = useState("");
  const [paste, setPaste] = useState("");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("Choose the files, then create a code.");
  const [progress, setProgress] = useState<ShareProgress | null>(null);
  const [error, setError] = useState("");
  const sender = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | null>(null);
  const receiver = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const stopScan = useRef<(() => void) | null>(null);

  useEffect(() => () => stopScan.current?.(), []);

  useEffect(() => {
    const payload = readSharePayload(window.location.hash);
    if (!payload) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setRole("receive");
      void applyCode(payload, "receive", () => cancelled);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // The link hash is read once. applyCode changes every render and must not restart the transfer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseRole(next: Role) {
    if (next === role) return;
    stopScan.current?.();
    stopScan.current = null;
    sender.current?.close();
    sender.current = null;
    channel.current?.close();
    channel.current = null;
    receiver.current?.close();
    receiver.current = null;
    setRole(next);
    setCode("");
    setSvg("");
    setImage("");
    setPaste("");
    setScanning(false);
    setProgress(null);
    setError("");
    setStatus(next === "send" ? "Choose the files, then create a code." : "");
  }

  async function showCode(sdp: string, visible?: string) {
    const packed = await packSignal(sdp);
    const shown = visible || packed;
    setCode(packed);
    if (!fitsInQr(shown)) {
      setSvg("");
      setImage("");
      setStatus("This connection code is too long for a QR image. Copy the text code instead.");
      return packed;
    }
    const markup = await styledQrSvg(shown, { dark: "#141311", light: "#ffffff", errorCorrectionLevel: "L" });
    setSvg(markup);
    setImage(styledQrDataUrl(markup));
    return packed;
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
        void sendFiles(offer.channel, files, setProgress).then(() => setStatus("Sent. The other phone can save the files."));
      });
      const packed = await packSignal(offer.sdp);
      const link = sharePageUrl(`${window.location.origin}/tools/qr-file-share`, packed, addresses);
      await showCode(offer.sdp, link || undefined);
      setStatus(link
        ? "Scan this with the other phone’s camera. A reply appears there. Hold that phone up to this computer."
        : "On the other phone, open this same page, choose Receive, and paste the code.");
      if (link) void scan(packed);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start the transfer.");
    }
  }

  async function applyCode(packed: string, as: Role = role, isCancelled: () => boolean = () => false) {
    setError("");
    stopScan.current?.();
    setScanning(false);
    try {
      const sdp = await unpackSignal(packed.trim());
      if (isCancelled()) return;
      if (as === "receive") {
        setStatus("Connecting…");
        const answer = await createAnswer(sdp);
        if (isCancelled()) {
          answer.peer.close();
          return;
        }
        receiver.current = answer.peer;
        void answer.incoming.then((incoming) => {
          receiveFiles(incoming, setProgress, (meta, bytes) => {
            saveDownload(meta, bytes);
            setStatus(`Saved ${meta.name}.`);
          });
        });
        await showCode(answer.sdp);
        setStatus("Hold this reply up to the computer camera. The file starts saving on this phone.");
        return;
      }
      if (!sender.current || !channel.current) throw new Error("Share a file before scanning the reply.");
      await acceptAnswer(sender.current, sdp);
      setStatus("Reply accepted. Waiting for the connection to open…");
    } catch (reason) {
      if (!isCancelled()) setError(reason instanceof Error ? reason.message : "Could not read that code.");
    }
  }

  async function scan(ignore = "") {
    setError("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Open this page on localhost or https before using the camera.");
      return;
    }
    const video = videoRef.current;
    if (!video) {
      setError("The camera view is not ready. Try the scan again.");
      return;
    }
    stopScan.current?.();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      setScanning(true);
      await video.play();
      let stopped = false;
      stopScan.current = () => {
        stopped = true;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        setScanning(false);
      };
      const detector = "BarcodeDetector" in window ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
      const decode = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      let busy = false;
      const loop = async () => {
        if (stopped) return;
        if (!busy && video.readyState >= 2) {
          busy = true;
          try {
            const value = await readFrame(video, detector, decode, canvas, context);
            const payload = readSharePayload(value);
            if (payload && payload !== ignore) {
              stopScan.current?.();
              await applyCode(payload);
              return;
            }
          } catch {
            // A single missed frame should not stop the camera.
          } finally {
            busy = false;
          }
        }
        if (!stopped) requestAnimationFrame(() => void loop());
      };
      void loop();
    } catch (reason) {
      stopScan.current?.();
      setScanning(false);
      setError(cameraErrorMessage(reason));
    }
  }

  async function downloadCode() {
    if (!svg) return;
    downloadBlob(await svgToPng(svg), "qr-file-share.png");
  }

  async function shareCode() {
    if (!svg) return;
    setError("");
    try {
      const file = new File([await svgToPng(svg)], "qr-file-share.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "QR File Share", text: "Scan this in QR File Share. Both devices stay on the same Wi-Fi." });
        return;
      }
      downloadBlob(file, file.name);
      setStatus("Downloaded the code. Attach that image in WhatsApp, Messages, or Mail.");
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Could not share the code.");
    }
  }

  async function decodePhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const decode = (await import("jsqr")).default;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not read that photo.");
      context.drawImage(bitmap, 0, 0);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const value = decode(frame.data, frame.width, frame.height)?.data;
      bitmap.close();
      if (!value) throw new Error("No transfer code was found in that photo.");
      const payload = readSharePayload(value);
      if (!payload) throw new Error("No transfer code was found in that photo.");
      await applyCode(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read that photo.");
    }
  }

  const percent = progress && progress.size > 0 ? Math.round((progress.received / progress.size) * 100) : 0;

  return (
    <div className="grid gap-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Choose a file and tap Share. The other phone scans the code with its camera, then holds that screen up to this computer. The file moves directly between them. Nothing is uploaded.
      </p>
      <div className="flex gap-2">
        <Button variant={role === "send" ? "primary" : "secondary"} onClick={() => chooseRole("send")}>Send</Button>
        <Button variant={role === "receive" ? "primary" : "secondary"} onClick={() => chooseRole("receive")}>Receive</Button>
      </div>
      {role === "send" ? (
        <>
          <FileDrop accept="*/*" multiple label="Choose files or a video" hint="Both devices should stay on this page until the transfer finishes." files={files} onFiles={setFiles} />
          <Button variant="primary" className="w-full sm:w-fit" onClick={() => void startSending()}>Share</Button>
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
            {role === "send" ? "The other phone scans this" : "Hold this up to the computer"}
          </figcaption>
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => void downloadCode()}>Download</Button>
            <Button type="button" onClick={() => void shareCode()}>Share</Button>
          </div>
          <p className="text-center text-[11px] leading-4 text-[#6e685f]">Share opens WhatsApp, Messages, Mail, and the other apps on this device.</p>
        </figure>
      ) : null}
      {code && !image ? <TextArea readOnly value={code} aria-label="Transfer code" /> : null}
      <div className="grid gap-2">
        <video ref={videoRef} className={scanning ? "max-h-72 w-full rounded-2xl bg-black" : "hidden"} muted playsInline />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => scanning ? stopScan.current?.() : void scan(code)}>{scanning ? "Stop camera" : role === "send" ? "Scan the reply" : "Scan a code"}</Button>
          <Button type="button" onClick={() => photoRef.current?.click()}>Use a photo</Button>
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Paste a code instead</summary>
          <div className="mt-2 grid gap-2">
            <TextArea aria-label="Pasted transfer code" value={paste} onChange={(event) => setPaste(event.target.value)} placeholder="Paste a transfer code if the camera cannot scan it." />
            <Button type="button" onClick={() => void applyCode(readSharePayload(paste) || paste)} disabled={!paste.trim()}>Use pasted code</Button>
          </div>
        </details>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void decodePhoto(file);
          }}
        />
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

async function readFrame(
  video: HTMLVideoElement,
  detector: BarcodeDetector | null,
  decode: ((data: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts?: "dontInvert" }) => { data: string } | null) | null,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D | null,
) {
  if (detector) {
    const codes = await detector.detect(video);
    return codes[0]?.rawValue ?? "";
  }
  if (!decode || !context || video.videoWidth === 0) return "";
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  return decode(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" })?.data ?? "";
}

function svgToPng(markup: string) {
  const size = Number(markup.match(/viewBox="0 0 (\d+)/)?.[1] ?? 320);
  const scale = Math.max(2, Math.ceil(720 / size));
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size * scale;
      canvas.height = size * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not draw the code."));
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not save the code.")), "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not draw the code."));
    };
    image.src = url;
  });
}
