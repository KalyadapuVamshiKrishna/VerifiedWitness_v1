import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let cached: NeonQueryFunction<false, false> | null = null

export function sql(): NeonQueryFunction<false, false> {
  if (cached) return cached

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Provision the Neon Postgres integration and run `vercel env pull` before hitting any route that touches the database.'
    )
  }

  cached = neon(connectionString)
  return cached
}
