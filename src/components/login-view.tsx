"use client";

/**
 * Exptrack sign-in, v2.
 *
 * Design read: auth screen for a design-literate indie fintool demo.
 * Premium dark-tech language, choreographed entrance motion.
 * Dials (taste-skill): VARIANCE 7 / MOTION 7 / DENSITY 3. Dark theme lock.
 *
 * Sources of inspiration:
 * - gsap.com: entrance timeline, pointer tilt + magnetic CTA via gsap.quickTo
 *   (continuous pointer values never touch useState, per taste-skill 3.B)
 * - threeui.com: holographic tilt-card materiality for the product shot
 * - 21st.dev: spotlight-border card (cursor-lit 1px border ring)
 * - taste-skill: copy discipline, icon library only, reduced-motion fallback
 *
 * Systems: radii 10px interactive / 16px containers. z-scale: grain 60.
 * Accent lock: brand mint #66D7B0 on navy #112333, error coral #E57370
 * (tokens mirror globals.css: --navy, --mint, --mint-hover, --coral).
 */

import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  ArrowRight,
  ChartBar,
  Check,
  CircleNotch,
  Eye,
  EyeSlash,
  LockSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { DEMO_ACCOUNT, getSession, signIn } from "@/lib/auth";
import { SEED_DATA } from "@/lib/seed";
import { currentMonth, formatINR, monthLabel } from "@/lib/format";

/** Totals for the stat card, summed from the same seed ledger the
 *  dashboard renders. Falls back to all-time if the current month is empty. */
function computeStats() {
  const month = currentMonth();
  let list = SEED_DATA.transactions.filter((tx) => tx.date.startsWith(month));
  let label = monthLabel(month);
  if (list.length === 0) {
    list = SEED_DATA.transactions;
    label = "All time";
  }
  const income = list
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = list
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  return { income, expense, balance: income - expense, label };
}

const stats = computeStats();
const statLabel = stats.label;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const SPOTLIGHT_MASK = {
  background:
    "radial-gradient(320px circle at var(--sx, 50%) var(--sy, 50%), rgba(102, 215, 176, 0.35), transparent 70%)",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
  WebkitMaskComposite: "xor",
  padding: "1px",
} as const;

function setSpot(el: HTMLElement, event: ReactPointerEvent) {
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--sx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--sy", `${event.clientY - rect.top}px`);
}

function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#66D7B0] text-[#112333]">
        <ChartBar weight="fill" size={18} />
      </span>
      <span className="font-mono text-sm tracking-tight text-[#F5F8F7]">
        exptrack
      </span>
    </span>
  );
}

