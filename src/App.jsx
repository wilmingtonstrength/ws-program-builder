import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://xxtomnbvinxuvnrrqnqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dG9tbmJ2aW54dXZucnJxbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk5MTksImV4cCI6MjA4NTc5NTkxOX0.Ty-KRgr9JsYr7ZEZtvm7lB2TxcdWeW1CCsJQdWyFND8'
)

function r5(v) { return Math.round(v / 5) * 5 }
function mkEx(s, e, st, r, p, pk, n) {
  return { series: s, exercise: e, sets: String(st), reps: String(r), pct: p || null, prKey: pk || null, note: n || '' }
}
const WU_A = mkEx('WU', 'Tall Snatch + OHS', 1, '5+1', null, null, 'bar')
const WU_B_press = mkEx('WU', 'Tall Clean + Press', 1, '5+5', null, null, 'bar')
const WU_B_pp = mkEx('WU', 'Tall Clean + Push Press', 1, '5+5', null, null, 'bar')

/* ===================== EXERCISE LIBRARY ===================== */
const LIBRARY = {
  'Snatch': [
    'Hang Snatch','Power Position Snatch','Low Hang Snatch','No Foot Snatch',
    'No Foot No Hook Snatch','Pause at Knee Snatch','Hang Power Snatch',
    'Power Position Power Snatch','Low Hang Power Snatch','Tall Snatch',
    'PP Snatch + OHS','Hang Snatch + OHS','3-Position Snatch',
  ],
  'Clean': [
    'Hang Clean','Power Position Clean','Low Hang Clean','No Foot Clean',
    'No Foot No Hook Clean','Pause at Knee Clean','Hang Power Clean',
    'Power Position Power Clean','Low Hang Power Clean','Tall Clean',
    'Hang Clean High Pull','PAK Clean Pull','Clean Pull',
    'Pause at Knee Clean Pull','3-Position Clean Pull',
    'Hang Snatch High Pull','Snatch Pull','Pause at Knee Snatch Pull','3-Position Snatch Pull',
  ],
  'Complex': [
    'Hang Clean + Push Press','PP Clean + Push Press','Hang Snatch + OHS',
    'PP Snatch + OHS','3-Position Clean','3-Position Snatch',
    'PP Snatch + Hang Snatch','PP Clean + Hang Clean',
    'Hang Clean + Front Squat','PAK Clean Pull + Clean Pull',
    'PP Clean + Push Press + Front Squat','Hang Clean + Push Jerk',
    'Tall Snatch + OHS','Tall Clean + Push Press','Tall Clean + Press',
  ],
  'Squat': [
    'Front Squat','Back Squat','Goblet Squat','OHS',
    'Front Squat HE','Back Squat HE','Goblet Squat HE',
    'Double KB Front Squat','Zercher Squat',
  ],
  'Overhead': [
    'Press','Push Press','Push Jerk','Power Jerk','Split Jerk',
    'Behind-the-Neck Press','Behind-the-Neck Push Jerk',
    'Behind-the-Neck Power Jerk','Behind-the-Neck Split Jerk',
    'SA KB Overhead Press','Double KB Overhead Press',
    'SA KB Push Press','Double KB Push Press',
  ],
  'Pulls / Hinge': [
    'Deadlift','Sumo Deadlift','Trap Bar Deadlift','KB Deadlift','RDL','DB RDL',
  ],
  'Horizontal Row': [
    'KOB Row','SA KOB Row','Chainsaw Row','Bent-Over Row',
    'Supinated Grip Bent-Over Row','Chest Supported Row',
    'Tripod Row','TRX Row','SA TRX Row','Flywheel Row','SA Cable Row',
  ],
  'Horizontal Press': [
    'Bench Press','DB Bench Press','DB Incline Press',
    'Push Up','Hand Release Push Up','Deficit Push Up','Dips',
  ],
  'Vertical Pull': [
    'Chin Up','Pull Up','Lat Pulldown','SA Lat Pulldown','Pullovers','Flywheel Lat Pulldown',
  ],
  'Unilateral / Single Leg': [
    'RFE Split Squat','FFE Split Squat','Ipsilateral Split Squat',
    'Contralateral Split Squat','Reverse Lunge','Split Squat',
    'Step Up','Single Leg Squat to Box','Skater Squat',
    'Sled Push','Sled Push/Pull','DBL KB Front Rack Walking Lunge',
  ],
  'Posterior Chain': [
    'SA/SL RDL','Split Stance RDL','KB Swing','Back Extension',
    '45-Deg Back Extension','SL 45-Deg Back Extension',
    'Glute Ham Raise','Nordic Hamstring Curl','Nordic Hip Hinge','Razor Curl',
  ],
  'Core Anterior': [
    'Plank','Plank Walk','Hollow Hold','Hollow Rocks','Dead Bug',
    'Reverse Crunch','Dragon Flag','Hanging Knee Raises','Toes to Bar',
    'Body Saw',"Miyagi's",'Mountain Climbers','Slider Mountain Climbers',
    'Oblique Mountain Climbers','Oblique Slider Mountain Climbers','Plank Pull Through',
  ],
  'Core Lateral': [
    'Side Plank','QL Raise','Copenhagen Plank','Paloff Press',
    'Flywheel Rotation','Suitcase Carry','SA Front Rack Carry',
    'Barbell Side Bend','Get-Up','KB Windmill',
    'Half Kneeling Flywheel Cable Lift','Half Kneeling Flywheel Cable Chop',
    'Landmine Anti-Rotation',
  ],
  'Shoulder Girdle': [
    'Isohold Lateral Raises','Pullovers','TRX Ys','TRX Ws','YWTs',
    'Trap Raises','Shrugs','Band Pull-Aparts','BPA Underhand',
    'DB External Shoulder Rotation','Band External Shoulder Rotation',
    'Bottoms-Up KB Carry',"Waiter's Walk",
  ],
  'Cardio / Conditioning': ['Rower','Bike','Runner','Jump Rope'],
}
const PATTERN_KEYS = Object.keys(LIBRARY)

