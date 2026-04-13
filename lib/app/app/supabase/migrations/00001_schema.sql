create table lease_analyses (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  analysis jsonb not null,
  created_at timestamp with time zone default now()
);

create table licenses (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
