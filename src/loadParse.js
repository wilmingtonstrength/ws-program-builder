// Work out an exercise's load from what the coach typed, so "Back Squat ... 65 to 75%"
// automatically becomes a weight range off that athlete's back squat max.
// No hidden fields needed: the % comes from the note, the lift from the name.

// "65–75%", "65-75%", "65 to 75%", "65%-75%", "70%"  ->  [0.65, 0.75] / [0.7]
export function pctFromText(text) {
  const m = String(text || '').match(/(\d{2,3}(?:\.\d)?)\s*%?\s*(?:-|–|—|to)\s*(\d{2,3}(?:\.\d)?)\s*%|(\d{2,3}(?:\.\d)?)\s*%/i)
  if (!m) return null
  const nums = (m[3] != null ? [m[3]] : [m[1], m[2]]).map(Number)
  if (nums.some(n => isNaN(n) || n < 30 || n > 130)) return null
  return nums.map(n => n / 100)
}

// Which tested lift an exercise name refers to (earliest match in the name wins).
const LIFT_PATTERNS = [
  ['back_squat', /\bback squat\b/],
  ['front_squat', /\bfront squat\b/],
  ['bench_press', /\bbench press\b|^bench\b/],
  ['push_press', /\bpush press\b/],
  ['press', /\b(?:overhead|strict|military|shoulder) press\b|^press\b|\bohp\b/],
  ['deadlift', /\bdeadlift\b/],
  ['snatch', /\bsnatch\b/],
  ['clean', /\bclean\b/],
  ['jerk', /\bjerk\b/],
]
const NOT_BARBELL = /\b(db|dumbbell|kb|kettlebell|one arm|single arm|single leg|sl|romanian|rdl|landmine|trap bar|med ?ball)\b/

export function liftFromName(name, tests = {}) {
  const n = String(name || '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim()
  if (!n || NOT_BARBELL.test(n)) return null
  let best = null, bestAt = Infinity
  LIFT_PATTERNS.forEach(([id, re]) => {
    const m = n.match(re)
    if (m && tests[id] && m.index < bestAt) { best = id; bestAt = m.index }
  })
  return best
}

// The exercise with its load resolved. A % typed in the note wins (it is what
// the coach sees and edits); the lift is the explicit prKey, else read from the name.
export function withLoad(ex, tests = {}) {
  if (!ex || ex.series === 'WU') return ex
  const pct = pctFromText(ex.note) || ex.pct || null
  const prKey = ex.prKey || (pct ? liftFromName(ex.exercise, tests) : null)
  return { ...ex, pct, prKey }
}
