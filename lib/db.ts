import { Pool } from 'pg'

const rawUrl = process.env.DATABASE_URL ?? ''

let connectionString = rawUrl
if (rawUrl) {
  try {
    const url = new URL(rawUrl)
    url.searchParams.delete('pgbouncer')
    url.searchParams.delete('sslmode')
    connectionString = url.toString()
  } catch {}
}

export const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
})

type AnyPool = { query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }> }

// postgres.js-compatible tagged-template API built on top of pg.
// lib/species.ts and lib/fish-health.ts use this without changes.
export function makeSql(client: AnyPool) {
  // T is the full return type (e.g. Species[]), matching postgres.js convention
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function sql<T extends any[] = Record<string, any>[]>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T> {
    let text = ''
    for (let i = 0; i < strings.length; i++) {
      text += strings[i]
      if (i < values.length) text += `$${i + 1}`
    }
    const result = await client.query(text, values as unknown[])
    return result.rows as unknown as T
  }

  sql.unsafe = async (rawSql: string, params?: unknown[]): Promise<Record<string, unknown>[]> => {
    const result = await client.query(rawSql, params)
    return result.rows as Record<string, unknown>[]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sql.json = (value: unknown): any => (value === undefined ? null : value)

  return sql
}

const sql = makeSql(pool)
export default sql
