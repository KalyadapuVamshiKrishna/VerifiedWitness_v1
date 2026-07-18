import { sql } from './client'
import type {
  MetadataFindings,
  OcrFindings,
  AiFindings,
  CorrelationResult,
  FusionResult,
  TimelineEvent,
  LogEntry,
} from '@/lib/types'

export interface FindingsSnapshot {
  investigationId: string
  metadataFindings: MetadataFindings | null
  ocrFindings: OcrFindings | null
  aiFindings: AiFindings | null
  correlationResult: CorrelationResult | null
  fusionResult: FusionResult | null
  timelineEvents: TimelineEvent[]
  logEntries: LogEntry[]
}

function parseJsonbColumn<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null
  // neon serverless returns jsonb columns already parsed as JS values
  return value as T
}

export async function getFindingsSnapshot(investigationId: string): Promise<FindingsSnapshot | null> {
  const db = sql()
  const rows = await db`select * from investigation_findings where investigation_id = ${investigationId}`
  if (!rows.length) return null
  const row = rows[0] as Record<string, unknown>

  return {
    investigationId,
    metadataFindings: parseJsonbColumn<MetadataFindings>(row.metadata_findings),
    ocrFindings: parseJsonbColumn<OcrFindings>(row.ocr_findings),
    aiFindings: parseJsonbColumn<AiFindings>(row.ai_findings),
    correlationResult: parseJsonbColumn<CorrelationResult>(row.correlation_result),
    fusionResult: parseJsonbColumn<FusionResult>(row.fusion_result),
    timelineEvents: parseJsonbColumn<TimelineEvent[]>(row.timeline_events) ?? [],
    logEntries: parseJsonbColumn<LogEntry[]>(row.log_entries) ?? [],
  }
}

export async function saveMetadataFindings(investigationId: string, data: MetadataFindings): Promise<void> {
  const db = sql()
  await db`update investigation_findings set metadata_findings = ${JSON.stringify(data)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

export async function saveOcrFindings(investigationId: string, data: OcrFindings): Promise<void> {
  const db = sql()
  await db`update investigation_findings set ocr_findings = ${JSON.stringify(data)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

export async function saveAiFindings(investigationId: string, data: AiFindings): Promise<void> {
  const db = sql()
  await db`update investigation_findings set ai_findings = ${JSON.stringify(data)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

export async function saveCorrelationResult(investigationId: string, data: CorrelationResult): Promise<void> {
  const db = sql()
  await db`update investigation_findings set correlation_result = ${JSON.stringify(data)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

export async function saveFusionResult(investigationId: string, data: FusionResult): Promise<void> {
  const db = sql()
  await db`update investigation_findings set fusion_result = ${JSON.stringify(data)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

/** Read-modify-write: replaces the entry matching `event.stage`, appends if not present. */
export async function upsertTimelineEvent(investigationId: string, event: TimelineEvent): Promise<void> {
  const db = sql()
  const rows = await db`select timeline_events from investigation_findings where investigation_id = ${investigationId}`
  const current = (parseJsonbColumn<TimelineEvent[]>(rows[0]?.timeline_events) ?? []).filter(
    (e) => e.stage !== event.stage
  )
  const next = [...current, event]
  await db`update investigation_findings set timeline_events = ${JSON.stringify(next)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}

/** Read-modify-write append — log lists here are per-investigation and small (see plan). */
export async function appendLogEntries(investigationId: string, entries: LogEntry[]): Promise<void> {
  if (!entries.length) return
  const db = sql()
  const rows = await db`select log_entries from investigation_findings where investigation_id = ${investigationId}`
  const current = parseJsonbColumn<LogEntry[]>(rows[0]?.log_entries) ?? []
  const next = [...current, ...entries]
  await db`update investigation_findings set log_entries = ${JSON.stringify(next)}::jsonb, updated_at = now() where investigation_id = ${investigationId}`
}
