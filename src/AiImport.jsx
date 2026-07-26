import { useState } from 'react'

// "Build from a photo or notes" — sends typed text and/or a photo of a written
// program to the parse-program serverless function, which returns a structured
// template. The coach reviews, then saves it as a custom template + opens it in
// the builder to fine-tune.

const slugify = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)

function toTemplateJson(parsed) {
  const dayKeys = (parsed.days || []).map(d => d.key).filter(Boolean)
  const block1 = { pctLabel: 'Block 1' }
  ;(parsed.days || []).forEach(d => {
    if (!d.key) return
    block1[d.key] = {
      header: d.header || '',
      exercises: (d.exercises || []).map(e => {
        const lo = e.pctLo != null ? e.pctLo / 100 : null
        const hi = e.pctHi != null ? e.pctHi / 100 : lo
        return {
          series: e.series || '', exercise: e.exercise || '',
          sets: String(e.sets ?? ''), reps: String(e.reps ?? ''),
          pct: lo != null ? [lo, lo, hi] : null,
          prKey: e.prKey || null, note: e.note || '',
        }
      }),
    }
  })
  return { label: parsed.label || 'Imported Program', days: dayKeys, weeks: parsed.weeks || 3, blocks: { 1: block1 } }
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = String(reader.result)
      const comma = res.indexOf(',')
      resolve({ imageBase64: res.slice(comma + 1), mediaType: file.type || 'image/jpeg' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AiImport({ sb, allTemplates = {}, setCustomTemplates, setTier, setBlock, setTab }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [img, setImg] = useState(null)          // { imageBase64, mediaType, name }
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [parsed, setParsed] = useState(null)     // { label, weeks, days: [...] }
  const [saving, setSaving] = useState(false)

  async function pickImage(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const { imageBase64, mediaType } = await readImage(f)
    setImg({ imageBase64, mediaType, name: f.name })
  }

  async function build() {
    setErr(''); setParsed(null)
    if (!text.trim() && !img) { setErr('Paste some program text or attach a photo.'); return }
    setBusy(true)
    try {
      const res = await fetch('/.netlify/functions/parse-program', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() || undefined, imageBase64: img?.imageBase64, mediaType: img?.mediaType }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(data.error || `Request failed (${res.status}).`); return }
      if (!data.template?.days?.length) { setErr('No program could be read from that.'); return }
      setParsed(data.template)
    } catch (e) {
      setErr('Could not reach the importer. If this just deployed, give it a minute.')
    } finally { setBusy(false) }
  }

  async function saveAndOpen() {
    if (!parsed) return
    setSaving(true)
    const obj = toTemplateJson(parsed)
    let id = slugify(obj.label) || 'imported_program'
    if (allTemplates[id] && !id.startsWith('imported_')) id = 'imported_' + id
    const { error } = await sb.from('custom_templates').upsert(
      { id, template_json: JSON.stringify(obj), updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    setSaving(false)
    if (error) { setErr('Save failed: ' + error.message); return }
    setCustomTemplates?.(prev => ({ ...prev, [id]: obj }))
    setTier?.(id); setBlock?.(1); setTab?.('builder')
  }

  const dayCount = parsed?.days?.length || 0
  const exCount = (parsed?.days || []).reduce((n, d) => n + (d.exercises?.length || 0), 0)

  return (
    <div style={{ background: 'linear-gradient(90deg,#0a2540,#0e3a5c)', color: '#fff', borderRadius: 10, padding: 14, margin: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 18 }}>✨</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Build from a photo or notes</div>
          <div style={{ fontSize: 12, opacity: .8 }}>Snap your legal pad or paste a program — AI turns it into an editable template.</div>
        </div>
        <span style={{ fontSize: 20 }}>{open ? '–' : '+'}</span>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
            placeholder={"Paste or type the program…\ne.g.\nMonday — Lower\nA1 Back Squat 4x5 @ 80%\nB1 RDL 3x8 3010\n..."}
            style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 6, border: 'none', fontFamily: 'monospace', fontSize: 13 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <label style={{ background: '#ffffff22', border: '1px solid #ffffff55', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              📷 {img ? img.name : 'Attach photo'}
              <input type="file" accept="image/*" onChange={pickImage} style={{ display: 'none' }} />
            </label>
            {img && <button onClick={() => setImg(null)} style={{ background: 'transparent', border: 'none', color: '#ffd', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>remove</button>}
            <button onClick={build} disabled={busy} style={{ marginLeft: 'auto', background: '#0a7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: busy ? .6 : 1 }}>
              {busy ? 'Reading…' : 'Build template'}
            </button>
          </div>

          {err && <div style={{ marginTop: 10, background: '#5a1d1d', border: '1px solid #a55', color: '#ffd9d9', padding: 10, borderRadius: 6, fontSize: 13 }}>{err}</div>}

          {parsed && (
            <div style={{ marginTop: 12, background: '#ffffff', color: '#0a2540', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{parsed.label}</div>
              <div style={{ fontSize: 12, color: '#5a6b7b', marginBottom: 8 }}>{dayCount} days · {exCount} exercises · {parsed.weeks || 3} weeks</div>
              {(parsed.days || []).map((d, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{d.header || d.key}</div>
                  {(d.exercises || []).map((e, j) => (
                    <div key={j} style={{ fontSize: 12, color: '#33465a', marginLeft: 8 }}>
                      <span style={{ color: '#5a6b7b' }}>{e.series}</span> {e.exercise} — {e.sets}×{e.reps}{e.note ? ` · ${e.note}` : ''}
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={saveAndOpen} disabled={saving} style={{ marginTop: 8, background: '#0a2540', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save template & open in builder →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
