"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, loadUser, saveSession } from "@/lib/api";

const LINKS = [
  ["/onboarding", "Quiz"],
  ["/portfolio", "Portfolio"],
  ["/dashboard", "Dashboard"],
  ["/impact", "Impact"],
  ["/verify", "Verify"],
  ["/learn", "Learn"],
];

export function NavBar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alex@impactpulse.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => setUser(loadUser()), [open, path]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await api<{ access_token: string; user: { id: number; name: string; email: string } }>(
        mode === "login" ? "/auth/login" : "/auth/register",
        { method: "POST", body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name }) },
      );
      saveSession(data.access_token, data.user);
      setUser(data.user);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#14241c14] bg-[#efe7d8]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-5">
        <Link href="/" className="serif shrink-0 text-xl">
          ImpactPulse
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 text-[13px]">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-2 py-1 ${path === href ? "bg-ink text-[#f6f1e6]" : "hover:bg-white/70"}`}
            >
              {label}
            </Link>
          ))}
          <button
            className="btn btn-sm btn-ghost ml-1 shrink-0"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("ip-ask"))}
          >
            Advisor
          </button>
          <button className="btn btn-sm btn-lime shrink-0" type="button" onClick={() => setOpen(true)}>
            {user ? user.name.split(" ")[0] : "Sign in"}
          </button>
        </nav>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#14241ccc] p-4" onClick={() => setOpen(false)}>
          <form className="card w-full max-w-md p-6" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
            <p className="kicker text-sea">{mode === "login" ? "Welcome back" : "Create an account"}</p>
            <h2 className="mt-1 text-3xl">Your vote, on the record.</h2>
            {mode === "register" && (
              <input className="mt-4 w-full rounded-xl border border-[#e4d9c6] px-3 py-2" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
            )}
            <input className="mt-3 w-full rounded-xl border border-[#e4d9c6] px-3 py-2" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input className="mt-3 w-full rounded-xl border border-[#e4d9c6] px-3 py-2" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error && <p className="mt-2 text-sm text-clay">{error}</p>}
            <p className="mt-3 text-xs text-[#5d6b63]">Demo: alex@impactpulse.app / demo1234</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                className="text-sm underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Need an account?" : "Have an account?"}
              </button>
              <button className="btn btn-ink" type="submit">
                {mode === "login" ? "Sign in" : "Register"}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
