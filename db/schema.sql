create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  object_key text not null unique,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  uploader_id text not null,
  uploader_name text,
  created_at timestamptz not null default now()
);

create index if not exists files_created_at_idx on files (created_at desc);
create index if not exists files_uploader_id_idx on files (uploader_id);
