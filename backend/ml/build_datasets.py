"""Write the CSV/JSON datasets and a PostgreSQL seed file. Stdlib only."""

from __future__ import annotations

import csv
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
DB = ROOT / "database"

# name, ticker, category, region, risk, climate, water, energy, social, governance,
# expense, aum, co2, kwh, water_l, forest, sdgs, claim, source, label
FUNDS = [
    ("BlueOcean Renewable Fund", "BOCE", "Renewable Energy", "Europe", "Growth", 4, 2, 5, 2, 4, 0.45, 820, 42, 180, 1200, 0.3, "7,13", "Independently audited by DNV: financed 18,200 MWh of new offshore wind in 2024.", "DNV assurance statement 2024", "verified"),
    ("Amazon Canopy Promise", "ACAN", "Forests", "Latin America", "Balanced", 5, 2, 1, 3, 2, 0.72, 140, 22, 10, 80, 1.4, "13,15", "This fund aims to reforest an unspecified area of the Amazon.", "Fund factsheet", "misleading"),
    ("Thames Water Stewardship", "TWST", "Water", "United Kingdom", "Conservative", 2, 5, 1, 3, 5, 0.38, 540, 6, 20, 4200, 0.05, "6,14", "Audited 2024: 86 million litres of wastewater treated to a verified standard across 4 plants.", "Water utility audit", "verified"),
    ("Nordic Wind & Grid", "NWGD", "Renewable Energy", "Nordics", "Balanced", 4, 1, 5, 2, 4, 0.41, 1200, 44, 260, 120, 0.02, "7,13", "SBTi-validated pathway; 2024 generation of 640 GWh attributed, third-party metered.", "SBTi target plus meter data", "verified"),
    ("Solar Sahel Access", "SOLS", "Renewable Energy", "Africa", "Growth", 4, 1, 5, 5, 3, 0.68, 210, 30, 190, 40, 0.0, "7,10", "Verified by GOGLA: 42,000 solar home systems installed, 9.6 GWh displaced kerosene in 2024.", "GOGLA report", "verified"),
    ("Coral Reef Recovery Note", "CORL", "Oceans", "Global", "Growth", 3, 5, 1, 2, 3, 0.80, 90, 4, 5, 800, 0.0, "14", "This product is committed to supporting various reef projects for a more sustainable future.", "Marketing brochure", "misleading"),
    ("Fair Wage Supply Chain", "FAIR", "Social", "Global", "Balanced", 1, 1, 1, 5, 4, 0.55, 430, 2, 0, 0, 0.0, "8,10", "Audited living-wage coverage reached 71% of tier-1 suppliers in 2024 (Fair Wear Foundation).", "Fair Wear audit", "verified"),
    ("Gender Equality Bond", "GEBN", "Social", "Europe", "Conservative", 1, 1, 1, 5, 5, 0.33, 980, 1, 0, 0, 0.0, "5,10", "Use-of-proceeds audited: £210m lent to women-owned SMEs, impact report by ISS ESG.", "ISS ESG second-party opinion", "verified"),
    ("Green Hydrogen Corridor", "H2CO", "Renewable Energy", "Europe", "Growth", 5, 2, 5, 2, 3, 0.77, 310, 28, 140, 60, 0.0, "7,13", "The issuer aims to explore green hydrogen across various European ports.", "Issuer presentation", "misleading"),
    ("Urban Transit Electrification", "UTEB", "Transport", "United Kingdom", "Balanced", 4, 1, 4, 4, 4, 0.48, 670, 36, 95, 20, 0.0, "11,13", "Independently counted 1,240 electric buses financed, 62,000 tCO2e avoided in 2024.", "Programme assurance", "verified"),
    ("Peatland Carbon Store", "PEAT", "Forests", "United Kingdom", "Conservative", 5, 3, 1, 2, 5, 0.42, 260, 55, 5, 300, 0.8, "13,15", "IUCN-verified restoration of 1,850 hectares; 48,000 tCO2e sequestered, measured 2023-24.", "IUCN verification", "verified"),
    ("Mangrove Shield Asia", "MANG", "Forests", "Asia", "Balanced", 4, 4, 1, 3, 4, 0.60, 180, 40, 8, 900, 1.1, "13,14,15", "Third-party monitored: 920 hectares of mangrove restored, survival rate 81% at year 3.", "Remote-sensing audit", "verified"),
    ("Circular Plastics Europe", "CIRC", "Circular Economy", "Europe", "Balanced", 3, 2, 2, 3, 4, 0.50, 390, 12, 15, 200, 0.0, "12,13", "Audited 14,600 tonnes of food-grade recycled PET output in 2024 (EuCertPlast).", "EuCertPlast certificate", "verified"),
    ("Smallholder Agroforestry", "AGRO", "Food Systems", "Africa", "Growth", 4, 3, 1, 5, 3, 0.70, 150, 18, 6, 240, 0.9, "2,15", "Rainforest Alliance sampled 6,200 farms; 3.1 million trees in programme, 2024 review.", "Rainforest Alliance review", "verified"),
    ("Community Solar UK", "CSUK", "Renewable Energy", "United Kingdom", "Conservative", 3, 1, 5, 4, 5, 0.36, 240, 20, 150, 10, 0.0, "7,11", "Ofgem-registered community sites, 31 MW, metered 27.4 GWh exported in 2024.", "Ofgem registration and meters", "verified"),
    ("Ocean Plastic Heroes", "OPLH", "Oceans", "Global", "Growth", 2, 4, 1, 3, 2, 0.85, 70, 3, 2, 500, 0.0, "14", "We are committed to cleaning the oceans and delivering a significant positive impact worldwide.", "Campaign page", "misleading"),
    ("EverGreen Zero", "EVGZ", "Renewable Energy", "Global", "Growth", 5, 3, 5, 3, 1, 1.20, 40, 0, 0, 0, 0.0, "13", "This fund is guaranteed carbon negative and eliminates all emissions overnight.", "Promotional email", "false"),
    ("CleanCoal Transition", "CCLN", "Energy", "Global", "Balanced", 1, 1, 2, 1, 1, 0.90, 300, 0, 5, 0, 0.0, "7", "Coal is clean energy. This fund completely eliminates pollution from coal plants with zero harm guaranteed.", "Sales deck", "false"),
    ("Highland Hydro Co-op", "HHYD", "Renewable Energy", "United Kingdom", "Conservative", 3, 3, 5, 3, 5, 0.34, 190, 16, 120, 800, 0.1, "6,7", "MCS-certified hydro sites; 11.2 GWh generated, audited community dividend £1.4m (2024).", "MCS certification and accounts", "verified"),
    ("Sahel Drip Irrigation", "DRIP", "Water", "Africa", "Balanced", 3, 5, 2, 5, 3, 0.62, 110, 8, 4, 6100, 0.2, "2,6", "Measured 18% yield lift across 9,400 hectares; 1.2 billion litres saved versus flood irrigation.", "University field study", "verified"),
    ("Baltic Sea Nutrients", "BALT", "Water", "Europe", "Balanced", 2, 5, 1, 2, 4, 0.44, 220, 5, 3, 2800, 0.0, "14", "HELCOM-aligned projects removed 640 tonnes of nitrogen from agricultural runoff, independently sampled.", "HELCOM dataset", "verified"),
    ("City Canopy Bonds", "CITY", "Forests", "Europe", "Conservative", 3, 2, 1, 4, 5, 0.30, 760, 14, 2, 40, 0.6, "11,15", "Municipal green bond: 74,000 street trees planted, survival audited at 86% after 24 months.", "City auditor", "verified"),
    ("Ethical Cloud & Grid", "CLOD", "Renewable Energy", "Global", "Growth", 3, 1, 4, 2, 4, 0.58, 540, 18, 160, 30, 0.0, "7,9", "PPA-backed: data centres matched 92% hourly with new renewable generation in the 2024 report.", "EnergyTag hourly report", "verified"),
    ("PurePlanet Absolute", "PPAB", "Forests", "Global", "Growth", 5, 5, 5, 5, 1, 1.40, 25, 0, 0, 0, 0.0, "13,15", "Investing here will end climate change and remove 100% of pollution from the planet, risk-free.", "Influencer script", "false"),
    ("Inclusive Housing Green", "HOUS", "Social", "United Kingdom", "Conservative", 2, 1, 3, 5, 4, 0.40, 880, 9, 22, 30, 0.0, "10,11", "EPC-verified retrofit of 3,150 homes, average 41% gas reduction, social value report 2024.", "EPC lodgement sample", "verified"),
    ("Kelp Coast Recovery", "KELP", "Oceans", "Europe", "Balanced", 4, 4, 1, 2, 3, 0.66, 75, 11, 2, 300, 0.0, "13,14", "Pilot sites monitored: 160 hectares of kelp, biomass survey by the Marine Institute in 2024.", "Marine Institute survey", "verified"),
    ("Sustainable Future Leaders", "SFLX", "Green Bonds", "Global", "Balanced", 3, 3, 3, 3, 2, 0.75, 1500, 8, 20, 100, 0.1, "13", "A world-leading ESG strategy delivering eco-friendly outcomes for a sustainable future.", "Marketing one-pager", "misleading"),
    ("Andean Watershed Fund", "ANDW", "Water", "Latin America", "Growth", 3, 5, 2, 4, 3, 0.69, 95, 7, 6, 3500, 0.4, "6,15", "Flow meters on 22 community systems: 410 million litres of drinking water supplied in 2024.", "NGO meter logs", "verified"),
    ("Battery Circularity", "BATC", "Circular Economy", "Europe", "Growth", 3, 2, 4, 3, 4, 0.63, 280, 10, 40, 50, 0.0, "7,12", "Audited recovery of 1,900 tonnes of lithium-ion black mass, 2024 recycler certificates.", "Recycler certificates", "verified"),
    ("Women in Climate Tech", "WICT", "Social", "Global", "Growth", 3, 1, 3, 5, 3, 0.71, 160, 6, 30, 10, 0.0, "5,9", "Portfolio companies reported 48% women on technical teams. The survey method is not disclosed.", "Self-reported survey", "misleading"),
    ("Regenerative Grain Co-op", "GRAIN", "Food Systems", "Europe", "Balanced", 4, 3, 1, 4, 4, 0.47, 210, 15, 4, 180, 0.3, "2,15", "Soil organic carbon rose 0.2 percentage points on 12,000 hectares, lab-tested by independent agronomists.", "Soil laboratory panel", "verified"),
    ("Arctic Claims Fund", "ARCT", "Forests", "Global", "Growth", 4, 2, 2, 1, 1, 0.95, 60, 1, 1, 1, 0.0, "15", "We protect various Arctic ecosystems and are committed to significant conservation soon.", "Teaser document", "misleading"),
    ("Rail Not Road", "RAIL", "Transport", "Europe", "Conservative", 3, 1, 3, 3, 5, 0.35, 1100, 24, 40, 10, 0.0, "9,11", "Green bond proceeds tracked: 86 km of electrified rail, 210,000 tCO2e avoided, auditor KPMG.", "KPMG use-of-proceeds letter", "verified"),
    ("School Solar Africa", "SCHL", "Renewable Energy", "Africa", "Balanced", 3, 1, 4, 5, 4, 0.52, 80, 9, 70, 5, 0.0, "4,7", "312 schools electrified, attendance records show an 11% rise, generation metered at 4.8 GWh.", "Ministry records and meters", "verified"),
    ("Desert Bloom Afforestation", "DSRT", "Forests", "Middle East", "Growth", 4, 2, 1, 2, 2, 0.88, 100, 5, 1, 20, 2.0, "15", "This fund aims to green the desert and plant trees across an unspecified region.", "Brochure", "misleading"),
    ("Heat Pump Neighbourhoods", "HEAT", "Renewable Energy", "United Kingdom", "Balanced", 4, 1, 4, 4, 4, 0.46, 330, 27, 80, 15, 0.0, "7,11", "TrustMark-lodged installs: 8,600 heat pumps, method published, 19,400 tCO2e a year avoided.", "TrustMark lodgements", "verified"),
    ("Fisheries Recovery Note", "FISH", "Oceans", "Global", "Balanced", 2, 4, 1, 4, 3, 0.58, 140, 3, 1, 200, 0.0, "14", "MSC-certified fisheries in the book: 6 stocks with biomass above target in the 2024 assessment.", "MSC and ICES assessment", "verified"),
    ("Zero Harm Mining", "ZHRM", "Circular Economy", "Global", "Growth", 2, 2, 2, 2, 1, 1.10, 200, 0, 0, 0, 0.0, "12", "Our mines are 100% pollution free and guaranteed to cause zero harm to every community.", "Investor call transcript", "false"),
    ("Coastal Defence Wetlands", "WETL", "Water", "United Kingdom", "Conservative", 3, 4, 1, 3, 5, 0.39, 410, 12, 2, 1600, 0.5, "13,14", "Environment Agency scheme: 1,100 hectares of managed realignment, 2024 damages-avoided report published.", "Environment Agency report", "verified"),
    ("Microgrid Islands", "MIGR", "Renewable Energy", "Asia", "Growth", 3, 2, 5, 4, 3, 0.73, 130, 14, 110, 20, 0.0, "7,11", "Diesel displacement metered at 6.1 million litres a year across 14 island microgrids.", "Utility meters", "verified"),
    ("Fair Fashion Bond", "FASH", "Social", "Global", "Balanced", 2, 2, 1, 5, 3, 0.60, 190, 4, 2, 80, 0.0, "8,12", "The bond aims to improve conditions in various factories and support a more ethical industry.", "Brand sustainability page", "misleading"),
    ("Biogas from Waste", "BIOG", "Renewable Energy", "Europe", "Balanced", 3, 2, 4, 3, 4, 0.49, 250, 17, 130, 40, 0.0, "7,12", "RED II compliant: 48 million m3 biomethane injected, sustainability certificates retired in 2024.", "Certificate registry", "verified"),
    ("Indigenous Land Stewardship", "LAND", "Forests", "Latin America", "Growth", 5, 3, 1, 5, 4, 0.64, 70, 26, 3, 60, 1.6, "10,15", "Community monitoring of 62,000 hectares; satellite analysis shows deforestation 78% below the control area.", "Satellite analysis 2024", "verified"),
    ("Blue Carbon Mangrove II", "BCM2", "Oceans", "Africa", "Balanced", 4, 4, 1, 3, 3, 0.67, 85, 21, 2, 400, 0.7, "13,14", "Registry project documents 19,500 tCO2e issued in the latest monitoring period, verifier named.", "Carbon registry monitoring report", "verified"),
    ("Vague Virtue ETF", "VVET", "Green Bonds", "Global", "Conservative", 2, 2, 2, 2, 2, 0.28, 2400, 3, 8, 20, 0.0, "13", "Invests in companies that are generally eco-friendly and committed to doing better.", "Index methodology teaser", "misleading"),
    ("Nuclear Transition Note", "NUCL", "Clean Energy", "Europe", "Conservative", 4, 2, 5, 2, 5, 0.37, 1600, 48, 300, 40, 0.0, "7,13", "Low-carbon generation attributed with published grid factors; 1.1 TWh financed share in 2024.", "Ember factors and allocation report", "verified"),
    ("Plastic Offset Fantasy", "PLOF", "Oceans", "Global", "Growth", 2, 3, 1, 2, 1, 1.30, 35, 0, 0, 0, 0.0, "14", "Buy this and the ocean becomes plastic-free. We guarantee 100% pollution removal, risk-free.", "Landing page", "false"),
    ("Apprentice Green Skills", "SKIL", "Social", "United Kingdom", "Conservative", 1, 1, 2, 5, 4, 0.32, 300, 1, 4, 0, 0.0, "4,8", "6,840 apprentices completed, destination data published, 79% in work after 6 months.", "Education outcome data", "verified"),
    ("Highland Peat Neighbours", "HPEA", "Forests", "United Kingdom", "Balanced", 5, 4, 1, 3, 4, 0.43, 95, 33, 2, 500, 0.9, "13,15", "Peat depth surveys on 640 hectares, emissions factor from the IPCC wetlands supplement, report public.", "Project design document", "verified"),
    ("Mega Green Promise", "MEGA", "Green Bonds", "Global", "Growth", 4, 4, 4, 4, 1, 0.99, 500, 2, 5, 10, 0.05, "13", "The world's most sustainable fund, aiming to fix various environmental issues with significant impact.", "Advertisement", "misleading"),
    ("District Heat Nordic", "DHEA", "Renewable Energy", "Nordics", "Conservative", 3, 1, 4, 3, 5, 0.31, 720, 19, 100, 25, 0.0, "7,11", "Municipal disclosure: 73% renewable district heat, 410 GWh, emissions factor third-party reviewed.", "Municipal disclosure", "verified"),
    ("Riverkeeper Bonds", "RIVR", "Water", "United Kingdom", "Balanced", 2, 5, 1, 3, 5, 0.40, 180, 4, 1, 2400, 0.1, "6,14", "Citizen science plus lab tests: phosphate down 22% at 14 sites, method and raw data published.", "Open water-quality dataset", "verified"),
]

