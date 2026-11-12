"""ESG claim classifier.

The default high-speed model is TF-IDF + balanced logistic regression with an expert regulatory rule layer.
When fine-tuned transformer weights are present (or loaded via FinBERT), it utilizes the transformer pipeline.
`train_greenwash.py --finbert` provides the deep transformer fine-tune path.
"""

from __future__ import annotations

import re
from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).resolve().parents[1] / "ml" / "greenwash_model" / "model.joblib"
FINBERT_DIR = Path(__file__).resolve().parents[1] / "ml" / "greenwash_model" / "finbert"

FALSE_PATTERNS = [
    r"guaranteed carbon negative",
    r"eliminates all emissions",
    r"end climate change",
    r"100% of pollution",
    r"100% pollution",
    r"risk-free",
    r"zero harm guaranteed",
    r"completely eliminates",
    r"carbon free overnight",
    r"plastic-free",
    r"zero harm to every",
]
VAGUE_PATTERNS = [
    r"\bunspecified\b",
    r"\bvarious\b",
    r"\bsignificant positive\b",
    r"\bsustainable future\b",
    r"\beco-friendly\b",
    r"\bworld-leading\b",
    r"\baims to\b",
    r"\baiming to\b",
    r"\bcommitted to\b",
    r"\bgenerally\b",
    r"not disclosed",
    r"do(?:ing)? better",
]
VERIFIED_SIGNALS = [
    "audited",
    "audit",
    "third-party",
    "third party",
    "verified",
    "sbti",
    "metered",
    "published",
    "verifier",
    "dnv",
    "kpmg",
    "iucn",
    "sampled",
    "laboratory",
    "lab-tested",
]

_model = None
_transformer_pipe = None


def load_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
    return _model


def load_transformer():
    global _transformer_pipe
    if _transformer_pipe is None and FINBERT_DIR.exists():
        try:
            from transformers import pipeline
            _transformer_pipe = pipeline("text-classification", model=str(FINBERT_DIR), top_k=None)
        except Exception:
            _transformer_pipe = False
    return _transformer_pipe if _transformer_pipe is not False else None


def rule_read(text: str) -> tuple[str | None, str, float]:
    lowered = text.lower()
    for pattern in FALSE_PATTERNS:
        if re.search(pattern, lowered):
            return "false", "Absolute promise with no credible evidence — treat as a false claim.", 0.94
    has_number = bool(re.search(r"\d", lowered))
    has_signal = any(signal in lowered for signal in VERIFIED_SIGNALS)
    vague_hits = [pattern for pattern in VAGUE_PATTERNS if re.search(pattern, lowered)]
    if "unspecified" in lowered:
        return "misleading", "Unspecified area — no verifiable metric provided.", 0.9
    if vague_hits and not (has_number and has_signal):
        return "misleading", "Vague language and no measurable, sourced target.", 0.84
    if has_number and has_signal:
        return "verified", "Names a quantity and a checkable source or verifier.", 0.9
    if has_number and not vague_hits:
        return "verified", "Contains a measurable figure.", 0.62
    return None, "Not enough specific evidence in the wording.", 0.4


def check_claim(text: str) -> dict:
    rule_label, reason, rule_confidence = rule_read(text)
    model = load_model()
    transformer = load_transformer()
    
    ml_label = None
    ml_confidence = None
    probabilities = {}
    engine_name = "hybrid-rule-tfidf"

    if transformer:
        try:
            t_res = transformer(text)[0]
            label_map = {"LABEL_0": "verified", "LABEL_1": "misleading", "LABEL_2": "false"}
            probabilities = {label_map.get(item["label"], item["label"]): round(float(item["score"]), 4) for item in t_res}
            best = max(t_res, key=lambda x: x["score"])
            ml_label = label_map.get(best["label"], best["label"])
            ml_confidence = float(best["score"])
            engine_name = "finbert-transformer"
        except Exception:
            pass

    if ml_label is None and model is not None:
        label = model.predict([text])[0]
        proba = model.predict_proba([text])[0]
        classes = list(model.classes_)
        probabilities = {str(name): round(float(value), 4) for name, value in zip(classes, proba)}
        ml_label = str(label)
        ml_confidence = float(max(proba))
        engine_name = "tfidf-logreg"

    if rule_label and rule_confidence >= 0.8:
        label = rule_label
        confidence = max(rule_confidence, ml_confidence or 0)
    elif ml_label:
        label = ml_label
        confidence = ml_confidence or 0.5
        if label == "verified":
            reason = "The claim classifier reads this as specific, quantified, and checkable."
        elif label == "false":
            reason = "The claim classifier reads this as an unsupported absolute promise."
        else:
            reason = "The claim classifier reads this as vague, aspirational, or weakly sourced."
    else:
        label = rule_label or "misleading"
        confidence = rule_confidence

    return {
        "label": label,
        "confidence": round(float(confidence), 4),
        "reason": reason,
        "probabilities": probabilities,
        "model": engine_name if (model is not None or transformer is not None) else "rules",
    }
