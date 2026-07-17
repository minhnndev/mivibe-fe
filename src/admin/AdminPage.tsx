import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminApp from "./AdminApp";
import { isConfigured, supabase } from "./supabase";

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setSession(data.session);
      setError(sessionError?.message ?? null);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
    } catch (loginError) {
      setError(messageFromError(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090909] text-sm text-white/45">
        Checking admin session...
      </div>
    );
  }

  if (session) {
    if (session.user.app_metadata.role !== "admin") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
          <Card className="w-full max-w-md border-red-400/20 bg-[#111] p-8 text-center text-white">
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-300">Access denied</p>
            <h1 className="mt-3 font-heading text-3xl font-semibold italic">Admin role required</h1>
            <p className="mt-3 text-sm leading-6 text-white/45">
              This account is authenticated but does not have the admin role in Supabase.
            </p>
            <Button type="button" variant="outline" className="mt-6" onClick={() => void handleSignOut()}>
              Sign out
            </Button>
          </Card>
        </main>
      );
    }

    return (
      <AdminApp
        userEmail={session.user.email ?? "Authenticated admin"}
        onSignOut={() => void handleSignOut()}
      />
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090909] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,168,76,0.14),transparent_38%)]" />
      <Card className="relative w-full max-w-md border-white/10 bg-[#111]/95 p-8 text-white shadow-2xl shadow-black/60">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-[#C9A84C]">
              Restricted workspace
            </p>
            <h1 className="font-heading text-4xl font-semibold italic">Mivibe Admin</h1>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Sign in with the admin account configured in Supabase Auth.
            </p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C]">
            <LockKeyhole size={18} />
          </div>
        </div>

        {!isConfigured ? (
          <div className="mb-5 rounded-lg border border-orange-400/25 bg-orange-400/10 p-3 text-sm text-orange-200">
            Supabase runtime environment is not configured.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleLogin}>
          <label className="block space-y-2 text-sm">
            <span className="text-white/60">Email</span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@mivibe.app"
              className="h-11 border-white/10 bg-white/5 px-3 text-white placeholder:text-white/20"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-white/60">Password</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 border-white/10 bg-white/5 px-3 text-white"
              required
            />
          </label>

          {error ? (
            <div role="alert" className="rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full bg-[#C9A84C] text-black hover:bg-[#d8bb68]"
            disabled={!isConfigured || submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
