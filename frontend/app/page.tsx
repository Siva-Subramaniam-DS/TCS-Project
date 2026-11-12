"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const PROBLEMS = [
  ["Greenwashing", "Most ESG adverts are adjectives. Very few are measurements you can check."],
  ["Complexity", "First-time investors bounce off jargon before they ever pick a fund."],
  ["Invisible impact", "A portfolio can look green on a factsheet and still show you nothing it changed."],
];

const STEPS = [
  ["01", "Quiz", "Eight questions become a values vector: climate, water, energy, social, governance."],
  ["02", "Match", "Cosine similarity ranks verified funds. A decision tree keeps the risk honest."],
  ["03", "Shield", "Every claim is classified: verified, misleading, or false."],
  ["04", "Proof", "SHA-256 links each audit row to the one before it."],
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-start gap-5 px-4 py-4 sm:px-5 min-[760px]:grid-cols-[1.15fr_0.85fr] min-[760px]:items-center lg:gap-10 lg:py-14">
        <div>
          <p className="kicker text-sea">HSBC Sustainathon · TCS</p>
          <h1 className="mt-2 max-w-xl text-[2.35rem] leading-[1.02] sm:text-5xl lg:text-6xl">
            Invest with proof. Impact with purpose.
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn btn-sm btn-ink" href="/onboarding">
              Take the 8-question quiz
            </Link>
            <Link className="btn btn-sm btn-ghost" href="/verify">
              Test a claim
            </Link>
          </div>
          <p className="mt-3 max-w-lg text-sm text-[#3d4f46] sm:text-base">
            ImpactPulse is for Gen Z investors who want sustainable funds they can actually verify.
            Your values pick the portfolio. The shield throws out the slogans.
          </p>
        </div>
        <aside className="card relative overflow-hidden p-5">
          <span className="stamp">Hash-linked</span>
          <p className="kicker mt-6 text-sea">Per £1,000 · BlueOcean Renewable</p>
          <ul className="mt-4 space-y-3 text-lg">
            <li className="flex justify-between"><span>CO₂ sequestered</span><strong>42 kg</strong></li>
            <li className="flex justify-between"><span>Clean energy</span><strong>180 kWh</strong></li>
            <li className="flex justify-between"><span>Water purified</span><strong>1,200 L</strong></li>
            <li className="flex justify-between"><span>Forest restored</span><strong>0.3 m²</strong></li>
          </ul>
          <p className="mono mt-4 text-[11px] leading-relaxed text-[#5d6b63]">
            Each claim is tied to the hash before it.
          </p>
          <p className="mt-3 text-sm text-[#5d6b63]">
            Modelled from the fund record for one year. If the claim has no metric, it does not land here.
          </p>
        </aside>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-8 md:grid-cols-3">
        {PROBLEMS.map(([title, copy]) => (
          <motion.article key={title} whileHover={{ y: -4 }} className="card p-5">
            <h2 className="text-2xl">{title}</h2>
            <p className="mt-2 text-[#3d4f46]">{copy}</p>
          </motion.article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="kicker text-sea">How it works</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {STEPS.map(([n, title, copy]) => (
            <article key={n} className="rounded-3xl border border-[#14241c14] bg-lime/50 p-5">
              <p className="mono text-xs">{n}</p>
              <h3 className="mt-2 text-2xl">{title}</h3>
              <p className="mt-2 text-sm text-[#24362c]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="card flex flex-wrap items-end justify-between gap-6 p-6 md:p-8">
          <div>
            <p className="kicker text-sea">SDGs in the product</p>
            <h2 className="mt-2 max-w-xl text-4xl">Clean energy, climate, oceans, land, and access.</h2>
            <p className="mt-3 max-w-xl text-[#3d4f46]">
              Funds are tagged to the goals their projects touch. The literacy hub is there so the door stays open if you are new to this.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["7 Energy", "13 Climate", "14 Oceans", "15 Land", "10 Access"].map((item) => (
              <span key={item} className="rounded-full bg-ink px-3 py-1 text-sm text-[#f6f1e6]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
