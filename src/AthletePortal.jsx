import { useState, useEffect, useRef } from 'react'
import { sb } from './supabaseClient'
import {
  getTemplate, TEMPLATE_ID, loadAthletePRs,
  weightText, syncTargetFor, dayLabel,
} from './programEngine'

// ---- theme (matches Wilmington Strength) ----
const NAVY = '#0a1628'
const CARD = '#0f2035'
const CARD2 = '#132a45'
const ACCENT = '#00d4ff'
const OK = '#00ff88'
const MUTED = '#5b7a9c'
const TEXT = '#e8f1fb'
const BORDER = '#1d3350'

const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch { return d } }
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const today = () => new Date().toISOString().slice(0, 10)
const logKey = (b, w, d, ei, si) => `${b}-${w}-${d}-${ei}-${si}`
const hasVal = (v) => v != null && v !== ''

// number of loggable set inputs to show (cap busy interval work)
function setInputCount(ex) {
  const n = parseInt(ex.sets)
  if (!n || isNaN(n)) return 0
  return Math.min(n, 8)
}
const isLoggable = (ex) => ex.series !== 'WU' && setInputCount(ex) > 0

export default function AthletePortal({ athlete, onLogout }) {
  const tmpl = getTemplate()
  const blocks = tmpl ? Object.keys(tmpl.blocks).map(Number).sort((a, b) => a - b) : []
  const weeks = tmpl?.weeks || 3
  const days = tmpl?.days || []

  const [prs, setPrs] = useState({})
  const [logs, setLogs] = useState({})          // logKey -> { value }
  const [block, setBlock] = useState(() => lsGet('ws_ap_block', blocks[0] || 1))
  const [week, setWeek] = useState(() => lsGet('ws_ap_week', 1))
  const [dayKey, setDayKey] = useState(() => lsGet('ws_ap_day', days[0] || 'dayA'))
  const [ready, setReady] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)  // workout_logs table missing
  const [toast, setToast] = useState(null)
  const timers = useRef({})

  useEffect(() => { lsSet('ws_ap_block', block) }, [block])
  useEffect(() => { lsSet('ws_ap_week', week) }, [week])
  useEffect(() => { lsSet('ws_ap_day', dayKey) }, [dayKey])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const p = await loadAthletePRs(athlete.id)
      if (!alive) return
      setPrs(p)
      await refreshLogs()
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [athlete.id])

  async function refreshLogs() {
    const { data, error } = await sb
      .from('workout_logs').select('*')
      .eq('athlete_id', athlete.id).eq('template', TEMPLATE_ID)
    if (error) { setNeedsSetup(true); return }
    const m = {}
    data.forEach(r => { m[logKey(r.block, r.week, r.day, r.ex_index, r.set_index)] = { value: r.value } })
    setLogs(m)
  }

  const flash = (msg, kind = 'ok') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600) }

  function saveSet(exIdx, ex, setIdx, raw) {
    const k = logKey(block, week, dayKey, exIdx, setIdx)
    setLogs(prev => ({ ...prev, [k]: { ...(prev[k] || {}), value: raw } }))
    const val = raw === '' || raw == null ? null : parseFloat(raw)
    clearTimeout(timers.current[k])
    timers.current[k] = setTimeout(async () => {
      const row = {
        athlete_id: athlete.id, template: TEMPLATE_ID,
        block, week, day: dayKey, ex_index: exIdx, ex_name: ex.exercise,
        set_index: setIdx, value: isNaN(val) ? null : val,
        logged_at: new Date().toISOString(),
      }
      const { error } = await sb.from('workout_logs')
        .upsert(row, { onConflict: 'athlete_id,template,block,week,day,ex_index,set_index' })
      if (error) setNeedsSetup(true)
    }, 700)
  }

  // ---- derived helpers for polish ----
  // chronological index of a (block, week) so we can find the "last time"
  const chron = (b, w) => (b - 1) * weeks + w

  // values logged for one exercise at a specific block/week
  const setValsAt = (b, w, d, exIdx, count) =>
    Array.from({ length: count }, (_, s) => logs[logKey(b, w, d, exIdx, s)]?.value ?? '')

  // does a given day (in the current block/week) have any logged set?
  const dayLogged = (b, w, d) => {
    const pref = `${b}-${w}-${d}-`
    return Object.entries(logs).some(([k, v]) => k.startsWith(pref) && hasVal(v?.value))
  }

  // most recent prior session's values for the same exercise slot
  const lastTimeFor = (d, exIdx, count) => {
    const cur = chron(block, week)
    let best = null, bestChron = -1
    for (const b of blocks) {
      for (let w = 1; w <= weeks; w++) {
        const c = chron(b, w)
        if (c >= cur) continue
        const vals = setValsAt(b, w, d, exIdx, count)
        if (vals.some(hasVal) && c > bestChron) { best = vals; bestChron = c }
      }
    }
    return best ? best.filter(hasVal) : null
  }

  async function logToTesting(exIdx, ex) {
    const target = syncTargetFor(ex.exercise)
    if (!target) return
    const count = setInputCount(ex)
    const vals = setValsAt(block, week, dayKey, exIdx, count).map(parseFloat).filter(n => !isNaN(n))
    let best
    if (vals.length) best = target.better === 'lower' ? Math.min(...vals) : Math.max(...vals)
    else {
      const typed = window.prompt(`${target.label} — ${target.prompt}:`)
      if (typed == null) return
      best = parseFloat(typed)
    }
    if (isNaN(best)) { flash('Enter a number first', 'err'); return }

    // converted_value: max_velocity uses the tests-table formula 20.45 / v (MPH).
    let converted = best
    if (target.test_id === 'max_velocity') converted = Math.round((20.45 / best) * 100) / 100

    const cur = prs[target.test_id]
    let isPr = false
    if (cur == null) isPr = true
    else if (target.better === 'higher') isPr = converted > cur
    else isPr = converted < cur

    const label = target.test_id === 'max_velocity'
      ? `${best}s → ${converted} MPH` : `${best} ${target.unit}`
    if (!window.confirm(`Log to Testing:\n${target.label} = ${label}${isPr ? '  (NEW PR!)' : ''}\n\nWrite to your performance record?`)) return

    const { error } = await sb.from('results').insert({
      athlete_id: athlete.id, test_id: target.test_id, test_date: today(),
      raw_value: best, converted_value: converted, unit: target.unit, is_pr: isPr,
    })
    if (error) { flash('Log failed: ' + error.message, 'err'); return }
    setPrs(prev => ({ ...prev, [target.test_id]: converted }))
    flash(`${target.label} logged${isPr ? ' — new PR! 🎉' : ''}`)
  }

  if (!tmpl) return <Shell onLogout={onLogout} athlete={athlete}><p style={{ color: MUTED, padding: 20 }}>Program not found.</p></Shell>

  const bd = tmpl.blocks[block] || {}
  const exercises = bd[dayKey]?.exercises || []
  const { dow, focus } = dayLabel(tmpl, block, dayKey)

  // day progress: exercises with >=1 logged set / total loggable exercises
  const loggables = exercises.filter(isLoggable)
  const doneCount = loggables.filter((ex, idx) => {
    const exIdx = exercises.indexOf(ex)
    return setValsAt(block, week, dayKey, exIdx, setInputCount(ex)).some(hasVal)
  }).length
  const pct = loggables.length ? Math.round((doneCount / loggables.length) * 100) : 0

  return (
    <Shell onLogout={onLogout} athlete={athlete}>
      {toast && (
        <div style={{ position: 'fixed', top: 12, left: 12, right: 12, zIndex: 50, background: toast.kind === 'err' ? '#3a1220' : '#0c3', color: '#fff', padding: '12px 14px', borderRadius: 10, fontWeight: 700, textAlign: 'center', boxShadow: '0 6px 24px rgba(0,0,0,.4)' }}>{toast.msg}</div>
      )}

      {needsSetup && (
        <div style={{ background: '#3a2a12', border: '1px solid #a76', color: '#ffd9a0', padding: 12, borderRadius: 10, margin: '0 0 14px', fontSize: 13 }}>
          Logging isn’t saving yet — the <b>workout_logs</b> table needs to be created in Supabase. You can still browse the program.
        </div>
      )}

      {/* Block + Week selectors */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Segment label="Block" value={block} setValue={setBlock} options={blocks} />
        <Segment label="Week" value={week} setValue={setWeek} options={Array.from({ length: weeks }, (_, i) => i + 1)} />
      </div>

      {/* Day tabs with completion dots */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 6 }}>
        {days.map(d => {
          const { dow } = dayLabel(tmpl, block, d)
          const active = d === dayKey
          const done = dayLogged(block, week, d)
          return (
            <button key={d} onClick={() => setDayKey(d)} style={{
              position: 'relative', flex: '0 0 auto', padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 13, letterSpacing: .3,
              background: active ? ACCENT : CARD2, color: active ? NAVY : MUTED,
            }}>
              {(dow || d).slice(0, 3)}
              {done && <span style={{ position: 'absolute', top: 5, right: 7, width: 6, height: 6, borderRadius: 6, background: active ? NAVY : OK }} />}
            </button>
          )
        })}
      </div>

      <div style={{ color: TEXT, fontWeight: 900, fontSize: 20, marginTop: 4 }}>{dow}</div>
      {focus && <div style={{ color: ACCENT, fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{focus}</div>}

      {/* Day progress bar */}
      {loggables.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: MUTED, fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
            <span>{doneCount} / {loggables.length} LOGGED</span>
            {pct === 100 && <span style={{ color: OK }}>DAY COMPLETE ✓</span>}
          </div>
          <div style={{ height: 6, background: CARD2, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? OK : ACCENT, transition: 'width .3s' }} />
          </div>
        </div>
      )}

      {!ready && <p style={{ color: MUTED }}>Loading your numbers…</p>}

      {ready && exercises.map((ex, i) => (
        <ExerciseCard
          key={i} ex={ex} exIdx={i} week={week} block={block} dayKey={dayKey}
          target={weightText(ex, week, prs)}
          sync={syncTargetFor(ex.exercise)}
          vals={setValsAt(block, week, dayKey, i, setInputCount(ex))}
          lastTime={isLoggable(ex) ? lastTimeFor(dayKey, i, setInputCount(ex)) : null}
          onSet={(si, v) => saveSet(i, ex, si, v)}
          onLogTesting={() => logToTesting(i, ex)}
        />
      ))}
      <div style={{ height: 40 }} />
    </Shell>
  )
}

