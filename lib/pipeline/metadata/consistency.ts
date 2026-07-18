import type { ConsistencyFlag } from '@/lib/types'

export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
  }
  return undefined
}

export function computeConsistencyFlags(input: {
  captured?: unknown
  modified?: unknown
  software?: string
}): ConsistencyFlag[] {
  const flags: ConsistencyFlag[] = []

  const captured = toDate(input.captured)
  const modified = toDate(input.modified)

  if (captured && modified && modified.getTime() < captured.getTime()) {
    flags.push({
      field: 'timestamps',
      description: `Modify date (${modified.toISOString()}) is earlier than capture date (${captured.toISOString()}) — inconsistent with normal capture-then-edit ordering.`,
    })
  }

  if (input.software && /photoshop|gimp|affinity|luminar|lightroom|snapseed/i.test(input.software)) {
    flags.push({
      field: 'editingSoftware',
      description: `Editing software signature detected in metadata: "${input.software}".`,
    })
  }

  return flags
}

export function computeIntegrityScore(input: { missingFieldsCount: number; consistencyFlagsCount: number }): number {
  const score = 100 - input.missingFieldsCount * 8 - input.consistencyFlagsCount * 15
  return Math.max(0, Math.min(100, score))
}