/* ===================== TEMPLATES ===================== */
const TEMPLATES = {
  beginner: {
    label: 'Athlete Beginner', blocks: {
      1: {
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch',4,'2'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','RFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_press, mkEx('A1','Hang Clean + Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','Deadlift',3,'5'),mkEx('D1','KOB Row',3,'8ea'),mkEx('D2','Dragon Flag',3,'8')] }
      },
      2: {
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','PP Snatch + OHS',4,'2+1'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','RFE Split Squat',3,'8ea')] },
        dayB: { header: 'B Day', exercises: [WU_B_press, mkEx('A1','PP Clean + Push Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','KB Deadlift',4,'5'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','Farmers Carry',3,'1')] }
      },
      3: {
        maxWeek: 3,
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch',4,'2'),mkEx('B1','Bench Press',4,'5'),mkEx('C1','Front Squat',4,'3'),mkEx('D1','RFE Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_press, mkEx('A1','Hang Clean + Press',4,'1+3'),mkEx('B1','Hang Clean',4,'2'),mkEx('C1','Deadlift',4,'5'),mkEx('D1','SA Cable Row',3,'8'),mkEx('D2','Nordic Hamstring Curl',3,'8')] }
      }
    }
  },
  oly_athlete: {
    label: 'Oly Athlete', blocks: {
      1: {
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',[0.65,0.65,0.75],'snatch'),mkEx('B1','Bench Press',3,'8',[0.60,0.60,0.70],'bench_press'),mkEx('C1','Front Squat',4,'5',[0.65,0.65,0.75],'front_squat'),mkEx('D1','Ipsilateral Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','PP Clean + Push Press',4,'1+5',[0.65,0.65,0.75],'clean'),mkEx('B1','PP Clean + Hang Clean',4,'2+1',[0.65,0.65,0.75],'clean'),mkEx('C1','Deadlift',3,'8',[0.60,0.60,0.70],'deadlift'),mkEx('D1','Nordic Hamstring Curl',3,'8'),mkEx('D2','Chest Supported Row',3,'12')] }
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Front Squat',4,'3',[0.75,0.75,0.85],'front_squat'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','RFE Split Squat',3,'8ea')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','PP Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','Deadlift',4,'5',[0.70,0.70,0.80],'deadlift'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','Farmers Carry',3,'1')] }
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only', maxWeek: 3,
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Front Squat',4,'3',[0.75,0.75,0.85],'front_squat'),mkEx('D1','Sled Push',3,'1'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','Hang Clean + Push Press',4,'1+2',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','Deadlift',3,'5',[0.75,0.75,0.90],'deadlift'),mkEx('D1','KOB Row',3,'8ea'),mkEx('D2','Dragon Flag',3,'8')] }
      }
    }
  },
  oly_adv: {
    label: 'Oly ADV Athlete', blocks: {
      1: {
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','PP Snatch + Hang Snatch + OHS',4,'1+2+1',[0.65,0.65,0.75],'snatch'),mkEx('B1','Bench Press',3,'8',[0.60,0.60,0.70],'bench_press'),mkEx('C1','Back Squat',3,'8',[0.60,0.60,0.70],'back_squat'),mkEx('D1','Ipsilateral Split Squat',3,'8ea'),mkEx('D2','Chin Up',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','PP Clean + Push Press',4,'1+5',[0.65,0.65,0.75],'clean'),mkEx('B1','PP Clean + Front Squat',4,'3+1',[0.65,0.65,0.75],'clean'),mkEx('C1','Hang Clean High Pull',4,'5',[0.85,0.85,0.95],'clean'),mkEx('D1','Chest Supported Row',3,'12'),mkEx('D2','Glute Ham Raise',3,'8')] }
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch + OHS',4,'2+1',[0.75,0.75,0.85],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Back Squat',4,'5',[0.70,0.70,0.80],'back_squat'),mkEx('D1','Chin Up',3,'8'),mkEx('D2','Nordic Hamstring Curl',3,'8')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','Hang Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean + Front Squat',4,'2+1',[0.75,0.75,0.85],'clean'),mkEx('C1','PAK Clean Pull',4,'3',[0.95,0.95,1.05],'clean'),mkEx('D1','Chainsaw Row',3,'8'),mkEx('D2','Split Stance RDL',3,'8ea')] }
      },
      3: {
        pctLabel: '75-90%', w1note: '75% only', maxWeek: 3,
        dayA: { header: 'A Day', exercises: [WU_A, mkEx('A1','Hang Snatch',4,'2',[0.75,0.75,0.90],'snatch'),mkEx('B1','Bench Press',4,'5',[0.70,0.70,0.80],'bench_press'),mkEx('C1','Back Squat',4,'5',[0.70,0.70,0.80],'back_squat'),mkEx('D1','Flywheel Rotation',3,'10'),mkEx('D2','Chin Up',3,'AMAP')] },
        dayB: { header: 'B Day', exercises: [WU_B_pp, mkEx('A1','Hang Clean + Push Press',4,'1+3',[0.75,0.75,0.85],'clean'),mkEx('B1','Hang Clean',4,'2',[0.75,0.75,0.85],'clean'),mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',[1.00,1.00,1.20],'clean'),mkEx('D1','SA KOB Row',3,'8ea'),mkEx('D2','45-Deg Back Extension',3,'8ea')] }
      }
    }
  }
}

