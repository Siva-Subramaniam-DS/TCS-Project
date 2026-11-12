"""Train the Random Forest impact scorer and the decision-tree risk profiler."""

from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "data" / "funds_dataset.csv"
OUT = Path(__file__).resolve().parent / "impact_model"

sys.path.append(str(Path(__file__).resolve().parents[1]))
from services.impact_scorer import formula_score  # noqa: E402
from services.risk_profiler import rule_profile  # noqa: E402

RISK_ORDER = {"Conservative": 0, "Balanced": 1, "Growth": 2}
LABELS = {"Conservative": 0, "Balanced": 1, "Growth": 2}


def train_impact(frame: pd.DataFrame) -> None:
    features = []
    target = []
    for row in frame.itertuples(index=False):
        features.append(
            [
                row.climate,
                row.water,
                row.energy,
                row.social,
                row.governance,
                row.expense_ratio,
                float(np.log1p(row.aum_gbp_m)),
                RISK_ORDER.get(row.risk, 1),
            ]
        )
        target.append(
            formula_score(row.co2_kg_per_1k, row.kwh_per_1k, row.water_l_per_1k, row.forest_m2_per_1k, row.governance)
        )
    model = RandomForestRegressor(n_estimators=200, random_state=7)
    model.fit(features, target)
    joblib.dump(model, OUT / "impact_rf.joblib")
    print(f"Saved impact forest ({len(frame)} funds)")


def train_risk() -> None:
    rng = np.random.default_rng(7)
    features = []
    target = []
    reactions = ["sell", "hold", "buy"]
    for _ in range(4000):
        age = int(rng.integers(18, 65))
        horizon = int(rng.integers(1, 16))
        savings = float(rng.integers(25, 800))
        drop = int(rng.integers(0, 3))
        profile = rule_profile(age, horizon, savings, reactions[drop])
        features.append([age, horizon, savings, drop])
        target.append(LABELS[profile])
    tree = DecisionTreeClassifier(max_depth=8, random_state=7)
    tree.fit(features, target)
    joblib.dump(tree, OUT / "risk_tree.joblib")
    print("Saved risk tree")


def train() -> None:
    if not CSV_PATH.exists():
        from build_datasets import main as build

        build()
    OUT.mkdir(parents=True, exist_ok=True)
    frame = pd.read_csv(CSV_PATH)
    train_impact(frame)
    train_risk()


if __name__ == "__main__":
    train()
