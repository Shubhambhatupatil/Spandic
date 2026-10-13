"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type AuthMode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setBusy(true);

    try {
      const supabase = createClient();

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        setMessage("If an account exists for that email, a password-reset link will be sent. Check your inbox.");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        if (error) throw error;

        if (data.session) {
          setMessage("Welcome to SPANDIC! Your account is ready.");
          window.setTimeout(() => window.location.assign("/"), 700);
        } else {
          setMessage("Signup submitted. If email confirmation is enabled, check your inbox to activate your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign("/");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to continue. Check your settings and try again.");
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "signup" ? "Make room for you." : mode === "reset" ? "Reset your password." : "Welcome back.";
  const subtitle = mode === "reset"
    ? "We’ll email you a secure link if an account matches."
    : "A more thoughtful place to share what matters.";

  return <main className="auth-page">
    <Link className="auth-brand" href="/"><span className="brand-mark">s<span>.</span></span> SPANDIC</Link>
    <section className="auth-card">
      <p className="eyebrow">YOUR WORLD, YOUR PEOPLE</p>
      <h1>{heading}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      {mode !== "reset" && <div className="auth-switch">
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Create account</button>
        <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => changeMode("signin")}>Sign in</button>
      </div>}

      <form onSubmit={submit}>
        {mode === "signup" && <label>Display name
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60} placeholder="How people will know you" autoComplete="name" />
        </label>}
        <label>Email address
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </label>
        {mode !== "reset" && <label>Password
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>}
        <button className="auth-submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create your account ↗" : mode === "reset" ? "Send reset link ↗" : "Sign in ↗"}
        </button>
      </form>

      {mode === "signin" && <button type="button" className="text-button" onClick={() => changeMode("reset")}>Forgot your password?</button>}
      {mode === "reset" && <button type="button" className="text-button" onClick={() => changeMode("signin")}>← Back to sign in</button>}
      {message && <p className="auth-message" role="status" aria-live="polite" data-error={isError}>{message}</p>}
      <p className="auth-legal">By continuing, you agree to use SPANDIC respectfully. Community safety and privacy controls are being built before public launch.</p>
      <Link className="auth-back" href="/">← Back to the feed</Link>
    </section>
  </main>;
}
