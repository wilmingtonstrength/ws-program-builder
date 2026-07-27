import { useState, useEffect, useRef, Fragment } from 'react'

// Coach-side "Online Programs" tab. Assign a program (snapshots an editable,
// WEEK-BASED copy) then edit it like a calendar: each week is independent —
// edit/add/remove/reorder/link exercises, delete or copy/paste days, delete
// weeks, add however many weeks you want. Self-contained; never touches paper.

const today = () => new Date().toISOString().slice(0, 10)
const clone = (o) => JSON.parse(JSON.stringify(o))
const dowFromHeader = (h) => (h || '').split('—')[0].trim()

// --- superset-aware exercise numbering ---
// ex.linked = "grouped with the previous exercise" (same letter). ex.wu = warmup.
function deriveLinked(exs) {
  let prevLetter = null
  return (exs || []).map((ex, i) => {
    const s = String(ex.series || '')
    const wu = s.toUpperCase() === 'WU'
    const letter = (s.match(/^[A-Za-z]+/) || [''])[0].toUpperCase()
    const linked = !wu && i > 0 && !!letter && letter === prevLetter
    prevLetter = wu ? prevLetter : (letter || prevLetter)
    return { ...ex, wu, linked }
  })
}
function renumber(exs) {
  let letterIdx = -1, num = 0
  return (exs || []).map((ex, i) => {
    if (ex.wu) return { ...ex, series: 'WU' }
    if (ex.linked && i > 0 && !exs[i - 1].wu) { num++ } else { letterIdx++; num = 1 }
    const letter = String.fromCharCode(65 + Math.min(letterIdx, 25))
    return { ...ex, series: letter + num }
  })
}
// group = a superset (a run of consecutive linked exercises)
function toGroups(exs) {
  const groups = []; let cur = null
  ;(exs || []).forEach(ex => { if (ex.linked && cur) cur.push(ex); else { cur = [ex]; groups.push(cur) } })
  return groups
}
function groupIndexOf(exs, idx) {
  const groups = toGroups(exs); let count = 0
  for (let k = 0; k < groups.length; k++) { if (idx < count + groups[k].length) return k; count += groups[k].length }
  return groups.length - 1
}
// move the whole group containing idx one slot up (-1) or down (+1)
function moveGroup(exs, idx, dir) {
  const groups = toGroups(exs); const gi = groupIndexOf(exs, idx); const tj = gi + dir
  if (tj < 0 || tj >= groups.length) return exs
  const t = groups[gi]; groups[gi] = groups[tj]; groups[tj] = t
  return groups.flat()
}
// drag the group containing fromIdx to where the group containing toIdx is
function dropGroup(exs, fromIdx, toIdx) {
  const groups = toGroups(exs); const gi = groupIndexOf(exs, fromIdx); const gj = groupIndexOf(exs, toIdx)
  if (gi === gj) return exs
  const [moved] = groups.splice(gi, 1)
  groups.splice(gj > gi ? gj - 1 : gj, 0, moved)
  return groups.flat()
}

// Flatten a block-based template (blocks × weeks) into an independent week list.
function flattenToWeeks(t) {
  if (!t?.blocks) return t
  const srcBlocks = Object.keys(t.blocks).map(Number).sort((a, b) => a - b)
  const perBlockWeeks = t.weeks || 1
  const days = t.days || []
  const weeks = {}
  let n = 0
  srcBlocks.forEach(b => {
    for (let w = 1; w <= perBlockWeeks; w++) {
      n++
      const wk = { pctLabel: `Week ${n}` }
      days.forEach(d => {
        if (t.blocks[b][d]) {
          const src = clone(t.blocks[b][d])
          src.exercises = renumber(deriveLinked(src.exercises || []))
          wk[d] = src
        }
      })
      weeks[n] = wk
    }
  })
  return { label: t.label, days, weeks: 1, blocks: weeks }
}

