"use client";

const CARDS = [
  ["ESG", "A checklist, not a result. Environmental, social, governance. Ask what was measured."],
  ["Green bond", "A loan that promises the cash goes to environmental projects. Honest ones name the projects and the auditor."],
  ["Expense ratio", "The yearly fee. 0.40% of £1,000 is £4. It comes out even if the impact story is thin."],
  ["Scope 3", "The emissions in the supply chain and in how customers use the product. Often the biggest number, often missing."],
  ["Additionality", "Did your money cause something new, or was it happening anyway?"],
  ["MRV", "Measure it, report it, let someone else verify it. If a claim skips one of those, treat it as a slogan."],
  ["SBTi", "A climate target that has been checked against a scientific pathway, not written by the brand team alone."],
  ["Hash chain", "Each audit row fingerprints the claim plus the previous fingerprint. Edit yesterday, and today's hash no longer fits."],
];

export default function LearnPage() {
  function ask(term: string) {
    window.dispatchEvent(new CustomEvent("ip-ask", { detail: `Explain ${term} like I'm 22 and new to investing.` }));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
      <p className="kicker text-sea">Literacy hub · SDG 10</p>
      <h1 className="mt-2 max-w-3xl text-3xl sm:text-5xl">The words, without the fog.</h1>
      <p className="mt-3 max-w-2xl text-[#3d4f46]">
        Investing stays exclusive when the language does. Tap a card and the advisor will say it in plain speech.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {CARDS.map(([title, copy]) => (
          <button key={title} type="button" className="card p-5 text-left hover:bg-lime/40" onClick={() => ask(title)}>
            <h2 className="text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-[#3d4f46]">{copy}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-sea">Ask the advisor</p>
          </button>
        ))}
      </div>
    </main>
  );
}
