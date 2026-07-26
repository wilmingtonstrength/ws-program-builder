import { useState, useEffect, useRef } from 'react'

// Coach-side "Online Programs" tab. Assign a program to an athlete (which
// snapshots an editable copy), then edit that athlete's program as a calendar:
// add/edit/remove exercises, copy/paste days, and add blocks ("next 3 weeks").
// Fully self-contained — never touches the paper template builder.

const today = () => new Date().toISOString().slice(0, 10)
const clone = (o) => JSON.parse(JSON.stringify(o))
const dowFromHeader = (h) => (h || '').split('—')[0].trim()

function totalSessions(prog) {
  if (!prog?.blocks) return 0
  const blocks = Object.keys(prog.blocks).length
  const weeks = prog.weeks || 3
  const days = (prog.days || []).length
  return blocks * weeks * days
}

export default function CoachOnline({ athletes = [], allTemplates = {}, sb }) {
  const [assignments, setAssignments] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [athleteId, setAthleteId] = useState('')
  const [programId, setProgramId] = useState('matts_online')
  const [msg, setMsg] = useState('')
  const [editing, setEditing] = useState(null)   // the assignment being edited

  const programList = Object.entries(allTemplates).map(([id, t]) => ({ id, label: t.label || id }))
  const nameOf = (id) => { const a = athletes.find(x => x.id === id); return a ? `${a.first_name} ${a.last_name}`.trim() : `Athlete ${id}` }

  async function loadAll() {
    setLoading(true)
    const { data: asn } = await sb.from('assignments').select('*').eq('active', true).order('created_at', { ascending: false })
    let all = [], from = 0
    while (true) {
      const { data, error } = await sb.from('workout_logs')
        .select('athlete_id,template,block,week,day,value,logged_at').range(from, from + 999)
      if (error) break
      if (data) all = all.concat(data)
      if (!data || data.length < 1000) break
      from += 1000
    }
    setAssignments(asn || [])
    setLogs(all)
    setLoading(false)
  }
  useEffect(() => { loadAll() }, [])

  async function assign() {
    if (!athleteId || !programId) { setMsg('Pick an athlete and a program.'); return }
    const aId = parseInt(athleteId)
    setMsg('Assigning…')
    const snap = allTemplates[programId] ? clone(allTemplates[programId]) : null
    await sb.from('assignments').update({ active: false }).eq('athlete_id', aId).eq('active', true)
    const { error } = await sb.from('assignments').insert({
      athlete_id: aId, template: programId, active: true, start_date: today(), program_json: snap,
    })
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg(`Assigned ${allTemplates[programId]?.label || programId} to ${nameOf(aId)}.`)
    setAthleteId('')
    loadAll()
  }

  function progressFor(a) {
    const prog = a.program_json || allTemplates[a.template]
    const total = totalSessions(prog)
    const mine = logs.filter(l => l.athlete_id === a.athlete_id && l.template === a.template && l.value != null && String(l.value).trim() !== '')
    const done = new Set(mine.map(l => `${l.block}-${l.week}-${l.day}`)).size
    const last = mine.reduce((m, l) => (l.logged_at && l.logged_at > m ? l.logged_at : m), '')
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, last, due: total > 0 && done >= total }
  }

  if (editing) {
    return <ProgramEditor
      assignment={editing} allTemplates={allTemplates} sb={sb} athleteName={nameOf(editing.athlete_id)}
      onBack={() => { setEditing(null); loadAll() }}
    />
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#0a2540' }}>Online Programming</h2>
          <span style={{ background: '#0a7', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, letterSpacing: 1 }}>SEPARATE FROM PAPER</span>
        </div>
        <p style={{ color: '#5a6b7b', fontSize: 12, marginTop: 2 }}>Assign a program to an athlete, then open it to edit their calendar — add exercises, copy days, add the next 3 weeks. Athletes see it live at <b>/athlete</b>.</p>

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

// ---------------- Program editor (calendar) ----------------
function ProgramEditor({ assignment, allTemplates, sb, athleteName, onBack }) {
  const seed = assignment.program_json || (allTemplates[assignment.template] ? clone(allTemplates[assignment.template]) : { label: assignment.template, days: [], weeks: 3, blocks: {} })
  const [prog, setProg] = useState(seed)
  const [block, setBlock] = useState(Object.keys(seed.blocks || {}).map(Number).sort((a, b) => a - b)[0] || 1)
  const [dayKey, setDayKey] = useState((seed.days || [])[0] || 'dayA')
  const [clip, setClip] = useState(null)          // copied day
  const [saveState, setSaveState] = useState('saved')
  const timer = useRef(null)

  const blocks = Object.keys(prog.blocks || {}).map(Number).sort((a, b) => a - b)
  const days = prog.days || []
  const bd = prog.blocks?.[block] || {}
  const day = bd[dayKey] || { header: '', exercises: [] }

  function save(next) {
    setSaveState('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const { error } = await sb.from('assignments').update({ program_json: next }).eq('id', assignment.id)
      setSaveState(error ? 'error' : 'saved')
    }, 600)
  }
  function mutate(fn) {
    setProg(prev => { const next = clone(prev); fn(next); save(next); return next })
  }

  const setExField = (i, field, val) => mutate(p => { p.blocks[block][dayKey].exercises[i][field] = val })
  const addExercise = () => mutate(p => {
    if (!p.blocks[block][dayKey]) p.blocks[block][dayKey] = { header: '', exercises: [] }
    p.blocks[block][dayKey].exercises.push({ series: '', exercise: '', sets: '3', reps: '5', pct: null, prKey: null, note: '' })
  })
  const removeExercise = (i) => mutate(p => { p.blocks[block][dayKey].exercises.splice(i, 1) })
  const setHeader = (val) => mutate(p => { if (!p.blocks[block][dayKey]) p.blocks[block][dayKey] = { header: '', exercises: [] }; p.blocks[block][dayKey].header = val })
  const copyDay = () => setClip(clone(day))
  const pasteDay = () => { if (clip) mutate(p => { p.blocks[block][dayKey] = clone(clip) }) }
  const addBlock = () => mutate(p => {
    const keys = Object.keys(p.blocks).map(Number).sort((a, b) => a - b)
    const last = keys[keys.length - 1]
    const n = last + 1
    p.blocks[n] = clone(p.blocks[last])
    if (p.blocks[n].pctLabel) p.blocks[n].pctLabel = `Block ${n}`
    setTimeout(() => setBlock(n), 0)
  })

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={onBack} style={linkBtn}>← Back to athletes</button>
          <span style={{ fontSize: 12, color: saveState === 'error' ? '#c00' : '#0a7', fontWeight: 700 }}>
            {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Save failed' : 'All changes saved'}
          </span>
        </div>
        <h2 style={{ margin: '0 0 2px', fontSize: 20, color: '#0a2540' }}>{prog.label}</h2>
        <div style={{ color: '#5a6b7b', fontSize: 13, marginBottom: 14 }}>{athleteName}</div>

        {/* Block tabs + add block */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={lbl}>Block</span>
          {blocks.map(b => (
            <button key={b} onClick={() => setBlock(b)} style={{ ...pill, background: b === block ? '#0a2540' : '#fff', color: b === block ? '#fff' : '#0a2540' }}>{b}</button>
          ))}
          <button onClick={addBlock} style={{ ...pill, background: '#0a7', color: '#fff', border: 'none' }}>+ Next 3 weeks</button>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, flexWrap: 'wrap' }}>
          {days.map(d => {
            const active = d === dayKey
            return (
              <button key={d} onClick={() => setDayKey(d)} style={{ ...pill, padding: '6px 12px', background: active ? '#00a3cc' : '#fff', color: active ? '#fff' : '#0a2540' }}>
                {(dowFromHeader(bd[d]?.header) || d).slice(0, 3)}
              </button>
            )
          })}
        </div>

        {/* Day header + copy/paste */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input value={day.header || ''} onChange={e => setHeader(e.target.value)} placeholder="Day header (e.g. Monday — Lower / Speed)"
            style={{ flex: 1, padding: '8px 10px', border: '1px solid #bbccdb', borderRadius: 4, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#0a2540' }} />
          <button onClick={copyDay} style={btnLight}>Copy day</button>
          <button onClick={pasteDay} disabled={!clip} style={{ ...btnLight, opacity: clip ? 1 : .4 }}>Paste day</button>
        </div>

        {/* Exercise rows */}
        <div style={{ background: '#fff', border: '1px solid #cdd8e3', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 6, padding: '8px 10px', background: '#eef3f8', fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#5a6b7b', textTransform: 'uppercase' }}>
            <span style={{ width: 44 }}>Ord</span>
            <span style={{ flex: 1 }}>Exercise</span>
            <span style={{ width: 44 }}>Sets</span>
            <span style={{ width: 52 }}>Reps</span>
            <span style={{ flex: 1 }}>Note / tempo / %</span>
            <span style={{ width: 24 }} />
          </div>
          {(day.exercises || []).map((ex, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '6px 10px', borderTop: '1px solid #eef3f8', alignItems: 'center' }}>
              <input value={ex.series || ''} onChange={e => setExField(i, 'series', e.target.value)} style={{ ...cell, width: 44 }} />
              <input value={ex.exercise || ''} onChange={e => setExField(i, 'exercise', e.target.value)} style={{ ...cell, flex: 1, fontWeight: 700 }} />
              <input value={ex.sets || ''} onChange={e => setExField(i, 'sets', e.target.value)} style={{ ...cell, width: 44 }} />
              <input value={ex.reps || ''} onChange={e => setExField(i, 'reps', e.target.value)} style={{ ...cell, width: 52 }} />
              <input value={ex.note || ''} onChange={e => setExField(i, 'note', e.target.value)} style={{ ...cell, flex: 1 }} />
              <button onClick={() => removeExercise(i)} title="Remove" style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: '#c55', cursor: 'pointer', fontSize: 16, fontWeight: 800 }}>×</button>
            </div>
          ))}
          {(day.exercises || []).length === 0 && <div style={{ padding: 14, color: '#98a7b5', fontSize: 13 }}>No exercises on this day yet.</div>}
          <div style={{ padding: 10, borderTop: '1px solid #eef3f8' }}>
            <button onClick={addExercise} style={btn}>+ Add exercise</button>
          </div>
        </div>
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
