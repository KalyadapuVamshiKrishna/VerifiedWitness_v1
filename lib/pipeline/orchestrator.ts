import { randomUUID } from 'crypto'
import { getEvidenceForInvestigation, updateInvestigationStatus } from '@/lib/db/investigations'
import {
  upsertTimelineEvent,
  appendLogEntries,
  saveMetadataFindings,
  saveOcrFindings,
  saveAiFindings,
  saveCorrelationResult,
  saveFusionResult,
} from '@/lib/db/findings'
import type { TimelineStage, LogLevel } from '@/lib/types'
import { extractMetadata } from './metadata/extract'
import { extractOcr } from './ocr/extract'
import { callGeminiVisualInvestigation } from './ai/gemini-client'
import { parseAiResponse } from './ai/parse'
import { runCorrelation } from './correlation/engine'
import { runFusion } from './fusion/engine'

async function fetchEvidenceBuffer(blobUrl: string): Promise<Buffer> {
  const res = await fetch(blobUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch evidence blob (${res.status})`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function log(investigationId: string, level: LogLevel, message: string, stage?: TimelineStage): Promise<void> {
  await appendLogEntries(investigationId, [
    { id: randomUUID(), investigationId, timestamp: new Date().toISOString(), level, message, stage },
  ])
}

/**
 * Wraps one pipeline stage: writes the 'active' timeline event before running, then
 * 'complete'/'failed' after — this is what makes progress visible to the polling GET route
 * while `run` is still executing (see plan's "execution model" section).
 */
async function runStage<T>(investigationId: string, stage: TimelineStage, fn: () => Promise<T>): Promise<T> {
  const startedAt = new Date().toISOString()
  await upsertTimelineEvent(investigationId, { investigationId, stage, status: 'active', startedAt })
  await log(investigationId, 'SYSTEM', `Starting stage: ${stage}`, stage)

  try {
    const result = await fn()
    const completedAt = new Date().toISOString()
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()
    await upsertTimelineEvent(investigationId, { investigationId, stage, status: 'complete', startedAt, completedAt, durationMs })
    await log(investigationId, 'SUCCESS', `Stage complete: ${stage} (${durationMs}ms)`, stage)
    return result
  } catch (err) {
    const completedAt = new Date().toISOString()
    const message = err instanceof Error ? err.message : String(err)
    await upsertTimelineEvent(investigationId, { investigationId, stage, status: 'failed', startedAt, completedAt, detail: message })
    await log(investigationId, 'ERROR', `Stage failed: ${stage} — ${message}`, stage)
    throw err
  }
}

/**
 * Runs the full analysis pipeline for one investigation synchronously in a single request.
 * Progressive DB writes (timeline_events/log_entries) are the only channel visible to a
 * concurrent GET poll — see Phase 1 plan notes on the serverless execution model.
 */
export async function runPipeline(investigationId: string): Promise<void> {
  try {
    const evidence = await getEvidenceForInvestigation(investigationId)
    if (!evidence) {
      throw new Error(`No evidence found for investigation ${investigationId}`)
    }

    await updateInvestigationStatus(investigationId, 'processing')

    await runStage(investigationId, 'received', async () => undefined)

    const buffer = await fetchEvidenceBuffer(evidence.blobUrl)

    const metadata = await runStage(investigationId, 'metadata', () => extractMetadata(buffer, evidence.id))
    await saveMetadataFindings(investigationId, metadata)

    const ocr = await runStage(investigationId, 'ocr', () => extractOcr(buffer, evidence.id))
    await saveOcrFindings(investigationId, ocr)

    const ai = await runStage(investigationId, 'ai_visual', async () => {
      const { text, modelVersion } = await callGeminiVisualInvestigation(buffer, evidence.mimeType)
      const { findings, policyWarnings } = parseAiResponse(text, evidence.id, modelVersion)
      for (const warning of policyWarnings) {
        await log(investigationId, 'WARNING', warning, 'ai_visual')
      }
      return findings
    })
    await saveAiFindings(investigationId, ai)

    const correlation = await runStage(investigationId, 'correlation', async () => runCorrelation(metadata, ocr, ai, evidence.id))
    await saveCorrelationResult(investigationId, correlation)

    const fusion = await runStage(investigationId, 'fusion', async () => runFusion(metadata, ocr, ai, correlation, evidence.id))
    await saveFusionResult(investigationId, fusion)

    await runStage(investigationId, 'report', async () => undefined)
    await runStage(investigationId, 'complete', async () => undefined)

    await updateInvestigationStatus(investigationId, 'complete', fusion.trustScore)
  } catch (err) {
    await updateInvestigationStatus(investigationId, 'failed')
    throw err
  }
}
