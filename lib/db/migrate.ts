import { sql } from './client'

/**
 * Idempotent schema bootstrap — mirrors lib/db/schema.sql. Runs on-demand rather than as a
 * separate migration step, since this project deliberately has no migration tool (see CLAUDE.md).
 */
export async function ensureSchema(): Promise<void> {
  const db = sql()

  await db`
    create table if not exists investigations (
      id text primary key,
      name text not null,
      status text not null default 'intake',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      summary text,
      evidence_id text,
      trust_score integer
    )
  `

  await db`
    create table if not exists evidence (
      id text primary key,
      investigation_id text not null references investigations(id) on delete cascade,
      file_name text not null,
      mime_type text not null,
      file_size_bytes bigint not null,
      sha256 text not null,
      blob_url text not null,
      blob_pathname text not null,
      uploaded_at timestamptz not null default now(),
      page_count integer
    )
  `

  await db`create index if not exists evidence_sha256_idx on evidence(sha256)`
  await db`create index if not exists evidence_investigation_id_idx on evidence(investigation_id)`

  await db`
    create table if not exists investigation_findings (
      investigation_id text primary key references investigations(id) on delete cascade,
      metadata_findings jsonb,
      ocr_findings jsonb,
      ai_findings jsonb,
      correlation_result jsonb,
      fusion_result jsonb,
      timeline_events jsonb,
      log_entries jsonb,
      updated_at timestamptz not null default now()
    )
  `

  // Table may already exist from before log_entries was added — backfill the column.
  await db`alter table investigation_findings add column if not exists log_entries jsonb`
}
