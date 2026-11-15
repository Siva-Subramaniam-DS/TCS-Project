"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GreenwashBadge } from "@/components/GreenwashBadge";
import { ImpactGauge } from "@/components/ImpactGauge";
import { api, portfolioId } from "@/lib/api";

type Totals = {
  co2_kg: number;
  kwh: number;
  water_l: number;
  forest_m2: number;
  score: number;
  model_score: number;
  per_day: { co2_kg: number; kwh: number; water_l: number; forest_m2: number };
};

type Payload = {
  portfolio_id: number;
  name: string;
  amount_gbp: number;
  totals: Totals;
  note: string;
  sdgs: { sdg: number; weight: number }[];
  holdings: {
    name: string;
    ticker: string;
    allocation: number;
    label: string;
    impact: { co2_kg: number; kwh: number; water_l: number; forest_m2: number; score: number };
  }[];
};

export default function ImpactPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [today, setToday] = useState(0.4);

  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    setToday((Date.now() - start.getTime()) / 86400000);
    const id = portfolioId() || 1;
    api<Payload>(`/impact/${id}`).then(setData).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
      <p className="kicker text-sea">Live impact</p>
      <h1 className="mt-2 text-3xl sm:text-5xl">The year, and the day so far.</h1>
      {error && <p className="mt-4">{error}. <Link className="underline" href="/portfolio">Build a portfolio</Link> first.</p>}
      {data?.totals && (
        <>
          <p className="mt-3 max-w-2xl text-sm text-[#5d6b63]">{data.note}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <ImpactGauge label="CO₂ this year" value={data.totals.co2_kg} unit="kg" max={220} />
            <ImpactGauge label="Energy this year" value={data.totals.kwh} unit="kWh" max={900} tone="#1d6a72" />
            <ImpactGauge label="Water this year" value={data.totals.water_l} unit="litres" max={9000} tone="#1d6a72" />
            <ImpactGauge label="Forest this year" value={data.totals.forest_m2} unit="m²" max={5} tone="#c9841a" caption={`Model score ${data.totals.model_score}`} />
          </div>
          <div className="card mt-6 grid grid-cols-2 gap-5 p-5 sm:grid-cols-4">
            <div>
              <p className="kicker text-sea">Today so far</p>
              <p className="serif mt-2 text-3xl">{(data.totals.per_day.co2_kg * today).toFixed(3)}</p>
              <p className="text-xs text-[#5d6b63]">kg CO₂, year spread across today</p>
            </div>
            <div>
              <p className="kicker text-sea">Energy today</p>
              <p className="serif mt-2 text-3xl">{(data.totals.per_day.kwh * today).toFixed(2)}</p>
              <p className="text-xs text-[#5d6b63]">kWh</p>
            </div>
            <div>
              <p className="kicker text-sea">Water today</p>
              <p className="serif mt-2 text-3xl">{(data.totals.per_day.water_l * today).toFixed(1)}</p>
              <p className="text-xs text-[#5d6b63]">litres</p>
            </div>
            <div>
              <p className="kicker text-sea">SDG weight</p>
              <p className="mt-2 text-sm">{data.sdgs.map((item) => `SDG ${item.sdg} ${item.weight}%`).join(" · ")}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {data.holdings.map((holding) => (
              <article key={holding.ticker} className="card grid items-center gap-3 p-4 sm:grid-cols-[1.2fr_auto_1.6fr]">
                <div>
                  <p className="mono text-xs text-sea">{holding.ticker} · {holding.allocation}%</p>
                  <h2 className="text-xl">{holding.name}</h2>
                </div>
                <div>
                  <GreenwashBadge status={holding.label} />
                </div>
                <dl className="grid grid-cols-4 gap-2 text-sm sm:text-right">
                  {[
                    ["CO₂", `${holding.impact.co2_kg} kg`],
                    ["Energy", `${holding.impact.kwh} kWh`],
                    ["Water", `${holding.impact.water_l} L`],
                    ["Score", holding.impact.score],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] text-[#55635b]">{k}</dt>
                      <dd className="num font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
