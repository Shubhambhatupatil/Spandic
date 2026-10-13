-- SPANDIC initial social schema for Supabase PostgreSQL.
-- Apply with: supabase db push (after linking your own Supabase project).
-- RLS is enabled on every user-facing table. Never put service-role keys in the browser.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  display_name text not null default 'New member' check (char_length(display_name) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 300),
  avatar_url text,
  website text,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '' check (char_length(caption) <= 2200),
  media_url text,
  media_type text not null default 'text' check (media_type in ('text', 'image', 'video')),
  visibility text not null default 'public' check (visibility in ('public', 'followers')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_has_content check (char_length(trim(caption)) > 0 or media_url is not null)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  caption text not null default '' check (char_length(caption) <= 300),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  constraint story_expiry_after_creation check (expires_at > created_at)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('follow', 'like', 'comment')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint no_self_notification check (actor_id is null or actor_id <> recipient_id)
);

create index if not exists posts_feed_idx on public.posts (created_at desc);
create index if not exists posts_author_feed_idx on public.posts (author_id, created_at desc);
create index if not exists follows_following_idx on public.follows (following_id, created_at desc);
create index if not exists comments_post_idx on public.comments (post_id, created_at asc);
create index if not exists stories_active_idx on public.stories (expires_at, created_at desc);
create index if not exists notifications_recipient_idx on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (recipient_id) where read_at is null;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();
drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at before update on public.comments
for each row execute function public.set_updated_at();

-- Create a profile after signup. The generated username can be changed in onboarding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, 'member'), '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  base_username := left(base_username, 22);
  if char_length(base_username) < 3 then
    base_username := 'member';
  end if;
  candidate := base_username;
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_username, 22) || suffix::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), base_username), 60));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.saved_posts enable row level security;
alter table public.stories enable row level security;
alter table public.notifications enable row level security;

-- Profiles are discoverable, but only their owner can change them.
create policy "Profiles are readable" on public.profiles for select to anon, authenticated using (true);
create policy "Users insert their own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Public posts are readable by everyone; follower-only posts require an accepted follow.
create policy "Read public or followed posts" on public.posts for select to anon, authenticated
using (
  visibility = 'public'
  or author_id = (select auth.uid())
  or (
    (select auth.uid()) is not null
    and exists (select 1 from public.follows f where f.follower_id = (select auth.uid()) and f.following_id = posts.author_id)
  )
);
create policy "Users create their own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "Users edit their own posts" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Users delete their own posts" on public.posts for delete to authenticated using (auth.uid() = author_id);

create policy "Follows are readable" on public.follows for select to anon, authenticated using (true);
create policy "Users follow as themselves" on public.follows for insert to authenticated with check (auth.uid() = follower_id and follower_id <> following_id);
create policy "Users unfollow as themselves" on public.follows for delete to authenticated using (auth.uid() = follower_id);

create policy "Likes are readable" on public.likes for select to anon, authenticated using (true);
create policy "Users like as themselves" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users remove their own likes" on public.likes for delete to authenticated using (auth.uid() = user_id);

create policy "Read comments on readable posts" on public.comments for select to anon, authenticated
using (exists (select 1 from public.posts p where p.id = comments.post_id));
create policy "Users create comments as themselves" on public.comments for insert to authenticated
with check (auth.uid() = author_id and exists (select 1 from public.posts p where p.id = comments.post_id));
create policy "Users edit their own comments" on public.comments for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Users delete their own comments" on public.comments for delete to authenticated using (auth.uid() = author_id);

create policy "Users read their saved posts" on public.saved_posts for select to authenticated using (auth.uid() = user_id);
create policy "Users save posts as themselves" on public.saved_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users unsave their posts" on public.saved_posts for delete to authenticated using (auth.uid() = user_id);

create policy "Read active stories" on public.stories for select to anon, authenticated using (expires_at > now());
create policy "Users create their own stories" on public.stories for insert to authenticated with check (auth.uid() = author_id);
create policy "Users delete their own stories" on public.stories for delete to authenticated using (auth.uid() = author_id);

create policy "Users read their notifications" on public.notifications for select to authenticated using (auth.uid() = recipient_id);
create policy "Users mark their notifications read" on public.notifications for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Prevent direct client writes to notification rows; trusted server-side code can add them.
revoke insert, delete on public.notifications from anon, authenticated;
