// Shared program engine for the athlete portal.
// Reuses the SAME template data + weight math as the coach builder so the
// athlete sees identical numbers. Program content is imported from App.jsx
// (single source of truth); the coach render is untouched.
import { TEMPLATES, r5, rKg } from './App'
import { sb } from './supabaseClient'

export const TEMPLATE_ID = 'matts_online'

export function getTemplate(id = TEMPLATE_ID) {
  return TEMPLATES[id] || null
}

// Human day labels pulled from the template header (e.g. "Monday — ...").
export function dayLabel(tmpl, block, dayKey) {
  const bd = tmpl?.blocks?.[block]
  const header = bd?.[dayKey]?.header || dayKey
  const dow = header.split('—')[0].trim()  // text before the em-dash
  const focus = header.includes('—') ? header.split('—').slice(1).join('—').trim() : ''
  return { dow, focus, header }
}

// ---- Athlete PRs (most-recent test_date wins, matching the builder) ----
export async function loadAthletePRs(athleteId) {
  let all = [], from = 0
  while (true) {
    const { data, error } = await sb
      .from('results')
      .select('test_id,test_date,converted_value,raw_value')
      .eq('athlete_id', athleteId)
      .range(from, from + 499)
    if (error) break
    if (data) all = all.concat(data)
    if (!data || data.length < 500) break
    from += 500
  }
  const latest = {}
  all.forEach(r => {
    const v = parseFloat(r.converted_value ?? r.raw_value)
    if (isNaN(v)) return
    const d = r.test_date || ''
    if (!latest[r.test_id] || d > latest[r.test_id].d) latest[r.test_id] = { v, d }
  })
  const map = {}
  Object.keys(latest).forEach(k => { map[k] = latest[k].v })
  return map
}

const PR_FALLBACKS = {
  jerk: ['push_press', 'press', 'overhead'],
  push_press: ['press', 'overhead'],
  press: ['push_press', 'overhead'],
  overhead: ['push_press', 'press', 'jerk'],
}

export function getPR(prs, prKey) {
  if (!prKey || !prs) return null
  if (Array.isArray(prKey)) {
    const vals = prKey.map(k => prs[k]).filter(v => v != null)
    return vals.length ? Math.min(...vals) : null
  }
  if (prs[prKey] != null) return prs[prKey]
  for (const fb of (PR_FALLBACKS[prKey] || [])) if (prs[fb] != null) return prs[fb]
  return null
}

// Weight target text for an exercise at a given week (1-3) within a block.
// Mirrors the coach builder's getHint(): week 1 -> pct[0]; weeks 2-3 ->
// pct[1]..pct[2] range. Returns '' when there is no %/PR target (the athlete
// just logs what they hit — most of matts_online works this way).
export function weightText(ex, week, prs, useKg = false) {
  const pr = getPR(prs, ex.prKey)
  if (!pr || !ex.pct) return ''
  const unit = useKg ? ' kg' : ' lbs'
  const round = useKg ? rKg : r5
  if (week <= 1) return round(pr * ex.pct[0]) + unit
  const lo = round(pr * ex.pct[1]), hi = round(pr * ex.pct[2])
  return lo === hi ? lo + unit : lo + '–' + hi + unit
}

// ---- tests table (drives which exercises can log a max) ----
export async function loadTests() {
  const { data, error } = await sb.from('tests').select('id,name,unit,direction')
  const map = {}
  if (!error && data) data.forEach(t => { map[t.id] = t })
  return map
}

// ---- "Log to Testing" mapping ----
// Which exercises can push a result into the performance-tracking `results`
// table. Two sources:
//  1) Name-based max-effort tests (Fly / jumps) where best-of-sets = the score.
//  2) Strength lifts whose prKey is a real test id (back_squat, bench_press,
//     push_press, …) — these log a MAX (prompted), consistent with testing.
export function syncTargetFor(ex, tests = {}) {
  const n = (ex?.exercise || '').toLowerCase()
  if (n.includes('fly 10') && n.includes('5yd')) {
    return { test_id: '5_10_fly', unit: 'sec', label: '5-10 Fly', better: 'lower', prompt: 'Best fly time (sec)' }
  }
  if (n.includes('fly 10')) {
    return { test_id: 'max_velocity', unit: 'sec', label: 'Max Velocity', better: 'higher', prompt: 'Fly time (sec)' }
  }
  if (n.includes('countermovement')) {
    return { test_id: 'vertical_jump', unit: 'inches', label: 'Vertical Jump', better: 'higher', prompt: 'Best height (in)' }
  }
  // Static Jump: no sync yet — deferred until the eccentric-utilization score.
  if (n.includes('static jump')) return null
  // Strength lifts: prKey points at a real test id -> log a max.
  const key = typeof ex?.prKey === 'string' ? ex.prKey : null
  if (key && tests[key]) {
    const t = tests[key]
    const unit = t.unit || 'lbs'
    return {
      test_id: key, unit, label: t.name || key,
      better: t.direction === 'lower' ? 'lower' : 'higher',
      prompt: `${t.name || key} max (${unit})`, isMax: true,
    }
  }
  return null
}
