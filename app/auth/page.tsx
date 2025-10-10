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
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold">
          {hasPin ? "Enter PIN" : "Create PIN"}
        </h1>
        <input
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="4-digit PIN"
        />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-black text-white disabled:opacity-50"
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
