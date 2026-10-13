"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  website: string | null;
  avatar_url: string | null;
  is_private: boolean;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) {
          window.location.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name, bio, website, avatar_url, is_private")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        if (!active) return;
        const next = data as Profile;
        setProfile(next);
        setDisplayName(next.display_name ?? "");
        setBio(next.bio ?? "");
        setWebsite(next.website ?? "");
        setIsPrivate(Boolean(next.is_private));
      } catch (e) {
        if (active) {
          setError(true);
          setNotice(e instanceof Error ? e.message : "Could not load your profile.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => { active = false; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setNotice("");
    setError(false);

    const trimmedName = displayName.trim();
    const trimmedBio = bio.trim();
    const trimmedWebsite = website.trim();

    if (!trimmedName || trimmedName.length > 60 || trimmedBio.length > 300) {
      setError(true);
      setNotice("Use a display name of 1–60 characters and a bio of up to 300 characters.");
      setSaving(false);
      return;
    }

    if (trimmedWebsite) {
      try {
        const parsed = new URL(trimmedWebsite);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
      } catch {
        setError(true);
        setNotice("Enter a valid website URL beginning with https:// or http://.");
        setSaving(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedName,
          bio: trimmedBio,
          website: trimmedWebsite || null,
          is_private: isPrivate
        })
        .eq("id", profile.id)
        .select("id, username, display_name, bio, website, avatar_url, is_private")
        .single();

      if (updateError) throw updateError;
      setProfile(data as Profile);
      setNotice("Profile saved successfully.");
    } catch (e) {
      setError(true);
      setNotice(e instanceof Error ? e.message : "Could not save your profile. Check your connection and database setup.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      window.location.assign("/");
    } catch (e) {
      setError(true);
      setNotice(e instanceof Error ? e.message : "Could not sign out.");
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/"><span className="brand-mark">s<span>.</span></span> SPANDIC</Link>
      <section className="auth-card profile-card">
        <p className="eyebrow">YOUR SPACE ON SPANDIC</p>
        <h1>Your profile.</h1>
        <p className="auth-subtitle">Make it yours. You control what you share.</p>

        {loading ? <p className="auth-message" role="status">Loading your profile…</p> : !profile ? (
          <div>
            <p className="auth-message" role="status">We couldn’t load your profile. Confirm your email, configure Supabase, and apply the database migration.</p>
            <Link className="auth-back" href="/login">Go to sign in</Link>
          </div>
        ) : (
          <>
            <div className="profile-identity">
              <div className="profile-avatar">{(displayName || profile.username).slice(0, 1).toUpperCase()}</div>
              <div><strong>{profile.display_name}</strong><span>@{profile.username}</span></div>
            </div>
            <form onSubmit={saveProfile}>
              <label>Display name
                <input required minLength={1} maxLength={60} value={displayName} onChange={e => setDisplayName(e.target.value)} autoComplete="name" />
              </label>
              <label>Bio <span className="profile-counter">{bio.length}/300</span>
                <textarea className="profile-bio" maxLength={300} value={bio} onChange={e => setBio(e.target.value)} placeholder="A little about you…" />
              </label>
              <label>Website
                <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" autoComplete="url" />
              </label>
              <label className="profile-privacy">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                <span><strong>Private account</strong><small>Privacy setting is saved to your profile. Follow approval controls must be implemented before private posts are considered fully protected.</small></span>
              </label>
              <button className="auth-submit" disabled={saving}>{saving ? "Saving…" : "Save profile ↗"}</button>
            </form>
            {notice && <p className="auth-message" role="status" aria-live="polite" data-error={error}>{notice}</p>}
            <button className="text-button" type="button" onClick={signOut}>Sign out</button>
          </>
        )}
        <Link className="auth-back" href="/">← Back to the feed</Link>
      </section>
    </main>
  );
}
