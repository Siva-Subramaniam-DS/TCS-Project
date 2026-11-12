"use client";

import { useEffect, useState } from "react";
import { AuditTimeline, AuditEvent } from "@/components/AuditTimeline";
import { GreenwashBadge } from "@/components/GreenwashBadge";
import { api } from "@/lib/api";

const SAMPLES = [
  "This fund aims to reforest an unspecified area of the Amazon.",
  "Independently audited by DNV: financed 18,200 MWh of new offshore wind in 2024.",
  "This fund is guaranteed carbon negative and eliminates all emissions overnight.",
];

type Fund = { id: number; name: string; ticker: string; claim: string };
type Check = { label: string; confidence: number; reason: string; model: string };
type Trail = { events: AuditEvent[]; integrity: { intact: boolean; length: number }; fund: { name: string; claim: string } };

export default function VerifyPage() {
  const [text, setText] = useState(SAMPLES[0]);
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
        <div className="mt-4 flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button key={sample} className="rounded-full bg-white/70 px-3 py-1 text-left text-xs" type="button" onClick={() => setText(sample)}>
              {sample.slice(0, 42)}…
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="card mt-4 min-h-36 w-full p-4 outline-none"
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
        <button className="btn btn-ink mt-4" type="button" onClick={run} disabled={busy}>
          {busy ? "Checking…" : "Run the shield"}
        </button>
        {error && <p className="mt-3 text-clay">{error}</p>}
        {result && (
          <article className="card mt-5 p-5">
            <GreenwashBadge status={result.label} confidence={result.confidence} />
            <p className="mt-3 text-lg">{result.reason}</p>
            <p className="mt-2 text-xs text-[#5d6b63]">Model: {result.model}</p>
          </article>
        )}
      </section>
      <section className="card p-5">
        <p className="kicker text-sea">Audit trail</p>
        <h2 className="mt-2 text-3xl">{trail ? trail.fund.name : "Pick a fund"}</h2>
        <div className="mt-5">
          <AuditTimeline events={trail?.events || []} intact={trail?.integrity.intact} />
        </div>
        {trail && (
          <p className="mt-4 text-xs text-[#5d6b63]">Full chain length {trail.integrity.length}. Each row stores the previous hash.</p>
        )}
      </section>
    </main>
  );
}