/* ===================== EXERCISE COMBO INPUT ===================== */
function ExerciseInput({ value, onChange }) {
  const [pattern, setPattern] = useState(() => {
    for (const [p, exs] of Object.entries(LIBRARY)) {
      if (exs.includes(value)) return p
    }
    return ''
  })
  const [text, setText] = useState(value)
  const [showDrop, setShowDrop] = useState(false)
  const [filtered, setFiltered] = useState([])
  const ref = useRef(null)

  useEffect(() => { setText(value) }, [value])
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePatternChange = (p) => { setPattern(p); setFiltered(LIBRARY[p] || []); setShowDrop(true); setText('') }
  const handleTextChange = (e) => {
    const v = e.target.value; setText(v); onChange(v)
    if (pattern) { setFiltered((LIBRARY[pattern] || []).filter(ex => ex.toLowerCase().includes(v.toLowerCase()))); setShowDrop(true) }
  }
  const handleSelect = (ex) => { setText(ex); onChange(ex); setShowDrop(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <select value={pattern} onChange={e => handlePatternChange(e.target.value)}
        style={{ fontSize: 8, color: '#aaa', border: 'none', background: 'transparent', padding: '0 0 1px 0', cursor: 'pointer', width: '100%', outline: 'none' }}>
        <option value="">— pattern —</option>
        {PATTERN_KEYS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <input type="text" value={text} onChange={handleTextChange}
        onFocus={() => { if (pattern) { setFiltered(LIBRARY[pattern] || []); setShowDrop(true) } }}
        placeholder="exercise..."
        style={{ width: '100%', border: 'none', borderBottom: '1px dashed #bbb', background: 'transparent', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', outline: 'none', padding: '1px 0' }} />
      {showDrop && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #999', maxHeight: 180, overflowY: 'auto', zIndex: 9999, boxShadow: '0 4px 10px rgba(0,0,0,0.2)', minWidth: 200 }}>
          {filtered.map(ex => (
            <div key={ex} onMouseDown={() => handleSelect(ex)}
              style={{ padding: '5px 10px', cursor: 'pointer', fontSize: 11, borderBottom: '1px solid #f0f0f0' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              {ex}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===================== INLINE EDITABLE FIELD ===================== */
function EditField({ value, onChange, style = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  useEffect(() => { setVal(value) }, [value])
  const finish = () => { setEditing(false); if (val.trim()) onChange(val.trim()) }
  if (editing) return (
    <input autoFocus value={val} onChange={e => setVal(e.target.value)}
      onBlur={finish} onKeyDown={e => { if (e.key === 'Enter') finish(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
      style={{ border: 'none', borderBottom: '2px solid #111', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', outline: 'none', padding: 0, width: 40, ...style }} />
  )
  return <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc', ...style }}>{value}</span>
}

/* ===================== MAIN APP ===================== */
export default function App() {
  const [athletes, setAthletes] = useState([])
  const [prs, setPrs] = useState({})
  const [athleteId, setAthleteId] = useState(null)
  const [tier, setTier] = useState('beginner')
  const [block, setBlock] = useState(1)
  const [search, setSearch] = useState('')
  const [showAthDrop, setShowAthDrop] = useState(false)
  const [status, setStatus] = useState('Loading...')
  const [edits, setEdits] = useState({})
  const athRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: ath, error } = await sb.from('athletes').select('id,first_name,last_name').eq('status', 'Active').order('first_name')
      if (error) { setStatus('Error: ' + error.message); return }
      setAthletes(ath)
      setStatus('Fetching PRs...')
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

  useEffect(() => {
    const handler = (e) => { if (athRef.current && !athRef.current.contains(e.target)) setShowAthDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getPR = (aId, tid) => prs[aId + '-' + tid] || null
  const tD = TEMPLATES[tier]
  const bD = tD.blocks[block]
  const isOly = tier !== 'beginner'
  const ath = athletes.find(a => a.id === athleteId)
  const filteredAth = athletes.filter(a => (a.first_name + ' ' + a.last_name).toLowerCase().includes(search.toLowerCase()))

  const getExs = (day) => bD[day].exercises.map((ex, i) => {
    const k = tier + '-' + block + '-' + day + '-' + i
    return edits[k] ? { ...ex, ...edits[k] } : ex
  })
  const setEdit = (day, i, field, value) => {
    const k = tier + '-' + block + '-' + day + '-' + i
    setEdits(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [field]: value } }))
  }

  const PKS = [
    ['snatch','Snatch'],['clean','Clean'],['front_squat','Fr. Squat'],
    ['back_squat','Bk. Squat'],['bench_press','Bench'],['deadlift','Deadlift']
  ]

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
      {status !== 'Ready' && (
        <div className="no-print" style={{ background: '#fffbe6', borderBottom: '1px solid #ddb', padding: '5px 16px', fontSize: 11, color: '#665500' }}>{status}</div>
      )}

      {/* CONTROLS */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={lbl}>Template</div>
          <select value={tier} onChange={e => { setTier(e.target.value); setBlock(1); setEdits({}) }}
            style={{ border: '1px solid #bbb', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit' }}>
            {Object.entries(TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <div style={lbl}>Block</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3].map(b => (
              <button key={b} onClick={() => { setBlock(b); setEdits({}) }}
                style={{ padding: '5px 16px', border: '1px solid #bbb', background: block === b ? '#111' : '#fff', color: block === b ? '#fff' : '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div ref={athRef} style={{ position: 'relative', minWidth: 220 }}>
          <div style={lbl}>Athlete</div>
          {ath && !showAthDrop ? (
            <div onClick={() => setShowAthDrop(true)}
              style={{ padding: '5px 10px', border: '1px solid #e8b000', background: '#fffbe6', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 700, minWidth: 200 }}>
              <span>{ath.first_name} {ath.last_name}</span>
              <span onClick={e => { e.stopPropagation(); setAthleteId(null); setSearch('') }} style={{ color: '#999', marginLeft: 8, fontWeight: 400 }}>×</span>
            </div>
          ) : (
            <div>
              <input value={search} onChange={e => { setSearch(e.target.value); setShowAthDrop(true) }}
                onFocus={() => setShowAthDrop(true)} placeholder="Search athlete..."
                style={{ width: '100%', padding: '5px 8px', border: '1px solid #bbb', fontSize: 12, fontFamily: 'inherit' }} />
              {showAthDrop && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #999', borderTop: 'none', maxHeight: 220, overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                  {filteredAth.slice(0, 40).map(a => (
                    <div key={a.id} onMouseDown={() => { setAthleteId(a.id); setSearch(''); setShowAthDrop(false) }}
                      style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: 12 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      {a.first_name} {a.last_name}
                    </div>
                  ))}
                  {filteredAth.length === 0 && <div style={{ padding: '7px 10px', color: '#aaa' }}>No results</div>}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => window.print()}
          style={{ padding: '6px 18px', background: '#111', border: 'none', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', marginLeft: 'auto', fontFamily: 'inherit' }}>
          Print / PDF
        </button>
      </div>

      {/* SHEET */}
      <div id="sheet" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '14px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 7, borderBottom: '2px solid #111' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>{tD.label} — Block {block}</div>
            <div style={{ fontSize: 13, color: ath ? '#111' : '#aaa', marginTop: 2, fontWeight: 600 }}>
              {ath ? ath.first_name + ' ' + ath.last_name : 'Select an athlete above'}
            </div>
            {isOly && bD.pctLabel && (
              <div style={{ fontSize: 9, color: '#777', marginTop: 1, letterSpacing: 1 }}>
                Range: {bD.pctLabel}{bD.w1note ? ' | Wk 1: ' + bD.w1note : ''}{bD.maxWeek ? ' | Wk ' + bD.maxWeek + ': MAX' : ''}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.5 }}>
            <div style={{ fontSize: 20, letterSpacing: 4, fontWeight: 900 }}>WS</div>
            WILMINGTON<br />STRENGTH
          </div>
        </div>

        {/* PR Bar */}
        <div style={{ display: 'flex', border: '1.5px solid #999', marginBottom: 9, overflow: 'hidden' }}>
          {PKS.map(([k, lb], idx) => {
            const v = ath ? getPR(ath.id, k) : null
            return (
              <div key={k} style={{ flex: 1, textAlign: 'center', padding: '3px 2px', borderRight: idx < PKS.length - 1 ? '1px solid #bbb' : 'none' }}>
                <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#777' }}>{lb}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: v ? '#111' : '#ccc' }}>{v ? Math.round(v) : '—'}</div>
              </div>
            )
          })}
        </div>

        {/* Days */}
        {['dayA', 'dayB'].map((dk) => (
          <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} mw={bD.maxWeek || null} ath={ath} getPR={getPR} setEdit={setEdit} />
        ))}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media print {
          @page { size: letter portrait; margin: 0.3in }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important }
          #sheet { max-width: none !important; margin: 0 !important; padding: 6px !important; box-shadow: none !important }
        }
      `}</style>
    </div>
  )
}

const lbl = { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }

/* ===================== DAY TABLE ===================== */
function DayTable({ dk, day, exs, isOly, mw, ath, getPR, setEdit }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '3px 8px', background: '#efefef', borderBottom: '1px solid #aaa' }}>
        {day.header}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 26 }} />
          <col style={{ width: 190 }} />
          <col /><col /><col /><col />
        </colgroup>
        <thead>
          <tr>
            {['#', 'Exercise', 'Week 1', 'Week 2', 'Week 3', 'Week 4'].map((h, i) => (
              <th key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1.5px solid #111', borderRight: i < 5 ? '1px solid #bbb' : 'none', padding: '3px 4px', textAlign: i <= 1 ? 'left' : 'center', color: '#444', background: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exs.map((ex, i) => (
            <ExRow key={i} ex={ex} i={i} dk={dk} isOly={isOly} mw={mw} ath={ath} getPR={getPR} setEdit={setEdit} isLast={i === exs.length - 1} isWU={ex.series === 'WU'} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ===================== EXERCISE ROW ===================== */
function ExRow({ ex, i, dk, isOly, mw, ath, getPR, setEdit, isLast, isWU }) {
  const pr = ath && ex.prKey ? getPR(ath.id, ex.prKey) : null

  const tdBase = {
    borderBottom: isLast ? '1.5px solid #111' : '1px solid #ddd',
    borderRight: '1px solid #ddd',
    padding: 0,
    verticalAlign: 'top',
    background: isWU ? '#fafafa' : 'transparent',
  }

  const wkCell = (wk) => {
    if (isWU) return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? '1px solid #ddd' : 'none' }}>
        <div style={{ height: 32 }}></div>
      </td>
    )
    if (mw && wk === mw && ex.pct) return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? '1px solid #ddd' : 'none' }}>
        <div style={{ fontSize: 8, fontWeight: 800, textAlign: 'center', border: '1.5px solid #777', height: 28, paddingTop: 7, margin: '3px 4px' }}>MAX ___</div>
      </td>
    )
    let hint = ''
    if (isOly && ex.pct) {
      if (wk === 1 && pr) hint = r5(pr * ex.pct[0]) + ' lbs'
      if ((wk === 2 || wk === 3) && pr) {
        const lo = r5(pr * ex.pct[1]), hi = r5(pr * ex.pct[2])
        hint = lo === hi ? lo + ' lbs' : lo + '–' + hi
      }
    }
    return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? '1px solid #ddd' : 'none' }}>
        <div style={{ fontSize: 8, color: '#0055bb', minHeight: 11, paddingLeft: 3, fontWeight: hint ? 700 : 400 }}>{hint || '\u00a0'}</div>
        <div style={{ border: '1.5px solid #888', height: 28, margin: '2px 4px 3px' }}></div>
      </td>
    )
  }

  return (
    <tr>
      <td style={{ ...tdBase, borderRight: '1px solid #ddd', textAlign: 'center', padding: '4px 2px' }}>
        <EditField value={ex.series} onChange={v => setEdit(dk, i, 'series', v)} style={{ fontSize: 10, fontWeight: 800, color: isWU ? '#bbb' : '#111' }} />
      </td>
      <td style={{ ...tdBase, borderRight: '1px solid #ddd', padding: '3px 5px' }}>
        <ExerciseInput value={ex.exercise} onChange={v => setEdit(dk, i, 'exercise', v)} />
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 1 }}>
          <EditField value={ex.sets} onChange={v => setEdit(dk, i, 'sets', v)} style={{ fontSize: 13, fontWeight: 800 }} />
          <span style={{ fontSize: 11, color: '#555' }}>×</span>
          <EditField value={ex.reps} onChange={v => setEdit(dk, i, 'reps', v)} style={{ fontSize: 13, fontWeight: 800 }} />
          {ex.note && <span style={{ fontSize: 9, color: '#aaa', fontStyle: 'italic', marginLeft: 3 }}>{ex.note}</span>}
        </div>
      </td>
      {[1, 2, 3, 4].map(wk => wkCell(wk))}
    </tr>
  )
}
