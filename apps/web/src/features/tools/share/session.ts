import { chunks, createAssembler, describeFiles, doneMessage, fileMessage, type FileMeta } from "./transfer";

export type ShareProgress = { name: string; received: number; size: number };

function waitForIce(connection: RTCPeerConnection) {
  if (connection.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      if (connection.iceGatheringState !== "complete") return;
      connection.removeEventListener("icegatheringstatechange", done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      connection.removeEventListener("icegatheringstatechange", done);
      resolve();
    }, 4000);
    connection.addEventListener("icegatheringstatechange", done);
  });
}

function connection() {
  return new RTCPeerConnection({ iceServers: [] });
}

export async function createOffer() {
  const peer = connection();
  const channel = peer.createDataChannel("files");
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  await waitForIce(peer);
  return { peer, channel, sdp: peer.localDescription?.sdp ?? "" };
}

export async function createAnswer(offerSdp: string) {
  const peer = connection();
  const incoming = new Promise<RTCDataChannel>((resolve) => {
    peer.addEventListener("datachannel", (event) => resolve(event.channel), { once: true });
  });
  await peer.setRemoteDescription({ type: "offer", sdp: offerSdp });
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  await waitForIce(peer);
  return { peer, incoming, sdp: peer.localDescription?.sdp ?? "" };
}

export async function acceptAnswer(peer: RTCPeerConnection, answerSdp: string) {
  await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });
}

export async function sendFiles(
  channel: RTCDataChannel,
  files: File[],
  onProgress: (progress: ShareProgress) => void,
) {
  if (channel.readyState !== "open") {
    await new Promise<void>((resolve, reject) => {
      channel.addEventListener("open", () => resolve(), { once: true });
      channel.addEventListener("error", () => reject(new Error("The direct connection failed.")), { once: true });
    });
  }
  const metas = describeFiles(files);
  for (const [index, meta] of metas.entries()) {
    const file = files[index]!;
    channel.send(fileMessage(meta));
    const bytes = new Uint8Array(await file.arrayBuffer());
    let sent = 0;
    for (const part of chunks(bytes)) {
      while (channel.bufferedAmount > 1024 * 1024) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      const copy = new ArrayBuffer(part.byteLength);
      new Uint8Array(copy).set(part);
      channel.send(copy);
      sent += part.byteLength;
      onProgress({ name: meta.name, received: sent, size: meta.size });
    }
  }
  channel.send(doneMessage());
}

export function receiveFiles(
  channel: RTCDataChannel,
  onProgress: (progress: ShareProgress) => void,
  onFile: (meta: FileMeta, bytes: Uint8Array) => void,
) {
  const assembler = createAssembler();
  channel.binaryType = "arraybuffer";
  channel.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
      assembler.control(event.data);
      return;
    }
    const result = assembler.chunk(new Uint8Array(event.data as ArrayBuffer));
    if (result.type === "progress") onProgress(result);
    if (result.type === "file") onFile(result.meta, result.bytes);
  });
}

export function saveDownload(meta: FileMeta, bytes: Uint8Array) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: meta.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = meta.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