// --- date helpers (dated calendar) ---
const WEEKDAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function sundayOf(d) { const x = new Date(d); return addDays(x, -x.getDay()) }
function mondayOf(d) { const x = new Date(d); return addDays(x, -((x.getDay() + 6) % 7)) }
function parseYmd(s) { return s ? new Date(s + 'T00:00:00') : new Date() }
// Monday=0 … Sunday=6 offset of a session within its training week (from the day header, else its position)
function weekdayOffset(header, fallbackIdx) {
  const m = String(header || '').toLowerCase().match(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/)
  if (m) return (WEEKDAYS[m[0]] + 6) % 7
  return Math.min(Math.max(fallbackIdx, 0), 6)
}

function totalSessions(prog) {
  if (!prog?.blocks) return 0
  const weeks = Object.keys(prog.blocks).length
  const days = (prog.days || []).length
  return weeks * days
}

export default function CoachOnline({ athletes = [], allTemplates = {}, removedTemplates = new Set(), sb }) {
  const [assignments, setAssignments] = useState([])
  const [logs, setLogs] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [athleteId, setAthleteId] = useState('')
  const [programId, setProgramId] = useState('matts_online')
  const [startDate, setStartDate] = useState(() => ymd(mondayOf(new Date())))
  const [msg, setMsg] = useState('')
  const [editing, setEditing] = useState(null)

  const programList = Object.entries(allTemplates).filter(([id]) => !removedTemplates.has(id)).map(([id, t]) => ({ id, label: t.label || id }))
  const nameOf = (id) => { const a = athletes.find(x => x.id === id); return a ? `${a.first_name} ${a.last_name}`.trim() : `Athlete ${id}` }

  async function loadAll() {
    setLoading(true)
    const { data: asn } = await sb.from('assignments').select('*').eq('active', true).order('created_at', { ascending: false })
    let all = [], from = 0
    while (true) {
      const { data, error } = await sb.from('workout_logs')
        .select('athlete_id,template,block,week,day,ex_index,set_index,value,logged_at').range(from, from + 999)
      if (error) break
      if (data) all = all.concat(data)
      if (!data || data.length < 1000) break
      from += 1000
    }
    const { data: nts } = await sb.from('workout_notes')
      .select('athlete_id,template,block,week,day,ex_index,note,updated_at')
    setAssignments(asn || [])
    setLogs(all)
    setNotes(nts || [])
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  async function assign() {
    if (!athleteId || !programId) { setMsg('Pick an athlete and a program.'); return }
    const aId = parseInt(athleteId)
    setMsg('Assigning…')
    const snap = allTemplates[programId] ? flattenToWeeks(clone(allTemplates[programId])) : null
    await sb.from('assignments').update({ active: false }).eq('athlete_id', aId).eq('active', true)
    const { error } = await sb.from('assignments').insert({
      athlete_id: aId, template: programId, active: true, start_date: startDate || today(), program_json: snap,
    })
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg(`Assigned ${allTemplates[programId]?.label || programId} to ${nameOf(aId)}.`)
    setAthleteId('')
    loadAll()
  }

  function progressFor(a) {
    const prog = a.program_json || (allTemplates[a.template] ? flattenToWeeks(allTemplates[a.template]) : null)
    const total = totalSessions(prog)
    const mine = logs.filter(l => l.athlete_id === a.athlete_id && l.template === a.template && l.value != null && String(l.value).trim() !== '')
    const done = new Set(mine.map(l => `${l.block}-${l.week}-${l.day}`)).size
    const last = mine.reduce((m, l) => (l.logged_at && l.logged_at > m ? l.logged_at : m), '')
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, last, due: total > 0 && done >= total }
  }

  if (editing) {
    return <ProgramEditor
      assignment={editing} allTemplates={allTemplates} sb={sb} athleteName={nameOf(editing.athlete_id)} logs={logs} notes={notes}
      onBack={() => { setEditing(null); loadAll() }}
    />
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#0a2540' }}>Online Programming</h2>
          <span style={{ background: '#0a7', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, letterSpacing: 1 }}>SEPARATE FROM PAPER</span>
        </div>
        <p style={{ color: '#5a6b7b', fontSize: 12, marginTop: 2 }}>Assign a program, then open it to edit the calendar — each week is independent. Athletes see it live at <b>/athlete</b>.</p>

        <div style={{ background: '#fff', border: '1px solid #cdd8e3', borderRadius: 8, padding: 14, marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#0a2540', marginBottom: 10 }}>Assign a program</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={lbl}>Athlete</div>
              <select value={athleteId} onChange={e => setAthleteId(e.target.value)} style={sel}>
                <option value="">Select athlete…</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Program</div>
              <select value={programId} onChange={e => setProgramId(e.target.value)} style={sel}>
                {programList.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <div style={lbl}>Start date</div>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...sel, minWidth: 140 }} />
            </div>
            <button onClick={assign} style={btn}>Assign</button>
          </div>
          {msg && <div style={{ marginTop: 10, fontSize: 12, color: '#0a7' }}>{msg}</div>}
        </div>

        <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#0a2540', marginBottom: 8 }}>
          Assigned athletes {loading ? '' : `(${assignments.length})`}
        </div>
        {loading && <div style={{ color: '#5a6b7b', fontSize: 13 }}>Loading…</div>}
        {!loading && assignments.length === 0 && <div style={{ color: '#5a6b7b', fontSize: 13 }}>No active assignments yet.</div>}

        {assignments.map(a => {
          const p = progressFor(a)
          return (
            <div key={a.id} style={{ background: '#fff', border: `1px solid ${p.due ? '#e0a500' : '#cdd8e3'}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2540' }}>{nameOf(a.athlete_id)}</div>
                  <div style={{ fontSize: 12, color: '#5a6b7b' }}>{a.program_json?.label || allTemplates[a.template]?.label || a.template}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {p.due && <span style={{ background: '#e0a500', color: '#fff', fontWeight: 800, fontSize: 11, padding: '4px 10px', borderRadius: 12 }}>DUE FOR NEW</span>}
                  <span style={{ color: '#5a6b7b', fontSize: 12 }}>{p.done}/{p.total} · {p.pct}%</span>
                  <button onClick={() => setEditing(a)} style={btnDark}>Edit program →</button>
                </div>
              </div>
              <div style={{ height: 6, background: '#e6edf3', borderRadius: 6, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.due ? '#e0a500' : '#0a7' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------- Week-based program editor ----------------
function ProgramEditor({ assignment, allTemplates, sb, athleteName, logs = [], notes = [], onBack }) {
  const raw = assignment.program_json?.blocks
    ? assignment.program_json
    : (allTemplates[assignment.template] ? clone(allTemplates[assignment.template]) : { label: assignment.template, days: [], weeks: 1, blocks: {} })
  // Flatten anything still block-based (a template, or an older block-based
  // program_json) into independent weeks. Already-week-based (weeks:1) is left as-is.
  const seed = (raw.weeks && raw.weeks > 1) ? flattenToWeeks(raw) : raw

  const [prog, setProg] = useState(seed)
  const weekKeys0 = Object.keys(seed.blocks || {}).map(Number).sort((a, b) => a - b)
  const [wk, setWk] = useState(weekKeys0[0] || 1)
  const [dayKey, setDayKey] = useState((seed.days || [])[0] || 'dayA')
  const [clip, setClip] = useState(null)
  const [weekClip, setWeekClip] = useState(null)   // a copied week (for calendar paste)
  const [drag, setDrag] = useState(null)
  const [addN, setAddN] = useState(3)
  const [saveState, setSaveState] = useState('saved')
  const [view, setView] = useState('calendar')   // 'calendar' overview | 'day' editor
  const [startDate, setStartDate] = useState(assignment.start_date || ymd(mondayOf(new Date())))
  const [monthCursor, setMonthCursor] = useState(() => { const s = assignment.start_date ? parseYmd(assignment.start_date) : new Date(); return new Date(s.getFullYear(), s.getMonth(), 1) })
  const timer = useRef(null)

  const weeks = Object.keys(prog.blocks || {}).map(Number).sort((a, b) => a - b)
  const days = prog.days || []
  const wd = prog.blocks?.[wk] || {}
  const day = wd[dayKey] || { header: '', exercises: [] }

  function save(next) {
    setSaveState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const { error } = await sb.from('assignments').update({ program_json: next }).eq('id', assignment.id)
      setSaveState(error ? 'error' : 'saved')
    }, 500)
  }
  function mutate(fn) { setProg(prev => { const next = clone(prev); fn(next); save(next); return next }) }
  // rewrite the current day's exercises through a transform, then renumber
  function mutExs(fn) {
    mutate(p => {
      if (!p.blocks[wk][dayKey]) p.blocks[wk][dayKey] = { header: '', exercises: [] }
      const exs = p.blocks[wk][dayKey].exercises || []
      p.blocks[wk][dayKey].exercises = renumber(fn(exs.slice()))
    })
  }

  const setExField = (idx, field, val) => mutate(p => { p.blocks[wk][dayKey].exercises[idx][field] = val })
  const addExercise = () => mutExs(exs => { exs.push({ series: '', exercise: '', sets: '3', reps: '5', pct: null, prKey: null, note: '', linked: false, wu: false }); return exs })
  const removeExercise = (idx) => mutExs(exs => { exs.splice(idx, 1); return exs })
  const moveExercise = (idx, dir) => mutExs(exs => moveGroup(exs, idx, dir))
  const dropOn = (target) => { if (drag != null && drag !== target) mutExs(exs => dropGroup(exs, drag, target)); setDrag(null) }
  const toggleLink = (idx) => mutExs(exs => { if (idx > 0) exs[idx] = { ...exs[idx], linked: !exs[idx].linked, wu: false }; return exs })

  const setHeader = (val) => mutate(p => { if (!p.blocks[wk][dayKey]) p.blocks[wk][dayKey] = { header: '', exercises: [] }; p.blocks[wk][dayKey].header = val })
  const copyDay = () => setClip(clone(day))
  const pasteDay = () => { if (clip) mutate(p => { p.blocks[wk][dayKey] = clone(clip) }) }
  const deleteDay = () => { if (window.confirm(`Delete ${dowFromHeader(day.header) || dayKey} from Week ${wk}? (this week only)`)) mutate(p => { delete p.blocks[wk][dayKey] }) }

  const addWeeks = () => mutate(p => {
    const keys = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
    let last = keys[keys.length - 1] || 0
    const source = p.blocks[last]
    const n = Math.max(1, Math.min(12, parseInt(addN) || 1))
    for (let k = 0; k < n; k++) {
      last++
      p.blocks[last] = source ? clone(source) : {}
      p.blocks[last].pctLabel = `Week ${last}`
    }
    setTimeout(() => setWk(last), 0)
  })
  const deleteWeek = () => {
    if (weeks.length <= 1) { window.alert('Keep at least one week.'); return }
    if (!window.confirm(`Delete Week ${wk} entirely?`)) return
    mutate(p => {
      delete p.blocks[wk]
      // re-index remaining weeks to 1..N
      const rest = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
      const nb = {}
      rest.forEach((old, idx) => { const nw = idx + 1; nb[nw] = p.blocks[old]; nb[nw].pctLabel = `Week ${nw}` })
      p.blocks = nb
    })
    setTimeout(() => setWk(1), 0)
  }
  const duplicateWeek = (w) => mutate(p => {
    const keys = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
    const last = keys[keys.length - 1] || 0
    const nw = last + 1
    p.blocks[nw] = clone(p.blocks[w]); p.blocks[nw].pctLabel = `Week ${nw}`
  })
  const deleteWeekAt = (w) => {
    if (weeks.length <= 1) { window.alert('Keep at least one week.'); return }
    if (!window.confirm(`Delete Week ${w} entirely?`)) return
    mutate(p => {
      delete p.blocks[w]
      const rest = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
      const nb = {}
      rest.forEach((old, idx) => { const nwk = idx + 1; nb[nwk] = p.blocks[old]; nb[nwk].pctLabel = `Week ${nwk}` })
      p.blocks = nb
    })
    setTimeout(() => setWk(1), 0)
  }
  const openDay = (w, d) => { setWk(w); setDayKey(d); setView('day') }

  // athlete completion, from logs (block == week index in the week-based model)
  const loggedSet = new Set(
    logs.filter(l => l.athlete_id === assignment.athlete_id && l.template === assignment.template && l.value != null && String(l.value).trim() !== '')
      .map(l => `${l.block}-${l.day}`)
  )
  const dayLogged = (w, d) => loggedSet.has(`${w}-${d}`)
  const weekDone = (w) => { const ds = days.filter(d => prog.blocks[w]?.[d]); return ds.length > 0 && ds.every(d => dayLogged(w, d)) }

  // what the athlete actually logged for a given exercise (block == week in this model)
  const mine = (rows) => rows.filter(r => r.athlete_id === assignment.athlete_id && r.template === assignment.template)
  const athleteSets = (w, d, exIdx) => mine(logs)
    .filter(l => l.block === w && l.day === d && l.ex_index === exIdx && l.value != null && String(l.value).trim() !== '')
    .sort((a, b) => (a.set_index ?? 0) - (b.set_index ?? 0))
    .map(l => String(l.value).trim())
  const athleteNote = (w, d, exIdx) => {
    const r = mine(notes).find(n => n.block === w && n.day === d && n.ex_index === exIdx && n.note && n.note.trim())
    return r ? r.note.trim() : ''
  }
  const currentWeek = weeks.find(w => !weekDone(w)) || weeks[weeks.length - 1]

  // dated-calendar mapping: each session lands on a real date from the start date
  const saveStartDate = async (v) => { setStartDate(v); await sb.from('assignments').update({ start_date: v }).eq('id', assignment.id) }
  const week1Monday = mondayOf(parseYmd(startDate))
  const dateOfSession = (w, d) => addDays(week1Monday, (w - 1) * 7 + weekdayOffset(prog.blocks[w]?.[d]?.header, days.indexOf(d)))
  const cellMap = {}
  weeks.forEach(w => days.forEach(d => { if (prog.blocks[w]?.[d]) cellMap[ymd(dateOfSession(w, d))] = { w, d } }))
  const repeatWeek = () => mutate(p => {
    const src = clone(p.blocks[wk]); const keys = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
    let last = keys[keys.length - 1] || 0; const n = Math.max(1, Math.min(12, parseInt(addN) || 1))
    for (let k = 0; k < n; k++) { last++; p.blocks[last] = clone(src); p.blocks[last].pctLabel = `Week ${last}` }
  })
  // which program-week a calendar date belongs to (1-based; can exceed current length)
  const weekIndexForDate = (dt) => Math.floor((mondayOf(dt).getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1
  const copyWeekAt = (W) => { if (prog.blocks[W]) setWeekClip({ w: W, block: clone(prog.blocks[W]) }) }
  const pasteWeekAt = (W) => {
    if (!weekClip || W < 1) return
    mutate(p => {
      const maxW = Math.max(0, ...Object.keys(p.blocks).map(Number))
      for (let k = maxW + 1; k < W; k++) p.blocks[k] = {}   // fill any gap with empty weeks
      p.blocks[W] = clone(weekClip.block); p.blocks[W].pctLabel = `Week ${W}`
    })
  }

  const Header = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <button onClick={onBack} style={linkBtn}>← Back to athletes</button>
        <span style={{ fontSize: 12, color: saveState === 'error' ? '#c00' : '#0a7', fontWeight: 700 }}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Save failed' : 'All changes saved'}
        </span>
      </div>
      <h2 style={{ margin: '0 0 2px', fontSize: 20, color: '#0a2540' }}>{prog.label}</h2>
      <div style={{ color: '#5a6b7b', fontSize: 13, marginBottom: 14 }}>{athleteName} · {weeks.length} week{weeks.length === 1 ? '' : 's'} · on Week {currentWeek}</div>
    </>
  )

  // -------- Dated month calendar --------
  if (view === 'calendar') {
    const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const gridStart = sundayOf(monthStart)
    const todayY = ymd(new Date())
    const rows = Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) => addDays(gridStart, r * 7 + c)))
    const visibleRows = rows.filter(row => row.some(d => d.getMonth() === monthCursor.getMonth()))
    const gotoMonth = (delta) => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1))
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <Header />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
            <button onClick={() => gotoMonth(-1)} style={navBtn}>‹</button>
            <span style={{ fontWeight: 900, fontSize: 17, color: '#0a2540', minWidth: 150, textAlign: 'center' }}>{MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}</span>
            <button onClick={() => gotoMonth(1)} style={navBtn}>›</button>
            <button onClick={() => setMonthCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} style={btnLight}>Today</button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#5a6b7b', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Program starts <input type="date" value={startDate} onChange={e => saveStartDate(e.target.value)} style={{ border: '1px solid #bbccdb', borderRadius: 4, padding: '5px 6px', fontFamily: 'inherit', fontSize: 12 }} /></span>
          </div>
          {weekClip && (
            <div style={{ marginBottom: 8, background: '#e6f8ef', border: '1px solid #9fdcc0', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: '#0a6', display: 'flex', alignItems: 'center', gap: 8 }}>
              Week {weekClip.w} copied — click <b>paste</b> on any week to drop it in.
              <button onClick={() => setWeekClip(null)} style={{ ...miniLink, color: '#0a6', marginLeft: 'auto' }}>clear</button>
            </div>
          )}
          <div style={{ background: '#fff', border: '1px solid #cdd8e3', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(7,1fr)' }}>
              <div style={{ background: '#eef3f8', borderBottom: '1px solid #cdd8e3' }} />
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(h => (
                <div key={h} style={{ padding: '7px 6px', textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#5a6b7b', background: '#eef3f8', borderBottom: '1px solid #cdd8e3' }}>{h}</div>
              ))}
              {visibleRows.map((row, ri) => {
                const W = weekIndexForDate(row[1])
                const hasWeek = W >= 1 && !!prog.blocks[W]
                return (
                  <Fragment key={ri}>
                    <div style={{ borderRight: '1px solid #f0f4f8', borderBottom: '1px solid #f0f4f8', padding: 6, background: '#fafcfe', fontSize: 10 }}>
                      {W >= 1 && <div style={{ fontWeight: 800, color: '#0a2540', marginBottom: 3 }}>Wk {W}</div>}
                      {hasWeek && <button onClick={() => copyWeekAt(W)} style={{ ...miniLink, display: 'block' }}>copy</button>}
                      {W >= 1 && weekClip && <button onClick={() => pasteWeekAt(W)} style={{ ...miniLink, color: '#0a7', display: 'block', marginTop: 2 }}>paste</button>}
                    </div>
                    {row.map((dt, ci) => {
                      const y = ymd(dt)
                      const inMonth = dt.getMonth() === monthCursor.getMonth()
                      const info = cellMap[y]
                      const s = info ? prog.blocks[info.w][info.d] : null
                      const done = info ? dayLogged(info.w, info.d) : false
                      const isToday = y === todayY
                      return (
                        <div key={ci} onClick={() => info && openDay(info.w, info.d)}
                          style={{ minHeight: 88, borderRight: '1px solid #f0f4f8', borderBottom: '1px solid #f0f4f8', padding: 6, background: inMonth ? '#fff' : '#f7fafc', cursor: info ? 'pointer' : 'default' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#fff' : (inMonth ? '#5a6b7b' : '#c3cfda'), background: isToday ? '#0a7' : 'transparent', borderRadius: 10, width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{dt.getDate()}</div>
                          {s && (
                            <div style={{ marginTop: 4, background: done ? '#e6f8ef' : '#eef3f8', borderLeft: `3px solid ${done ? '#0a7' : '#00a3cc'}`, borderRadius: 4, padding: '4px 6px' }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: '#0a2540', lineHeight: 1.15 }}>{(s.header || '').split('—').slice(1).join('—').trim() || (s.header || 'Session')}</div>
                              <div style={{ fontSize: 9, color: '#5a6b7b', marginTop: 1 }}>{s.exercises?.length || 0} ex {done && <span style={{ color: '#0a7', fontWeight: 800 }}>✓</span>}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </Fragment>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 12 }}>
            <button onClick={addWeeks} style={btn}>+ Add</button>
            <input type="number" min="1" max="12" value={addN} onChange={e => setAddN(e.target.value)} style={{ width: 46, border: '1px solid #bbccdb', borderRadius: 4, padding: '7px 4px', fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }} />
            <span style={{ fontSize: 13, color: '#5a6b7b' }}>week(s) at the end. Click a session to edit; copy a week from inside a day.</span>
          </div>
          <div style={{ fontSize: 11, color: '#8a99a8', marginTop: 8 }}>Use <b>copy</b> / <b>paste</b> (left of each week) to copy a week and drop it onto a future week — the fast way to write the next month. Today is circled; green = the athlete logged it.</div>
        </div>
      </div>
    )
  }

  // -------- Day editor (drill-down) --------
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Header />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setView('calendar')} style={linkBtn}>← Calendar</button>
          <span style={{ fontWeight: 900, color: '#0a2540', fontSize: 15 }}>Week {wk}</span>
          <span style={{ fontSize: 12, color: '#5a6b7b' }}>{(() => { const dt = dateOfSession(wk, dayKey); return `${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getDate()}, ${dt.getFullYear()}` })()}</span>
          <button onClick={deleteWeek} style={{ ...miniLink, color: '#c00' }}>delete week</button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
            <button onClick={repeatWeek} title="Copy this whole week to the end, N times" style={btnLight}>Copy week →</button>
            <input type="number" min="1" max="12" value={addN} onChange={e => setAddN(e.target.value)} style={{ width: 40, border: '1px solid #bbccdb', borderRadius: 4, padding: '5px 4px', fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }} />
            <span style={{ fontSize: 12, color: '#5a6b7b' }}>× more</span>
          </span>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {days.map(d => {
            const active = d === dayKey
            const exists = !!wd[d]
            return (
              <button key={d} onClick={() => setDayKey(d)} style={{ ...pill, padding: '6px 12px', opacity: exists ? 1 : .45, background: active ? '#00a3cc' : '#fff', color: active ? '#fff' : '#0a2540' }}>
                {(dowFromHeader(wd[d]?.header) || d).slice(0, 3)}
              </button>
            )
          })}
        </div>

        {/* Day header + day actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <input value={day.header || ''} onChange={e => setHeader(e.target.value)} placeholder="Day header (e.g. Monday — Lower / Speed)"
            style={{ flex: 1, minWidth: 220, padding: '8px 10px', border: '1px solid #bbccdb', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#0a2540' }} />
          <button onClick={copyDay} style={btnLight}>Copy day</button>
          <button onClick={pasteDay} disabled={!clip} style={{ ...btnLight, opacity: clip ? 1 : .4 }}>Paste day</button>
          <button onClick={deleteDay} style={{ ...btnLight, color: '#c00', borderColor: '#e2b6b6' }}>Delete day</button>
        </div>

        {/* Exercises */}
        <div style={{ background: '#fff', border: '1px solid #cdd8e3', borderRadius: 8, overflow: 'hidden' }}>
          {(day.exercises || []).map((ex, i) => {
            const aSets = athleteSets(wk, dayKey, i)
            const aNote = athleteNote(wk, dayKey, i)
            return (
            <div key={i}
              style={{
                borderTop: i ? '1px solid #eef3f8' : 'none',
                borderLeft: ex.linked ? '3px solid #0a7' : '3px solid transparent',
                marginLeft: ex.linked ? 14 : 0,
              }}>
            <div
              draggable onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
              onDragOver={e => e.preventDefault()} onDrop={() => dropOn(i)}
              style={{
                display: 'flex', gap: 6, padding: '6px 8px', alignItems: 'center',
                background: drag === i ? '#eef7f2' : 'transparent',
              }}>
              <span title="Drag to reorder — moves the whole superset" style={{ cursor: 'grab', color: '#b7c3d0', fontSize: 14, userSelect: 'none' }}>⠿</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => moveExercise(i, -1)} title="Move up" style={arrow}>▲</button>
                <button onClick={() => moveExercise(i, 1)} title="Move down" style={arrow}>▼</button>
              </div>
              <span style={{ width: 28, textAlign: 'center', fontWeight: 900, fontSize: 12, color: ex.linked ? '#0a7' : '#0a2540' }}>{ex.series}</span>
              <input value={ex.exercise || ''} onChange={e => setExField(i, 'exercise', e.target.value)} placeholder="exercise" style={{ ...cell, flex: 1, fontWeight: 700 }} />
              <input value={ex.sets || ''} onChange={e => setExField(i, 'sets', e.target.value)} title="sets" style={{ ...cell, width: 40 }} />
              <span style={{ color: '#999', fontSize: 12 }}>×</span>
              <input value={ex.reps || ''} onChange={e => setExField(i, 'reps', e.target.value)} title="reps" style={{ ...cell, width: 52 }} />
              <input value={ex.note || ''} onChange={e => setExField(i, 'note', e.target.value)} placeholder="note / tempo / %" style={{ ...cell, flex: 1 }} />
              <button onClick={() => toggleLink(i)} disabled={i === 0} title={ex.linked ? 'Unlink from the exercise above' : 'Superset with the exercise above'}
                style={{ ...btnLight, padding: '5px 8px', fontSize: 11, color: ex.linked ? '#fff' : '#5a6b7b', background: ex.linked ? '#0a7' : '#fff', borderColor: ex.linked ? '#0a7' : '#bbccdb', opacity: i === 0 ? .3 : 1 }}>
                {ex.linked ? 'linked ✕' : '＋ link'}
              </button>
              <button onClick={() => removeExercise(i)} title="Remove" style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: '#c55', cursor: 'pointer', fontSize: 16, fontWeight: 800 }}>×</button>
            </div>
            {(aSets.length > 0 || aNote) && (
              <div style={{ padding: '2px 8px 8px', marginLeft: ex.linked ? 0 : 28, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {aSets.length > 0 && (
                  <div style={{ fontSize: 12, color: '#0a7' }}>
                    <span style={{ fontWeight: 800, color: '#5a6b7b' }}>Logged: </span>{aSets.join(' · ')}
                  </div>
                )}
                {aNote && (
                  <div style={{ fontSize: 12, color: '#0a2540', background: '#fff8e6', border: '1px solid #f0e2b0', borderRadius: 5, padding: '5px 8px' }}>
                    <span style={{ fontWeight: 800, color: '#a07b00' }}>📝 Athlete note: </span>{aNote}
                  </div>
                )}
              </div>
            )}
            </div>
          )})}
          {(day.exercises || []).length === 0 && <div style={{ padding: 14, color: '#98a7b5', fontSize: 13 }}>No exercises on this day. Add one, or paste a day.</div>}
          <div style={{ padding: 10, borderTop: '1px solid #eef3f8' }}>
            <button onClick={addExercise} style={btn}>+ Add exercise</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#8a99a8', marginTop: 8 }}>Tip: drag <b>⠿</b> (or ▲▼) to reorder — a linked superset moves as one unit. <b>＋ link</b> joins an exercise to the one above (A1 · A2 · A3); numbering updates automatically.</div>
      </div>
    </div>
  )
}

const lbl = { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5a6b7b', marginBottom: 3, marginRight: 4 }
const sel = { border: '1px solid #bbccdb', padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', borderRadius: 4, minWidth: 170 }
const cell = { border: '1px solid #dbe4ee', padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', borderRadius: 4, color: '#0a2540', minWidth: 0 }
const btn = { padding: '8px 18px', background: '#0a7', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }
const btnDark = { padding: '7px 14px', background: '#0a2540', color: '#fff', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }
const btnLight = { padding: '7px 12px', background: '#fff', color: '#0a2540', border: '1px solid #bbccdb', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }
const linkBtn = { background: 'transparent', border: 'none', color: '#0a7', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }
const pill = { padding: '6px 14px', borderRadius: 16, border: '1px solid #bbccdb', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const arrow = { border: 'none', background: 'transparent', color: '#8a99a8', cursor: 'pointer', fontSize: 9, lineHeight: 1, padding: '1px 2px' }
const calTh = { fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#5a6b7b', padding: '8px 6px', textAlign: 'center', background: '#eef3f8', borderBottom: '1px solid #cdd8e3' }
const calTd = { padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid #eef3f8', borderRight: '1px solid #f2f6fa', verticalAlign: 'top', minWidth: 96 }
const miniLink = { background: 'transparent', border: 'none', color: '#5a6b7b', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }
const navBtn = { width: 30, height: 30, borderRadius: 6, border: '1px solid #bbccdb', background: '#fff', color: '#0a2540', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1 }
