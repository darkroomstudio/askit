import { sql } from '@vercel/postgres'

export async function cronJobLogger() {
  const utcTime = new Date().toUTCString()
  const log = `Cron job triggered at ${utcTime}`
  await sql`CREATE TABLE IF NOT EXISTS cron_logs (log TEXT)`
  await sql`INSERT INTO cron_logs (log) VALUES (${log})`
}
