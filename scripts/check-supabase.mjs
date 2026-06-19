/**
 * Test Supabase connection. Run after creating .env:
 *   node scripts/check-supabase.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error('❌ ไม่พบไฟล์ .env — copy จาก .env.example แล้วใส่ค่า Supabase')
    process.exit(1)
  }

  const lines = readFileSync(envPath, 'utf8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key || url.includes('your-project') || key.includes('your-anon')) {
  console.error('❌ ใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env ให้ครบ')
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
}

console.log('🔍 ทดสอบ Supabase...')

const activeRes = await fetch(
  `${url}/rest/v1/stat_active_question?id=eq.live&select=id,game_type,question_key`,
  { headers },
)
if (!activeRes.ok) {
  const text = await activeRes.text()
  console.error('❌ stat_active_question:', activeRes.status, text)
  console.error('   → รัน supabase/schema.sql ใน SQL Editor ก่อน')
  process.exit(1)
}
console.log('✅ ตาราง stat_active_question พร้อม')

const answersRes = await fetch(`${url}/rest/v1/stat_answers?select=id&limit=1`, { headers })
if (!answersRes.ok) {
  const text = await answersRes.text()
  console.error('❌ stat_answers:', answersRes.status, text)
  process.exit(1)
}
console.log('✅ ตาราง stat_answers พร้อม')
console.log('\n🎉 Supabase พร้อมใช้งาน — อย่าลืมใส่ env เดียวกันใน Vercel แล้ว Redeploy')
