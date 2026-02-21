import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://xxtomnbvinxuvnrrqnqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dG9tbmJ2aW54dXZucnJxbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk5MTksImV4cCI6MjA4NTc5NTkxOX0.Ty-KRgr9JsYr7ZEZtvm7lB2TxcdWeW1CCsJQdWyFND8'
)

function r5(v) { return Math.round(v / 5) * 5 }
function mkEx(s, e, st, r, p, pk, n) {
  return { series: s, exercise: e, sets: String(st), reps: String(r), pct: p || null, prKey: pk || null, note: n || '' }
}

const TEMPLATES = {
  beginner: {
    label: 'Athlete Beginner', blocks: {
      1: {
        dayA: { header: 'Hang Snatch + Squat', exercises: [mkEx('A1','Hang Snatch',4,'2'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','RFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'Power Pos Clean + Pull', exercises: [mkEx('A1','Hang Clean + Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','Deadlift',3,'5'),mkEx('D1','KOB Row',3,'8ea'),mkEx('D2','Dragon Flag',3,'8')] }
      },
      2: {
        dayA: { header: 'PP Snatch + OHS', exercises: [mkEx('A1','PP Snatch + OHS',4,'2+1'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','RFE Split Squat',3,'8ea')] },
        dayB: { header: 'PP Clean + Deadlift', exercises: [mkEx('A1','PP Clean + Push Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','KB Deadlift',4,'5'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','Farmers Carry',3,'1')] }
      },
      3: {
        maxWeek: 3,
        dayA: { header: 'Hang Snatch + Squat', exercises: [mkEx('A1','Hang Snatch',4,'2'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','RFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'Power Pos Clean + Pull', exercises: [mkEx('A1','Hang Clean + Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','Deadlift',4,'5'),mkEx('D1','SA Cable Row',3,'8'),mkEx('D2','Nordic Nose Dive',3,'8')] }
      }
    }
  },
  oly_athlete: {
    label: 'Oly Athlete', blocks: {
      1: {
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'PP Snatch + Hang Snatch', exercises: [mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',[0.65,0.65,0.75],'snatch'),mkEx('B1','Bench Press',3,'8',[0.60,0.60,0.70],'bench_press'),mkEx('C1','Front Squat',4,'5',[0.65,0.65,0.75],'front_squat'),mkEx('D1','Ipsilateral FFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'Pwr Pos Clean + Push Press', exercises: [mkEx('A1','Pwr Pos Clean + Push Press',4,'1+5',[0.65,0.65,0.75],'clean'),mkEx('B1','PP Clean + Hang Clean',4,'2+1',[0.65,0.65,0.75],'clean'),mkEx('C1','Deadlift',3,'8',[0.60,0.60,0.70],'deadlift'),mkEx('D1','Nordic Hamstring Curl',3,'8'),mkEx('D2','Chest Supported Row',3,'12')] }
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'Hang Snatch + Front Squat', exercises: [mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Front Squat',4,'3',[0.75,0.75,0.85],'front_squat'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','RFE Split Squat',3,'8ea')] },
        dayB: { header: 'PP Clean + Push Press', exercises: [mkEx('A1','PP Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','Deadlift',4,'5',[0.70,0.70,0.80],'deadlift'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','Farmers Carry',3,'1')] }
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only', maxWeek: 3,
        dayA: { header: 'Hang Snatch + Front Squat', exercises: [mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Front Squat',4,'3',[0.75,0.75,0.85],'front_squat'),mkEx('D1','Sled Push',3,'1'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'Power Pos Clean + Deadlift', exercises: [mkEx('A1','Hng Clean + Push Press',4,'1+2',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','Deadlift',3,'5',[0.75,0.75,0.90],'deadlift'),mkEx('D1','KOB Row',3,'8ea'),mkEx('D2','Dragon Flag',3,'8')] }
      }
    }
  },
  oly_adv: {
    label: 'Oly ADV Athlete', blocks: {
      1: {
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'PP Snatch + Hang Snatch + OHS', exercises: [mkEx('WU','Tall Snatch + OHS',1,'5+2',null,null,'bar'),mkEx('A1','PP Snatch + Hang Snatch + OHS',4,'1+2+1',[0.65,0.65,0.75],'snatch'),mkEx('B1','Bench Press',3,'8',[0.60,0.60,0.70],'bench_press'),mkEx('C1','Back Squat',3,'8',[0.60,0.60,0.70],'back_squat'),mkEx('D1','Ipsilateral FFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'Pwr Pos Clean + Push Press', exercises: [mkEx('WU','Tall Clean + Push Press',1,'5+5',null,null,'bar'),mkEx('A1','Pwr Pos Clean + Push Press',4,'1+5',[0.65,0.65,0.75],'clean'),mkEx('B1','PP Clean + Front Squat',4,'3+1',[0.65,0.65,0.75],'clean'),mkEx('C1','Hang Clean High Pull',4,'5',[0.85,0.85,0.95],'clean'),mkEx('D1','Chest Supported Rows',3,'12'),mkEx('D2','Glute Ham Nordics',3,'8')] }
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'Hang Snatch + OHS + Back Squat', exercises: [mkEx('WU','Tall Snatch + OHS',1,'5+2',null,null,'bar'),mkEx('A1','Hang Snatch + OHS',4,'2+1',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Back Squat',4,'5',[0.70,0.70,0.80],'back_squat'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','Nordic Nose Dives',3,'8')] },
        dayB: { header: 'Hang Clean + Push Press', exercises: [mkEx('WU','Tall Clean + Push Press',1,'5+5',null,null,'bar'),mkEx('A1','Hang Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean + Front Squat',4,'2+1',[0.75,0.75,0.85],'clean'),mkEx('C1','PAK Clean Pull',4,'3',[0.95,0.95,1.05],'clean'),mkEx('D1','Chainsaw Row',3,'8'),mkEx('D2','SS DBL DB RDL',3,'8ea')] }
      },
      3: {
        pctLabel: '75-90%', w1note: '75% only', maxWeek: 3,
        dayA: { header: 'Hang Snatch + Back Squat', exercises: [mkEx('WU','Tall Snatch + OHS',1,'5+2',null,null,'bar'),mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.90],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Back Squat',4,'5',[0.70,0.70,0.80],'back_squat'),mkEx('D1','Flywheel Rotation',3,'10'),mkEx('D2','Chin Up',3,'AMAP')] },
        dayB: { header: 'Hang Clean + Push Press + Pull', exercises: [mkEx('WU','Tall Clean + Push Press',1,'5+5',null,null,'bar'),mkEx('A1','Hang Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',[1.00,1.00,1.20],'clean'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','45 Deg SL Back Extension',3,'8ea')] }
      }
    }
  }
}

export default function App() {
  const [athletes, setAthletes] = useState([])
  const [prs, setPrs] = useState({})
  const [athleteId, setAthleteId] = useState(null)
  const [tier, setTier] = useState('beginner')
  const [block, setBlock] = useState(1)
  const [search, setSearch] = useState('')
  const [showDrop, setShowDrop] = useState(false)
  const [status, setStatus] = useState('Loading...')
  const [edits, setEdits] = useState({})

  useEffect(() => {
    async function load() {
      const { data: ath, error } = await sb.from('athletes').select('id,first_name,last_name').eq('status', 'Active').order('first_name')
      if (error) { setStatus('Error: ' + error.message); return }
      setAthletes(ath)
      setStatus('Loaded ' + ath.length + ' athletes. Fetching PRs...')
      let all = [], from = 0
      while (true) {
        const { data } = await sb.from('results').select('athlete_id,test_id,converted_value').range(from, from + 499)
        if (data) all = [...all, ...data]
        if (!data || data.length < 500) break
        from += 500
      }
      const map = {}
      all.forEach(r => { const k = r.athlete_id + '-' + r.test_id; const v = parseFloat(r.converted_value); if (!map[k] || v > map[k]) map[k] = v })
      setPrs(map)
      setStatus('Ready')
    }
    load()
  }, [])

  const getPR = (aId, tid) => prs[aId + '-' + tid] || null
  const tD = TEMPLATES[tier]
  const bD = tD.blocks[block]
  const isOly = tier !== 'beginner'
  const ath = athletes.find(a => a.id === athleteId)
  const filtered = athletes.filter(a => (a.first_name + ' ' + a.last_name).toLowerCase().includes(search.toLowerCase()))

  const getExs = (day) => bD[day].exercises.map((ex, i) => {
    const k = tier + '-' + block + '-' + day + '-' + i
    return edits[k] ? { ...ex, ...edits[k] } : ex
  })

  const setEdit = (day, i, f, v) => {
    const k = tier + '-' + block + '-' + day + '-' + i
    setEdits(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [f]: v } }))
  }

  const PKS = [['snatch','SNT'],['clean','CLN'],['front_squat','FS'],['back_squat','BS'],['bench_press','BN'],['deadlift','DL']]

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh', fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
      {/* STATUS */}
      {status !== 'Ready' && (
        <div style={{ background: '#fffbe6', border: '1px solid #ddb', padding: '8px 16px', fontSize: 12, color: '#665500' }}>{status}</div>
      )}

      {/* CONTROLS */}
      <div style={{ background: '#fff', borderBottom: '2px solid #111', padding: '10px 16px', display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {/* Template */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }}>Template</div>
          <select value={tier} onChange={e => { setTier(e.target.value); setBlock(1) }} style={{ border: '1px solid #bbb', padding: '6px 8px', fontSize: 13 }}>
            {Object.entries(TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </div>

        {/* Block */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }}>Block</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3].map(b => (
              <button key={b} onClick={() => setBlock(b)} style={{ padding: '6px 18px', border: '1px solid #bbb', background: block === b ? '#111' : '#fff', color: block === b ? '#fff' : '#555', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{b}</button>
            ))}
          </div>
        </div>

        {/* Athlete Search */}
        <div style={{ position: 'relative', minWidth: 220 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }}>Athlete</div>
          {ath && !showDrop ? (
            <div onClick={() => setShowDrop(true)} style={{ padding: '6px 10px', border: '1px solid #e8b000', background: '#fffbe6', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 700 }}>
              <span>{ath.first_name} {ath.last_name}</span>
              <span onClick={e => { e.stopPropagation(); setAthleteId(null); setSearch('') }} style={{ color: '#999', marginLeft: 8 }}>×</span>
            </div>
          ) : (
            <div>
              <input autoFocus={showDrop} value={search} onChange={e => { setSearch(e.target.value); setShowDrop(true) }} onFocus={() => setShowDrop(true)} placeholder="Search athlete..." style={{ width: '100%', padding: '6px 8px', border: '1px solid #bbb', fontSize: 13 }} />
              {showDrop && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #999', borderTop: 'none', maxHeight: 240, overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  {filtered.slice(0, 40).map(a => (
                    <div key={a.id} onMouseDown={() => { setAthleteId(a.id); setSearch(''); setShowDrop(false) }} style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={e => e.target.style.background = '#f0f0f0'} onMouseLeave={e => e.target.style.background = '#fff'}>
                      {a.first_name} {a.last_name}
                    </div>
                  ))}
                  {filtered.length === 0 && <div style={{ padding: '8px 10px', color: '#aaa' }}>No results</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {ath && <button onClick={() => window.print()} style={{ padding: '7px 20px', background: '#111', border: 'none', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', marginLeft: 'auto' }}>Print / PDF</button>}
      </div>

      {/* SHEET */}
      <div style={{ maxWidth: 800, margin: '14px auto', background: '#fff', padding: '18px 22px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '2px solid #111' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>{tD.label} — Block {block}</div>
            <div style={{ fontSize: 15, color: ath ? '#111' : '#aaa', marginTop: 3, fontWeight: 600 }}>{ath ? ath.first_name + ' ' + ath.last_name : 'Select an athlete above'}</div>
            {isOly && bD.pctLabel && <div style={{ fontSize: 10, color: '#777', marginTop: 3, letterSpacing: 1 }}>Range: {bD.pctLabel}{bD.w1note ? ' | Wk 1: ' + bD.w1note : ''}{bD.maxWeek ? ' | Wk ' + bD.maxWeek + ': MAX' : ''}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.5 }}>
            <div style={{ fontSize: 22, letterSpacing: 4 }}>WS</div>
            WILMINGTON<br />STRENGTH
          </div>
        </div>

        {/* PR Bar */}
        <div style={{ display: 'flex', border: '1px solid #ccc', marginBottom: 12, overflow: 'hidden' }}>
          {PKS.map(([k, lb]) => {
            const v = ath ? getPR(ath.id, k) : null
            return (
              <div key={k} style={{ flex: 1, textAlign: 'center', padding: '5px 4px', borderRight: '1px solid #ccc' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#777' }}>{lb}</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: v ? '#111' : '#ccc' }}>{v ? Math.round(v) : '—'}</div>
              </div>
            )
          })}
        </div>

        {/* Days */}
        {['dayA', 'dayB'].map((dk, di) => (
          <DayTable key={dk} dk={dk} label={di === 0 ? 'A Day' : 'B Day'} day={bD[dk]} exs={getExs(dk)} isOly={isOly} mw={bD.maxWeek || null} ath={ath} getPR={getPR} setEdit={setEdit} />
        ))}
      </div>

      <style>{`
        @media print {
          @page { size: letter portrait; margin: 0.45in }
          body { background: white !important }
          #controls, #status { display: none !important }
        }
      `}</style>
    </div>
  )
}

function DayTable({ dk, label, day, exs, isOly, mw, ath, getPR, setEdit }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '4px 10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        {label} — {day.header}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 30 }} /><col style={{ width: 185 }} /><col /><col /><col /><col />
        </colgroup>
        <thead>
          <tr>
            {['#', 'Exercise  Sets×Reps', 'Week 1', 'Week 2', 'Week 3', 'Week 4'].map((h, i) => (
              <th key={i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid #111', borderRight: '1px solid #ccc', padding: '4px 5px', textAlign: i <= 1 ? 'left' : 'center', color: '#444', background: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exs.map((ex, i) => <ExRow key={i} ex={ex} i={i} dk={dk} isOly={isOly} mw={mw} ath={ath} getPR={getPR} setEdit={setEdit} isLast={i === exs.length - 1} />)}
        </tbody>
      </table>
    </div>
  )
}

function ExRow({ ex, i, dk, isOly, mw, ath, getPR, setEdit, isLast }) {
  const pr = ath && ex.prKey ? getPR(ath.id, ex.prKey) : null
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')

  const startEdit = (f, cur) => { setEditing(f); setEditVal(cur) }
  const finishEdit = (f) => { if (editVal.trim()) setEdit(dk, i, f, editVal.trim()); setEditing(null) }

  const cellStyle = { borderBottom: isLast ? '2px solid #111' : '1px solid #ddd', borderRight: '1px solid #ddd', padding: 0, verticalAlign: 'top' }

  const wkCell = (wk) => {
    if (mw && wk === mw && ex.pct) return (
      <td key={wk} style={cellStyle}>
        <div style={{ fontSize: 9, fontWeight: 800, textAlign: 'center', borderBottom: '1.5px solid #999', height: 36, paddingTop: 10, margin: 3 }}>MAX ___</div>
      </td>
    )
    let hint = ''
    if (isOly && ex.pct) {
      if (wk === 1 && pr) hint = r5(pr * ex.pct[0]) + ' lbs'
      if ((wk === 2 || wk === 3) && pr) { const lo = r5(pr * ex.pct[1]), hi = r5(pr * ex.pct[2]); hint = lo === hi ? lo + ' lbs' : lo + '–' + hi }
    }
    return (
      <td key={wk} style={cellStyle}>
        <div style={{ fontSize: 9, color: '#888', minHeight: 12, paddingLeft: 2 }}>{hint || ' '}</div>
        <div style={{ borderBottom: '1.5px solid #aaa', height: 36, margin: '3px 4px 0' }}></div>
      </td>
    )
  }

  const editable = (f, val) => editing === f ? (
    <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
      onBlur={() => finishEdit(f)} onKeyDown={e => { if (e.key === 'Enter') finishEdit(f); if (e.key === 'Escape') setEditing(null) }}
      style={{ border: 'none', borderBottom: '2px solid #111', background: 'transparent', font: 'inherit', outline: 'none', padding: 0, width: '100%' }} />
  ) : (
    <span onClick={() => startEdit(f, val)} style={{ cursor: 'pointer', borderBottom: '1px dashed #bbb' }}>{val}</span>
  )

  return (
    <tr style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
      <td style={{ ...cellStyle, textAlign: 'center', fontWeight: 800, fontSize: 10, padding: '6px 2px' }}>{editable('series', ex.series)}</td>
      <td style={{ ...cellStyle, padding: '4px 6px' }}>
        <div style={{ fontSize: 11, fontWeight: 700 }}>{editable('exercise', ex.exercise)}</div>
        <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>
          {editable('sets', ex.sets)} × {editable('reps', ex.reps)}
          {ex.note && <span style={{ fontStyle: 'italic', color: '#888' }}> — {ex.note}</span>}
        </div>
      </td>
      {[1, 2, 3, 4].map(wk => wkCell(wk))}
    </tr>
  )
}
