"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthContent() {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/auth/status", { cache: "no-store" });
      const data = await res.json();
      if (data.authenticated) {
        router.replace("/");
        return;
      }
      setHasPin(Boolean(data.hasPin));
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be 4 digits");
      return;
    }
    setLoading(true);
    try {
      const endpoint = hasPin ? "/api/auth/login" : "/api/auth/setup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      const next = search.get("next") || "/";
      router.replace(next);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (hasPin === null) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-lg">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {hasPin ? "Welcome back" : "Secure your dashboard"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {hasPin ? "Enter your 4‑digit PIN to continue" : "Create a 4‑digit PIN to sign in"}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PIN</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "pin-error" : undefined}
            className={`w-full h-11 rounded-lg border px-3 text-center tracking-widest text-lg placeholder-gray-400 outline-none transition-all
              bg-white text-gray-900 border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200
              dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-700 dark:focus:border-gray-100 dark:focus:ring-neutral-700
              ${error ? 'border-red-500 focus:ring-red-100 dark:focus:ring-red-900' : ''}`}
          />
          {error && <div id="pin-error" className="text-sm text-red-600">{error}</div>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Please wait..." : hasPin ? "Unlock" : "Set PIN"}
        </button>
      </form>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-neutral-500">Loading authentication...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
