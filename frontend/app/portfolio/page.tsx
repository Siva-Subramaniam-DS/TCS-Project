"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GreenwashBadge } from "@/components/GreenwashBadge";
import { PortfolioDonut } from "@/components/PortfolioDonut";
import { DEMO_QUIZ, FundCard, Quiz, api, loadQuiz, loadUser, savePortfolioId, saveQuiz } from "@/lib/api";

type Rec = {
  risk_profile: string;
  amount_gbp: number;
  recommendations: FundCard[];
  flagged: { name: string; ticker: string; reason: string }[];
  next_best_action?: {
    title: string;
    recommendation: string;
    target_ticker?: string;
    target_fund?: string;
    impact_metric?: string;
  };
  compute_carbon_footprint?: {
    architecture: string;
    estimated_co2_grams: number;
    rating: string;
  };
};

export default function PortfolioPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [amount, setAmount] = useState(1000);
  const [data, setData] = useState<Rec | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = loadQuiz();
    const active = stored || DEMO_QUIZ;
    if (!stored) saveQuiz(active);
    setQuiz(active);
    const starter = Math.max(500, active.monthly_savings * 12);
    setAmount(starter);
    api<Rec>("/portfolio/recommend", {
      method: "POST",
      body: JSON.stringify({
        values: {
          climate: active.climate,
          water: active.water,
          energy: active.energy,
          social: active.social,
          governance: active.governance,
        },
        age: active.age,
        horizon_years: active.horizon_years,
        monthly_savings: active.monthly_savings,
        drop_reaction: active.drop_reaction,
        amount_gbp: starter,
        name: active.name,
      }),
    })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const scaled = (data?.recommendations || []).map((fund) => {
    const ratio = amount / (data?.amount_gbp || amount);
    return { ...fund, amount_gbp: Math.round(fund.amount_gbp * ratio) };
  });

  async function lockIn() {
    if (!data || !quiz) return;
    setSaving(true);
    setError("");
    try {
      const user = loadUser();
      const saved = await api<{ id: number }>("/portfolio/save", {
        method: "POST",
        body: JSON.stringify({
          user_id: user?.id,
          name: `${quiz.name}'s portfolio`,
          amount_gbp: amount,
          risk_profile: data.risk_profile,
          allocations: data.recommendations.map((fund) => ({
            fund_id: fund.fund_id,
            allocation_pct: fund.allocation,
          })),
        }),
      });
      savePortfolioId(saved.id);
      if (user) localStorage.setItem("ip_user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-5 sm:pt-10 lg:pb-10">
      <p className="kicker text-sea">Portfolio builder</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl sm:text-5xl">{quiz ? `${quiz.name}, here is the match.` : "Building your mix"}</h1>
        {data && <span className="stamp">Risk · {data.risk_profile}</span>}
      </div>
      <p className="mt-3 max-w-2xl text-[#3d4f46]">
        Verified funds only. Misleading and false claims are listed underneath, so you can see what was kept out.
      </p>
      {error && <p className="mt-4 text-clay">{error}</p>}
      {!data && !error && <p className="mt-8">Scoring your values against the fund book…</p>}
      {data && (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              {data.next_best_action && (
                <div className="card relative overflow-hidden border border-leaf/40 bg-lime/30 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-leaf px-2.5 py-0.5 text-xs font-semibold text-white">HSBC Next Best Action</span>
                    {data.compute_carbon_footprint && (
                      <span className="mono text-[11px] text-[#5d6b63]">
                        {data.compute_carbon_footprint.rating} ({data.compute_carbon_footprint.estimated_co2_grams}g CO₂e compute)
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-ink">{data.next_best_action.title}</h3>
                  <p className="mt-1 text-sm text-[#24362c]">{data.next_best_action.recommendation}</p>
                </div>
              )}
              <label className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span>
                  <span className="block font-semibold">Amount to allocate</span>
                  <span className="text-xs text-[#55635b]">Every slice below rescales as you type.</span>
                </span>
                <span className="flex items-center rounded-xl border border-[#e4d9c6] bg-white pl-3">
                  <span className="text-[#55635b]">£</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    step={50}
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="num w-24 rounded-xl bg-transparent px-2 py-2 text-right text-base"
                  />
                </span>
              </label>
              {scaled.map((fund) => (
                <article key={fund.fund_id} className="card p-5">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-sea">{fund.ticker} · {fund.category}</p>
                      <h2 className="text-xl sm:text-2xl">{fund.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="serif text-2xl sm:text-3xl">{Math.round((fund.match || 0) * 100)}%</p>
                      <p className="whitespace-nowrap text-xs text-[#55635b]">values match</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <GreenwashBadge status={fund.label} />
                    <span className="rounded-full bg-[#f3ecdf] px-2 py-1 text-xs">{fund.allocation}% · £{fund.amount_gbp.toLocaleString()}</span>
                    <span className="rounded-full bg-[#f3ecdf] px-2 py-1 text-xs">{fund.risk}</span>
                    {fund.sdgs.map((sdg) => (
                      <span key={sdg} className="rounded-full bg-lime px-2 py-1 text-xs">SDG {sdg}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-[#3d4f46]">{fund.claim}</p>
                  <p className="mt-2 text-xs text-[#5d6b63]">
                    Per this slice: {(fund.impact.co2_kg * (amount / (data.amount_gbp || amount))).toFixed(1)} kg CO₂ · score {fund.impact.score}/100
                  </p>
                </article>
              ))}
            </div>
            <div className="space-y-4">
              <PortfolioDonut slices={scaled.map((fund) => ({ name: fund.ticker, value: fund.allocation }))} />
              <button className="btn btn-ink hidden w-full lg:flex" type="button" onClick={lockIn} disabled={saving}>
                {saving ? "Saving…" : "Lock this portfolio"}
              </button>
              {data.flagged.length > 0 && (
                <div className="card p-4">
                  <p className="kicker text-clay">Kept out</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {data.flagged.slice(0, 5).map((fund) => (
                      <li key={fund.ticker}>
                        <strong>{fund.name}</strong>
                        <span className="text-[#5d6b63]"> · {fund.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div
            className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[#14241c14] bg-[#efe7d8]/95 px-4 pt-3 backdrop-blur lg:hidden"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="text-sm">
              <p className="font-semibold">£{amount.toLocaleString()} · {scaled.length} funds</p>
              <p className="text-xs text-[#55635b]">{data.risk_profile} risk</p>
            </div>
            <button className="btn btn-ink" type="button" onClick={lockIn} disabled={saving}>
              {saving ? "Saving…" : "Lock this portfolio"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
