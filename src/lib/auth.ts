export type Session = {
  email: string;
  name: string;
  since: string;
};

export const DEMO_ACCOUNT = {
  email: "demo@exptrack.app",
  password: "demo1234",
  name: "Demo",
};

export const SESSION_COOKIE = "exptrack_session";

type SignInResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function writeCookie(value: string, remember: boolean) {
  if (typeof document === "undefined") return;
  const maxAge = remember ? "; max-age=2592000" : "";
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(
    value
  )}; path=/; SameSite=Lax${maxAge}`;
}

export async function signIn(
  email: string,
  password: string,
  remember: boolean
): Promise<SignInResult> {
  // Fake network latency so the loading state is visible.
  await delay(550 + Math.random() * 350);

  const normalized = email.trim().toLowerCase();

  if (!normalized || !password) {
    return { ok: false, error: "Enter your email and password." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "That doesn't look like an email address." };
  }
  if (normalized !== DEMO_ACCOUNT.email) {
    return {
      ok: false,
      error: "No account found for this email. Try the demo account below.",
    };
  }
  if (password !== DEMO_ACCOUNT.password) {
    return { ok: false, error: "Incorrect password." };
  }

  const session: Session = {
    email: DEMO_ACCOUNT.email,
    name: DEMO_ACCOUNT.name,
    since: new Date().toISOString(),
  };
  writeCookie(JSON.stringify(session), remember);
  return { ok: true, session };
}

export function getSession(): Session | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
  const raw = row ?? null;
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  cachedSession = parseSession(raw);
  return cachedSession;
}

let cachedRaw: string | null = null;
let cachedSession: Session | null = null;

function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.split("=")[1]));
    if (typeof parsed?.email !== "string") return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export function signOut() {
  writeCookie("", false);
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  }
}
