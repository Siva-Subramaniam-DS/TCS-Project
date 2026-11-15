"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Quiz, saveQuiz } from "@/lib/api";

type Option = { label: string; value: number | string };

const QUESTIONS: { key: keyof Quiz; prompt: string; help: string; options: Option[] }[] = [
  { key: "climate", prompt: "How hard should climate action pull your money?", help: "1 is a light preference. 5 means it leads the portfolio.", options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })) },
  { key: "water", prompt: "Clean water and living oceans. How much do they matter here?", help: "Rivers, drinking water, reefs, fisheries.", options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })) },
  { key: "energy", prompt: "Renewable energy access. What priority?", help: "Wind, solar, heat, grids that switch off fossil fuel.", options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })) },
  { key: "social", prompt: "Fair jobs, gender equality, and who gets left out.", help: "Wages, housing, skills, who owns the outcome.", options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })) },
  { key: "governance", prompt: "Honest companies. Audits. No fog.", help: "If they won't publish the method, this score should be high for you.", options: [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })) },
  {
    key: "horizon_years",
    prompt: "How long can this money stay invested?",
    help: "A short horizon pushes the risk model toward conservative funds.",
    options: [
      { label: "Under 2 years", value: 2 },
      { label: "3–5 years", value: 5 },
      { label: "6–10 years", value: 8 },
      { label: "10 years or more", value: 12 },
    ],
  },
  {
    key: "drop_reaction",
    prompt: "The portfolio drops 20% next month. You…",
    help: "There is no brave answer. This only sets the risk band.",
    options: [
      { label: "Sell and sleep", value: "sell" },
      { label: "Hold and wait", value: "hold" },
      { label: "Invest more", value: "buy" },
    ],
  },
  {
    key: "monthly_savings",
    prompt: "What can you set aside each month?",
    help: "We use a year of this as your starter amount. You can change it next.",
    options: [
      { label: "£25", value: 25 },
      { label: "£75", value: 75 },
      { label: "£150", value: 150 },
      { label: "£300", value: 300 },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Alex");
  const [answers, setAnswers] = useState<Partial<Quiz>>({ age: 22 });
  const current = QUESTIONS[step];
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);
  const scale = current.options.length === 5 && typeof current.options[0].value === "number";
  const picked = answers[current.key];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const index = Number(event.key) - 1;
      const option = QUESTIONS[step].options[index];
      if (option) choose(option.value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(value: number | string) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    const quiz = { ...next, name: name.trim() || "Alex", age: 22 } as Quiz;
    saveQuiz(quiz);
    router.push("/portfolio");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-12">
      <p className="kicker text-sea">Values quiz · {step + 1} / {QUESTIONS.length}</p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4d9c6]"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length}
      >
        <div className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      {step === 0 && (
        <label className="mt-6 block text-sm">
          What should we call you?
          <input className="mt-1 w-full rounded-xl border border-[#e4d9c6] bg-card px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      )}
      <h1 className="mt-5 text-3xl sm:text-5xl">{current.prompt}</h1>
      <p className="mt-3 text-[#5d6b63]">{current.help}</p>
      {scale ? (
        <div key={step} className="mt-8">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {current.options.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={picked === option.value}
                className={`card serif grid aspect-square max-h-28 w-full place-items-center text-3xl transition-colors sm:text-4xl ${
                  picked === option.value ? "!bg-ink text-[#f6f1e6]" : "hover:bg-lime/60"
                }`}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#55635b]">
            <span>A light preference</span>
            <span>Leads the portfolio</span>
          </div>
        </div>
      ) : (
        <div key={step} className="mt-8 grid gap-3 sm:grid-cols-2">
          {current.options.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={picked === option.value}
              className={`card flex items-center justify-between px-5 py-5 text-left text-lg transition-colors ${
                picked === option.value ? "!bg-ink text-[#f6f1e6]" : "hover:bg-lime/60"
              }`}
              onClick={() => choose(option.value)}
            >
              {option.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="opacity-40">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button className="btn btn-ghost" type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        <p className="hidden text-xs text-[#55635b] sm:block">
          Tip: press 1–{current.options.length} on your keyboard
        </p>
      </div>
    </main>
  );
}
