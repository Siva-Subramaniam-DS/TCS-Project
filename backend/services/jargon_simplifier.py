"""Plain-English explainer. Uses Gemini when GEMINI_API_KEY is set, otherwise a local glossary."""

from __future__ import annotations

import os

import httpx

SYSTEM = (
    "You are the ImpactPulse advisor. Explain like I'm 22, care about sustainability, "
    "and I'm new to investing. Use short sentences, no jargon unless you define it, "
    "and never invent impact numbers. If a claim sounds vague, say so. "
    "Keep answers under 140 words."
)

GLOSSARY = [
    ("greenwashing", "Greenwashing is when a fund sounds green in the advert but the paperwork doesn't prove it. ImpactPulse flags wording that is vague, unsourced, or simply untrue."),
    ("esg", "ESG means environmental, social, and governance. It is a checklist for how a company treats the planet, people, and its own rules. A high ESG score is not the same as a proven impact."),
    ("aum", "AUM means assets under management: how much money the fund is looking after. Big AUM is not the same as big impact."),
    ("expense ratio", "The expense ratio is the yearly fee, as a percentage. A 0.40% fee on £1,000 is £4 a year. Fees come out whether or not the planet benefits."),
    ("sdg", "The SDGs are the UN Sustainable Development Goals, 17 targets such as clean energy (7) and climate action (13). We tag funds to the goals their projects actually touch."),
    ("etf", "An ETF is a fund you can buy and sell like a share. It usually holds a basket of companies. Convenient, but you still need to read what is inside."),
    ("green bond", "A green bond is a loan where the money is promised to environmental projects. The honest ones publish a list of projects and an auditor. The vague ones just say 'green'."),
    ("carbon credit", "A carbon credit is a certificate that says a tonne of CO₂ was avoided or stored. Quality varies wildly. Ask who measured it and who checked them."),
    ("scope 1", "Scope 1 emissions are the pollution a company makes directly, like fuel it burns itself. Scope 2 is bought electricity. Scope 3 is everything else in the chain, often the biggest slice."),
    ("scope 2", "Scope 2 is emissions from energy a company buys, mostly electricity. Scope 1 is what it burns itself. Scope 3 is the rest of the value chain."),
    ("scope 3", "Scope 3 is the indirect stuff: suppliers, shipping, and how customers use the product. It is usually the largest number and the easiest to leave out of a glossy report."),
    ("diversification", "Diversification means not betting everything on one fund. If one project disappoints, the rest of the portfolio still stands."),
    ("volatility", "Volatility is how wildly a price jumps around. High volatility can mean a rough year even if the long-term story is sound."),
    ("nav", "NAV is net asset value, the price of one slice of a fund. It moves as the holdings move."),
    ("sbti", "SBTi is the Science Based Targets initiative. If a company is validated there, its climate target has been checked against a pathway, not just written by the marketing team."),
    ("additionality", "Additionality asks: did your money cause something new, or was it going to happen anyway? Real impact needs the first one."),
    ("impact washing", "Impact washing is greenwashing's cousin: claiming real-world outcomes (trees, litres, tonnes) that aren't measured or are counted twice."),
    ("mrv", "MRV means measurement, reporting, and verification. In plain speech: count it, publish it, and let someone else check the count."),
    ("fiduciary", "A fiduciary has to act in your interest, not their own bonus. Fees, risk, and honesty about impact all sit inside that duty."),
    ("dividend", "A dividend is cash a company pays out to holders. Nice income. It says nothing by itself about carbon or water."),
    ("cosine", "We turn your quiz into five numbers (climate, water, energy, social, governance) and compare that shape with each fund. Cosine similarity is just 'how alike are these two shapes'."),
    ("hash", "A hash is a fingerprint of a text. We chain them so if someone edits yesterday's claim, the fingerprint no longer matches the next one. That's the audit trail."),
    ("risk profile", "Your risk profile is how much of a drop you can live with. Conservative means smoother and narrower. Growth means you can wait out a bad year."),
]


def _local_answer(message: str, context: str | None) -> str:
    lowered = message.lower()
    hits = [text for key, text in GLOSSARY if key in lowered]
    if hits:
        lead = " ".join(hits[:2])
    elif "portfolio" in lowered or "recommend" in lowered:
        lead = (
            "Your portfolio is a mix of funds that survived the greenwash check and sit inside your risk band. "
            "The percentages come from how closely each fund's values match your quiz."
        )
    elif "impact" in lowered or "co2" in lowered or "carbon" in lowered:
        lead = (
            "The dashboard numbers are modelled per £1,000 for a year, from the fund's published metrics, then scaled to what you invested. "
            "They are not a live sensor on a forest. If a fund can't show a method, we don't treat the number as real."
        )
    elif context:
        lead = "Here's the short version, using what I know about your portfolio."
    else:
        lead = (
            "Ask me about a term (ESG, green bond, expense ratio, Scope 3) or paste a claim and I'll say if it sounds solid. "
            "If the sentence could mean anything, it probably isn't proof."
        )
    if context:
        lead += f" Context I'm holding: {context}"
    return lead


def _gemini(prompt: str) -> str | None:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return None
    models = ["gemini-1.5-flash", "gemini-2.0-flash"]
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        try:
            response = httpx.post(url, json=body, timeout=25)
        except httpx.HTTPError:
            return None
        if response.status_code == 404:
            continue
        if response.status_code != 200:
            return None
        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (KeyError, IndexError):
            return None
    return None


def explain(message: str, history: list[dict] | None = None, context: str | None = None) -> dict:
    history = history or []
    transcript = "\n".join(f"{item['role']}: {item['content']}" for item in history[-6:])
    prompt = f"{SYSTEM}\n\nContext: {context or 'none'}\n\nConversation:\n{transcript}\n\nuser: {message}"
    remote = _gemini(prompt)
    if remote:
        return {"reply": remote, "engine": "gemini-1.5-flash"}
    return {"reply": _local_answer(message, context), "engine": "local-glossary"}
