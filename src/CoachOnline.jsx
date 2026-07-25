import { useState, useEffect } from 'react'

// Coach-side "Online Programming" tab. Fully self-contained: it loads its own
// data via the passed-in supabase client and shares NOTHING with the paper
// template builder, so a bug here can never affect the paper programs.

const today = () => new Date().toISOString().slice(0, 10)

function totalSessions(tmpl) {
  if (!tmpl?.blocks) return 0
  const blocks = Object.keys(tmpl.blocks).length
  const weeks = tmpl.weeks || 3
  const days = (tmpl.days || []).length
  return blocks * weeks * days
}

export default function CoachOnline({ athletes = [], allTemplates = {}, sb }) {
  const [assignments, setAssignments] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [athleteId, setAthleteId] = useState('')
  const [programId, setProgramId] = useState('matts_online')
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState('')

  const programList = Object.entries(allTemplates).map(([id, t]) => ({ id, label: t.label || id }))
  const nameOf = (id) => { const a = athletes.find(x => x.id === id); return a ? `${a.first_name} ${a.last_name}`.trim() : `Athlete ${id}` }

  async function loadAll() {
    setLoading(true)
    const { data: asn } = await sb.from('assignments').select('*').eq('active', true).order('created_at', { ascending: false })
    let all = [], from = 0
    while (true) {
      const { data, error } = await sb.from('workout_logs')
        .select('athlete_id,template,block,week,day,ex_index,ex_name,set_index,value,logged_at')
        .range(from, from + 999)
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
    await sb.from('assignments').update({ active: false }).eq('athlete_id', aId).eq('active', true)
    const { error } = await sb.from('assignments').insert({ athlete_id: aId, template: programId, active: true, start_date: today() })
    if (error) { setMsg('Error: ' + error.message); return }
    setMsg(`Assigned ${allTemplates[programId]?.label || programId} to ${nameOf(aId)}.`)
    setAthleteId('')
    loadAll()
  }

  // progress for one active assignment
  function progressFor(a) {
    const tmpl = allTemplates[a.template]
    const total = totalSessions(tmpl)
    const mine = logs.filter(l => l.athlete_id === a.athlete_id && l.template === a.template && l.value != null && String(l.value).trim() !== '')
    const sessions = new Set(mine.map(l => `${l.block}-${l.week}-${l.day}`))
    const done = sessions.size
    const last = mine.reduce((m, l) => (l.logged_at && l.logged_at > m ? l.logged_at : m), '')
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, last, due: total > 0 && done >= total }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '80vh', padding: 16 }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#0a2540' }}>Online Programming</h2>
          <span style={{ background: '#0a7', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 10, letterSpacing: 1 }}>SEPARATE FROM PAPER</span>
        </div>
        <p style={{ color: '#5a6b7b', fontSize: 12, marginTop: 2 }}>Assign an online program to an athlete, track their logging, and see when they’re due for the next block. Athletes see it at <b>/athlete</b>.</p>

        {/* Assign */}
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

        {/* Roster */}
        <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#0a2540', marginBottom: 8 }}>
          Assigned athletes {loading ? '' : `(${assignments.length})`}
        </div>
        {loading && <div style={{ color: '#5a6b7b', fontSize: 13 }}>Loading…</div>}
        {!loading && assignments.length === 0 && <div style={{ color: '#5a6b7b', fontSize: 13 }}>No active assignments yet.</div>}

        {assignments.map(a => {
          const p = progressFor(a)
          const isOpen = expanded === a.athlete_id + '-' + a.template
          return (
            <div key={a.id} style={{ background: '#fff', border: `1px solid ${p.due ? '#e0a500' : '#cdd8e3'}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#0a2540' }}>{nameOf(a.athlete_id)}</div>
                  <div style={{ fontSize: 12, color: '#5a6b7b' }}>{allTemplates[a.template]?.label || a.template}</div>
                </div>
                {p.due
                  ? <span style={{ background: '#e0a500', color: '#fff', fontWeight: 800, fontSize: 11, padding: '4px 10px', borderRadius: 12, letterSpacing: .5 }}>DUE FOR NEW</span>
                  : <span style={{ color: '#5a6b7b', fontSize: 12 }}>{p.done}/{p.total} sessions</span>}
              </div>
              <div style={{ height: 7, background: '#e6edf3', borderRadius: 6, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.due ? '#e0a500' : '#0a7', transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#5a6b7b' }}>{p.pct}% logged{p.last ? ` · last active ${p.last.slice(0, 10)}` : ' · not started'}</span>
                <button onClick={() => setExpanded(isOpen ? null : a.athlete_id + '-' + a.template)} style={linkBtn}>{isOpen ? 'Hide log' : 'View log'}</button>
              </div>
              {isOpen && <SessionLog logs={logs.filter(l => l.athlete_id === a.athlete_id && l.template === a.template)} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionLog({ logs }) {
  // group by block-week-day
  const groups = {}
  logs.forEach(l => {
    if (l.value == null || String(l.value).trim() === '') return
    const k = `${l.block}-${l.week}-${l.day}`
    if (!groups[k]) groups[k] = {}
    const ex = l.ex_name || `Exercise ${l.ex_index}`
    if (!groups[k][ex]) groups[k][ex] = []
    groups[k][ex][l.set_index] = l.value
  })
  const keys = Object.keys(groups).sort()
  if (!keys.length) return <div style={{ marginTop: 10, fontSize: 12, color: '#98a7b5' }}>Nothing logged yet.</div>
  const dayName = (d) => ({ dayA: 'Mon', dayB: 'Tue', dayC: 'Wed', dayD: 'Thu', dayE: 'Sat' }[d] || d)
  return (
    <div style={{ marginTop: 12, borderTop: '1px solid #e6edf3', paddingTop: 10 }}>
      {keys.map(k => {
        const [b, w, d] = k.split('-')
        return (
          <div key={k} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#0a2540' }}>Block {b} · Week {w} · {dayName(d)}</div>
            {Object.entries(groups[k]).map(([ex, sets]) => (
              <div key={ex} style={{ fontSize: 12, color: '#33465a', marginLeft: 8 }}>
                <span style={{ color: '#5a6b7b' }}>{ex}:</span> {sets.filter(v => v != null && String(v).trim() !== '').join(' · ')}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

const lbl = { fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5a6b7b', marginBottom: 3 }
const sel = { border: '1px solid #bbccdb', padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', borderRadius: 4, minWidth: 170 }
const btn = { padding: '8px 20px', background: '#0a7', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4 }
const linkBtn = { background: 'transparent', border: 'none', color: '#0a7', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }
