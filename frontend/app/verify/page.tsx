"use client";

import { useEffect, useState } from "react";
import { AuditTimeline, AuditEvent } from "@/components/AuditTimeline";
import { GreenwashBadge } from "@/components/GreenwashBadge";
import { api } from "@/lib/api";

const SAMPLES = [
  ["Vague promise", "This fund aims to reforest an unspecified area of the Amazon."],
  ["Audited metric", "Independently audited by DNV: financed 18,200 MWh of new offshore wind in 2024."],
  ["Too good to be true", "This fund is guaranteed carbon negative and eliminates all emissions overnight."],
];

const VERDICT = {
  verified: { title: "Verified", line: "Specific, measured and checked by someone else.", tone: "#1c7a4a", bg: "#e5f6ea" },
  misleading: { title: "Misleading", line: "Sounds green, but the numbers or the auditor are missing.", tone: "#a86a0c", bg: "#fff1d6" },
  false: { title: "False", line: "The claim cannot be true as written.", tone: "#c4543a", bg: "#fde4de" },
} as const;

type Fund = { id: number; name: string; ticker: string; claim: string };
type Check = { label: string; confidence: number; reason: string; model: string };
type Trail = { events: AuditEvent[]; integrity: { intact: boolean; length: number }; fund: { name: string; claim: string } };

export default function VerifyPage() {
  const [text, setText] = useState(SAMPLES[0][1]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundId, setFundId] = useState<number | "">("");
  const [result, setResult] = useState<Check | null>(null);
  const [trail, setTrail] = useState<Trail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Fund[]>("/funds").then(setFunds).catch((err: Error) => setError(err.message));
  }, []);

  async function run() {
    setBusy(true);
    setError("");
    try {
      const check = await api<Check>("/greenwash/check", {
        method: "POST",
        body: JSON.stringify({ text, fund_id: fundId || null }),
      });
      setResult(check);
      if (fundId) {
        setTrail(await api<Trail>(`/audit/${fundId}`));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadTrail(id: number) {
    setFundId(id);
    const fund = funds.find((item) => item.id === id);
    if (fund) setText(fund.claim);
    setTrail(await api<Trail>(`/audit/${id}`));
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-5 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="kicker text-sea">Greenwash shield</p>
        <h1 className="mt-2 text-3xl sm:text-5xl">Paste a claim. Keep the proof.</h1>
        <p className="mt-3 max-w-xl text-[#3d4f46]">
          The shield reads a fund&apos;s marketing line and decides if it is verified, misleading or false.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#55635b]">Try a sample:</span>
          {SAMPLES.map(([label, sample]) => (
            <button
              key={label}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                text === sample ? "border-ink bg-ink text-[#f6f1e6]" : "border-[#14241c22] bg-white/70 hover:bg-white"
              }`}
              type="button"
              onClick={() => {
                setText(sample);
                setResult(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <label htmlFor="claim" className="sr-only">Claim to check</label>
        <textarea
          id="claim"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste a fund's sustainability claim here"
          className="card mt-3 min-h-36 w-full p-4 text-lg"
        />
        <label className="mt-3 block text-sm">
          Attach to a fund so the check joins its audit chain
          <select
            className="mt-1 w-full rounded-xl border border-[#e4d9c6] bg-card px-3 py-2"
            value={fundId}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) {
                setFundId("");
                setTrail(null);
                return;
              }
              loadTrail(Number(value));
            }}
          >
            <option value="">No fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.ticker} — {fund.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-ink mt-4" type="button" onClick={run} disabled={busy || !text.trim()}>
          {busy ? "Checking…" : "Run the shield"}
        </button>
        {error && <p role="alert" className="mt-3 text-clay">{error}. Check the API is running on port 8000.</p>}
        <div aria-live="polite">
          {result && (() => {
            const v = VERDICT[(result.label in VERDICT ? result.label : "misleading") as keyof typeof VERDICT];
            const pct = Math.round(result.confidence * 100);
            return (
              <article className="card mt-5 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ background: v.bg, color: v.tone }}>
                  <div>
                    <p className="serif text-3xl">{v.title}</p>
                    <p className="text-sm">{v.line}</p>
                  </div>
                  <div className="text-right">
                    <p className="serif text-3xl">{pct}%</p>
                    <p className="text-xs">confidence</p>
                  </div>
                </div>
                <div className="h-1.5 bg-[#efe4d4]">
                  <div className="h-full" style={{ width: `${pct}%`, background: v.tone }} />
                </div>
                <div className="p-5">
                  <p className="text-lg">{result.reason}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#55635b]">
                    <GreenwashBadge status={result.label} />
                    <span>Model: {result.model}</span>
                  </div>
                </div>
              </article>
            );
          })()}
        </div>
      </section>
      <section className="card self-start p-5">
        <p className="kicker text-sea">Audit trail</p>
        <h2 className="mt-2 text-3xl">{trail ? trail.fund.name : "Pick a fund"}</h2>
        <div className="mt-5">
          {trail ? (
            <AuditTimeline events={trail.events} intact={trail.integrity.intact} />
          ) : (
            <p className="text-sm text-[#55635b]">
              Attach the claim to a fund on the left. Every check for that fund appears here, each row linked to the
              hash of the one before it, so no one can edit the past quietly.
            </p>
          )}
        </div>
        {trail && (
          <p className="mt-4 text-xs text-[#5d6b63]">Full chain length {trail.integrity.length}. Each row stores the previous hash.</p>
        )}
      </section>
    </main>
  );
}
