// Daily check: text the coach when an athlete's online program is about to run
// out or has run out. Stateless — it texts only on specific days so there are no
// repeats: 7 days before the last session, 1 day before, the day after it ends,
// then weekly for 4 weeks while nothing new has been assigned.
// Needs env: GHL_API_KEY (LeadConnector private integration token),
// optional COACH_GHL_CONTACT_ID.
const SB_URL = 'https://xxtomnbvinxuvnrrqnqb.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dG9tbmJ2aW54dXZucnJxbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk5MTksImV4cCI6MjA4NTc5NTkxOX0.Ty-KRgr9JsYr7ZEZtvm7lB2TxcdWeW1CCsJQdWyFND8'   // public anon key (same one the app ships)
const COACH_CONTACT = 'yfDS5AxN8MM6f2jyHp6U'
const WD = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY = 86400000

const utc = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const mondayOf = (t) => t - ((new Date(t).getUTCDay() + 6) % 7) * DAY
const offset = (header, i) => { const m = String(header || '').toLowerCase().match(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/); return m ? (WD[m[0]] + 6) % 7 : Math.min(Math.max(i, 0), 6) }

export function lastSession(a) {
  const prog = a.program_json
  if (!prog?.blocks || !a.start_date) return null
  const days = prog.days || []
  const w1 = mondayOf(utc(a.start_date))
  let last = null
  for (const w of Object.keys(prog.blocks)) days.forEach((d, i) => {
    const s = prog.blocks[w]?.[d]
    if (!s) return
    const t = w1 + ((parseInt(w) - 1) * 7 + offset(s.header, i)) * DAY
    if (last == null || t > last) last = t
  })
  return last
}

export function buildMessage(assignments, names, todayYmd) {
  const today = utc(todayYmd)
  const lines = []
  assignments.forEach(a => {
    const last = lastSession(a)
    if (last == null) return
    const left = Math.round((last - today) / DAY)
    const dt = new Date(last)
    const when = `${MON[dt.getUTCMonth()]} ${dt.getUTCDate()}`
    const who = names[a.athlete_id] || `Athlete ${a.athlete_id}`
    if (left === 7) lines.push(`${who}'s program ends ${when} (1 week left).`)
    else if (left === 1) lines.push(`${who}'s program ends tomorrow.`)
    else if (left === -1) lines.push(`${who}'s program ran out yesterday.`)
    else if (left < -1 && left >= -28 && left % 7 === 0) lines.push(`${who}'s program ran out ${when} (${-left / 7} week${left === -7 ? '' : 's'} ago) and nothing new is assigned.`)
  })
  return lines.length ? 'Online programs: ' + lines.join(' ') : null
}

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`)
  return r.json()
}

export async function run({ send = true, todayYmd } = {}) {
  const today = todayYmd || new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const asn = await sbGet('assignments?active=eq.true&select=id,athlete_id,start_date,program_json')
  const ids = [...new Set(asn.map(a => a.athlete_id))]
  const ath = ids.length ? await sbGet(`athletes?id=in.(${ids.join(',')})&select=id,first_name,last_name`) : []
  const names = Object.fromEntries(ath.map(a => [a.id, `${a.first_name || ''} ${a.last_name || ''}`.replace(/\s+/g, ' ').trim()]))
  const message = buildMessage(asn, names, today)
  if (!message || !send) return { today, message, sent: false }
  const key = process.env.GHL_API_KEY
  if (!key) throw new Error('GHL_API_KEY is not set')
  const r = await fetch('https://services.leadconnectorhq.com/conversations/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, Version: '2021-04-15', 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'SMS', contactId: process.env.COACH_GHL_CONTACT_ID || COACH_CONTACT, message }),
  })
  if (!r.ok) throw new Error(`GHL ${r.status}: ${await r.text()}`)
  return { today, message, sent: true }
}

export default async () => {
  try { console.log('program-alerts', JSON.stringify(await run())) }
  catch (e) { console.error('program-alerts failed:', e.message) }
  return new Response('ok')
}

// 13:00 UTC = 8am Eastern in winter, 9am in summer.
export const config = { schedule: '0 13 * * *' }
