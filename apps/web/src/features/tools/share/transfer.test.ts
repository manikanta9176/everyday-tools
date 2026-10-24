import { describe, expect, it } from "vitest";
import { fitsInQr, packSignal, unpackSignal } from "./signal";
import { chunks, createAssembler, describeFiles, doneMessage, fileMessage } from "./transfer";

describe("QR file transfer", () => {
  it("describes files without reading their bytes", () => {
    expect(describeFiles([{ name: "clip.mp4", size: 12, type: "video/mp4" }])).toEqual([
      { id: "1", name: "clip.mp4", size: 12, mime: "video/mp4" },
    ]);
  });

  it("reassembles a file from a header and chunks", () => {
    const assembler = createAssembler();
    const meta = describeFiles([{ name: "note.txt", size: 5, type: "text/plain" }])[0]!;
    expect(assembler.control(fileMessage(meta))).toMatchObject({ type: "start", meta });
    expect(assembler.chunk(new Uint8Array([104, 101]))).toMatchObject({ type: "progress", received: 2, size: 5 });
    const done = assembler.chunk(new Uint8Array([108, 108, 111]));
    expect(done.type).toBe("file");
    if (done.type === "file") expect(new TextDecoder().decode(done.bytes)).toBe("hello");
    expect(assembler.control(doneMessage())).toEqual({ type: "done" });
  });

  it("rejects a chunk that overruns the announced size", () => {
    const assembler = createAssembler();
    assembler.control(fileMessage({ id: "1", name: "a.bin", size: 1, mime: "application/octet-stream" }));
    expect(() => assembler.chunk(new Uint8Array([1, 2]))).toThrow(/more data/);
  });

  it("splits bytes on the chunk boundary", () => {
    const parts = [...chunks(new Uint8Array([1, 2, 3, 4]), 3)];
    expect(parts.map((part) => [...part])).toEqual([[1, 2, 3], [4]]);
  });

  it("round-trips a connection description through a QR-sized code", async () => {
    const sdp = "v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n".repeat(8);
    const packed = await packSignal(sdp);
    expect(fitsInQr(packed)).toBe(true);
    expect(await unpackSignal(packed)).toBe(sdp);
  });
});
