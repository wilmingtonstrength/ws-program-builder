import { useState, useEffect } from 'react'
import { sb } from './supabaseClient'
import AthletePortal from './AthletePortal'

// Athlete-facing entry, served at /athlete. The coach builder stays at "/"
// with no login (unchanged). Passwordless BETA login: email -> athletes-table
// lookup. Upgrade path: Supabase magic-link auth.
const COACH_EMAILS = ['matt@wilmingtonstrength.com']
const NAVY = '#0a1628', CARD = '#0f2035', ACCENT = '#00d4ff', MUTED = '#5b7a9c', TEXT = '#e8f1fb', BORDER = '#1d3350'
const SESSION_KEY = 'ws_athlete_session'

// Coach preview: /athlete?preview=<athlete id> shows that athlete's portal exactly
// as they see it, read-only (nothing typed is saved) and without touching the
// coach's own athlete login.
function CoachPreview({ id, onBack }) {
  const [athlete, setAthlete] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    sb.from('athletes').select('id,first_name,last_name,email').eq('id', id).limit(1)
      .then(({ data, error }) => { if (error || !data?.length) setErr('Athlete not found.'); else setAthlete(data[0]) })
  }, [id])
  if (err) return <div style={{ minHeight: '100vh', background: NAVY, color: TEXT, padding: 30, fontFamily: "'Archivo', system-ui, sans-serif" }}>{err}</div>
  if (!athlete) return <div style={{ minHeight: '100vh', background: NAVY }} />
  return <AthletePortal key={athlete.id} athlete={athlete} preview onLogout={onBack || (() => window.close())} exitLabel={onBack ? '← All athletes' : 'Close'} />
}

// Coach signed in on the athlete side: pick any athlete with an online program
// and see their portal exactly as they do (read-only).
function CoachHome({ onLogout }) {
  const [rows, setRows] = useState(null)
  const [viewing, setViewing] = useState(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: asn } = await sb.from('assignments')
        .select('athlete_id,template,start_date,label:program_json->>label').eq('active', true)
      const ids = [...new Set((asn || []).map(a => a.athlete_id))]
      const { data: ath } = ids.length ? await sb.from('athletes').select('id,first_name,last_name').in('id', ids) : { data: [] }
      const name = (id) => { const a = (ath || []).find(x => x.id === id); return a ? `${a.first_name || ''} ${a.last_name || ''}`.replace(/\s+/g, ' ').trim() : `Athlete ${id}` }
      const list = (asn || []).map(a => ({ id: a.athlete_id, name: name(a.athlete_id), program: a.label || a.template }))
        .sort((x, y) => x.name.localeCompare(y.name))
      if (alive) setRows(list)
    })()
    return () => { alive = false }
  }, [])

  if (viewing) return <CoachPreview id={viewing} onBack={() => setViewing(null)} />
  return (
    <div style={{ minHeight: '100vh', background: NAVY, fontFamily: "'Archivo', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ color: ACCENT, fontWeight: 900, fontSize: 18, letterSpacing: .5 }}>Wilmington Strength</div>
            <div style={{ color: MUTED, fontSize: 12 }}>Coach view · tap an athlete to see their program</div>
          </div>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${MUTED}`, color: MUTED, borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Log out</button>
        </div>
        {!rows && <p style={{ color: MUTED }}>Loading athletes…</p>}
        {rows && rows.length === 0 && <p style={{ color: MUTED }}>No athletes have an online program yet.</p>}
        {(rows || []).map(r => (
          <button key={r.id} onClick={() => setViewing(r.id)} style={{ display: 'flex', width: '100%', textAlign: 'left', alignItems: 'center', gap: 10, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', color: TEXT, fontWeight: 800, fontSize: 16 }}>{r.name}</span>
              <span style={{ display: 'block', color: MUTED, fontSize: 12, marginTop: 2 }}>{r.program}</span>
            </span>
            <span style={{ color: ACCENT, fontWeight: 900, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AthleteApp() {
  const previewId = parseInt(new URLSearchParams(window.location.search).get('preview'))
  if (previewId) return <CoachPreview id={previewId} />
  return <AthleteLogin />
}

function AthleteLogin() {
  const [athlete, setAthlete] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const login = (a) => { localStorage.setItem(SESSION_KEY, JSON.stringify(a)); setAthlete(a) }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setAthlete(null) }

  if (athlete?.coach) return <CoachHome onLogout={logout} />
  if (athlete) return <AthletePortal athlete={athlete} onLogout={logout} />
  return <Login onLogin={login} />
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e?.preventDefault()
    const addr = email.trim().toLowerCase()
    if (!addr) return
    setErr(''); setBusy(true)
    try {
      if (COACH_EMAILS.includes(addr)) { onLogin({ coach: true }); return }
      const { data, error } = await sb
        .from('athletes').select('id,first_name,last_name,email')
        .ilike('email', addr).limit(1)
      if (error) { setErr('Lookup failed: ' + error.message); return }
      if (data && data.length) onLogin(data[0])
      else setErr('No athlete found with that email. Check with your coach.')
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Archivo', system-ui, sans-serif", padding: 20 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360, background: CARD, borderRadius: 16, padding: 28, border: `1px solid ${BORDER}` }}>
        <div style={{ color: ACCENT, fontWeight: 900, fontSize: 24, letterSpacing: .5, textAlign: 'center' }}>Wilmington Strength</div>
        <div style={{ color: MUTED, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 24 }}>Athlete Login</div>

        <label style={{ color: MUTED, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>EMAIL</label>
        <input
          value={email} onChange={e => setEmail(e.target.value)}
          type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
          style={{ width: '100%', boxSizing: 'border-box', marginTop: 6, marginBottom: 14, padding: '12px 14px', borderRadius: 10, border: `1px solid ${BORDER}`, background: '#132a45', color: TEXT, fontFamily: 'inherit', fontSize: 16 }}
        />
        {err && <div style={{ color: '#ff8a8a', fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: ACCENT, color: NAVY, fontFamily: 'inherit', fontWeight: 900, fontSize: 16, cursor: 'pointer', opacity: busy ? .6 : 1 }}>
          {busy ? 'Checking…' : 'View my program'}
        </button>
      </form>
    </div>
  )
}
