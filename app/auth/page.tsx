"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ── SVG Icons ── */
const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BackspaceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* shake keyframes injected once */
const ShakeStyle = () => (
  <style>{`
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
    .shake { animation: shake 0.45s ease; }
  `}</style>
);

function AuthContent() {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/auth/status", { cache: "no-store" });
      const data = await res.json();
      if (data.authenticated) { router.replace("/"); return; }
      setHasPin(Boolean(data.hasPin));
    };
    run();
  }, [router]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4 && !loading) {
      setError(null);
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) submitPin(newPin);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !loading) setPin(pin.slice(0, -1));
  };

  const submitPin = async (enteredPin: string) => {
    setLoading(true);
    try {
      const endpoint = hasPin ? "/api/auth/login" : "/api/auth/setup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid PIN");
      router.replace(search.get("next") || "/");
    } catch (e: unknown) {
      setIsShaking(true);
      setError(e instanceof Error ? e.message : "Invalid PIN");
      setPin("");
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  if (hasPin === null) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100dvh", gap: "1rem",
      }}>
        <div className="spinner" />
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>Checking security…</p>
      </div>
    );
  }

  return (
    <>
      <ShakeStyle />
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100dvh",
        padding: "2rem 1.5rem",
        background: "linear-gradient(160deg, var(--violet-soft) 0%, var(--bg) 50%, var(--amber-soft) 100%)",
      }}>

        {/* ── Branding card ── */}
        <div className="fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "24px",
            background: "linear-gradient(135deg, var(--violet) 0%, #4F46E5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", margin: "0 auto 1.25rem",
            boxShadow: "var(--shadow-violet)",
          }}>
            {hasPin ? <LockIcon /> : <ShieldIcon />}
          </div>

          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "0.375rem" }}>
            {hasPin ? "Welcome back" : "Secure your ledger"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260 }}>
            {hasPin
              ? "Enter your 4-digit PIN to access your ledger"
              : "Create a 4-digit PIN to protect your data"}
          </p>
        </div>

        {/* ── PIN dots ── */}
        <div
          className={isShaking ? "shake" : ""}
          style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}
        >
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 16, height: 16, borderRadius: "50%",
                transition: "all 0.15s ease",
                background: pin.length > i ? "var(--violet)" : "transparent",
                border: `2px solid ${pin.length > i ? "var(--violet)" : "var(--border-strong)"}`,
                boxShadow: pin.length > i ? "var(--shadow-violet)" : "none",
                transform: pin.length > i ? "scale(1.1)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* ── Keypad ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem", maxWidth: 280, width: "100%",
        }}>
          {["1","2","3","4","5","6","7","8","9"].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              style={{
                height: 68, borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)", border: "1.5px solid var(--border)",
                fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)",
                cursor: "pointer", transition: "all 0.12s ease",
                boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--violet-soft)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--violet-light)";
                (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {num}
            </button>
          ))}

          {/* Loading indicator cell */}
          <div style={{
            height: 68, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {loading && <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />}
          </div>

          {/* 0 key */}
          <button
            type="button"
            onClick={() => handleNumberClick("0")}
            style={{
              height: 68, borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)", border: "1.5px solid var(--border)",
              fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)",
              cursor: "pointer", transition: "all 0.12s ease",
              boxShadow: "var(--shadow-sm)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--violet-soft)";
              (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete last digit"
            style={{
              height: 68, borderRadius: "var(--radius-lg)",
              background: "transparent", border: "1.5px solid transparent",
              color: "var(--text-secondary)", cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <BackspaceIcon />
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            marginTop: "1.5rem",
            background: "var(--danger-soft)", border: "1.5px solid #FECACA",
            color: "var(--danger)", padding: "0.625rem 1rem",
            borderRadius: "var(--radius-md)", fontSize: "0.875rem", fontWeight: 600,
          }}>
            <AlertIcon />
            {error}
          </div>
        )}

        {/* ── Security note ── */}
        <p style={{
          marginTop: "2rem", fontSize: "0.75rem", color: "var(--text-muted)",
          textAlign: "center", maxWidth: 240,
        }}>
          Your ledger data is stored locally and protected by your PIN.
        </p>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div className="spinner" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}