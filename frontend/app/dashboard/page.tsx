"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoalMilestone } from "@/components/GoalMilestone";
import { ImpactGauge } from "@/components/ImpactGauge";
import { ImpactLeaderboard, BoardRow } from "@/components/ImpactLeaderboard";
import { PortfolioDonut } from "@/components/PortfolioDonut";
import { Portfolio, api, loadQuiz, loadUser } from "@/lib/api";

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("Alex");

  useEffect(() => {
    const user = loadUser();
    setName(loadQuiz()?.name || user?.name || "Alex");
    const userId = user?.id || 1;
    api<Portfolio>(`/portfolio/${userId}`)
      .then(setPortfolio)
      .catch((err: Error) => setError(err.message));
    api<{ rows: BoardRow[] }>("/impact/leaderboard")
      .then((data) => setBoard(data.rows))
      .catch(() => undefined);
  }, []);

  const impact = portfolio?.impact;
  const rows: BoardRow[] = impact
    ? [...board, { name: `${name} (you)`, city: "Your portfolio", co2_kg: Math.round(impact.co2_kg), score: impact.score, you: true }]
    : board;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
      <p className="kicker text-sea">Dashboard</p>
      <h1 className="mt-2 text-3xl sm:text-5xl">{name}, this is what the money is doing.</h1>
      <p className="mt-3 max-w-2xl text-[#3d4f46]">
        {portfolio ? `${portfolio.name} · £${portfolio.amount_gbp.toLocaleString()} · ${portfolio.risk_profile || "Balanced"}` : "Loading the latest portfolio."}
      </p>
      {error && (
        <div className="card mt-6 max-w-xl p-5">
          <h2 className="text-2xl">No portfolio to show yet</h2>
          <p className="mt-2 text-sm text-[#3d4f46]">{error}. Take the quiz to build one, or check the API is running on port 8000.</p>
          <Link className="btn btn-ink mt-4" href="/onboarding">Take the quiz</Link>
        </div>
      )}
      {!impact && !error && (
        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-[210px] animate-pulse bg-[#f6efe2]" />
          ))}
        </div>
      )}
      {impact && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <ImpactGauge label="CO₂" value={impact.co2_kg} unit="kg / year" max={200} caption="Sequestered or avoided" />
            <ImpactGauge label="Energy" value={impact.kwh} unit="kWh / year" max={800} tone="#1d6a72" caption="Clean generation" />
            <ImpactGauge label="Water" value={impact.water_l} unit="litres / year" max={8000} tone="#1d6a72" caption="Purified or saved" />
            <ImpactGauge label="Forest" value={impact.forest_m2} unit="m² / year" max={4} tone="#c9841a" caption={`Score ${impact.score}/100`} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-[320px_1fr]">
            <PortfolioDonut slices={(portfolio?.holdings || []).map((fund) => ({ name: fund.ticker, value: fund.allocation }))} />
            <div className="grid gap-3">
              <GoalMilestone icon="sprout" title="First portfolio" detail="You locked a verified mix." progress={1} />
              <GoalMilestone icon="globe" title="100 kg CO₂" detail={`${impact.co2_kg.toFixed(0)} kg modelled this year.`} progress={impact.co2_kg / 100} />
              <GoalMilestone icon="link" title="All holdings verified" detail="False claims never enter this book." progress={1} />
            </div>
          </div>
          <div className="mt-6">
            <ImpactLeaderboard rows={rows} />
          </div>
        </>
      )}
    </main>
  );
}
