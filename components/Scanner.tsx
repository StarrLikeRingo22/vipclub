"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer } from "@/lib/types";
import { ScanIcon } from "./Icons";

// Staff scanner. Uses the on-device BarcodeDetector (Android Chrome/Edge) for a
// true in-app scan; everywhere else it falls back to "use your camera app" plus
// a quick member picker — so it always works and stays simple.

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

export function Scanner({ members }: { members: Customer[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [supported, setSupported] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let active = true;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const detector = window.BarcodeDetector
          ? new window.BarcodeDetector({ formats: ["qr_code"] })
          : null;

        const tick = async () => {
          if (!active || !detector || !video) return;
          try {
            const codes = await detector.detect(video);
            const hit = codes[0]?.rawValue;
            if (hit) {
              active = false;
              // QR encodes the staff check-in URL.
              const path = hit.includes("/checkin/")
                ? hit.slice(hit.indexOf("/checkin/"))
                : hit;
              window.location.href = path;
              return;
            }
          } catch {
            /* keep trying */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setScanning(false);
      }
    })();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning]);

  const filtered = members.filter((m) =>
    m.full_name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="pt-1">
      <h2 className="font-serif text-xl font-bold">Scan a VIP pass</h2>
      <p className="mb-3 mt-1 text-sm text-ink-soft">
        Point at the member&apos;s pass — their profile opens instantly.
      </p>

      <div className="overflow-hidden rounded-3xl bg-[#221a1d] p-5 text-center">
        {scanning ? (
          <video ref={videoRef} className="mx-auto h-56 w-56 rounded-2xl object-cover" muted playsInline />
        ) : (
          <div className="relative mx-auto flex h-56 w-56 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#2e2428,#1a1316)" }}>
            <div className="absolute left-3 top-3 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-gold" />
            <div className="absolute right-3 top-3 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-gold" />
            <div className="absolute bottom-3 left-3 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-gold" />
            <div className="absolute bottom-3 right-3 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-gold" />
            <ScanIcon width={44} height={44} className="text-gold" />
          </div>
        )}
        <button
          onClick={() => setScanning((s) => !s)}
          className="btn-primary mx-auto mt-4 w-full max-w-[240px] rounded-2xl px-4 py-3 text-sm font-bold"
        >
          {scanning ? "Stop camera" : supported ? "Start camera scan" : "Try camera scan"}
        </button>
        <p className="mt-3 text-xs text-[#9a8a8e]">
          {supported
            ? "Live scan supported on this device."
            : "On iPhone, your built-in Camera app also opens the pass when you point it at the QR."}
        </p>
      </div>

      {/* manual fallback */}
      <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-ink-soft">
        Or pick the member
      </p>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members…"
        className="card-shadow mb-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px]" />
      <div className="card-shadow max-h-72 overflow-y-auto rounded-2xl border border-line bg-white px-4">
        {filtered.slice(0, 25).map((m) => (
          <a key={m.id} href={`/checkin/${m.id}`}
            className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#E8A0A8,#C97B86)" }}>
              {m.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <b className="block text-[14px]">{m.full_name}</b>
              <span className="text-xs text-ink-soft">#{m.customer_code}</span>
            </div>
            <span className="text-rose-deep">&rsaquo;</span>
          </a>
        ))}
      </div>
    </div>
  );
}
