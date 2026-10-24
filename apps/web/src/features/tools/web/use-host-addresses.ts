"use client";

import { useEffect, useState } from "react";
import { readHostCandidates } from "./network";

export function useHostAddresses() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let closed = false;
    const peer = new RTCPeerConnection({ iceServers: [] });
    const found = new Set<string>();
    const publish = (done: boolean) => {
      if (closed) return;
      setAddresses([...found]);
      if (done) setReady(true);
    };
    peer.onicecandidate = (event) => {
      if (event.candidate?.candidate) {
        for (const address of readHostCandidates([event.candidate.candidate])) found.add(address);
        publish(false);
      }
      if (!event.candidate) publish(true);
    };
    peer.createDataChannel("local");
    void peer.createOffer().then((offer) => peer.setLocalDescription(offer)).catch(() => publish(true));
    return () => {
      closed = true;
      peer.close();
    };
  }, []);

  return { addresses, ready };
}
