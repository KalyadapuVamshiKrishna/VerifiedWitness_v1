import * as exifr from 'exifr'
import type { MetadataFindings } from '@/lib/types'
import { computeConsistencyFlags, computeIntegrityScore, toDate } from './consistency'

export async function extractMetadata(buffer: Buffer, evidenceId: string): Promise<MetadataFindings> {
  let raw: Record<string, unknown> = {}
  try {
    raw = (await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      xmp: true,
      jfif: true,
      ihdr: true,
      sanitize: true,
      reviveValues: true,
    })) ?? {}
  } catch {
    raw = {}
  }

  let gps: { latitude: number; longitude: number } | undefined
  try {
    gps = (await exifr.gps(buffer)) ?? undefined
  } catch {
    gps = undefined
  }

  const missingFields: string[] = []

  const make = raw.Make as string | undefined
  const model = raw.Model as string | undefined
  const lens = (raw.LensModel as string | undefined) ?? (raw.LensMake as string | undefined)
  if (!make && !model) missingFields.push('camera')

  const software = raw.Software as string | undefined
  const editingSoftware = software ? [software] : []
  if (!software) missingFields.push('editingSoftware')

  if (!gps) missingFields.push('gps')

  const captured = raw.DateTimeOriginal
  const modified = raw.ModifyDate
  const digitized = raw.CreateDate
  if (!captured) missingFields.push('timestamps.captured')

  const width = (raw.ExifImageWidth as number | undefined) ?? (raw.ImageWidth as number | undefined)
  const height = (raw.ExifImageHeight as number | undefined) ?? (raw.ImageHeight as number | undefined)
  if (!width || !height) missingFields.push('resolution')

  const consistencyFlags = computeConsistencyFlags({ captured, modified, software })
  const integrityScore = computeIntegrityScore({
    missingFieldsCount: missingFields.length,
    consistencyFlagsCount: consistencyFlags.length,
  })

  return {
    evidenceId,
    camera: make || model || lens ? { make, model, lens } : undefined,
    gps: gps ? { lat: gps.latitude, lng: gps.longitude } : undefined,
    timestamps: {
      captured: toDate(captured)?.toISOString(),
      modified: toDate(modified)?.toISOString(),
      digitized: toDate(digitized)?.toISOString(),
    },
    orientation: raw.Orientation !== undefined ? String(raw.Orientation) : undefined,
    resolution: width && height ? { width, height } : undefined,
    editingSoftware,
    colorSpace: raw.ColorSpace !== undefined ? String(raw.ColorSpace) : undefined,
    compression: raw.Compression !== undefined ? String(raw.Compression) : undefined,
    missingFields,
    consistencyFlags,
    integrityScore,
    raw,
  }
}