function ExerciseCard({ ex, exIdx, target, sync, vals, lastTime, onSet, onLogTesting }) {
  const isWU = ex.series === 'WU'
  const count = setInputCount(ex)
  const loggable = !isWU && count > 0
  const setsReps = ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : (ex.reps || ex.sets || '')
  const allDone = loggable && vals.length === count && vals.every(hasVal)

  return (
    <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: `1px solid ${allDone ? OK : BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {ex.series && <span style={{ color: NAVY, background: MUTED, borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{ex.series}</span>}
        <span style={{ color: TEXT, fontWeight: 800, fontSize: 16, flex: 1 }}>{ex.exercise}</span>
        {allDone && <span style={{ color: OK, fontWeight: 900, fontSize: 16 }}>✓</span>}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
        {setsReps && <span style={{ color: ACCENT, fontWeight: 800, fontSize: 14 }}>{setsReps}</span>}
        {target && <span style={{ color: OK, fontWeight: 800, fontSize: 14 }}>{target}</span>}
      </div>
      {ex.note && <div style={{ color: MUTED, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>{ex.note}</div>}
      {loggable && lastTime && lastTime.length > 0 && (
        <div style={{ color: MUTED, fontSize: 11, marginTop: 8 }}>
          <span style={{ opacity: .7 }}>Last time: </span>
          <span style={{ color: TEXT, fontWeight: 700 }}>{lastTime.join(' · ')}</span>
        </div>
      )}

      {loggable && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {Array.from({ length: count }, (_, s) => {
            const v = vals[s] ?? ''
            const filled = hasVal(v)
            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: MUTED, fontSize: 9, marginBottom: 3 }}>SET {s + 1}</span>
                <input
                  value={v} onChange={e => onSet(s, e.target.value)}
                  inputMode="decimal" placeholder="—"
                  style={{
                    width: 52, textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                    border: `1px solid ${filled ? OK : BORDER}`,
                    background: filled ? 'rgba(0,255,136,.10)' : CARD2,
                    color: filled ? OK : TEXT, fontFamily: 'inherit', fontWeight: 800, fontSize: 15,
                  }}
                />
              </div>
            )
          })}
        </div>
      )}

      {sync && (
        <button onClick={onLogTesting} style={{
          marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${ACCENT}`,
          background: 'transparent', color: ACCENT, fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>📊 Log to Testing → {sync.label}</button>
      )}
    </div>
  )
}

function Segment({ label, value, setValue, options }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: MUTED, fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(o => {
          const active = o === value
          return (
            <button key={o} onClick={() => setValue(o)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
              background: active ? ACCENT : CARD2, color: active ? NAVY : MUTED,
            }}>{o}</button>
          )
        })}
      </div>
    </div>
  )
}

function Shell({ children, onLogout, athlete }) {
  return (
    <div style={{ minHeight: '100vh', background: NAVY, fontFamily: "'Archivo', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: ACCENT, fontWeight: 900, fontSize: 18, letterSpacing: .5 }}>Matt’s Online Program</div>
            <div style={{ color: MUTED, fontSize: 12 }}>{athlete.first_name} {athlete.last_name}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${MUTED}`, color: MUTED, borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Log out</button>
        </div>
        {children}
      </div>
    </div>
  )
}
