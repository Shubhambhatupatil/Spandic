"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() || email.split("@")[0] } }
        });
        if (error) throw error;
        setMessage("If sign-up is enabled, check your email for a confirmation link. Your account is not active until confirmed.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue. Check your settings and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <Link className="auth-brand" href="/"><span className="brand-mark">s<span>.</span></span> SPANDIC</Link>
    <section className="auth-card">
      <p className="eyebrow">YOUR WORLD, YOUR PEOPLE</p>
      <h1>{mode === "signup" ? "Make room for you." : "Welcome back."}</h1>
      <p className="auth-subtitle">A more thoughtful place to share what matters.</p>
      <div className="auth-switch"><button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button><button className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button></div>
      <form onSubmit={submit}>
        {mode === "signup" && <label>Display name<input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={60} placeholder="How people will know you" autoComplete="name" /></label>}
        <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
        <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create your account ↗" : "Sign in ↗"}</button>
      </form>
      {message && <p className="auth-message" role="status">{message}</p>}
      <p className="auth-legal">By continuing, you agree to use SPANDIC respectfully. Community safety and privacy controls are being built before public launch.</p>
      <Link className="auth-back" href="/">← Back to the feed</Link>
    </section>
  </main>;
}
