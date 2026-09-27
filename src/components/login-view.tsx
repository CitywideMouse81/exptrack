"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNT, getSession, signIn } from "@/lib/auth";

const WEEK_BARS = [38, 52, 44, 61, 47, 72, 58];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-400 ${className}`}
    >
      <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden="true">
        <rect x="3" y="10" width="3.2" height="7" rx="1" fill="#020617" />
        <rect x="8.4" y="6.5" width="3.2" height="10.5" rx="1" fill="#020617" />
        <rect x="13.8" y="3" width="3.2" height="14" rx="1" fill="#020617" />
      </svg>
    </span>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9" />
      <path d="M6.5 7.8A16.6 16.6 0 0 0 2 12s3.5 6 10 6c1.4 0 2.6-.3 3.7-.7" />
      <path d="M9.9 10a2.8 2.8 0 0 0 4 4" />
    </svg>
  );
}

export function LoginView() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [showForgotNote, setShowForgotNote] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/");
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const result = await signIn(email, password, remember);
    setBusy(false);

    if (result.ok) {
      router.replace("/");
      router.refresh();
      return;
    }
    setError(result.error);
    setShakeKey((k) => k + 1);
  }

  function fillDemo() {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setError(null);
    setShowForgotNote(false);
    passwordRef.current?.focus();
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/[0.06]";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.5) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/[0.08] blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <Logo />
          <span className="font-mono text-sm tracking-tight text-slate-100">
            exptrack
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-slate-50">
            Every rupee,
            <br />
            accounted for.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            A clean, local record of what comes in and what goes out — income,
            expenses, and the monthly trend between them.
          </p>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium text-slate-400">
                Spending by week
              </p>
              <p className="font-mono text-xs text-slate-500">September</p>
            </div>
            <div className="mt-4 flex h-20 items-end gap-2">
              {WEEK_BARS.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className={`w-full rounded-sm ${
                    i === 5 ? "bg-emerald-400" : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.07] pt-3">
              <p className="text-xs text-slate-500">This month so far</p>
              <p className="font-mono text-sm text-slate-100">₹41,280</p>
            </div>
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Local-first — your data never leaves this browser.
        </p>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Logo />
            <span className="font-mono text-sm tracking-tight text-slate-900">
              exptrack
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Frontend-only demo — test account is listed below.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                aria-invalid={Boolean(error)}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNote((v) => !v)}
                  className="text-xs text-slate-400 transition hover:text-slate-900"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {showForgotNote && (
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  There&rsquo;s no recovery flow in the demo — the password is{" "}
                  <span className="font-mono text-slate-600">demo1234</span>.
                </p>
              )}
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600 select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-slate-900"
              />
              Keep me signed in
            </label>

            {error && (
              <p
                key={shakeKey}
                role="alert"
                className="animate-shake flex items-start gap-2 text-sm text-rose-600"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Zm-.75 7.5a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {busy && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              )}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="group mt-8 flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
          >
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Demo account
              </span>
              <span className="mt-1 block font-mono text-xs text-slate-600">
                {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
              </span>
            </span>
            <span className="text-xs font-medium text-slate-400 transition group-hover:text-slate-900">
              Autofill
            </span>
          </button>

          <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
            Credentials are checked in your browser. Nothing is sent anywhere.
          </p>
        </div>
      </main>
    </div>
  );
}