HEADERS = [
    "name", "ticker", "category", "region", "risk",
    "climate", "water", "energy", "social", "governance",
    "expense_ratio", "aum_gbp_m",
    "co2_kg_per_1k", "kwh_per_1k", "water_l_per_1k", "forest_m2_per_1k",
    "sdgs", "claim", "source", "label",
]


def impact_score(co2, kwh, water, forest, governance) -> int:
    raw = (
        40 * min(co2 / 50, 1.2)
        + 30 * min(kwh / 220, 1.2)
        + 15 * min(water / 2000, 1.2)
        + 10 * min(forest / 1.2, 1.2)
        + 5 * (governance / 5)
    )
    return int(max(1, min(99, round(raw))))


def write_funds() -> list[dict]:
    DATA.mkdir(parents=True, exist_ok=True)
    rows = []
    with (DATA / "funds_dataset.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        for fund in FUNDS:
            writer.writerow(fund)
            rec = dict(zip(HEADERS, fund))
            rec["impact_score"] = impact_score(
                rec["co2_kg_per_1k"], rec["kwh_per_1k"], rec["water_l_per_1k"],
                rec["forest_m2_per_1k"], rec["governance"],
            )
            rec["sdg_list"] = [int(x) for x in str(rec["sdgs"]).split(",") if x]
            rows.append(rec)
    return rows


def write_json(rows: list[dict]) -> None:
    mapping = [
        {"ticker": r["ticker"], "name": r["name"], "sdgs": r["sdg_list"], "label": r["label"]}
        for r in rows
    ]
    (DATA / "sdg_mapping.json").write_text(json.dumps(mapping, indent=2), encoding="utf-8")
    example = next(r for r in rows if r["ticker"] == "BOCE")
    seed = {
        "currency": "GBP",
        "unit_invested": 1000,
        "note": "Metrics are illustrative competition data, modelled per £1,000 invested for one year.",
        "example_fund": example["name"],
        "example": {
            "co2_kg": example["co2_kg_per_1k"],
            "kwh": example["kwh_per_1k"],
            "water_l": example["water_l_per_1k"],
            "forest_m2": example["forest_m2_per_1k"],
            "impact_score": example["impact_score"],
        },
        "funds": [
            {
                "ticker": r["ticker"],
                "name": r["name"],
                "co2_kg_per_1k": r["co2_kg_per_1k"],
                "kwh_per_1k": r["kwh_per_1k"],
                "water_l_per_1k": r["water_l_per_1k"],
                "forest_m2_per_1k": r["forest_m2_per_1k"],
                "impact_score": r["impact_score"],
            }
            for r in rows
        ],
    }
    (DATA / "impact_metrics_seed.json").write_text(json.dumps(seed, indent=2), encoding="utf-8")


def write_seed_sql(rows: list[dict]) -> None:
    def q(value) -> str:
        return "'" + str(value).replace("'", "''") + "'"

    lines = [
        "-- Demo funds. The API rebuilds the hash chain and the demo user on startup.",
        "INSERT INTO funds (name, ticker, category, region, risk, climate, water, energy, social, governance,",
        "    expense_ratio, aum_gbp_m, co2_kg_per_1k, kwh_per_1k, water_l_per_1k, forest_m2_per_1k, sdgs, claim, source, label)",
        "VALUES",
    ]
    values = []
    for r in rows:
        values.append(
            "("
            + ", ".join(
                [
                    q(r["name"]), q(r["ticker"]), q(r["category"]), q(r["region"]), q(r["risk"]),
                    str(r["climate"]), str(r["water"]), str(r["energy"]), str(r["social"]), str(r["governance"]),
                    str(r["expense_ratio"]), str(r["aum_gbp_m"]),
                    str(r["co2_kg_per_1k"]), str(r["kwh_per_1k"]), str(r["water_l_per_1k"]), str(r["forest_m2_per_1k"]),
                    q(r["sdgs"]), q(r["claim"]), q(r["source"]), q(r["label"]),
                ]
            )
            + ")"
        )
    lines.append(",\n".join(values) + " ON CONFLICT (ticker) DO NOTHING;")
    (DB / "seed.sql").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_greenwash_csv() -> None:
    random.seed(7)
    auditors = ["DNV", "KPMG", "ISS ESG", "IUCN", "a named verifier"]
    units = ["MWh", "tCO2e", "hectares", "litres", "homes"]
    things = ["new wind capacity", "avoided emissions", "restored habitat", "water treated", "retrofit installs"]
    vague = [
        "This fund aims to {verb} an unspecified area of the {place}.",
        "We are committed to {verb} and delivering a significant positive impact.",
        "A world-leading ESG strategy for a sustainable future, with various projects.",
        "The product is eco-friendly and generally supports a greener tomorrow.",
        "Management is aiming to explore {topic} across various regions soon.",
        "Invests in companies that are committed to doing better on sustainability.",
    ]
    false_claims = [
        "This fund is guaranteed carbon negative and eliminates all emissions overnight.",
        "Investing here will end climate change and remove 100% of pollution, risk-free.",
        "We guarantee 100% pollution removal and zero harm to every community.",
        "Coal is clean energy and this product completely eliminates all harm, guaranteed.",
        "Buy this and the planet becomes carbon free overnight, with zero risk.",
    ]
    verified = [
        "Independently audited by {auditor}: {n} {unit} of {thing} recorded in {year}.",
        "Third-party metered {n} {unit}. The method and the verifier ({auditor}) are published.",
        "Use of proceeds checked by {auditor}. {n} {unit} of {thing} in {year}, report public.",
        "{auditor} sampled the portfolio. {n} {unit} of {thing} met the stated test in {year}.",
    ]
    verbs = ["reforest", "clean", "restore", "offset", "protect"]
    places = ["Amazon", "ocean", "Sahel", "Arctic", "supply chain"]
    topics = ["green hydrogen", "plastic credits", "nature markets", "reef health"]

    rows = [("text", "label")]
    # Keep the canonical demo sentence in the training set.
    rows.append(("This fund aims to reforest an unspecified area of the Amazon.", "misleading"))
    for _ in range(760):
        template = random.choice(verified)
        text = template.format(
            auditor=random.choice(auditors),
            n=random.choice([120, 860, 2400, 18500, 640]),
            unit=random.choice(units),
            thing=random.choice(things),
            year=random.choice([2023, 2024, 2025]),
        )
        rows.append((text, "verified"))
    for _ in range(760):
        template = random.choice(vague)
        text = template.format(
            verb=random.choice(verbs),
            place=random.choice(places),
            topic=random.choice(topics),
        )
        rows.append((text, "misleading"))
    for _ in range(479):
        rows.append((random.choice(false_claims), "false"))

    random.shuffle(rows[1:])
    with (DATA / "greenwash_training_data.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)


def main() -> None:
    rows = write_funds()
    write_json(rows)
    write_seed_sql(rows)
    write_greenwash_csv()
    print(f"Wrote {len(rows)} funds and training claims to {DATA}")


if __name__ == "__main__":
    main()
