-- Users table
create table if not exists public.users (
	id uuid primary key default gen_random_uuid(),
	email text unique not null,
	password_hash text not null,
	role text not null check (role in ('student','category_reviewer','budget_reviewer')),
	is_verified boolean not null default false,
	created_at timestamptz not null default now()
);

-- OTP codes
create table if not exists public.otp_codes (
	id bigserial primary key,
	email text not null,
	code text not null,
	expires_at timestamptz not null,
	consumed boolean not null default false,
	created_at timestamptz not null default now()
);
create index if not exists otp_codes_email_idx on public.otp_codes(email);

-- Proposals
create table if not exists public.proposals (
	id uuid primary key default gen_random_uuid(),
	student_id uuid not null references public.users(id) on delete cascade,
	description text not null,
	budget numeric not null,
	footfall int not null,
	category text not null check (category in ('Sports','Cultural','Seminars')),
	status text not null default 'submitted',
	llm_summary text,
	llm_suggestions text,
	ml_score numeric,
	final_decision text,
	created_at timestamptz not null default now()
);
create index if not exists proposals_student_idx on public.proposals(student_id);
create index if not exists proposals_status_idx on public.proposals(status);
