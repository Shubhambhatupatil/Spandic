"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type AuthMode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  }

  async function oauth(provider: "google" | "facebook") {
    setMessage("");
    setIsError(false);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : `Unable to start ${provider} login.`);
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (mode === "signup") {
      const normalizedUsername = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
        setIsError(true);
        setMessage("Username must be 3–30 characters and use only lowercase letters, numbers, or underscores.");
        return;
      }
      if (password !== confirmPassword) {
        setIsError(true);
        setMessage("Passwords do not match. Please check both password fields.");
        return;
      }
    }

    setBusy(true);
    try {
      const supabase = createClient();

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`
        });
        if (error) throw error;
        setMessage("If an account exists for that email, a password-reset link will be sent.");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim().toLowerCase(),
              display_name: username.trim()
            }
          }
        });
        if (error) throw error;

        if (data.session) {
          window.location.assign("/");
        } else {
          setMessage("Your signup was received, but this Supabase project is still requiring email confirmation. Disable email confirmations in Supabase Auth settings to allow direct signup.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.assign("/");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "signup" ? "Join SPANDIC." : mode === "reset" ? "Reset password." : "Welcome back.";
  const subtitle = mode === "reset"
    ? "Enter your email to request a password reset."
    : mode === "signup"
      ? "Create your account and start connecting."
      : "Sign in and pick up where you left off.";

  return <main className="auth-page">
    <Link className="auth-brand" href="/"><span className="brand-mark">s<span>.</span></span> SPANDIC</Link>
    <section className="auth-card">
      <p className="eyebrow">YOUR WORLD, YOUR PEOPLE</p>
      <h1>{heading}</h1>
      <p className="auth-subtitle">{subtitle}</p>

      {mode !== "reset" && <div className="auth-switch">
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Create account</button>
        <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => changeMode("signin")}>Log in</button>
      </div>}

      {mode !== "reset" && <div className="oauth-buttons">
        <button type="button" className="oauth-button" disabled={busy} onClick={() => oauth("google")}><span className="google-mark">G</span> Continue with Google</button>
        <button type="button" className="oauth-button" disabled={busy} onClick={() => oauth("facebook")}><span className="facebook-mark">f</span> Continue with Facebook</button>
        <div className="auth-divider"><span>or continue with email</span></div>
      </div>}

      <form onSubmit={submit}>
        {mode === "signup" && <label>Username
          <input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} required minLength={3} maxLength={30} pattern="[a-z0-9_]{3,30}" placeholder="your_username" autoComplete="username" />
        </label>}
        <label>Email address
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </label>
        {mode !== "reset" && <label>Password
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>}
        {mode === "signup" && <label>Confirm password
          <input type="password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter your password again" autoComplete="new-password" />
        </label>}
        <button className="auth-submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "signup" ? "Create account →" : mode === "reset" ? "Reset password →" : "Log in →"}
        </button>
      </form>

      {mode === "signin" && <button type="button" className="text-button" onClick={() => changeMode("reset")}>Forgot password?</button>}
      {mode === "reset" && <button type="button" className="text-button" onClick={() => changeMode("signin")}>← Back to log in</button>}
      {message && <p className="auth-message" role="status" aria-live="polite" data-error={isError}>{message}</p>}
      <p className="auth-legal">By continuing, you agree to use SPANDIC respectfully.</p>
      <Link className="auth-back" href="/">← Back to SPANDIC</Link>
    </section>
    <style jsx>{`
      .oauth-buttons { display: grid; gap: 10px; margin: 18px 0; }
      .oauth-button { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:12px 14px; border:1px solid #dedee5; border-radius:12px; background:#fff; color:#191923; font:inherit; font-weight:600; cursor:pointer; }
      .oauth-button:disabled { opacity:.6; cursor:wait; }
      .google-mark { font-weight:800; color:#4285f4; font-size:18px; }
      .facebook-mark { display:inline-flex; align-items:center; justify-content:center; width:19px; height:19px; border-radius:50%; background:#1877f2; color:white; font-weight:800; }
      .auth-divider { display:flex; align-items:center; gap:12px; color:#858592; font-size:12px; margin:5px 0 0; }
      .auth-divider:before,.auth-divider:after { content:""; flex:1; height:1px; background:#e7e7ed; }
    `}</style>
  </main>;
}
