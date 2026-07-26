import { useState, useEffect, useRef } from 'react'
import { sb } from './supabaseClient'
import {
  getTemplate, TEMPLATE_ID, loadAthletePRs, loadTests,
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
const editKey = (b, d, ei, field) => `${b}-${d}-${ei}-${field}`
const hasVal = (v) => v != null && String(v).trim() !== ''

function templateSetCount(ex) {
  const n = parseInt(ex.sets)
  if (!n || isNaN(n)) return 0
  return Math.min(n, 12)
}
const isLoggable = (ex) => ex.series !== 'WU' && templateSetCount(ex) > 0
const MAX_SETS = 15

export default function AthletePortal({ athlete, onLogout }) {
  const [templateId, setTemplateId] = useState(TEMPLATE_ID)
  const [programObj, setProgramObj] = useState(null)   // coach-edited per-athlete program
  const tmpl = programObj || getTemplate(templateId)
  const blocks = tmpl ? Object.keys(tmpl.blocks).map(Number).sort((a, b) => a - b) : []
  const weeks = tmpl?.weeks || 3
  const days = tmpl?.days || []

  const [prs, setPrs] = useState({})
  const [tests, setTests] = useState({})
  const [logs, setLogs] = useState({})     // logKey -> { value }  (key present => set exists)
  const [aEdits, setAEdits] = useState({}) // editKey -> value  (athlete overrides, e.g. swapped exercise)
  const [block, setBlock] = useState(() => lsGet('ws_ap_block', blocks[0] || 1))
  const [week, setWeek] = useState(() => lsGet('ws_ap_week', 1))
  const [dayKey, setDayKey] = useState(() => lsGet('ws_ap_day', days[0] || 'dayA'))
  const [ready, setReady] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [toast, setToast] = useState(null)
  const timers = useRef({})

  useEffect(() => { lsSet('ws_ap_block', block) }, [block])
  useEffect(() => { lsSet('ws_ap_week', week) }, [week])
  useEffect(() => { lsSet('ws_ap_day', dayKey) }, [dayKey])

  useEffect(() => {
    let alive = true
    ;(async () => {
      // resolve the athlete's active assignment -> which program to show
      let tid = TEMPLATE_ID
      const { data: asn } = await sb.from('assignments').select('template,program_json')
        .eq('athlete_id', athlete.id).eq('active', true)
        .order('created_at', { ascending: false }).limit(1)
      if (asn && asn[0]) {
        if (asn[0].template) tid = asn[0].template
        if (asn[0].program_json && asn[0].program_json.blocks) setProgramObj(asn[0].program_json)
      }
      if (!alive) return
      setTemplateId(tid)
      const [p, t] = await Promise.all([loadAthletePRs(athlete.id), loadTests()])
      if (!alive) return
      setPrs(p); setTests(t)
      await Promise.all([refreshLogs(tid), refreshEdits(tid)])
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [athlete.id])

  async function refreshLogs(tid = templateId) {
    const { data, error } = await sb.from('workout_logs').select('*')
      .eq('athlete_id', athlete.id).eq('template', tid)
    if (error) { setNeedsSetup(true); return }
    const m = {}
    data.forEach(r => { m[logKey(r.block, r.week, r.day, r.ex_index, r.set_index)] = { value: r.value } })
    setLogs(m)
  }

  async function refreshEdits(tid = templateId) {
    const { data, error } = await sb.from('athlete_program_edits').select('*')
      .eq('athlete_id', athlete.id).eq('template', tid)
    if (error) return
    const m = {}
    data.forEach(r => { m[editKey(r.block, r.day, r.ex_index, r.field)] = r.value })
    setAEdits(m)
  }

  const flash = (msg, kind = 'ok') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600) }

  // effective exercise name (athlete swap wins over template)
  const effName = (exIdx, ex) => aEdits[editKey(block, dayKey, exIdx, 'exercise')] ?? ex.exercise

  function upsertRow(exIdx, ex, setIdx, value) {
    const row = {
      athlete_id: athlete.id, template: templateId,
      block, week, day: dayKey, ex_index: exIdx, ex_name: effName(exIdx, ex),
      set_index: setIdx, value: hasVal(value) ? String(value) : null,
      logged_at: new Date().toISOString(),
    }
    return sb.from('workout_logs').upsert(row, { onConflict: 'athlete_id,template,block,week,day,ex_index,set_index' })
  }

  function saveSet(exIdx, ex, setIdx, raw) {
    const k = logKey(block, week, dayKey, exIdx, setIdx)
    setLogs(prev => ({ ...prev, [k]: { value: raw } }))
    clearTimeout(timers.current[k])
    timers.current[k] = setTimeout(async () => {
      const { error } = await upsertRow(exIdx, ex, setIdx, raw)
      if (error) setNeedsSetup(true)
    }, 700)
  }

  async function addSet(exIdx, ex) {
    const next = displayCount(exIdx, ex)
    if (next >= MAX_SETS) return
    const k = logKey(block, week, dayKey, exIdx, next)
    setLogs(prev => ({ ...prev, [k]: { value: '' } }))
    const { error } = await upsertRow(exIdx, ex, next, '')
    if (error) setNeedsSetup(true)
  }

  async function removeSet(exIdx, ex) {
    const cur = displayCount(exIdx, ex)
    if (cur <= Math.max(1, templateSetCount(ex))) return
    const s = cur - 1
    const k = logKey(block, week, dayKey, exIdx, s)
    setLogs(prev => { const n = { ...prev }; delete n[k]; return n })
    clearTimeout(timers.current[k])
    await sb.from('workout_logs').delete()
      .eq('athlete_id', athlete.id).eq('template', TEMPLATE_ID)
      .eq('block', block).eq('week', week).eq('day', dayKey)
      .eq('ex_index', exIdx).eq('set_index', s)
  }

  async function swapExercise(exIdx, ex, newName) {
    const k = editKey(block, dayKey, exIdx, 'exercise')
    const trimmed = (newName || '').trim()
    if (!trimmed || trimmed === ex.exercise) {   // revert to template
      setAEdits(prev => { const n = { ...prev }; delete n[k]; return n })
      await sb.from('athlete_program_edits').delete()
        .eq('athlete_id', athlete.id).eq('template', templateId)
        .eq('block', block).eq('day', dayKey).eq('ex_index', exIdx).eq('field', 'exercise')
      return
    }
    setAEdits(prev => ({ ...prev, [k]: trimmed }))
    const { error } = await sb.from('athlete_program_edits').upsert({
      athlete_id: athlete.id, template: templateId, block, day: dayKey,
      ex_index: exIdx, field: 'exercise', value: trimmed, updated_at: new Date().toISOString(),
    }, { onConflict: 'athlete_id,template,block,day,ex_index,field' })
    if (error) flash('Swap didn’t save: ' + error.message, 'err')
  }

  // ---- derived helpers ----
  const chron = (b, w) => (b - 1) * weeks + w

  const displayCount = (exIdx, ex) => {
    let maxIdx = -1
    const pref = `${block}-${week}-${dayKey}-${exIdx}-`
    for (const key of Object.keys(logs)) {
      if (key.startsWith(pref)) {
        const s = parseInt(key.slice(pref.length))
        if (!isNaN(s) && s > maxIdx) maxIdx = s
      }
    }
    return Math.max(templateSetCount(ex), maxIdx + 1)
  }

  const valsAt = (b, w, d, exIdx, count) =>
    Array.from({ length: count }, (_, s) => logs[logKey(b, w, d, exIdx, s)]?.value ?? '')

  const dayLogged = (b, w, d) => {
    const pref = `${b}-${w}-${d}-`
    return Object.entries(logs).some(([k, v]) => k.startsWith(pref) && hasVal(v?.value))
  }

  const lastTimeFor = (d, exIdx) => {
    const cur = chron(block, week)
    let best = null, bestChron = -1
    for (const b of blocks) {
      for (let w = 1; w <= weeks; w++) {
        const c = chron(b, w)
        if (c >= cur) continue
        const pref = `${b}-${w}-${d}-${exIdx}-`
        const entries = Object.entries(logs)
          .filter(([k]) => k.startsWith(pref))
          .sort((a, z) => parseInt(a[0].slice(pref.length)) - parseInt(z[0].slice(pref.length)))
          .map(([, v]) => v?.value ?? '').filter(hasVal)
        if (entries.length && c > bestChron) { best = entries; bestChron = c }
      }
    }
    return best
  }

  async function logToTesting(exIdx, ex) {
    const target = syncTargetFor({ ...ex, exercise: effName(exIdx, ex) }, tests)
    if (!target) return
    const count = displayCount(exIdx, ex)
    const vals = valsAt(block, week, dayKey, exIdx, count).map(v => parseFloat(v)).filter(n => !isNaN(n))
    const bestOfSets = vals.length ? (target.better === 'lower' ? Math.min(...vals) : Math.max(...vals)) : null

    let best
    if (target.isMax) {
      // Working sets are usually submaximal — prompt (prefilled with best set) so
      // Matt confirms the actual max before it hits the testing record.
      const typed = window.prompt(target.prompt + ':', bestOfSets != null ? String(bestOfSets) : '')
      if (typed == null) return
      best = parseFloat(typed)
    } else if (bestOfSets != null) {
      best = bestOfSets
    } else {
      const typed = window.prompt(target.prompt + ':')
      if (typed == null) return
      best = parseFloat(typed)
    }
    if (isNaN(best)) { flash('Enter a number first', 'err'); return }

    let converted = best
    if (target.test_id === 'max_velocity') converted = Math.round((20.45 / best) * 100) / 100

    const cur = prs[target.test_id]
    let isPr = false
    if (cur == null) isPr = true
    else if (target.better === 'higher') isPr = converted > cur
    else isPr = converted < cur

    const label = target.test_id === 'max_velocity' ? `${best}s → ${converted} MPH` : `${best} ${target.unit}`
    const verb = target.isMax ? 'max' : 'result'
    if (!window.confirm(`Log ${target.label} ${verb}:\n${label}${isPr ? '  (NEW PR!)' : ''}\n\nWrite to your performance record?`)) return

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

  const loggables = exercises.filter(isLoggable)
  const doneCount = loggables.filter(ex => {
    const exIdx = exercises.indexOf(ex)
    return valsAt(block, week, dayKey, exIdx, displayCount(exIdx, ex)).some(hasVal)
  }).length
  const pct = loggables.length ? Math.round((doneCount / loggables.length) * 100) : 0

  return (
    <Shell onLogout={onLogout} athlete={athlete} title={tmpl?.label}>
      {toast && (
        <div style={{ position: 'fixed', top: 12, left: 12, right: 12, zIndex: 50, background: toast.kind === 'err' ? '#3a1220' : '#0c3', color: '#fff', padding: '12px 14px', borderRadius: 10, fontWeight: 700, textAlign: 'center', boxShadow: '0 6px 24px rgba(0,0,0,.4)' }}>{toast.msg}</div>
      )}

      {needsSetup && (
        <div style={{ background: '#3a2a12', border: '1px solid #a76', color: '#ffd9a0', padding: 12, borderRadius: 10, margin: '0 0 14px', fontSize: 13 }}>
          Logging isn’t saving — check your connection.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <Segment label="Week" value={block} setValue={setBlock} options={blocks} />
        {weeks > 1 && <Segment label="Sub-week" value={week} setValue={setWeek} options={Array.from({ length: weeks }, (_, i) => i + 1)} />}
      </div>

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

      {ready && exercises.map((ex, i) => {
        const count = displayCount(i, ex)
        const name = effName(i, ex)
        const swapped = name !== ex.exercise
        return (
          <ExerciseCard
            key={i} ex={ex} name={name} swapped={swapped} count={count}
            target={weightText(ex, week, prs)}
            sync={syncTargetFor({ ...ex, exercise: name }, tests)}
            vals={valsAt(block, week, dayKey, i, count)}
            lastTime={isLoggable(ex) ? lastTimeFor(dayKey, i) : null}
            canRemove={count > Math.max(1, templateSetCount(ex))}
            onSet={(si, v) => saveSet(i, ex, si, v)}
            onAddSet={() => addSet(i, ex)}
            onRemoveSet={() => removeSet(i, ex)}
            onSwap={(newName) => swapExercise(i, ex, newName)}
            onLogTesting={() => logToTesting(i, ex)}
          />
        )
      })}
      <div style={{ height: 40 }} />
    </Shell>
  )
}

function ExerciseCard({ ex, name, swapped, count, target, sync, vals, lastTime, canRemove, onSet, onAddSet, onRemoveSet, onSwap, onLogTesting }) {
  const isWU = ex.series === 'WU'
  const loggable = !isWU && count > 0
  const setsReps = ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : (ex.reps || ex.sets || '')
  const allDone = loggable && vals.length === count && vals.every(hasVal)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  const startEdit = () => { setDraft(name); setEditing(true) }
  const commit = () => { setEditing(false); if (draft !== name) onSwap(draft) }

  return (
    <div style={{ background: CARD, borderRadius: 14, padding: 14, marginBottom: 10, border: `1px solid ${allDone ? OK : BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {ex.series && <span style={{ color: NAVY, background: MUTED, borderRadius: 6, padding: '2px 6px', fontSize: 10, fontWeight: 900 }}>{ex.series}</span>}
        {editing ? (
          <input
            autoFocus value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit() }}
            style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: `1px solid ${ACCENT}`, background: CARD2, color: TEXT, fontFamily: 'inherit', fontWeight: 800, fontSize: 15 }}
          />
        ) : (
          <span onClick={startEdit} style={{ color: TEXT, fontWeight: 800, fontSize: 16, flex: 1, cursor: 'pointer' }}>
            {name}
            {swapped && <span style={{ color: ACCENT, fontSize: 10, fontWeight: 800, marginLeft: 6, verticalAlign: 'middle' }}>SWAPPED</span>}
          </span>
        )}
        {!editing && <button onClick={startEdit} title="Swap exercise" style={{ background: 'transparent', border: 'none', color: MUTED, fontSize: 15, cursor: 'pointer', padding: 2 }}>✎</button>}
        {allDone && <span style={{ color: OK, fontWeight: 900, fontSize: 16 }}>✓</span>}
      </div>
      {swapped && !editing && (
        <div style={{ marginTop: 3 }}>
          <button onClick={() => onSwap(ex.exercise)} style={{ background: 'transparent', border: 'none', color: MUTED, fontSize: 10, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>revert to {ex.exercise}</button>
        </div>
      )}
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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 12 }}>
          {Array.from({ length: count }, (_, s) => {
            const v = vals[s] ?? ''
            const filled = hasVal(v)
            return (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: MUTED, fontSize: 9, marginBottom: 3 }}>SET {s + 1}</span>
                <input
                  value={v} onChange={e => onSet(s, e.target.value)} placeholder="—"
                  style={{
                    width: 60, textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                    border: `1px solid ${filled ? OK : BORDER}`,
                    background: filled ? 'rgba(0,255,136,.10)' : CARD2,
                    color: filled ? OK : TEXT, fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                  }}
                />
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: 4, marginBottom: 1 }}>
            {canRemove && <button onClick={onRemoveSet} title="Remove last set" style={setBtn}>−</button>}
            <button onClick={onAddSet} title="Add a set" style={setBtn}>＋</button>
          </div>
        </div>
      )}

      {sync && (
        <button onClick={onLogTesting} style={{
          marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: `1px solid ${ACCENT}`,
          background: 'transparent', color: ACCENT, fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>📊 {sync.isMax ? 'Log max' : 'Log to Testing'} → {sync.label}</button>
      )}
    </div>
  )
}

const setBtn = {
  width: 38, height: 38, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD2,
  color: ACCENT, fontFamily: 'inherit', fontWeight: 900, fontSize: 18, cursor: 'pointer', lineHeight: 1,
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

function Shell({ children, onLogout, athlete, title }) {
  return (
    <div style={{ minHeight: '100vh', background: NAVY, fontFamily: "'Archivo', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ color: ACCENT, fontWeight: 900, fontSize: 18, letterSpacing: .5 }}>{title || 'Online Program'}</div>
            <div style={{ color: MUTED, fontSize: 12 }}>{athlete.first_name} {athlete.last_name}</div>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${MUTED}`, color: MUTED, borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Log out</button>
        </div>
        {children}
      </div>
    </div>
  )
}
