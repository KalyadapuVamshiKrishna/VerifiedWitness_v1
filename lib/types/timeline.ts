export type TimelineStage =
  | 'received'
  | 'metadata'
  | 'ocr'
  | 'ai_visual'
  | 'correlation'
  | 'fusion'
  | 'report'
  | 'complete'

export type TimelineStatus = 'pending' | 'active' | 'complete' | 'failed'

export interface TimelineEvent {
  investigationId: string
  stage: TimelineStage
  status: TimelineStatus
  startedAt?: string
  completedAt?: string
  durationMs?: number
  detail?: string
}

export type LogLevel = 'SYSTEM' | 'SUCCESS' | 'AUTH' | 'ERROR' | 'WARNING' | 'INFO'

export interface LogEntry {
  id: string
  investigationId?: string
  timestamp: string
  level: LogLevel
  message: string
  stage?: TimelineStage
}
