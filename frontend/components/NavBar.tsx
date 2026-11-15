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
  const [menu, setMenu] = useState(false);

  useEffect(() => setUser(loadUser()), [open, path]);
  useEffect(() => setMenu(false), [path]);

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
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 text-[13px] md:flex">
          {LINKS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              className={`shrink-0 rounded-full px-2.5 py-1 transition-colors ${path === href ? "bg-ink text-[#f6f1e6]" : "hover:bg-white/70"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-1">
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("ip-ask"))}
          >
            Advisor
          </button>
          <button className="btn btn-sm btn-lime" type="button" onClick={() => setOpen(true)}>
            {user ? user.name.split(" ")[0] : "Sign in"}
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#14241c33] md:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menu ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M2.5 5h13M2.5 9h13M2.5 13h13" />}
            </svg>
          </button>
        </div>
      </div>
      {menu && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-[#14241c14] px-4 pb-4 pt-2 md:hidden">
          <ul className="grid grid-cols-2 gap-1.5">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={path === href ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-2xl px-4 text-[15px] ${path === href ? "bg-ink text-[#f6f1e6]" : "bg-card"}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#14241ccc] p-4"
          onClick={() => setOpen(false)}
          onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        >
          <form role="dialog" aria-modal="true" aria-label="Sign in" className="card w-full max-w-md p-6" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
            <p className="kicker text-sea">{mode === "login" ? "Welcome back" : "Create an account"}</p>
            <h2 className="mt-1 text-3xl">Your vote, on the record.</h2>
            {mode === "register" && (
              <label className="mt-4 block text-sm">
                Name
                <input className="mt-1 w-full rounded-xl border border-[#e4d9c6] bg-white px-3 py-2" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
            )}
            <label className="mt-3 block text-sm">
              Email
              <input className="mt-1 w-full rounded-xl border border-[#e4d9c6] bg-white px-3 py-2" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="mt-3 block text-sm">
              Password
              <input className="mt-1 w-full rounded-xl border border-[#e4d9c6] bg-white px-3 py-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
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
