"use client";

import { useMemo, useRef, useState } from "react";

type Post = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  time: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
};

const initialPosts: Post[] = [
  { id: 1, name: "Maya Chen", handle: "@mayamakes", avatar: "MC", time: "18 min", text: "A little reminder to look up from your screen sometimes. The world is making something beautiful right now. 🌅", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85", likes: 2400, comments: 84, liked: false, saved: false },
  { id: 2, name: "Arjun Mehta", handle: "@arjunexplores", avatar: "AM", time: "1 hr", text: "The best journeys don't always need a destination. Sometimes all you need is a train window and a free afternoon. 🚆", likes: 816, comments: 37, liked: false, saved: false },
  { id: 3, name: "Studio Sunday", handle: "@studiosunday", avatar: "SS", time: "3 hr", text: "Make things with care. Share them with courage. Leave the internet a little better than you found it. ✳️", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85", likes: 1200, comments: 52, liked: false, saved: false }
];

const stories = [
  { name: "Your story", initials: "+", own: true },
  { name: "Maya", initials: "MC" },
  { name: "Arjun", initials: "AM" },
  { name: "Nia", initials: "NK" },
  { name: "Studio", initials: "SS" },
  { name: "Leo", initials: "LT" },
  { name: "Aanya", initials: "AS" }
];

const suggestions = [
  { name: "Nia Kapoor", handle: "@niacreates", initials: "NK", note: "Design · Mumbai" },
  { name: "Leo Tan", handle: "@leointhewild", initials: "LT", note: "Travel · Singapore" },
  { name: "Aanya Shah", handle: "@aanyawrites", initials: "AS", note: "Writing · London" }
];

function formatLikes(value: number) {
  if (value >= 1000) return (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(value);
}

export default function HomePage() {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("For you");
  const [followed, setFollowed] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((p) => [p.name, p.handle, p.text].some((s) => s.toLowerCase().includes(term)));
  }, [posts, query]);

  function toggleLike(id: number) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  }

  function toggleSave(id: number) {
    setPosts((current) => current.map((post) => post.id === id ? { ...post, saved: !post.saved } : post));
    setNotice("Saved state is a local demo only; accounts and saved posts are not connected yet.");
  }

  function createPost() {
    if (!draft.trim() && !selectedMedia) {
      setNotice("Write something or choose a photo first.");
      return;
    }
    const newPost: Post = {
      id: Date.now(),
      name: "You",
      handle: "@yourprofile",
      avatar: "YO",
      time: "now",
      text: draft.trim(),
      image: selectedMedia ?? undefined,
      likes: 0,
      comments: 0,
      liked: false,
      saved: false
    };
    setPosts((current) => [newPost, ...current]);
    setDraft("");
    setSelectedMedia(null);
    if (fileRef.current) fileRef.current.value = "";
    setShowComposer(false);
    setNotice("Post added to this browser session only. It is not uploaded or shared with other users.");
  }

  function chooseMedia(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("For this prototype, choose an image. Real video upload will be added with media storage.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setNotice("Please choose an image smaller than 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedMedia(String(reader.result));
    reader.readAsDataURL(file);
  }

  function navAction(label: string) {
    if (label === "Home") {
      setActiveTab("For you");
      setQuery("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (label === "Search") {
      document.getElementById("spandic-search")?.focus();
      return;
    }
    if (label === "Create") {
      setShowComposer(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setNotice(label + " is on the roadmap and will be connected in a later build. No fake backend is being shown.");
  }

  return (
    <main className="app-shell">
      <aside className="left-rail">
        <a className="brand" href="#" aria-label="SPANDIC home"><span className="brand-mark">s<span>.</span></span><span>SPANDIC</span></a>
        <div className="rail-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            ["Home", "⌂"], ["Search", "⌕"], ["Explore", "✳"], ["Reels", "▷"], ["Messages", "↗"], ["Notifications", "♡"], ["Create", "+"], ["Profile", "◉"]
          ].map(([label, icon]) => <button key={label} className={"nav-item " + (label === "Home" ? "selected" : "")} onClick={() => navAction(label)}><span className="nav-icon">{icon}</span><span>{label}</span>{label === "Notifications" && <i className="nav-dot" />}</button>)}
        </nav>
        <div className="rail-bottom"><div className="mini-avatar avatar-you">YO</div><div><strong>Your profile</strong><span>@you · Preview</span></div><button className="more-button" aria-label="More options" onClick={() => setNotice("Account settings will arrive with real authentication.")}>···</button></div>
      </aside>

      <section className="center-column">
        <header className="mobile-header"><a className="brand" href="#"><span className="brand-mark">s<span>.</span></span><span>SPANDIC</span></a><button className="icon-button" onClick={() => navAction("Notifications")} aria-label="Notifications">♡</button></header>
        <div className="feed-heading"><div><p className="eyebrow">TUESDAY, OCTOBER 13</p><h1>Your world, <em>in your feed.</em></h1></div><div className="online-pill"><span /> A world of perspectives</div></div>

        <section className="stories-section" aria-label="Stories">
          <div className="section-top"><h2>Stories <span className="live-label">● LIVE CIRCLES</span></h2><button className="text-button" onClick={() => setNotice("Stories will become available when accounts and media uploads are connected.")}>See all ↗</button></div>
          <div className="stories-row">{stories.map((story, i) => <button className="story" key={story.name} onClick={() => setNotice(story.own ? "Create a story will be available with media uploads." : "Demo story preview: real Stories are not connected yet.")}><span className={"story-ring ring-" + i}><span className={"story-avatar avatar-" + i}>{story.initials}</span></span><span>{story.name}</span></button>)}</div>
        </section>

        <div className="feed-tabs" role="tablist" aria-label="Feed type"><button className={activeTab === "For you" ? "active" : ""} onClick={() => setActiveTab("For you")}>For you</button><button className={activeTab === "Following" ? "active" : ""} onClick={() => { setActiveTab("Following"); setNotice("Following feed needs real accounts and follow relationships. Showing demo posts for now."); }}>Following</button><span className="tabs-spacer" /><span className="feed-note">A little less noise. A little more you.</span></div>

        <section className="composer-card">
          <div className="mini-avatar avatar-you">YO</div>
          <button className="composer-placeholder" onClick={() => setShowComposer((v) => !v)}>What’s on your mind, today?</button>
          <button className="composer-photo" aria-label="Add a photo" onClick={() => { setShowComposer(true); setTimeout(() => fileRef.current?.click(), 0); }}>▧</button>
          <button className="post-button" onClick={() => setShowComposer(true)}>Post <span>↗</span></button>
          {showComposer && <div className="composer-expanded"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Share a thought, a moment, an idea…" maxLength={1200} aria-label="Write a post" /><div className="composer-tools"><label className="upload-label">＋ Add image<input ref={fileRef} type="file" accept="image/*" onChange={(e) => chooseMedia(e.target.files?.[0])} /></label><span>{draft.length}/1200</span><button className="post-button" onClick={createPost}>Publish locally ↗</button></div>{selectedMedia && <div className="selected-preview"><img src={selectedMedia} alt="Selected upload preview" /><button onClick={() => setSelectedMedia(null)}>Remove image</button></div>}</div>}
        </section>

        {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}

        <div className="posts-list">{visiblePosts.map((post) => <article className="post-card" key={post.id}>
          <div className="post-header"><div className="mini-avatar">{post.avatar}</div><div className="post-author"><strong>{post.name} <span className="verified">✳</span></strong><span>{post.handle} <b>·</b> {post.time}</span></div><button className="more-button" aria-label={"More options for " + post.name} onClick={() => setNotice("Post reporting and moderation will be added before public launch.")}>···</button></div>
          <p className="post-copy">{post.text}</p>
          {post.image && <img className="post-image" src={post.image} alt={"Post shared by " + post.name} />}
          <div className="post-actions"><button className={post.liked ? "action liked" : "action"} onClick={() => toggleLike(post.id)} aria-label={post.liked ? "Unlike post" : "Like post"}><span>{post.liked ? "♥" : "♡"}</span> {formatLikes(post.likes)}</button><button className="action" onClick={() => setNotice("Comments will be enabled after the database is connected.")}><span>◯</span> {post.comments} <span className="action-word">replies</span></button><button className="action" onClick={() => setNotice("Sharing links will be enabled when posts have permanent URLs.")}><span>↗</span> <span className="action-word">Share</span></button><button className={"action save-action " + (post.saved ? "saved" : "")} onClick={() => toggleSave(post.id)} aria-label={post.saved ? "Unsave post" : "Save post"}>{post.saved ? "▣" : "▢"}</button></div>
        </article>)}
        {visiblePosts.length === 0 && <div className="empty-state"><span>⌕</span><h3>No matches yet</h3><p>Try another name or phrase.</p></div>}
        </div>
        <footer className="feed-footer">You’re at the beginning of something good. <span>✳</span></footer>
      </section>

      <aside className="right-rail">
        <div className="right-search"><span>⌕</span><input id="spandic-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people, posts…" aria-label="Search demo posts" /><kbd>⌘ K</kbd></div>
        <section className="welcome-card"><div className="welcome-stars">✳ <span>✦</span> ✳</div><p className="eyebrow">A NEW KIND OF SOCIAL</p><h2>Less scrolling.<br /><em>More connecting.</em></h2><p>Find your people, follow your curiosity, and make room for perspectives beyond your bubble.</p><button onClick={() => setNotice("Sign-up will be enabled after secure authentication is implemented.")}>Join the conversation <span>↗</span></button><div className="welcome-foot"><span>MADE FOR EVERYWHERE</span><span>✳ SPANDIC</span></div></section>
        <section className="suggestions"><div className="section-top"><h2>People to know</h2><button className="text-button" onClick={() => setNotice("Discovery will be connected to real profiles later.")}>Explore ↗</button></div>{suggestions.map((person, i) => <div className="suggestion" key={person.handle}><div className={"mini-avatar suggestion-avatar avatar-" + (i + 2)}>{person.initials}</div><div className="suggestion-info"><strong>{person.name}</strong><span>{person.note}</span></div><button className={"follow-button " + (followed.includes(person.handle) ? "following" : "")} onClick={() => setFollowed((prev) => prev.includes(person.handle) ? prev.filter((h) => h !== person.handle) : [...prev, person.handle])}>{followed.includes(person.handle) ? "Following" : "Follow"}</button></div>)}</section>
        <section className="community-card"><span className="community-icon">✳</span><div><strong>Good things grow together.</strong><p>Be curious. Be kind. Be unmistakably you.</p></div></section>
        <div className="right-footer"><div><button onClick={() => setNotice("Community guidelines are planned before public launch.")}>Guidelines</button><button onClick={() => setNotice("Privacy information will be published before accounts launch.")}>Privacy</button><button onClick={() => setNotice("About SPANDIC page is planned.")}>About</button></div><p>© 2026 SPANDIC · A work in progress</p></div>
      </aside>

      <nav className="mobile-nav" aria-label="Mobile navigation">{[["Home","⌂"],["Search","⌕"],["Create","+"],["Reels","▷"],["Profile","◉"]].map(([label,icon])=><button key={label} className={label === "Home" ? "selected" : ""} onClick={() => navAction(label)} aria-label={label}><span>{icon}</span></button>)}</nav>
    </main>
  );
}
