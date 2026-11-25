// Exercise demo-video library. One link per exercise NAME (not per program),
// so setting a video for "RDL" once shows it for every athlete, every week.
// Table: exercise_videos (name_key pk, name, url, updated_at).

export const videoKey = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export async function loadVideos(sb) {
  const { data, error } = await sb.from('exercise_videos').select('name_key,url')
  const map = {}
  if (!error && data) data.forEach(r => { if (r.url) map[r.name_key] = r.url })
  return map
}

// Save (or, with a blank url, remove) the video for an exercise name.
export async function saveVideo(sb, name, url) {
  const key = videoKey(name)
  if (!key) return { error: { message: 'Name the exercise first' } }
  const clean = String(url || '').trim()
  if (!clean) return sb.from('exercise_videos').delete().eq('name_key', key)
  return sb.from('exercise_videos').upsert(
    { name_key: key, name: String(name).trim(), url: clean, updated_at: new Date().toISOString() },
    { onConflict: 'name_key' })
}

// How to play a link inline: YouTube / Vimeo embed, a direct video file, or
// (anything else, e.g. Instagram) just open it in a new tab.
export function videoPlayer(url) {
  const u = String(url || '').trim()
  if (!/^https?:\/\//i.test(u)) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i)
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1` }
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vm) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` }
  if (/\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(u)) return { kind: 'video', src: u }
  return { kind: 'link', src: u }
}
