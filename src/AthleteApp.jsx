import { useState } from 'react'
import { sb } from './supabaseClient'
import AthletePortal from './AthletePortal'

// Athlete-facing entry, served at /athlete. The coach builder stays at "/"
// with no login (unchanged). Passwordless BETA login: email -> athletes-table
// lookup. Upgrade path: Supabase magic-link auth.
const COACH_EMAILS = ['matt@wilmingtonstrength.com']
const NAVY = '#0a1628', CARD = '#0f2035', ACCENT = '#00d4ff', MUTED = '#5b7a9c', TEXT = '#e8f1fb', BORDER = '#1d3350'
const SESSION_KEY = 'ws_athlete_session'

export default function AthleteApp() {
  const [athlete, setAthlete] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const login = (a) => { localStorage.setItem(SESSION_KEY, JSON.stringify(a)); setAthlete(a) }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setAthlete(null) }

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
      if (COACH_EMAILS.includes(addr)) {
        setErr('That’s a coach account — use the main builder at the home page.')
        return
      }
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
