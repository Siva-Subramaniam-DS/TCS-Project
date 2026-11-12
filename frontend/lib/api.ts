export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Values = {
  climate: number;
  water: number;
  energy: number;
  social: number;
  governance: number;
};

export type Quiz = Values & {
  age: number;
  horizon_years: number;
  monthly_savings: number;
  drop_reaction: string;
  name: string;
};

export type Impact = {
  co2_kg: number;
  kwh: number;
  water_l: number;
  forest_m2: number;
  score: number;
  model_score?: number;
};

export type FundCard = {
  fund_id: number;
  name: string;
  ticker: string;
  category: string;
  region: string;
  risk: string;
  match: number | null;
  allocation: number;
  amount_gbp: number;
  label: string;
  claim: string;
  source: string;
  sdgs: number[];
  impact: Impact;
  impact_per_1k?: Impact;
};

export type Portfolio = {
  id: number;
  user_id: number;
  name: string;
  amount_gbp: number;
  risk_profile: string | null;
  holdings: FundCard[];
  impact: (Impact & { per_day?: Impact }) | null;
};

export function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("ip_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* keep status text */
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json();
}

export function loadQuiz(): Quiz | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ip_quiz");
  return raw ? (JSON.parse(raw) as Quiz) : null;
}

export function saveQuiz(quiz: Quiz) {
  localStorage.setItem("ip_quiz", JSON.stringify(quiz));
}

export function loadUser(): { id: number; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ip_user");
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(token: string, user: { id: number; name: string; email: string }) {
  localStorage.setItem("ip_token", token);
  localStorage.setItem("ip_user", JSON.stringify(user));
}

export function portfolioId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ip_portfolio");
  return raw ? Number(raw) : null;
}

export function savePortfolioId(id: number) {
  localStorage.setItem("ip_portfolio", String(id));
}

export const DEMO_QUIZ: Quiz = {
  name: "Alex",
  climate: 5,
  water: 2,
  energy: 5,
  social: 3,
  governance: 4,
  age: 22,
  horizon_years: 8,
  monthly_savings: 150,
  drop_reaction: "buy",
};
