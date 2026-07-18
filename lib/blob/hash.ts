import { createHash } from 'crypto'

/** Authoritative evidence hash — always computed server-side over the exact bytes received. */
export function sha256Hex(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}
