"""Train the ESG claim classifier.

Default path: TF-IDF + logistic regression on data/greenwash_training_data.csv.
Optional: python ml/train_greenwash.py --finbert
  Fine-tunes ProsusAI/finbert. Needs torch, transformers, and a GPU for a sane runtime.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "greenwash_training_data.csv"
MODEL_PATH = Path(__file__).resolve().parent / "greenwash_model" / "model.joblib"


def train() -> Path:
    if not CSV_PATH.exists():
        sys.path.append(str(Path(__file__).resolve().parent))
        from build_datasets import main as build

        build()
    frame = pd.read_csv(CSV_PATH)
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=6000)),
            (
                "clf",
                LogisticRegression(max_iter=500, class_weight="balanced"),
            ),
        ]
    )
    model.fit(frame["text"].astype(str), frame["label"].astype(str))
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved claim classifier to {MODEL_PATH} ({len(frame)} rows)")
    return MODEL_PATH


def train_finbert() -> None:
    from datasets import Dataset
    from transformers import (
        AutoModelForSequenceClassification,
        AutoTokenizer,
        Trainer,
        TrainingArguments,
    )

    frame = pd.read_csv(CSV_PATH)
    labels = {"verified": 0, "misleading": 1, "false": 2}
    frame["label_id"] = frame["label"].map(labels)
    dataset = Dataset.from_pandas(frame[["text", "label_id"]].rename(columns={"label_id": "labels"}))
    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")

    def tokenize(batch):
        return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=128)

    dataset = dataset.map(tokenize, batched=True)
    model = AutoModelForSequenceClassification.from_pretrained(
        "ProsusAI/finbert", num_labels=3, ignore_mismatched_sizes=True
    )
    args = TrainingArguments(
        output_dir=str(MODEL_PATH.parent / "finbert_run"),
        num_train_epochs=1,
        per_device_train_batch_size=8,
        learning_rate=2e-5,
        logging_steps=50,
        save_strategy="no",
        report_to=[],
    )
    trainer = Trainer(model=model, args=args, train_dataset=dataset)
    trainer.train()
    out = MODEL_PATH.parent / "finbert"
    trainer.save_model(str(out))
    tokenizer.save_pretrained(str(out))
    print(f"Saved FinBERT weights to {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--finbert", action="store_true", help="Fine-tune ProsusAI/finbert (heavy)")
    args = parser.parse_args()
    if args.finbert:
        train_finbert()
    else:
        train()
