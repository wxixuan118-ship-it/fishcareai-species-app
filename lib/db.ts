import postgres from 'postgres'

const rawUrl = (process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL)!

// Strip pooler-only query params (e.g. `pgbouncer=true`) that some platforms
// inject — postgres.js forwards unrecognized params as startup parameters,
// which a direct (non-pooled) Postgres connection rejects outright.
const url = new URL(rawUrl)
url.searchParams.delete('pgbouncer')

const sql = postgres(url.toString(), {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

export default sql
