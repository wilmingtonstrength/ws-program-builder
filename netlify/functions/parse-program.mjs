import Anthropic from '@anthropic-ai/sdk'

// Serverless: turn a coach's handwritten/typed program (photo and/or text) into
// structured template JSON. The Anthropic API key stays here on the server.

const SYSTEM = `You convert a strength & conditioning coach's training program — handwritten on paper, or typed — into structured JSON. You are precise and never invent exercises, sets, reps, or loads that aren't in the source. If something is illegible or absent, omit it rather than guessing.`

const VALID_PRKEYS = ['back_squat','front_squat','bench_press','press','push_press','deadlift','clean','snatch','jerk']

const INSTRUCTIONS = `Read the program above and return ONLY a JSON object (no prose, no markdown fences) with this exact shape:

{
  "label": "short program name",
  "weeks": 3,
  "days": [
    {
      "key": "dayA",
      "header": "Monday — Focus (e.g. Lower / Speed)",
      "exercises": [
        {
          "series": "A1",           // ordering label like A1, B1, C1 (infer if not written)
          "exercise": "Back Squat",
          "sets": "3",
          "reps": "5",              // reps, time ("30s"), or distance ("25 yds") as written
          "note": "tempo / velocity / % target / cues exactly as written, else empty",
          "prKey": "back_squat",    // one of ${VALID_PRKEYS.join(', ')} if this lift is % based off a max, else null
          "pctLo": null,            // low % of max as a number (e.g. 75), else null
          "pctHi": null             // high % of max, else null
        }
      ]
    }
  ]
}

Rules:
- "key" must be one of dayA, dayB, dayC, dayD, dayE in order (Mon→A, Tue→B, Wed→C, Thu→D, Fri/Sat→E).
- Keep 4-digit tempos (e.g. 3010, 50X1) and velocity/percent targets verbatim in "note".
- Only set prKey + pctLo/pctHi when the source ties the load to a percentage of a max.
- Return valid JSON and nothing else.`

function jsonResponse(status, obj) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }
}

function extractJson(text) {
  if (!text) return null
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try { return JSON.parse(cleaned.slice(start, end + 1)) } catch { return null }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return jsonResponse(400, { error: 'The AI importer isn’t connected yet — add ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables, then redeploy.' })
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch { return jsonResponse(400, { error: 'Invalid request body.' }) }
  const { text, imageBase64, mediaType } = body
  if (!text && !imageBase64) return jsonResponse(400, { error: 'Paste some program text or attach a photo.' })

  const content = []
  if (imageBase64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } })
  }
  content.push({ type: 'text', text: (text ? `Program text:\n${text}\n\n` : '') + INSTRUCTIONS })

  const client = new Anthropic({ apiKey })
  const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 8000,
      output_config: { effort: 'low' },   // keep latency down for the serverless timeout
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    })
    const out = (resp.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    const parsed = extractJson(out)
    if (!parsed || !Array.isArray(parsed.days)) {
      return jsonResponse(422, { error: 'Couldn’t read a program out of that — try clearer text or a sharper, well-lit photo.' })
    }
    return jsonResponse(200, { template: parsed })
  } catch (e) {
    return jsonResponse(502, { error: e?.message || 'The AI request failed. Try again.' })
  }
}