export function LoginView() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [showForgotNote, setShowForgotNote] = useState(false);

  useLayoutEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.timeline({ defaults: { ease: "power3.out" } })
          .from(".anim-mark", { opacity: 0, y: -10, duration: 0.5 })
          .from(
            ".anim-line > span",
            { yPercent: 112, duration: 0.9, ease: "power4.out", stagger: 0.12 },
            "-=0.25"
          )
          .from(".anim-sub", { opacity: 0, y: 14, duration: 0.6 }, "-=0.55")
          .from(
            ".anim-card",
            { opacity: 0, y: 48, rotateX: 8, transformPerspective: 900, duration: 1 },
            "-=0.45"
          )
          .from(".anim-foot", { opacity: 0, duration: 0.5 }, "-=0.7")
          .from(
            ".anim-field",
            { opacity: 0, y: 16, duration: 0.55, stagger: 0.07 },
            "-=0.9"
          );

        // Stat values count up once on entry: signals the ledger is live.
        gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((el) => {
          const target = Number(el.dataset.stat ?? 0);
          const progress = { v: 0 };
          el.textContent = formatINR(0);
          gsap.to(progress, {
            v: target,
            duration: 1.4,
            ease: "power2.out",
            delay: 0.7,
            onUpdate: () => {
              el.textContent = formatINR(Math.round(progress.v));
            },
          });
        });
      }

      // Holo tilt on the product shot: rotation follows the pointer,
      // sheen + spotlight border follow via CSS custom properties.
      const card = cardRef.current;
      if (card && !reduce) {
        const rx = gsap.quickTo(card, "rotationX", {
          duration: 0.6,
          ease: "power2.out",
        });
        const ry = gsap.quickTo(card, "rotationY", {
          duration: 0.6,
          ease: "power2.out",
        });
        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--sx", `${px * 100}%`);
          card.style.setProperty("--sy", `${py * 100}%`);
          ry((px - 0.5) * 7);
          rx((0.5 - py) * 7);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
          card.style.setProperty("--sx", "50%");
          card.style.setProperty("--sy", "50%");
        };
        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      }

      // Magnetic CTA: the button leans a few pixels toward the cursor.
      const cta = ctaRef.current;
      if (cta && !reduce) {
        const clamp = gsap.utils.clamp(-6, 6);
        const mx = gsap.quickTo(cta, "x", { duration: 0.4, ease: "power2.out" });
        const my = gsap.quickTo(cta, "y", { duration: 0.4, ease: "power2.out" });
        const onMove = (event: PointerEvent) => {
          const rect = cta.getBoundingClientRect();
          mx(clamp((event.clientX - (rect.left + rect.width / 2)) * 0.2));
          my(clamp((event.clientY - (rect.top + rect.height / 2)) * 0.3));
        };
        const onLeave = () => {
          mx(0);
          my(0);
        };
        cta.addEventListener("pointermove", onMove);
        cta.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          cta.removeEventListener("pointermove", onMove);
          cta.removeEventListener("pointerleave", onLeave);
        });
      }
    }, rootRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (getSession()) router.replace("/");
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy || done) return;
    setBusy(true);
    setError(null);

    const result = await signIn(email, password, remember);

    if (result.ok) {
      setBusy(false);
      setDone(true);
      window.setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 500);
      return;
    }
    setBusy(false);
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
    "mt-1.5 h-11 w-full rounded-[10px] border border-white/10 bg-white/[0.05] px-3.5 text-sm text-[#F5F8F7] placeholder:text-[#F5F8F7]/40 outline-none transition focus:border-[#66D7B0] focus:ring-4 focus:ring-[#66D7B0]/15";

  return (
    <div
      ref={rootRef}
      className="relative grid min-h-dvh bg-[#112333] lg:grid-cols-[1.1fr_1fr]"
    >
      {/* Film grain, fixed + non-interactive (taste-skill 6.E) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04]"
        style={{ backgroundImage: GRAIN }}
      />

      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(161 161 170 / 0.4) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#66D7B0]/[0.07] blur-3xl"
        />

        <div className="anim-mark relative">
          <Wordmark />
        </div>

        <div className="relative max-w-xl">
          <h2 className="text-5xl font-semibold leading-[1.04] tracking-tighter text-[#F5F8F7] xl:text-6xl">
            <span className="anim-line block overflow-hidden pb-1">
              <span className="block">Every rupee,</span>
            </span>
            <span className="anim-line block overflow-hidden">
              <span className="block">accounted for.</span>
            </span>
          </h2>
          <p className="anim-sub mt-5 max-w-[46ch] text-sm leading-relaxed text-[#F5F8F7]/60">
            A local ledger of what comes in and what goes out, with the
            monthly trend between them.
          </p>

          {/* Live stat card in a holo tilt shell (threeui materiality).
              Numbers are summed from the same seed ledger the dashboard uses. */}
          <div className="anim-card mt-10 max-w-lg [perspective:1200px]">
            <div
              ref={cardRef}
              className="group relative rounded-[16px] border border-white/10 bg-white/[0.03] p-1.5 [transform-style:preserve-3d]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={SPOTLIGHT_MASK}
              />
              <div className="relative overflow-hidden rounded-[12px] bg-[#0B1A28] px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-medium text-[#F5F8F7]/60">
                    {statLabel}
                  </p>
                  <p className="font-mono text-xs text-[#F5F8F7]/40">
                    local ledger
                  </p>
                </div>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="text-sm text-[#F5F8F7]/60">Income</dt>
                    <dd
                      data-stat={stats.income}
                      className="font-mono text-sm text-[#66D7B0]"
                    >
                      {formatINR(stats.income)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <dt className="text-sm text-[#F5F8F7]/60">Expenses</dt>
                    <dd
                      data-stat={stats.expense}
                      className="font-mono text-sm text-[#E57370]"
                    >
                      {formatINR(stats.expense)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 border-t border-white/[0.07] pt-3">
                    <dt className="text-sm text-[#F5F8F7]/60">Balance</dt>
                    <dd
                      data-stat={stats.balance}
                      className="font-mono text-sm text-[#F5F8F7]"
                    >
                      {formatINR(stats.balance)}
                    </dd>
                  </div>
                </dl>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), rgba(102, 215, 176, 0.10), transparent 65%)",
                  }}
                />
              </div>
            </div>
            <p className="anim-foot mt-3 text-xs text-[#F5F8F7]/60">
              Summed live from the demo data you sign in to.
            </p>
          </div>
        </div>

        <p className="anim-foot relative flex items-center gap-2 text-xs text-[#F5F8F7]/60">
          <LockSimple size={13} className="text-[#66D7B0]" />
          Local-first. Your data never leaves this browser.
        </p>
      </aside>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <main className="relative flex flex-col items-center justify-center border-l border-white/[0.06] px-6 py-14">
        <div className="w-full max-w-[380px]">
          <div className="anim-mark mb-10 lg:hidden">
            <Wordmark />
          </div>

          <h1 className="anim-field text-2xl font-semibold tracking-tight text-[#F5F8F7]">
            Sign in
          </h1>
          <p className="anim-field mt-1.5 text-sm text-[#F5F8F7]/60">
            Frontend demo. The test account is one click below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            noValidate
          >
            <div className="anim-field">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#F5F8F7]/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="anim-field">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#F5F8F7]/80"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNote((v) => !v)}
                  className="text-xs text-[#F5F8F7]/60 transition hover:text-[#F5F8F7]"
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#F5F8F7]/60 transition hover:text-[#F5F8F7]"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {showForgotNote && (
                <p className="mt-2 text-xs leading-relaxed text-[#F5F8F7]/60">
                  No recovery flow in this demo. The password is{" "}
                  <span className="font-mono text-[#66D7B0]">demo1234</span>.
                </p>
              )}
            </div>

            <label className="anim-field flex w-fit cursor-pointer select-none items-center gap-2.5 text-sm text-[#F5F8F7]/60">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/[0.06] accent-[#66D7B0]"
              />
              Keep me signed in
            </label>

            {error && (
              <p
                key={shakeKey}
                role="alert"
                className="animate-shake flex items-start gap-2 text-sm text-[#E57370]"
              >
                <WarningCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <div ref={ctaRef} className="anim-field">
              <button
                type="submit"
                disabled={busy || done}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#66D7B0] text-sm font-semibold text-[#112333] transition hover:bg-[#4EC29A] active:scale-[0.98] disabled:pointer-events-none"
              >
                {busy && <CircleNotch size={16} className="animate-spin" />}
                {done && <Check size={16} weight="bold" />}
                {busy ? "Signing in…" : done ? "Signed in" : "Sign in"}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            onPointerMove={(e) => setSpot(e.currentTarget, e)}
            className="anim-field group relative mt-8 w-full overflow-hidden rounded-[12px] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-white/20"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[12px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={SPOTLIGHT_MASK}
            />
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#F5F8F7]/60">
                  Demo account
                </span>
                <span className="mt-1.5 block font-mono text-xs leading-relaxed text-[#F5F8F7]/80">
                  {DEMO_ACCOUNT.email}
                  <br />
                  {DEMO_ACCOUNT.password}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#F5F8F7]/60 transition group-hover:text-[#66D7B0]">
                Autofill
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </button>

          <p className="anim-field mt-8 text-center text-xs leading-relaxed text-[#F5F8F7]/60">
            Credentials are checked in your browser. Nothing is sent anywhere.
          </p>
        </div>
      </main>
    </div>
  );
}
