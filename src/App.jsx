import { useState, useEffect, useRef, Fragment } from 'react'
import { createClient } from '@supabase/supabase-js'
import CoachOnline from './CoachOnline'

const sb = createClient(
  'https://xxtomnbvinxuvnrrqnqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dG9tbmJ2aW54dXZucnJxbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk5MTksImV4cCI6MjA4NTc5NTkxOX0.Ty-KRgr9JsYr7ZEZtvm7lB2TxcdWeW1CCsJQdWyFND8'
)

export function r5(v) { return Math.round(v / 5) * 5 }
export function rKg(lbs) { return Math.round(lbs / 2.2046 * 2) / 2 }
export function mkEx(s, e, st, r, p, pk, n) {
  return { series: s, exercise: e, sets: String(st), reps: String(r), pct: p || null, prKey: pk || null, note: n || '' }
}

const WU_A = mkEx('WU', 'Tall Snatch + OHS', 1, '5+1', null, null, 'bar')
const WU_B_pp = mkEx('WU', 'Tall Clean + Push Press', 1, '5+5', null, null, 'bar')
const WU_B_press = mkEx('WU', 'Tall Clean + Press', 1, '5+5', null, null, 'bar')

const STR_B1 = [0.60, 0.60, 0.70]
const STR_B2 = [0.70, 0.70, 0.80]
const STR_B3 = [0.75, 0.75, 0.80]
const FS_B1 = STR_B1; const FS_B2 = STR_B2; const FS_B3 = STR_B3
const OLY_B1 = [0.65, 0.65, 0.75]
const OLY_B2 = [0.75, 0.75, 0.85]
const OLY_B3 = [0.75, 0.75, 0.85]
const PWR_B1 = [0.55, 0.55, 0.65]
const PWR_B2 = [0.65, 0.65, 0.75]
const PWR_B3 = [0.70, 0.70, 0.80]
const PULL_B1 = [0.85, 0.85, 0.95]
const PULL_B2 = [0.95, 0.95, 1.10]
const PULL_B3 = [0.95, 0.95, 1.20]
const CJ_HEAVY_B1 = [0.70, 0.70, 0.80]
const CJ_HEAVY_B2 = [0.80, 0.80, 0.90]
const CJ_HEAVY_B3 = [0.80, 0.80, 0.90]

const DEFAULT_BLOCK_RANGES = {
  1: { STR: [60,60,70], OLY: [65,65,75], PULL: [85,85,95], PWR: [55,55,65] },
  2: { STR: [70,70,80], OLY: [75,75,85], PULL: [95,95,110], PWR: [65,65,75] },
  3: { STR: [75,75,80], OLY: [75,75,85], PULL: [95,95,120], PWR: [70,70,80] },
}

function detectPctCategory(name) {
  if (!name) return null
  const n = name.toLowerCase()
  if ((n.includes('pull') || n.includes('high pull')) && (n.includes('clean') || n.includes('snatch'))) return 'PULL'
  if (n.includes('power') && (n.includes('snatch') || n.includes('clean'))) return 'PWR'
  if (n.includes('snatch') || n.includes('clean') || n.includes('jerk')) return 'OLY'
  if (['front squat','front squat he','push press','ohs','sa kb push press','double kb push press'].includes(n)) return 'OLY'
  if (n.includes('tall clean') || n.includes('pp clean')) return 'OLY'
  if (['back squat','back squat he','deadlift','sumo deadlift','trap bar deadlift','bench press','press','behind-the-neck press','db bench press','strict press'].includes(n)) return 'STR'
  return null
}

const PCT_CAT_LABELS = { STR: 'Strength', OLY: 'Olympic', PULL: 'Pulls', PWR: 'Power' }
const PCT_CAT_COLORS = { STR: '#2266aa', OLY: '#aa6600', PULL: '#666', PWR: '#8833aa' }

const LIBRARY = {
  'Snatch': [
    'Hang Snatch','Power Position Snatch','Low Hang Snatch','No Foot Snatch',
    'No Foot No Hook Snatch','Pause at Knee Snatch','Hang Power Snatch',
    'Power Position Power Snatch','Low Hang Power Snatch','Tall Snatch','3-Position Snatch',
    'PP Snatch + Hang Snatch','PP Snatch + OHS','Hang Snatch + OHS',
    'Tall Snatch + OHS','PP Snatch + Hang Snatch + OHS',
    'Power Snatch','Muscle Snatch','Snatch from Blocks','Pausing Power Snatch',
    'Block Snatch','Snatch High Pull','Power Snatch from Hang','Power Snatch from Blocks',
  ],
  'Clean': [
    'Hang Clean','Power Position Clean','Low Hang Clean','No Foot Clean',
    'No Foot No Hook Clean','Pause at Knee Clean','Hang Power Clean',
    'Power Position Power Clean','Low Hang Power Clean','Tall Clean','3-Position Clean',
    'PP Clean + Hang Clean','PAK Clean Pull + Clean Pull',
    'Muscle Clean','Clean from Blocks','Power Clean from Hang',
  ],
  'Jerk': [
    'Push Jerk','Power Jerk','Split Jerk',
    'Behind-the-Neck Push Jerk','Behind-the-Neck Power Jerk','Behind-the-Neck Split Jerk',
    'Pause Jerk','Tall Jerk',
    'Clean + Jerk','Hang Clean + Jerk','PP Clean + Jerk',
    'Hang Clean + Push Jerk','Low Hang Clean + Pause Jerk',
    'Jerk from Rack','Front Squat + Jerk',
  ],
  'Overhead': [
    'Press','Push Press','Behind-the-Neck Press',
    'SA KB Overhead Press','Double KB Overhead Press','SA KB Push Press','Double KB Push Press',
    'PP Clean + Press','PP Clean + Push Press','Hang Clean + Push Press',
    'Power Clean + Push Press','Hang Power Clean + Push Press','Low Hang Power Clean + Push Press',
    'PP Clean + Push Press + Front Squat','Tall Clean + Push Press','Tall Clean + Press',
    'Strict Press','DB Shoulder Press','Power Clean from Hang + Push Press',
  ],
  'Squat': [
    'Front Squat','Back Squat','Goblet Squat','OHS',
    'Front Squat HE','Back Squat HE','Goblet Squat HE',
    'Double KB Front Squat','Zercher Squat',
    'Pause Back Squat','Pause Front Squat',
  ],
  'Pulls / Hinge': [
    'Deadlift','Sumo Deadlift','Trap Bar Deadlift','KB Deadlift','RDL','DB RDL',
    'Clean Pull','Pause at Knee Clean Pull','3-Position Clean Pull',
    'Hang Clean High Pull','PAK Clean Pull','PAK Clean Pull + Clean Pull',
    'Snatch Pull','Pause at Knee Snatch Pull','3-Position Snatch Pull','Hang Snatch High Pull',
    'Snatch DL','Clean DL',
  ],
  'Horizontal Row': [
    'KOB Row','SA KOB Row','Chainsaw Row','Bent-Over Row',
    'Supinated Grip Bent-Over Row','Chest Supported Row',
    'Tripod Row','TRX Row','SA TRX Row','Flywheel Row','SA Flywheel Row','SA Cable Row',
  ],
  'Horizontal Press': [
    'Bench Press','DB Bench Press','DB Incline Press',
    'Push Up','Hand Release Push Up','Deficit Push Up','Dips',
  ],
  'Vertical Pull': ['Chin Up','Pull Up','Lat Pulldown','SA Lat Pulldown','Pullovers','Flywheel Lat Pulldown'],
  'Unilateral / Single Leg': [
    'RFE Split Squat','FFE Split Squat','Ipsilateral Split Squat',
    'Contralateral Split Squat','Reverse Lunge','Split Squat',
    'Step Up','Single Leg Squat to Box','Skater Squat',
    'Sled Push','Sled Push/Pull','DBL KB Front Rack Walking Lunge',
  ],
  'Posterior Chain': [
    'Good Morning',
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
    'Half Kneeling Flywheel Cable Lift','Half Kneeling Flywheel Cable Chop','Landmine Anti-Rotation',
  ],
  'Shoulder Girdle': [
    'Isohold Lateral Raises','TRX Ys','TRX Ws','YWTs',
    'Trap Raises','Shrugs','Band Pull-Aparts','BPA Underhand',
    'DB External Shoulder Rotation','Band External Shoulder Rotation',
    'Bottoms-Up KB Carry',"Waiter's Walk",
  ],
  'Cardio / Conditioning': ['Rower','Bike','Runner','Jump Rope'],
  'Speed / Power': [
    'Resisted Sprints','Acceleration','Change of Direction',
    'Acceleration / Change of Direction',
    'SL Lateral Hurdle Hop Complex','Seated Broad to Hurdle Hop',
    'Pro Agility','Plyo Warmup',
  ],
}

const EXERCISE_PR_KEYS = {
  // Squat
  'Back Squat':'back_squat','Back Squat HE':'back_squat',
  'Front Squat':'front_squat','Front Squat HE':'front_squat','OHS':'front_squat',
  // Horizontal press
  'Bench Press':'bench_press','DB Bench Press':'bench_press',
  // Hinge
  'Deadlift':'deadlift','Sumo Deadlift':'deadlift','Trap Bar Deadlift':'deadlift',
  // Overhead press
  'Press':'press','Behind-the-Neck Press':'press',
  'Push Press':'push_press','Behind-the-Neck Push Press':'push_press',
  // Jerk variants
  'Push Jerk':'jerk','Power Jerk':'jerk','Split Jerk':'jerk',
  'Pause Jerk':'jerk','Tall Jerk':'jerk',
  'Behind-the-Neck Push Jerk':'jerk','Behind-the-Neck Power Jerk':'jerk','Behind-the-Neck Split Jerk':'jerk',
  // Snatch variants
  'Hang Snatch':'snatch','Power Position Snatch':'snatch','Low Hang Snatch':'snatch',
  'No Foot Snatch':'snatch','No Foot No Hook Snatch':'snatch',
  'Hang Power Snatch':'snatch','Power Position Power Snatch':'snatch','Low Hang Power Snatch':'snatch',
  'Pause at Knee Snatch':'snatch','Tall Snatch':'snatch','3-Position Snatch':'snatch',
  'PP Snatch + OHS':['snatch','front_squat'],'Hang Snatch + OHS':['snatch','front_squat'],
  'Tall Snatch + OHS':['snatch','front_squat'],'PP Snatch + Hang Snatch + OHS':['snatch','front_squat'],
  'PP Snatch + Hang Snatch':'snatch',
  // Clean variants
  'Hang Clean':'clean','Power Position Clean':'clean','Low Hang Clean':'clean',
  'No Foot Clean':'clean','No Foot No Hook Clean':'clean',
  'Hang Power Clean':'clean','Power Position Power Clean':'clean','Low Hang Power Clean':'clean',
  'Pause at Knee Clean':'clean','Tall Clean':'clean','3-Position Clean':'clean',
  // Power clean combos — load off the pressing movement
  'Power Clean':'clean',
  'Power Clean + Push Press':'push_press',
  'Hang Power Clean + Push Press':'push_press',
  // Clean combos — load off the pressing movement
  'PP Clean + Press':'press',
  'PP Clean + Push Press':'push_press',
  'Hang Clean + Push Press':'push_press',
  'PP Clean + Hang Clean':'clean',
  'Hang Clean + Front Squat':['clean','front_squat'],
  'PP Clean + Front Squat':['clean','front_squat'],
  'PP Clean + Push Press + Front Squat':['push_press','front_squat'],
  'Hang Clean + Push Jerk':'jerk',
  'Low Hang Clean + Pause Jerk':'jerk',
  'Tall Clean + Push Press':'push_press',
  'Tall Clean + Press':'press',
  'Clean + Jerk':'jerk',
  'Hang Clean + Jerk':'jerk',
  'PP Clean + Jerk':'jerk',
  'Hang Clean + Push Press + Front Squat':['push_press','front_squat'],
  // Pulls
  'Clean Pull':'clean','Pause at Knee Clean Pull':'clean','3-Position Clean Pull':'clean',
  'Hang Clean High Pull':'clean','PAK Clean Pull':'clean','PAK Clean Pull + Clean Pull':'clean',
  'Snatch Pull':'snatch','Pause at Knee Snatch Pull':'snatch','3-Position Snatch Pull':'snatch',
  'Hang Snatch High Pull':'snatch',
  // Pull-up
  'Chin Up':'chin_up','Pull Up':'chin_up',
  // Medvedev additions
  'Power Snatch':'snatch','Muscle Snatch':'snatch','Snatch from Blocks':'snatch','Pausing Power Snatch':'snatch',
  'Muscle Clean':'clean','Clean from Blocks':'clean',
  'Snatch DL':'snatch','Clean DL':'clean',
  'Pause Back Squat':'back_squat','Pause Front Squat':'front_squat',
  // 4-Day Undulating additions
  'Block Snatch':'snatch','Snatch High Pull':'snatch',
  'Power Snatch from Hang':'snatch','Power Snatch from Blocks':'snatch',
  'Power Clean from Hang + Push Press':['clean','push_press'],
  'Jerk from Rack':'jerk','Front Squat + Jerk':['front_squat','jerk'],
  'Strict Press':'press','DB Shoulder Press':'press',
}


// ========== ANALYTICS UTILITIES ==========

// Exercise group detection for analytics
function detectGroup(name) {
  const n = (name || '').toLowerCase()
  // Pulls first (before snatch/clean check)
  if (n.includes('snatch') && (n.includes('pull') || n.includes('dl') || n.includes('deadlift'))) return 'G3'
  if (n.includes('clean') && (n.includes('pull') || n.includes('dl') || n.includes('deadlift'))) return 'G3'
  if (n.includes('pull') || n.includes('deadlift') || n.includes(' dl')) return 'G3'
  if (n.includes('rdl') || n.includes('good morning') || n.includes('back extension') || n.includes('hyperextension')) return 'G3'
  // G5 Overhead — Snatch Balance, OHS, Snatch Push Press, BTN go here (NOT G1)
  if (n.includes('snatch balance') || n.includes('overhead squat') || n.includes('ohs')) return 'G5'
  if (n.includes('snatch push press') || n.includes('snatch grip push press')) return 'G5'
  // G1 Snatch (after G5 overhead exceptions)
  if (n.includes('snatch')) return 'G1'
  // G2 Clean
  if (n.includes('clean') && (n.includes('jerk') || n.includes('front squat'))) return 'G2'
  if (n.includes('clean')) return 'G2'
  // G5 Jerk/Press/BTN/Behind
  if (n.includes('jerk') || n.includes('push press') || n.includes('press') || n.includes('btn') || n.includes('behind')) return 'G5'
  // G4 Squats
  if (n.includes('squat')) return 'G4'
  return null
}

// Split complex reps across groups: "Snatch Pull + Hang Snatch" "1+1" → G3 + G1
function splitComplexVol(exName, repsStr, sets) {
  // Split exercise name on "+" with flexible whitespace (handles "A + B", "A+B", "A +B")
  const parts = (exName || '').split(/\s*\+\s*/).filter(Boolean)
  const repsRaw = String(repsStr)
  const repParts = repsRaw.split('+').map(r => parseInt(r.trim()) || 0)
  const hasComplexReps = repsRaw.includes('+')
  const result = []
  if (parts.length > 1) {
    // Complex exercise: split each movement into its group
    parts.forEach((part, idx) => {
      const g = detectGroup(part.trim())
      if (!g) return
      let reps
      if (hasComplexReps && idx < repParts.length) {
        // Reps string has "+": match positionally
        reps = repParts[idx]
      } else if (hasComplexReps) {
        // More movements than rep parts: use last rep value
        reps = repParts[repParts.length - 1] || 0
      } else {
        // No "+" in reps (e.g., "3"): every movement gets the full rep count
        reps = repParts[0] || 0
      }
      result.push({ group: g, vol: sets * reps })
    })
  }
  // Single exercise or no parts matched: treat entire name as one group
  if (result.length === 0) {
    const g = detectGroup(exName)
    const totalReps = repParts.reduce((s, v) => s + v, 0)
    if (g) result.push({ group: g, vol: sets * totalReps })
  }
  return result
}


const DEFAULT_CELL_NOTES = {
  'beginner-3-dayA-1-2':'2RM','beginner-3-dayA-1-3':'MAX',
  'beginner-3-dayA-2-2':'3RM','beginner-3-dayA-2-3':'MAX',
  'beginner-3-dayA-3-2':'2RM','beginner-3-dayA-3-3':'MAX',
  'beginner-3-dayB-1-2':'3RM','beginner-3-dayB-1-3':'MAX',
  'beginner-3-dayB-2-2':'2RM','beginner-3-dayB-2-3':'MAX',
  'beginner-3-dayB-3-2':'3RM','beginner-3-dayB-3-3':'MAX',
  'oly_athlete-1-dayA-1-4':'RM','oly_athlete-1-dayA-2-4':'RM','oly_athlete-1-dayA-3-4':'RM',
  'oly_athlete-1-dayB-1-4':'RM','oly_athlete-1-dayB-2-4':'RM','oly_athlete-1-dayB-3-4':'RM',
  'oly_athlete-2-dayA-1-4':'RM','oly_athlete-2-dayA-2-4':'RM','oly_athlete-2-dayA-3-4':'RM',
  'oly_athlete-2-dayB-1-4':'RM','oly_athlete-2-dayB-2-4':'RM','oly_athlete-2-dayB-3-4':'RM',
  'oly_athlete-3-dayA-1-2':'2RM','oly_athlete-3-dayA-1-3':'MAX',
  'oly_athlete-3-dayA-2-2':'3RM','oly_athlete-3-dayA-2-3':'MAX',
  'oly_athlete-3-dayA-3-2':'2RM','oly_athlete-3-dayA-3-3':'MAX',
  'oly_athlete-3-dayB-1-2':'2RM','oly_athlete-3-dayB-1-3':'MAX',
  'oly_athlete-3-dayB-2-2':'2RM','oly_athlete-3-dayB-2-3':'MAX',
  'oly_athlete-3-dayB-3-2':'3RM','oly_athlete-3-dayB-3-3':'MAX',
  'oly_adv-1-dayA-1-4':'RM','oly_adv-1-dayA-2-4':'RM','oly_adv-1-dayA-3-4':'RM',
  'oly_adv-1-dayB-1-4':'RM','oly_adv-1-dayB-2-4':'RM','oly_adv-1-dayB-3-4':'RM',
  'oly_adv-2-dayA-1-4':'RM','oly_adv-2-dayA-2-4':'RM','oly_adv-2-dayA-3-4':'RM',
  'oly_adv-2-dayB-1-4':'RM','oly_adv-2-dayB-2-4':'RM','oly_adv-2-dayB-3-4':'RM',
  'oly_adv-3-dayA-1-2':'2RM','oly_adv-3-dayA-1-3':'MAX',
  'oly_adv-3-dayA-2-2':'3RM','oly_adv-3-dayA-2-3':'MAX',
  'oly_adv-3-dayA-3-2':'3RM','oly_adv-3-dayA-3-3':'MAX',
  'oly_adv-3-dayB-1-2':'2RM',
  'oly_adv-3-dayB-2-2':'2RM','oly_adv-3-dayB-2-3':'MAX',
  'oly_adv-3-dayB-3-3':'MAX',
  // 4-Day Oly Undulating — Track A heavy singles in Week 2
  // Block 1: BS(dayA-3), PP(dayB-2), SnPull(dayB-3), FS(dayC-3), ClPull(dayD-3)
  'oly_4day_undulating-1-dayA-3-2':'HS','oly_4day_undulating-1-dayB-2-2':'HS',
  'oly_4day_undulating-1-dayB-3-2':'HS','oly_4day_undulating-1-dayC-3-2':'HS',
  'oly_4day_undulating-1-dayD-3-2':'HS',
  // Block 1: Track B heavy singles in Week 4 — Sn on dayA, C&J on dayD
  'oly_4day_undulating-1-dayA-1-4':'MAX','oly_4day_undulating-1-dayD-2-4':'MAX',
  // Block 2: Track A heavy singles in Week 2
  'oly_4day_undulating-2-dayA-3-2':'HS','oly_4day_undulating-2-dayB-2-2':'HS',
  'oly_4day_undulating-2-dayB-3-2':'HS','oly_4day_undulating-2-dayC-3-2':'HS',
  'oly_4day_undulating-2-dayD-3-2':'HS',
  // Block 2: Track B heavy singles in Week 4 — Sn on dayD, C&J on dayA
  'oly_4day_undulating-2-dayD-1-4':'MAX','oly_4day_undulating-2-dayA-2-4':'MAX',
  // Block 3: Track A heavy singles in Week 2
  'oly_4day_undulating-3-dayA-3-2':'HS','oly_4day_undulating-3-dayB-2-2':'HS',
  'oly_4day_undulating-3-dayB-3-2':'HS','oly_4day_undulating-3-dayC-3-2':'HS',
  'oly_4day_undulating-3-dayD-3-2':'HS',
  // Block 3: Track B heavy singles in Week 4 — Sn on dayA, C&J on dayD
  'oly_4day_undulating-3-dayA-1-4':'MAX','oly_4day_undulating-3-dayD-2-4':'MAX',
}

export const TEMPLATES = {
  beginner: {
    label: 'Athlete Beginner', days: ['dayA','dayB'], blocks: {
      1: {
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + OHS',4,'3+1'),
          mkEx('B1','Bench Press',4,'5'),
          mkEx('C1','Front Squat',4,'3'),
          mkEx('D1','RFE Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_press,
          mkEx('A1','PP Clean + Press',4,'1+5'),
          mkEx('B1','Power Position Clean',4,'3'),
          mkEx('C1','KB Deadlift',3,'8'),
          mkEx('D1','Chest Supported Row',3,'8'),
          mkEx('D2','Plank',3,'30sec'),
        ]}
      },
      2: {
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1'),
          mkEx('B1','Bench Press',4,'5'),
          mkEx('C1','Goblet Squat',4,'5'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Sled Push',3,'1'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_press,
          mkEx('A1','PP Clean + Press',4,'1+5'),
          mkEx('B1','Hang Clean',4,'2'),
          mkEx('C1','KB Deadlift',4,'5'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','Farmers Carry',3,'1'),
        ]}
      },
      3: {
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2'),
          mkEx('B1','Bench Press',4,'5'),
          mkEx('C1','Front Squat',4,'3'),
          mkEx('D1','RFE Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_press,
          mkEx('A1','PP Clean + Press',4,'1+5'),
          mkEx('B1','Hang Clean',4,'2'),
          mkEx('C1','Deadlift',4,'5'),
          mkEx('D1','Flywheel Row',3,'8ea'),
          mkEx('D2','Suitcase Carry',3,'1'),
        ]}
      }
    }
  },
  oly_athlete: {
    label: 'Oly Athlete', days: ['dayA','dayB'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
          mkEx('B1','PP Clean + Hang Clean',4,'2+1',OLY_B1,'clean'),
          mkEx('C1','Deadlift',3,'8',STR_B1,'deadlift'),
          mkEx('D1','Nordic Hamstring Curl',3,'8'),
          mkEx('D2','Chest Supported Row',3,'12'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','RFE Split Squat',3,'8ea'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
          mkEx('B1','Hang Clean',4,'2',OLY_B2,'clean'),
          mkEx('C1','Deadlift',4,'5',STR_B2,'deadlift'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','Farmers Carry',3,'1'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','Sled Push',3,'1'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
          mkEx('B1','Hang Clean',4,'2',OLY_B3,'clean'),
          mkEx('C1','Deadlift',3,'5',OLY_B3,'deadlift'),
          mkEx('D1','KOB Row',3,'8ea'),
          mkEx('D2','Dragon Flag',3,'8'),
        ]}
      }
    }
  },
  oly_adv: {
    label: 'Oly ADV Athlete', days: ['dayA','dayB'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch + OHS',4,'1+2+1',OLY_B1,['snatch','front_squat']),
          mkEx('B1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('C1','Back Squat',3,'8',STR_B1,'back_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
          mkEx('B1','PP Clean + Front Squat',4,'3+1',OLY_B1,['clean','front_squat']),
          mkEx('C1','Hang Clean High Pull',4,'5',PULL_B1,'clean'),
          mkEx('D1','Chest Supported Row',3,'12'),
          mkEx('D2','Glute Ham Raise',3,'8'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch + OHS',4,'2+1',OLY_B2,['snatch','front_squat']),
          mkEx('B1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('C1','Back Squat',4,'5',STR_B2,'back_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Nordic Hamstring Curl',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','Hang Clean + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
          mkEx('B1','Hang Clean + Front Squat',4,'2+1',OLY_B2,['clean','front_squat']),
          mkEx('C1','PAK Clean Pull',4,'3',PULL_B2,'clean'),
          mkEx('D1','Chainsaw Row',3,'8'),
          mkEx('D2','Split Stance RDL',3,'8ea'),
        ]}
      },
      3: {
        pctLabel:'75-90%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('C1','Back Squat',4,'5',STR_B3,'back_squat'),
          mkEx('D1','Flywheel Rotation',3,'10'),
          mkEx('D2','Chin Up',3,'AMAP'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
          mkEx('B1','Hang Clean',4,'2',OLY_B3,'clean'),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','45-Deg Back Extension',3,'8ea'),
        ]}
      }
    }
  },
  gpp_2day: {
    label: 'GPP 2-Day', days: ['dayA','dayB'], blocks: {
      1: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',3,'8',STR_B1,'press'),
          mkEx('B1','Front Squat',3,'8',STR_B1,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Split Squat',3,'8ea'),
          mkEx('C3','Hollow Hold',3,'30sec'),
          mkEx('C4','Band Pull-Aparts',3,'15'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('B1','Sumo Deadlift',3,'8',STR_B1,'deadlift'),
          mkEx('C1','SA KOB Row',3,'8ea'),
          mkEx('C2','Nordic Hamstring Curl',3,'8'),
          mkEx('C3','Side Plank',3,'30s'),
          mkEx('C4','Rower',3,'400m'),
        ]}
      },
      2: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',4,'5',STR_B2,'press'),
          mkEx('B1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','RFE Split Squat',3,'6ea'),
          mkEx('C3','Dead Bug',3,'8'),
          mkEx('C4','TRX Ws',3,'12'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('B1','Sumo Deadlift',4,'5',STR_B2,'deadlift'),
          mkEx('C1','Chest Supported Row',3,'10'),
          mkEx('C2','Glute Ham Raise',3,'8'),
          mkEx('C3','Copenhagen Plank',3,'20s'),
          mkEx('C4','Bike',3,'10cal'),
        ]}
      },
      3: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',4,'5',STR_B3,'press'),
          mkEx('B1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','RFE Split Squat',3,'5ea'),
          mkEx('C3','Hollow Rocks',3,'10'),
          mkEx('C4','YWTs',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('B1','Deadlift',4,'5',STR_B3,'deadlift'),
          mkEx('C1','Flywheel Row',3,'8ea'),
          mkEx('C2','45-Deg Back Extension',3,'10'),
          mkEx('C3','Paloff Press',3,'10ea'),
          mkEx('C4','Rower',3,'500m'),
        ]}
      }
    }
  },
  adult_oly: {
    label: 'Adult Weightlifting 2-Day', days: ['dayA','dayB'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,['clean','jerk']),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Hollow Hold',3,'30sec'),
          mkEx('D3','TRX Ws',3,'12'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Hang Clean + Push Press',4,'1+3',OLY_B1,['clean','push_press']),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','KB Swing',3,'10'),
          mkEx('D2','SA KOB Row',3,'8ea'),
          mkEx('D3','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Dead Bug',3,'8'),
          mkEx('D3','Band Pull-Aparts',3,'15'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','45-Deg Back Extension',3,'10'),
          mkEx('D2','Chest Supported Row',3,'10'),
          mkEx('D3','Landmine Anti-Rotation',3,'10ea'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,['clean','jerk']),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Hollow Rocks',3,'10'),
          mkEx('D3','YWTs',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+1',OLY_B3,['clean','jerk']),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','Glute Ham Raise',3,'8'),
          mkEx('D2','Chainsaw Row',3,'8'),
          mkEx('D3','Side Plank',3,'30s'),
        ]}
      }
    }
  },
  oly_2day: {
    label: 'Olympic Lifting 2-Day', days: ['dayA','dayB'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,['clean','jerk']),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','RFE Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Hang Clean + Push Press',4,'1+3',OLY_B1,['clean','push_press']),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','DB Bench Press',3,'8'),
          mkEx('D2','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'6ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','Bench Press',3,'5',STR_B2,'bench_press'),
          mkEx('D2','Hollow Rocks',3,'10'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,['clean','jerk']),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','RFE Split Squat',3,'5ea'),
          mkEx('D2','Chin Up',3,'AMAP'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+1',OLY_B3,['clean','jerk']),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('D2','Dragon Flag',3,'8'),
        ]}
      }
    }
  },
  oly_power_3day: {
    label: '3-Day Oly + Power', days: ['dayA','dayB','dayC'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('D1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Hollow Hold',3,'30sec'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','Hang Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
          mkEx('B1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('C1','45-Deg Back Extension',3,'10'),
          mkEx('C2','SA KOB Row',3,'8ea'),
          mkEx('C3','Dead Bug',3,'8'),
          mkEx('C4','Rower',3,'400m'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','Hang Clean',4,'3',OLY_B1,'clean'),
          mkEx('B1','RFE Split Squat',3,'8ea'),
          mkEx('C1','Nordic Hamstring Curl',3,'8'),
          mkEx('C2','DB Bench Press',3,'8'),
          mkEx('C3','Band Pull-Aparts',3,'15'),
          mkEx('C4','Hollow Rocks',3,'10'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('D1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Dead Bug',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
          mkEx('B1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('C1','Glute Ham Raise',3,'8'),
          mkEx('C2','Chest Supported Row',3,'10'),
          mkEx('C3','Paloff Press',3,'10ea'),
          mkEx('C4','Bike',3,'10cal'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','Low Hang Clean',4,'2',OLY_B2,'clean'),
          mkEx('B1','Ipsilateral Split Squat',4,'5ea'),
          mkEx('C1','45-Deg Back Extension',3,'10'),
          mkEx('C2','Push Up',3,'AMAP'),
          mkEx('C3','TRX Ws',3,'12'),
          mkEx('C4','Side Plank',3,'30s'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('D1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('C1','Chin Up',3,'AMAP'),
          mkEx('C2','Hollow Rocks',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
          mkEx('B1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('C1','Split Stance RDL',3,'8ea'),
          mkEx('C2','Flywheel Row',3,'8ea'),
          mkEx('C3','Dragon Flag',3,'8'),
          mkEx('C4','Rower',3,'500m'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','Hang Clean',4,'2',OLY_B3,'clean'),
          mkEx('B1','RFE Split Squat',3,'5ea'),
          mkEx('C1','Razor Curl',3,'8'),
          mkEx('C2','Deficit Push Up',3,'8'),
          mkEx('C3','YWTs',3,'10'),
          mkEx('C4','Suitcase Carry',3,'1'),
        ]}
      }
    }
  },
  oly_power_4day: {
    label: '4-Day Oly + Power + Plyo', days: ['dayA','dayB','dayC','dayD'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('D1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Hollow Hold',3,'30sec'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','Hang Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
          mkEx('B1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('C1','45-Deg Back Extension',3,'10'),
          mkEx('C2','SA KOB Row',3,'8ea'),
          mkEx('C3','Dead Bug',3,'8'),
          mkEx('C4','Rower',3,'400m'),
        ]},
        dayC: { header: 'C Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','SL Lateral Hurdle Hop Complex',3,'4ea'),
          mkEx('C1','Seated Broad to Hurdle Hop',4,'1'),
          mkEx('D1','Pro Agility',4,'1'),
          mkEx('E1','Resisted Sprints',6,'1'),
        ]},
        dayD: { header: 'D Day', exercises: [
          mkEx('A1','Hang Clean',4,'3',OLY_B1,'clean'),
          mkEx('B1','RFE Split Squat',3,'8ea'),
          mkEx('C1','Nordic Hamstring Curl',3,'8'),
          mkEx('C2','DB Bench Press',3,'8'),
          mkEx('C3','Band Pull-Aparts',3,'15'),
          mkEx('C4','Hollow Rocks',3,'10'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('D1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Dead Bug',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
          mkEx('B1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('C1','Glute Ham Raise',3,'8'),
          mkEx('C2','Chest Supported Row',3,'10'),
          mkEx('C3','Paloff Press',3,'10ea'),
          mkEx('C4','Bike',3,'10cal'),
        ]},
        dayC: { header: 'C Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','SL Lateral Hurdle Hop Complex',3,'4ea'),
          mkEx('C1','Seated Broad to Hurdle Hop',4,'1'),
          mkEx('D1','Pro Agility',4,'1'),
          mkEx('E1','Resisted Sprints',6,'1'),
        ]},
        dayD: { header: 'D Day', exercises: [
          mkEx('A1','Low Hang Clean',4,'2',OLY_B2,'clean'),
          mkEx('B1','Ipsilateral Split Squat',4,'5ea'),
          mkEx('C1','45-Deg Back Extension',3,'10'),
          mkEx('C2','Push Up',3,'AMAP'),
          mkEx('C3','TRX Ws',3,'12'),
          mkEx('C4','Side Plank',3,'30s'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('D1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('C1','Chin Up',3,'AMAP'),
          mkEx('C2','Hollow Rocks',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
          mkEx('B1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('C1','Split Stance RDL',3,'8ea'),
          mkEx('C2','Flywheel Row',3,'8ea'),
          mkEx('C3','Dragon Flag',3,'8'),
          mkEx('C4','Rower',3,'500m'),
        ]},
        dayC: { header: 'C Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','SL Lateral Hurdle Hop Complex',3,'4ea'),
          mkEx('C1','Seated Broad to Hurdle Hop',4,'1'),
          mkEx('D1','Pro Agility',4,'1'),
          mkEx('E1','Resisted Sprints',6,'1'),
        ]},
        dayD: { header: 'D Day', exercises: [
          mkEx('A1','Hang Clean',4,'2',OLY_B3,'clean'),
          mkEx('B1','RFE Split Squat',3,'5ea'),
          mkEx('C1','Razor Curl',3,'8'),
          mkEx('C2','Deficit Push Up',3,'8'),
          mkEx('C3','YWTs',3,'10'),
          mkEx('C4','Suitcase Carry',3,'1'),
        ]}
      }
    }
  },
  gpp_3day: {
    label: 'GPP 3-Day', days: ['dayA','dayB','dayC'], blocks: {
      1: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',3,'8',STR_B1,'press'),
          mkEx('B1','Front Squat',3,'8',FS_B1,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','Split Squat',3,'8ea'),
          mkEx('C3','Hollow Hold',3,'30sec'),
          mkEx('C4','Band Pull-Aparts',3,'15'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('B1','Sumo Deadlift',3,'8',STR_B1,'deadlift'),
          mkEx('C1','SA KOB Row',3,'8ea'),
          mkEx('C2','Nordic Hamstring Curl',3,'8'),
          mkEx('C3','Side Plank',3,'30s'),
          mkEx('C4','Rower',3,'400m'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','DB Bench Press',3,'8'),
          mkEx('A2','RFE Split Squat',3,'8ea'),
          mkEx('C1','45-Deg Back Extension',3,'10'),
          mkEx('C2','Tripod Row',3,'10ea'),
          mkEx('C3','Dead Bug',3,'8'),
          mkEx('C4','Bike',3,'10cal'),
        ]}
      },
      2: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',4,'5',STR_B2,'press'),
          mkEx('B1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('C1','Chin Up',3,'8'),
          mkEx('C2','RFE Split Squat',3,'6ea'),
          mkEx('C3','Dead Bug',3,'8'),
          mkEx('C4','TRX Ws',3,'12'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('B1','Deadlift',4,'5',STR_B2,'deadlift'),
          mkEx('C1','Chest Supported Row',3,'10'),
          mkEx('C2','Glute Ham Raise',3,'8'),
          mkEx('C3','Copenhagen Plank',3,'20s'),
          mkEx('C4','Bike',3,'10cal'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','Push Up',4,'AMAP'),
          mkEx('A2','Ipsilateral Split Squat',4,'5ea'),
          mkEx('C1','Split Stance RDL',3,'8ea'),
          mkEx('C2','SA KOB Row',3,'8ea'),
          mkEx('C3','Paloff Press',3,'10ea'),
          mkEx('C4','Rower',3,'500m'),
        ]}
      },
      3: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Press',4,'5',STR_B3,'press'),
          mkEx('B1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('C1','Chin Up',3,'AMAP'),
          mkEx('C2','RFE Split Squat',3,'5ea'),
          mkEx('C3','Hollow Rocks',3,'10'),
          mkEx('C4','YWTs',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('B1','Deadlift',4,'5',STR_B3,'deadlift'),
          mkEx('C1','Flywheel Row',3,'8ea'),
          mkEx('C2','45-Deg Back Extension',3,'10'),
          mkEx('C3','Side Plank',3,'30s'),
          mkEx('C4','Rower',3,'500m'),
        ]},
        dayC: { header: 'C Day', exercises: [
          mkEx('A1','Deficit Push Up',4,'8'),
          mkEx('A2','Contralateral Split Squat',4,'5ea'),
          mkEx('C1','Razor Curl',3,'8'),
          mkEx('C2','Chainsaw Row',3,'8ea'),
          mkEx('C3','Dragon Flag',3,'8'),
          mkEx('C4','Suitcase Carry',3,'1'),
        ]}
      }
    }
  },
  upper_lower: {
    label: 'Upper / Lower Split', days: ['dayA','dayB','dayC','dayD'], blocks: {
      1: {
        dayA: { header: 'A Day — Upper Push', exercises: [
          mkEx('A1','Press',3,'8',STR_B1,'press'),
          mkEx('B1','Isohold Lateral Raises',3,'12'),
          mkEx('B2','SA KOB Row',3,'8ea'),
          mkEx('C1','DB Curl',3,'10'),
          mkEx('C2','Hollow Hold',3,'30sec'),
        ]},
        dayB: { header: 'B Day — Lower Hinge', exercises: [
          mkEx('A1','Deadlift',3,'8',STR_B1,'deadlift'),
          mkEx('B1','45-Deg Back Extension',3,'10'),
          mkEx('B2','RFE Split Squat',3,'8ea'),
          mkEx('B3','Rower',3,'400m'),
        ]},
        dayC: { header: 'C Day — Upper Pull', exercises: [
          mkEx('A1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('B1','Push Press',3,'8',FS_B1,'push_press'),
          mkEx('B2','Band Pull-Aparts',3,'15'),
          mkEx('C1','Tricep Pushdown',3,'12'),
          mkEx('C2','Dead Bug',3,'8'),
        ]},
        dayD: { header: 'D Day — Lower Squat', exercises: [
          mkEx('A1','Front Squat',3,'8',FS_B1,'front_squat'),
          mkEx('B1','Ipsilateral Split Squat',3,'8ea'),
          mkEx('B2','Nordic Hamstring Curl',3,'8'),
          mkEx('B3','Plank',3,'30sec'),
        ]}
      },
      2: {
        dayA: { header: 'A Day — Upper Push', exercises: [
          mkEx('A1','Press',4,'5',STR_B2,'press'),
          mkEx('B1','TRX Ws',3,'12'),
          mkEx('B2','Chest Supported Row',3,'10'),
          mkEx('C1','DB Hammer Curl',3,'10'),
          mkEx('C2','Paloff Press',3,'10ea'),
        ]},
        dayB: { header: 'B Day — Lower Hinge', exercises: [
          mkEx('A1','Deadlift',4,'5',STR_B2,'deadlift'),
          mkEx('B1','Glute Ham Raise',3,'8'),
          mkEx('B2','Contralateral Split Squat',4,'5ea'),
          mkEx('B3','Bike',3,'10cal'),
        ]},
        dayC: { header: 'C Day — Upper Pull', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('B1','Push Press',4,'3',FS_B2,'push_press'),
          mkEx('B2','YWTs',3,'10'),
          mkEx('C1','Dips',3,'AMAP'),
          mkEx('C2','Copenhagen Plank',3,'20s'),
        ]},
        dayD: { header: 'D Day — Lower Squat', exercises: [
          mkEx('A1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('B1','RFE Split Squat',4,'5ea'),
          mkEx('B2','45-Deg Back Extension',3,'10'),
          mkEx('B3','Dead Bug',3,'8'),
        ]}
      },
      3: {
        dayA: { header: 'A Day — Upper Push', exercises: [
          mkEx('A1','Press',4,'5',STR_B3,'press'),
          mkEx('B1','Isohold Lateral Raises',3,'12'),
          mkEx('B2','Flywheel Row',3,'8ea'),
          mkEx('C1','DB Curl',3,'10'),
          mkEx('C2','Hollow Rocks',3,'10'),
        ]},
        dayB: { header: 'B Day — Lower Hinge', exercises: [
          mkEx('A1','Deadlift',4,'5',STR_B3,'deadlift'),
          mkEx('B1','Split Stance RDL',3,'8ea'),
          mkEx('B2','Contralateral Split Squat',4,'5ea'),
          mkEx('B3','Rower',3,'500m'),
        ]},
        dayC: { header: 'C Day — Upper Pull', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('B1','Push Press',4,'3',FS_B3,'push_press'),
          mkEx('B2','Band Pull-Aparts',3,'15'),
          mkEx('C1','Tricep Pushdown',3,'12'),
          mkEx('C2','Dragon Flag',3,'8'),
        ]},
        dayD: { header: 'D Day — Lower Squat', exercises: [
          mkEx('A1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('B1','RFE Split Squat',4,'5ea'),
          mkEx('B2','Razor Curl',3,'8'),
          mkEx('B3','Suitcase Carry',3,'1'),
        ]}
      }
    }
  },
  oly_4day: {
    label: 'Olympic Lifting 4-Day', days: ['dayA','dayB','dayC','dayD'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,['clean','jerk']),
          mkEx('C1','Back Squat',3,'8',STR_B1,'back_squat'),
          mkEx('D1','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','Hang Power Snatch',4,'3',PWR_B1,'snatch'),
          mkEx('C1','Hang Power Clean + Push Press',4,'2+3',PWR_B1,'clean'),
          mkEx('D1','Snatch Pull',3,'5',PULL_B1,'snatch'),
          mkEx('E1','45-Deg Back Extension',3,'10'),
        ]},
        dayC: { header: 'C Day — Big Snatch + Jerk + FS', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',5,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Push Jerk',5,'3',OLY_B1,'clean'),
          mkEx('C1','Push Press',4,'5',FS_B1,'push_press'),
          mkEx('D1','DB Bench Press',3,'8'),
          mkEx('D2','TRX Ws',3,'12'),
        ]},
        dayD: { header: 'D Day — Snatch + Heavy C&J + Pull', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Hang Clean + Jerk',5,'2+2',CJ_HEAVY_B1,['clean','jerk']),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','Back Squat',4,'5',STR_B2,'back_squat'),
          mkEx('D1','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','Hang Power Snatch',4,'2',PWR_B2,'snatch'),
          mkEx('C1','Hang Power Clean + Push Press',4,'1+3',PWR_B2,'clean'),
          mkEx('D1','Snatch Pull',4,'2',PULL_B2,'snatch'),
          mkEx('E1','Glute Ham Raise',3,'8'),
        ]},
        dayC: { header: 'C Day — Big Snatch + Jerk + FS', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',5,'2',OLY_B2,'snatch'),
          mkEx('B1','Push Jerk',5,'2',OLY_B2,'clean'),
          mkEx('C1','Push Press',4,'3',FS_B2,'push_press'),
          mkEx('D1','Bench Press',3,'5',STR_B2,'bench_press'),
          mkEx('D2','Band Pull-Aparts',3,'15'),
        ]},
        dayD: { header: 'D Day — Snatch + Heavy C&J + Pull', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Jerk',5,'1+2',CJ_HEAVY_B2,['clean','jerk']),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','Chest Supported Row',3,'10'),
          mkEx('D2','Paloff Press',3,'10ea'),
        ]}
      },
      3: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,['clean','jerk']),
          mkEx('C1','Back Squat',4,'5',STR_B3,'back_squat'),
          mkEx('D1','Chin Up',3,'AMAP'),
        ]},
        dayB: { header: 'B Day — Plyo + Power', exercises: [
          mkEx('A1','Plyo Warmup',1,'1'),
          mkEx('B1','Hang Power Snatch',4,'2',PWR_B3,'snatch'),
          mkEx('C1','Hang Power Clean + Push Press',4,'1+2',PWR_B3,'clean'),
          mkEx('D1','Snatch Pull',4,'2',PULL_B3,'snatch'),
          mkEx('E1','Split Stance RDL',3,'8ea'),
        ]},
        dayC: { header: 'C Day — Big Snatch + Jerk + FS', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',5,'2',OLY_B3,'snatch'),
          mkEx('B1','Push Jerk',5,'2',OLY_B3,'clean'),
          mkEx('C1','Push Press',4,'3',FS_B3,'push_press'),
          mkEx('D1','DB Bench Press',3,'8'),
          mkEx('D2','YWTs',3,'10'),
        ]},
        dayD: { header: 'D Day — Snatch + Heavy C&J + Pull', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Hang Clean + Jerk',5,'1+1',CJ_HEAVY_B3,['clean','jerk']),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','Flywheel Row',3,'8ea'),
          mkEx('D2','Dragon Flag',3,'8'),
        ]}
      }
    }
  },
  hs_tech_speed: {
    label: 'HS Technique + Speed', days: ['dayA'], blocks: {
      1: { dayA: { header: 'A Day', exercises: [
        mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
        mkEx('B1','PP Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
        mkEx('C1','Hang Clean',4,'3',OLY_B1,'clean'),
        mkEx('D1','PAK Clean Pull + Clean Pull',3,'3',PULL_B1,'clean'),
        mkEx('E1','Nordic Hamstring Curl',3,'8'),
      ]}},
      2: { dayA: { header: 'A Day', exercises: [
        mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
        mkEx('B1','PP Clean + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
        mkEx('C1','Hang Clean',4,'2',OLY_B2,'clean'),
        mkEx('D1','PAK Clean Pull + Clean Pull',3,'2',PULL_B2,'clean'),
        mkEx('E1','Glute Ham Raise',3,'8'),
      ]}},
      3: { dayA: { header: 'A Day', exercises: [
        mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
        mkEx('B1','PP Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
        mkEx('C1','Hang Clean',4,'2',OLY_B3,'clean'),
        mkEx('D1','PAK Clean Pull + Clean Pull',3,'2',PULL_B3,'clean'),
        mkEx('E1','Razor Curl',3,'8'),
      ]}}
    }
  },
  oly_4day_undulating: {
    label: '4-Day Olympic Lifting (Undulating)', days: ['dayA','dayB','dayC','dayD'], blocks: {
      1: {
        pctLabel:'65-75%', w1note:'65% only',
        dayA: { header: 'Day 1 — Mon', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,['clean','jerk']),
          mkEx('C1','Back Squat',4,'5',STR_B1,'back_squat'),
          mkEx('D1','DB Bench Press',3,'10'),
        ]},
        dayB: { header: 'Day 2 — Tue', exercises: [
          WU_B_pp,
          mkEx('A1','Power Snatch',4,'2',PWR_B1,'snatch'),
          mkEx('B1','Power Clean + Push Press',4,'1+5',OLY_B1,['clean','push_press']),
          mkEx('C1','Snatch Pull',4,'3',PULL_B1,'snatch'),
          mkEx('D1','Hanging Knee Raises',3,'12'),
          mkEx('D2','Good Morning',3,'10'),
        ]},
        dayC: { header: 'Day 3 — Thu', exercises: [
          WU_A,
          mkEx('A1','No Foot Snatch',4,'2',OLY_B1,'snatch'),
          mkEx('B1','Jerk from Rack',4,'2',OLY_B1,'jerk'),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','RFE Split Squat',3,'8ea'),
        ]},
        dayD: { header: 'Day 4 — Fri', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch + OHS',4,'2+1',OLY_B1,['snatch','front_squat']),
          mkEx('B1','Hang Clean + Jerk',4,'2+2',OLY_B1,['clean','jerk']),
          mkEx('C1','Clean Pull',4,'3',PULL_B1,'clean'),
          mkEx('D1','Chin Up',3,'8'),
        ]}
      },
      2: {
        pctLabel:'75-85%', w1note:'75% only',
        dayA: { header: 'Day 1 — Mon', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'1+2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+1',OLY_B2,['clean','jerk']),
          mkEx('C1','Back Squat',4,'3',STR_B2,'back_squat'),
          mkEx('D1','Strict Press',3,'8',STR_B2,'press'),
        ]},
        dayB: { header: 'Day 2 — Tue', exercises: [
          WU_B_pp,
          mkEx('A1','Power Snatch from Hang',4,'2',PWR_B2,'snatch'),
          mkEx('B1','Power Clean from Hang + Push Press',4,'1+3',OLY_B2,['clean','push_press']),
          mkEx('C1','Snatch High Pull',4,'2',PULL_B2,'snatch'),
          mkEx('D1','Toes to Bar',3,'10'),
          mkEx('D2','RDL',3,'8'),
        ]},
        dayC: { header: 'Day 3 — Thu', exercises: [
          WU_A,
          mkEx('A1','Pause at Knee Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Front Squat + Jerk',4,'1+2',OLY_B2,['front_squat','jerk']),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'6ea'),
        ]},
        dayD: { header: 'Day 4 — Fri', exercises: [
          WU_A,
          mkEx('A1','Block Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+2',OLY_B2,['clean','jerk']),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','Chest Supported Row',3,'10'),
        ]}
      },
      3: {
        pctLabel:'75-90%', w1note:'75% only',
        dayA: { header: 'Day 1 — Mon', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',CJ_HEAVY_B3,['clean','jerk']),
          mkEx('C1','Back Squat',4,'3',STR_B3,'back_squat'),
          mkEx('D1','DB Shoulder Press',3,'8'),
        ]},
        dayB: { header: 'Day 2 — Tue', exercises: [
          WU_B_pp,
          mkEx('A1','Power Snatch from Blocks',4,'2',PWR_B3,'snatch'),
          mkEx('B1','Hang Power Clean + Push Press',4,'1+3',OLY_B3,['clean','push_press']),
          mkEx('C1','Pause at Knee Snatch Pull',4,'2',PULL_B3,'snatch'),
          mkEx('D1','Dragon Flag',3,'8'),
          mkEx('D2','Glute Ham Raise',3,'8'),
        ]},
        dayC: { header: 'Day 3 — Thu', exercises: [
          WU_A,
          mkEx('A1','No Foot No Hook Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Behind-the-Neck Push Jerk',4,'2',OLY_B3,'jerk'),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','Contralateral Split Squat',3,'5ea'),
        ]},
        dayD: { header: 'Day 4 — Fri', exercises: [
          WU_A,
          mkEx('A1','Snatch from Blocks',4,'2',OLY_B3,'snatch'),
          mkEx('B1','PP Clean + Jerk',4,'1+1',CJ_HEAVY_B3,['clean','jerk']),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','Bent-Over Row',3,'8'),
        ]}
      }
    }
  },
  matt_linear: (function() {
    // ===========================================================
    // Matt's Program — 12-week macrocycle (3 blocks x 4 weeks)
    // Simple linear block periodization. Same exercises, same sets/reps
    // every week within a block. Percentages step up across blocks.
    // Mon: Acceleration / Power Clean+Jerk / Back Squat / Single Leg / Core
    // Wed: Approach Jumps / Power Snatch / RDL / Nordic / Pull-ups
    // Fri: Bench Press / RFE Split Squat / Rows / Lateral Raises
    // ===========================================================
    const mm = (ex, pw) => { ex.matts = { perWeek: pw }; return ex }

    // Block percentage bands — same range all 4 weeks within a block
    const M_OLY_B1 = [0.65, 0.65, 0.75]
    const M_OLY_B2 = [0.70, 0.70, 0.80]
    const M_OLY_B3 = [0.75, 0.75, 0.85]
    const M_SQ_B1  = [0.70, 0.70, 0.80]
    const M_SQ_B2  = [0.75, 0.75, 0.85]
    const M_SQ_B3  = [0.80, 0.80, 0.90]
    const M_RDL_B1 = [0.65, 0.65, 0.75]
    const M_RDL_B2 = [0.70, 0.70, 0.80]
    const M_RDL_B3 = [0.75, 0.75, 0.85]

    // Bench uses top-set + AMRAP drop (needs matts perWeek for bench rendering)
    const benchWeeks = (topReps, topPct) => {
      const bw = { bench: { topReps, topPct } }
      return { 1: bw, 2: bw, 3: bw, 4: bw }
    }

    return {
      label: "Matt's Program",
      days: ['dayA','dayB','dayC'],
      blocks: {
        // ============================== BLOCK 1 ==============================
        1: {
          pctLabel: 'Block 1 — Oly 65-75% / Squat 70-80%',
          dayA: { header: 'Monday — Acceleration / Clean / Squat', exercises: [
            mkEx('WU','Acceleration','','',null,null,'flys, resistance sprints'),
            mkEx('A1','Power Clean + Power Jerk',4,'2+2',M_OLY_B1,'clean'),
            mkEx('B1','Back Squat',4,'5',M_SQ_B1,'back_squat','S1 3s ecc, S2 iso, S3-4 normal'),
            mkEx('C1','Calf Raises',3,'10',null,null),
            mkEx('C2','Core',3,'10',null,null),
          ]},
          dayB: { header: 'Wednesday — Jumps / Snatch / Posterior', exercises: [
            mkEx('WU','Approach Jumps','','',null,null),
            mkEx('A1','Power Snatch from Box',4,'3',M_OLY_B1,'snatch'),
            mkEx('B1','RDL',3,'8',M_RDL_B1,'deadlift'),
            mkEx('C1','Nordic Curls',3,'8',null,null),
            mkEx('C2','Pull Ups',3,'8',null,null),
          ]},
          dayC: { header: 'Friday — Upper / Single Leg', exercises: [
            mm(mkEx('A1','Bench Press',1,'5',null,'bench_press'), benchWeeks(5, 80)),
            mkEx('B1','RFE Split Squat',3,'5ea',null,null),
            mkEx('C1','Chest Supported Rows',3,'8',null,null),
            mkEx('C2','Lateral Raises',3,'10',null,null),
          ]}
        },
        // ============================== BLOCK 2 ==============================
        2: {
          pctLabel: 'Block 2 — Oly 70-80% / Squat 75-85%',
          dayA: { header: 'Monday — Acceleration / Clean / Squat', exercises: [
            mkEx('WU','Acceleration','','',null,null,'flys, resistance sprints'),
            mkEx('A1','Power Clean + Power Jerk',4,'2+2',M_OLY_B2,'clean'),
            mkEx('B1','Back Squat',4,'5',M_SQ_B2,'back_squat','S1 3s ecc, S2 iso, S3-4 normal'),
            mkEx('C1','Calf Raises',3,'10',null,null),
            mkEx('C2','Core',3,'10',null,null),
          ]},
          dayB: { header: 'Wednesday — Jumps / Snatch / Posterior', exercises: [
            mkEx('WU','Approach Jumps','','',null,null),
            mkEx('A1','Power Snatch from Box',4,'3',M_OLY_B2,'snatch'),
            mkEx('B1','RDL',3,'8',M_RDL_B2,'deadlift'),
            mkEx('C1','Nordic Curls',3,'8',null,null),
            mkEx('C2','Pull Ups',3,'8',null,null),
          ]},
          dayC: { header: 'Friday — Upper / Single Leg', exercises: [
            mm(mkEx('A1','Bench Press',1,'5',null,'bench_press'), benchWeeks(5, 85)),
            mkEx('B1','RFE Split Squat',3,'5ea',null,null),
            mkEx('C1','Chest Supported Rows',3,'8',null,null),
            mkEx('C2','Lateral Raises',3,'10',null,null),
          ]}
        },
        // ============================== BLOCK 3 ==============================
        3: {
          pctLabel: 'Block 3 — Oly 75-85% / Squat 80-90%',
          dayA: { header: 'Monday — Acceleration / Clean / Squat', exercises: [
            mkEx('WU','Acceleration','','',null,null,'flys, resistance sprints'),
            mkEx('A1','Power Clean + Power Jerk',4,'2+2',M_OLY_B3,'clean'),
            mkEx('B1','Back Squat',4,'5',M_SQ_B3,'back_squat','S1 3s ecc, S2 iso, S3-4 normal'),
            mkEx('C1','Calf Raises',3,'10',null,null),
            mkEx('C2','Core',3,'10',null,null),
          ]},
          dayB: { header: 'Wednesday — Jumps / Snatch / Posterior', exercises: [
            mkEx('WU','Approach Jumps','','',null,null),
            mkEx('A1','Power Snatch from Box',4,'3',M_OLY_B3,'snatch'),
            mkEx('B1','RDL',3,'8',M_RDL_B3,'deadlift'),
            mkEx('C1','Nordic Curls',3,'8',null,null),
            mkEx('C2','Pull Ups',3,'8',null,null),
          ]},
          dayC: { header: 'Friday — Upper / Single Leg', exercises: [
            mm(mkEx('A1','Bench Press',1,'5',null,'bench_press'), benchWeeks(5, 90)),
            mkEx('B1','RFE Split Squat',3,'5ea',null,null),
            mkEx('C1','Chest Supported Rows',3,'8',null,null),
            mkEx('C2','Lateral Raises',3,'10',null,null),
          ]}
        }
      }
    }
  })(),
  matts_online: {
    label: "Matt's Online Program",
    days: ['dayA','dayB','dayC','dayD','dayE'],
    weeks: 3,
    blocks: {
      1: {
        pctLabel: 'Block 1',
        dayA: { header: 'Monday — Acceleration / Horizontal Jump / Squat', exercises: [
          mkEx('A1','Spanish Squat ISO',2,'30s',null,null),
          mkEx('A2','Run Specific ISO',2,'20s ea',null,null),
          mkEx('B1','Fly 10 (5yd Lead In)',4,'1',null,null,'90, 95, 100, 100%'),
          mkEx('C1','Resisted Sprint',3,'1',null,null,'max load'),
          mkEx('D1','Broad Jump to Box',8,'1',null,null),
          mkEx('E1','Box Squat',3,'3',null,'back_squat','5010 · 0.45–0.55 m/s'),
          mkEx('F1','Single Leg Calf ISO',3,'30s ea',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper / Intervals', exercises: [
          mkEx('A1','Explosive Push Up to Box',3,'5',null,null),
          mkEx('B1','Bench Press',4,'3',null,'bench_press','50X1 · 0.3–0.4 m/s'),
          mkEx('C1','Chainsaw Row',3,'6 ea',null,null,'3010'),
          mkEx('C2','Dragon Flag',3,'5',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('D1','Bike Intervals',14,'1',null,null,'20s on, 40s off'),
        ]},
        dayC: { header: 'Wednesday — Vertical Power / Posterior Chain', exercises: [
          mkEx('A1','Run Specific ISO',2,'30s ea',null,null),
          mkEx('WU','Plyo Warm Up','','',null,null),
          mkEx('C1','Static Jump',3,'1',null,null,'log height'),
          mkEx('D1','Countermovement Jump',3,'1',null,null,'log height'),
          mkEx('E1','Barbell Hip Thrust',3,'6',null,null),
          mkEx('F1','Loaded Split Squat ISO',3,'30s ea',null,null),
          mkEx('G1','45° Back Extension',3,'12',null,null),
        ]},
        dayD: { header: 'Thursday — Upper / Easy Aerobic', exercises: [
          mkEx('A1','Push Press',4,'3',[0.75,0.75,0.85],'push_press'),
          mkEx('A2','Chin Up Eccentric',4,'4',null,null,'5s lowering'),
          mkEx('B1','Curls',3,'10',null,null),
          mkEx('B2','Landmine Anti Rotation',3,'8 ea',null,null),
          mkEx('C1','Bike',1,'30 min',null,null,'steady state'),
        ]},
        dayE: { header: 'Saturday — Max Velocity', exercises: [
          mkEx('WU','Warm Up','','',null,null,'15 min'),
          mkEx('B1','Fly 10 (15–20yd Lead In)',4,'25 yds',null,null),
          mkEx('C1','Accel Float',1,'40 yds',null,null),
          mkEx('D1','Hurdle Jump + Reactive',2,'4',null,null),
          mkEx('E1','Split Squat ISO',2,'60s ea',null,null),
          mkEx('F1','SL Hip Thrust ISO',2,'60s ea',null,null),
          mkEx('G1','Copenhagen',2,'30s ea',null,null),
        ]}
      },
      2: {
        pctLabel: 'Block 2',
        dayA: { header: 'Monday — Acceleration / Horizontal Jump / Squat', exercises: [
          mkEx('A1','Spanish Squat ISO',2,'30s',null,null),
          mkEx('A2','Run Specific ISO',2,'20s ea',null,null),
          mkEx('B1','Fly 10 (5yd Lead In)',4,'1',null,null,'90, 95, 100, 100%'),
          mkEx('C1','Resisted Sprint',3,'1',null,null,'max load'),
          mkEx('D1','Broad Jump to Box',8,'1',null,null),
          mkEx('E1','Box Squat',3,'3',null,'back_squat','5010 · 0.45–0.55 m/s'),
          mkEx('F1','Single Leg Calf ISO',3,'30s ea',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper / Intervals', exercises: [
          mkEx('A1','Explosive Push Up to Box',3,'5',null,null),
          mkEx('B1','Bench Press',4,'3',null,'bench_press','50X1 · 0.3–0.4 m/s'),
          mkEx('C1','Chainsaw Row',3,'6 ea',null,null,'3010'),
          mkEx('C2','Dragon Flag',3,'5',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('D1','Bike Intervals',14,'1',null,null,'20s on, 40s off'),
        ]},
        dayC: { header: 'Wednesday — Vertical Power / Posterior Chain', exercises: [
          mkEx('A1','Run Specific ISO',2,'30s ea',null,null),
          mkEx('WU','Plyo Warm Up','','',null,null),
          mkEx('C1','Static Jump',3,'1',null,null,'log height'),
          mkEx('D1','Countermovement Jump',3,'1',null,null,'log height'),
          mkEx('E1','Barbell Hip Thrust',3,'6',null,null),
          mkEx('F1','Loaded Split Squat ISO',3,'30s ea',null,null),
          mkEx('G1','45° Back Extension',3,'12',null,null),
        ]},
        dayD: { header: 'Thursday — Upper / Easy Aerobic', exercises: [
          mkEx('A1','Push Press',4,'3',[0.80,0.80,0.90],'push_press'),
          mkEx('A2','Chin Up Eccentric',4,'4',null,null,'5s lowering'),
          mkEx('B1','Curls',3,'10',null,null),
          mkEx('B2','Landmine Anti Rotation',3,'8 ea',null,null),
          mkEx('C1','Bike',1,'30 min',null,null,'steady state'),
        ]},
        dayE: { header: 'Saturday — Max Velocity', exercises: [
          mkEx('WU','Warm Up','','',null,null,'15 min'),
          mkEx('B1','Fly 10 (15–20yd Lead In)',4,'25 yds',null,null),
          mkEx('C1','Accel Float',1,'40 yds',null,null),
          mkEx('D1','Hurdle Jump + Reactive',2,'4',null,null),
          mkEx('E1','Split Squat ISO',2,'60s ea',null,null),
          mkEx('F1','SL Hip Thrust ISO',2,'60s ea',null,null),
          mkEx('G1','Copenhagen',2,'30s ea',null,null),
        ]}
      },
      3: {
        pctLabel: 'Block 3',
        dayA: { header: 'Monday — Acceleration / Horizontal Jump / Squat', exercises: [
          mkEx('A1','Spanish Squat ISO',2,'30s',null,null),
          mkEx('A2','Run Specific ISO',2,'20s ea',null,null),
          mkEx('B1','Fly 10 (5yd Lead In)',4,'1',null,null,'90, 95, 100, 100%'),
          mkEx('C1','Resisted Sprint',3,'1',null,null,'max load'),
          mkEx('D1','Broad Jump to Box',8,'1',null,null),
          mkEx('E1','Box Squat',3,'3',null,'back_squat','5010 · 0.45–0.55 m/s'),
          mkEx('F1','Single Leg Calf ISO',3,'30s ea',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper / Intervals', exercises: [
          mkEx('A1','Explosive Push Up to Box',3,'5',null,null),
          mkEx('B1','Bench Press',4,'3',null,'bench_press','50X1 · 0.3–0.4 m/s'),
          mkEx('C1','Chainsaw Row',3,'6 ea',null,null,'3010'),
          mkEx('C2','Dragon Flag',3,'5',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('D1','Bike Intervals',14,'1',null,null,'20s on, 40s off'),
        ]},
        dayC: { header: 'Wednesday — Vertical Power / Posterior Chain', exercises: [
          mkEx('A1','Run Specific ISO',2,'30s ea',null,null),
          mkEx('WU','Plyo Warm Up','','',null,null),
          mkEx('C1','Static Jump',3,'1',null,null,'log height'),
          mkEx('D1','Countermovement Jump',3,'1',null,null,'log height'),
          mkEx('E1','Barbell Hip Thrust',3,'6',null,null),
          mkEx('F1','Loaded Split Squat ISO',3,'30s ea',null,null),
          mkEx('G1','45° Back Extension',3,'12',null,null),
        ]},
        dayD: { header: 'Thursday — Upper / Easy Aerobic', exercises: [
          mkEx('A1','Push Press',4,'3',[0.85,0.85,0.95],'push_press'),
          mkEx('A2','Chin Up Eccentric',4,'4',null,null,'5s lowering'),
          mkEx('B1','Curls',3,'10',null,null),
          mkEx('B2','Landmine Anti Rotation',3,'8 ea',null,null),
          mkEx('C1','Bike',1,'30 min',null,null,'steady state'),
        ]},
        dayE: { header: 'Saturday — Max Velocity', exercises: [
          mkEx('WU','Warm Up','','',null,null,'15 min'),
          mkEx('B1','Fly 10 (15–20yd Lead In)',4,'25 yds',null,null),
          mkEx('C1','Accel Float',1,'40 yds',null,null),
          mkEx('D1','Hurdle Jump + Reactive',2,'4',null,null),
          mkEx('E1','Split Squat ISO',2,'60s ea',null,null),
          mkEx('F1','SL Hip Thrust ISO',2,'60s ea',null,null),
          mkEx('G1','Copenhagen',2,'30s ea',null,null),
        ]}
      }
    }
  },
  max_upper_lower: {
    label: "Matt's Upper Lower",
    days: ['dayA','dayB','dayC','dayD'],
    blocks: {
      1: {
        pctLabel: 'Block 1 — Oly 65-75% / Str 60-70%',
        dayA: { header: 'Monday — Lower', exercises: [
          mkEx('A1','Clean',5,'3',OLY_B1,'clean'),
          mkEx('B1','Front Squat',4,'5',STR_B1,'front_squat'),
          mkEx('C1','Nordic Curls',3,'8',null,null),
          mkEx('C2','Seated Calf Raise',3,'10',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B1,'bench_press'),
          mkEx('B1','Row',3,'8',null,null),
          mkEx('C1','Core (Anterior)',3,'10',null,null),
          mkEx('C2','Biceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]},
        dayC: { header: 'Wednesday — Lower', exercises: [
          mkEx('WU','Jump','','',null,null),
          mkEx('A1','Snatch',5,'3',OLY_B1,'snatch'),
          mkEx('B1','Single Leg Squat',3,'5ea',null,null),
          mkEx('C1','Standing Calf Raise',3,'10',null,null),
        ]},
        dayD: { header: 'Thursday — Upper', exercises: [
          mkEx('A1','Overhead Press',4,'5',STR_B1,'push_press'),
          mkEx('B1','Vertical Pull',3,'8',null,null),
          mkEx('C1','Lateral Core',3,'10',null,null),
          mkEx('C2','Flywheel',3,'10',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]}
      },
      2: {
        pctLabel: 'Block 2 — Oly 70-80% / Str 70-80%',
        dayA: { header: 'Monday — Lower', exercises: [
          mkEx('A1','Clean',5,'3',OLY_B2,'clean'),
          mkEx('B1','Front Squat',4,'5',STR_B2,'front_squat'),
          mkEx('C1','Nordic Curls',3,'8',null,null),
          mkEx('C2','Seated Calf Raise',3,'10',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('B1','Row',3,'8',null,null),
          mkEx('C1','Core (Anterior)',3,'10',null,null),
          mkEx('C2','Biceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]},
        dayC: { header: 'Wednesday — Lower', exercises: [
          mkEx('WU','Jump','','',null,null),
          mkEx('A1','Snatch',5,'3',OLY_B2,'snatch'),
          mkEx('B1','Single Leg Squat',3,'5ea',null,null),
          mkEx('C1','Standing Calf Raise',3,'10',null,null),
        ]},
        dayD: { header: 'Thursday — Upper', exercises: [
          mkEx('A1','Overhead Press',4,'5',STR_B2,'push_press'),
          mkEx('B1','Vertical Pull',3,'8',null,null),
          mkEx('C1','Lateral Core',3,'10',null,null),
          mkEx('C2','Flywheel',3,'10',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]}
      },
      3: {
        pctLabel: 'Block 3 — Oly 75-85% / Str 75-80%',
        dayA: { header: 'Monday — Lower', exercises: [
          mkEx('A1','Clean',5,'3',OLY_B3,'clean'),
          mkEx('B1','Front Squat',4,'5',STR_B3,'front_squat'),
          mkEx('C1','Nordic Curls',3,'8',null,null),
          mkEx('C2','Seated Calf Raise',3,'10',null,null),
        ]},
        dayB: { header: 'Tuesday — Upper', exercises: [
          mkEx('A1','Bench Press',4,'5',STR_B3,'bench_press'),
          mkEx('B1','Row',3,'8',null,null),
          mkEx('C1','Core (Anterior)',3,'10',null,null),
          mkEx('C2','Biceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]},
        dayC: { header: 'Wednesday — Lower', exercises: [
          mkEx('WU','Jump','','',null,null),
          mkEx('A1','Snatch',5,'3',OLY_B3,'snatch'),
          mkEx('B1','Single Leg Squat',3,'5ea',null,null),
          mkEx('C1','Standing Calf Raise',3,'10',null,null),
        ]},
        dayD: { header: 'Thursday — Upper', exercises: [
          mkEx('A1','Overhead Press',4,'5',STR_B3,'push_press'),
          mkEx('B1','Vertical Pull',3,'8',null,null),
          mkEx('C1','Lateral Core',3,'10',null,null),
          mkEx('C2','Flywheel',3,'10',null,null),
          mkEx('C3','Triceps',3,'10',null,null),
          mkEx('WU','20 Min Bike','','',null,null,'steady state'),
        ]}
      }
    }
  },
  oly_3day_undulating: (function() {
    // =========================================================
    // Olympic Lifting 3-Day Undulating — 3 blocks x 4 weeks
    // Block 1: volume/moderate | Block 2: intensity | Block 3: peaking
    // Day 1: Snatch / C&J / Back Squat (+2 accessory slots)
    // Day 2: Power Snatch / Clean+Push Press / Snatch Pull (+2 accessory slots)
    // Day 3: Snatch var / Heavy C&J / Front Squat / Clean Pull (+1 accessory slot)
    // =========================================================
    // Reuse the same perWeek metadata shape used by Matt's Program
    const mm = (ex, pw) => { ex.matts = { perWeek: pw }; return ex }
    const acc1 = () => [mkEx('ACC1','',3,'10',null,null)]
    const acc2 = () => [mkEx('ACC1','',3,'10',null,null), mkEx('ACC2','',3,'10',null,null)]

    // Shorthand intensity blocks (percent integers, not decimals)
    const Z_65_75 = { pctLo: 65, pctHi: 75 }
    const Z_60_70 = { pctLo: 60, pctHi: 70 }
    const Z_55_65 = { pctLo: 55, pctHi: 65 }
    const Z_70_80 = { pctLo: 70, pctHi: 80 }
    const Z_65_75b = { pctLo: 65, pctHi: 75 }
    const Z_75_85 = { pctLo: 75, pctHi: 85 }
    const Z_75_90 = { pctLo: 75, pctHi: 90 }
    const Z_80_90 = { pctLo: 80, pctHi: 90 }
    const Z_90_100 = { pctLo: 90, pctHi: 100 }
    const Z_90_105 = { pctLo: 90, pctHi: 105 }
    const Z_95_105 = { pctLo: 95, pctHi: 105 }
    const Z_100_115 = { pctLo: 100, pctHi: 115 }
    const Z_105_115 = { pctLo: 105, pctHi: 115 }
    const Z_110_120 = { pctLo: 110, pctHi: 120 }

    return {
      label: 'Olympic Lifting 3-Day Undulating',
      days: ['dayA','dayB','dayC'],
      blocks: {
        // ============================== BLOCK 1 ==============================
        1: {
          pctLabel: 'Block 1',
          dayA: { header: 'Day 1 \u2014 Snatch / C&J / Back Squat', exercises: [
            mm(mkEx('A1','Snatch',4,'3',null,'snatch'), {
              1: { sets: '4', reps: '3', ...Z_65_75 },
              2: { sets: '4', reps: '2', ...Z_65_75 },
              3: { sets: '4', reps: '2', ...Z_75_85 },
              4: { intent: 'HS', note: 'up to 95%' }
            }),
            mm(mkEx('B1','Clean + Jerk',4,'2+3',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '4', reps: '2+3', ...Z_65_75 },
              2: { sets: '4', reps: '2+2', ...Z_65_75 },
              3: { sets: '4', reps: '2+3', ...Z_65_75 },
              4: { sets: '4', reps: '2+2', ...Z_65_75 }
            }),
            mm(mkEx('C1','Back Squat',4,'5',null,'back_squat'), {
              1: { sets: '4', reps: '5', ...Z_70_80 },
              2: { intent: '3RM' },
              3: { sets: '4', reps: '5', ...Z_70_80 },
              4: { sets: '4', reps: '4', ...Z_70_80 }
            }),
            ...acc2(),
          ]},
          dayB: { header: 'Day 2 \u2014 Power Snatch / C+PP / Snatch Pull', exercises: [
            mm(mkEx('A1','Power Snatch',4,'3',null,'snatch'), {
              1: { sets: '4', reps: '3', ...Z_55_65 },
              2: { sets: '4', reps: '3', ...Z_55_65 },
              3: { sets: '4', reps: '3', ...Z_55_65 },
              4: { sets: '4', reps: '3', ...Z_55_65 }
            }),
            mm(mkEx('B1','Clean + Push Press',4,'1+5',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '4', reps: '1+5', ...Z_65_75 },
              2: { sets: '4', reps: '1+5', ...Z_65_75 },
              3: { sets: '4', reps: '1+5', ...Z_65_75 },
              4: { sets: '4', reps: '1+5', ...Z_65_75 }
            }),
            mm(mkEx('C1','Snatch Pull',4,'3',null,'snatch'), {
              1: { sets: '4', reps: '3', ...Z_90_100 },
              2: { sets: '4', reps: '3', ...Z_90_100 },
              3: { sets: '4', reps: '3', ...Z_90_100 },
              4: { sets: '3', reps: '3', ...Z_90_100 }
            }),
            ...acc2(),
          ]},
          dayC: { header: 'Day 3 \u2014 Snatch var / Heavy C&J / FS / Clean Pull', exercises: [
            mm(mkEx('A1','Snatch variation (lighter)',4,'3',null,'snatch'), {
              1: { sets: '4', reps: '3', ...Z_60_70 },
              2: { sets: '4', reps: '2', ...Z_60_70 },
              3: { sets: '4', reps: '3', ...Z_60_70 },
              4: { sets: '4', reps: '3', ...Z_60_70 }
            }),
            mm(mkEx('B1','Heavy Clean + Jerk',5,'2+2',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '5', reps: '2+2', ...Z_70_80 },
              2: { sets: '4', reps: '2+2', ...Z_70_80 },
              3: { sets: '4', reps: '2+2', ...Z_70_80 },
              4: { intent: 'HS', note: 'up to 95%' }
            }),
            mm(mkEx('C1','Front Squat',4,'5',null,'front_squat'), {
              1: { sets: '4', reps: '5', ...Z_65_75 },
              2: { intent: '3RM' },
              3: { sets: '4', reps: '5', ...Z_65_75 },
              4: { sets: '4', reps: '5', ...Z_65_75 }
            }),
            mm(mkEx('D1','Clean Pull',4,'3',null,'clean'), {
              1: { sets: '4', reps: '3', ...Z_90_105 },
              2: { sets: '4', reps: '3', ...Z_90_105 },
              3: { sets: '4', reps: '3', ...Z_90_105 },
              4: { sets: '3', reps: '3', ...Z_90_105 }
            }),
            ...acc1(),
          ]}
        },
        // ============================== BLOCK 2 ==============================
        2: {
          pctLabel: 'Block 2',
          dayA: { header: 'Day 1 \u2014 Snatch / C&J / Back Squat', exercises: [
            mm(mkEx('A1','Snatch',5,'2',null,'snatch'), {
              1: { sets: '5', reps: '2', ...Z_75_85 },
              2: { sets: '4', reps: '2', ...Z_75_85 },
              3: { sets: '5', reps: '2', ...Z_75_85 },
              4: { intent: 'HS', note: 'up to 95%' }
            }),
            mm(mkEx('B1','Clean + Jerk',4,'2+2',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '4', reps: '2+2', ...Z_75_85 },
              2: { sets: '4', reps: '1+2', ...Z_75_85 },
              3: { sets: '4', reps: '2+2', ...Z_75_85 },
              4: { sets: '4', reps: '2+2', ...Z_75_85 }
            }),
            mm(mkEx('C1','Back Squat',5,'4',null,'back_squat'), {
              1: { sets: '5', reps: '4', ...Z_75_85 },
              2: { intent: '2RM' },
              3: { sets: '4', reps: '4', ...Z_75_85 },
              4: { sets: '4', reps: '4', ...Z_75_85 }
            }),
            ...acc2(),
          ]},
          dayB: { header: 'Day 2 \u2014 Power Snatch / C+PP / Snatch Pull', exercises: [
            mm(mkEx('A1','Power Snatch',4,'2',null,'snatch'), {
              1: { sets: '4', reps: '2', ...Z_65_75 },
              2: { sets: '4', reps: '2', ...Z_65_75 },
              3: { sets: '4', reps: '2', ...Z_65_75 },
              4: { sets: '4', reps: '2', ...Z_65_75 }
            }),
            mm(mkEx('B1','Clean + Push Press',4,'1+3',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '4', reps: '1+3', ...Z_75_85 },
              2: { sets: '4', reps: '1+3', ...Z_75_85 },
              3: { sets: '4', reps: '1+3', ...Z_75_85 },
              4: { sets: '4', reps: '1+3', ...Z_75_85 }
            }),
            mm(mkEx('C1','Snatch Pull',4,'2',null,'snatch'), {
              1: { sets: '4', reps: '2', ...Z_95_105 },
              2: { sets: '4', reps: '2', ...Z_95_105 },
              3: { sets: '4', reps: '2', ...Z_95_105 },
              4: { sets: '4', reps: '2', ...Z_95_105 }
            }),
            ...acc2(),
          ]},
          dayC: { header: 'Day 3 \u2014 Snatch var / Heavy C&J / FS / Clean Pull', exercises: [
            mm(mkEx('A1','Snatch variation',4,'3',null,'snatch'), {
              1: { sets: '4', reps: '3', ...Z_65_75 },
              2: { sets: '4', reps: '2', ...Z_75_85 },
              3: { sets: '4', reps: '2', ...Z_75_85 },
              4: { sets: '4', reps: '2', ...Z_75_85 }
            }),
            mm(mkEx('B1','Heavy Clean + Jerk',5,'1+2',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '5', reps: '1+2', ...Z_75_90 },
              2: { sets: '4', reps: '1+2', ...Z_75_90 },
              3: { sets: '4', reps: '1+2', ...Z_75_90 },
              4: { intent: 'HS', note: 'up to 95%' }
            }),
            mm(mkEx('C1','Front Squat',4,'3',null,'front_squat'), {
              1: { sets: '4', reps: '3', ...Z_75_85 },
              2: { intent: '2RM' },
              3: { sets: '4', reps: '3', ...Z_75_85 },
              4: { sets: '4', reps: '3', ...Z_75_85 }
            }),
            mm(mkEx('D1','Clean Pull',4,'2',null,'clean'), {
              1: { sets: '4', reps: '2', ...Z_90_105 },
              2: { intent: '2RM', altExercise: 'Deadlift', altPrKey: 'deadlift' },
              3: { sets: '4', reps: '2', ...Z_90_105 },
              4: { sets: '4', reps: '2', ...Z_90_105 }
            }),
            ...acc1(),
          ]}
        },
        // ============================== BLOCK 3 (Peaking) ==============================
        3: {
          pctLabel: 'Block 3 \u2014 Peaking',
          dayA: { header: 'Day 1 \u2014 Snatch / C&J / Back Squat', exercises: [
            mm(mkEx('A1','Snatch',6,'1',null,'snatch'), {
              1: { sets: '6', reps: '1', ...Z_80_90 },
              2: { sets: '4', reps: '2', ...Z_70_80 },
              3: { intent: 'HS', note: 'up to 95%' },
              4: { intent: 'MAX' }
            }),
            mm(mkEx('B1','Clean + Jerk (1+1 variation)',5,'1+1',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '5', reps: '1+1', ...Z_75_90 },
              2: { sets: '5', reps: '1+1', ...Z_75_90 },
              3: { sets: '5', reps: '1+1', ...Z_75_90 },
              4: { sets: '5', reps: '1+1', ...Z_75_90 }
            }),
            mm(mkEx('C1','Back Squat (fast triples)',4,'3',null,'back_squat'), {
              1: { sets: '4', reps: '3', ...Z_75_85 },
              2: { intent: '1RM' },
              3: { sets: '4', reps: '3', ...Z_75_85 },
              4: { sets: '4', reps: '3', ...Z_75_85 }
            }),
            ...acc2(),
          ]},
          dayB: { header: 'Day 2 \u2014 Power Snatch / C+PP / Snatch Pull', exercises: [
            mm(mkEx('A1','Power Snatch',4,'2',null,'snatch'), {
              1: { sets: '4', reps: '2', ...Z_65_75 },
              2: { sets: '4', reps: '2', ...Z_65_75 },
              3: { sets: '3', reps: '2', ...Z_65_75 },
              4: { sets: '3', reps: '2', ...Z_65_75 }
            }),
            mm(mkEx('B1','Clean + Push Press',4,'1+2',null,['overhead','jerk','push_press','press','clean']), {
              1: { sets: '4', reps: '1+2', ...Z_75_85 },
              2: { intent: 'MAX', altExercise: 'Push Press', altPrKey: 'push_press' },
              3: { sets: '3', reps: '1+2', ...Z_75_85 },
              4: { sets: '3', reps: '1+2', ...Z_75_85 }
            }),
            mm(mkEx('C1','Snatch Pull (heavy)',4,'2',null,'snatch'), {
              1: { sets: '4', reps: '2', ...Z_105_115 },
              2: { sets: '4', reps: '2', ...Z_105_115 },
              3: { sets: '3', reps: '2', ...Z_105_115 },
              4: { sets: '3', reps: '2', ...Z_105_115 }
            }),
            ...acc2(),
          ]},
          dayC: { header: 'Day 3 \u2014 Snatch var / C&J singles / FS / Clean Pull', exercises: [
            mm(mkEx('A1','Snatch variation (doubles)',4,'2',null,'snatch'), {
              1: { sets: '4', reps: '2', ...Z_75_85 },
              2: { sets: '4', reps: '2', ...Z_75_85 },
              3: { sets: '4', reps: '2', ...Z_75_85 },
              4: { sets: '4', reps: '2', ...Z_75_85 }
            }),
            mm(mkEx('B1','Clean + Jerk singles',1,'1',null,['overhead','jerk','push_press','press','clean']), {
              1: { intent: 'HS', note: 'up to 95%' },
              2: { sets: '3', reps: '1', ...Z_75_85 },
              3: { intent: 'HS', note: 'up to 95%' },
              4: { intent: 'MAX' }
            }),
            mm(mkEx('C1','Front Squat',4,'2',null,'front_squat'), {
              1: { sets: '4', reps: '2', ...Z_75_90 },
              2: { intent: 'MAX' },
              3: { sets: '4', reps: '2', ...Z_75_90 },
              4: { sets: '4', reps: '2', ...Z_75_90, note: 'likely skipped' }
            }),
            mm(mkEx('D1','Clean Pull (heavy)',4,'2',null,'clean'), {
              1: { sets: '4', reps: '2', ...Z_110_120 },
              2: { intent: 'MAX', altExercise: 'Deadlift', altPrKey: 'deadlift', note: 'optional' },
              3: { sets: '3', reps: '2', ...Z_100_115 },
              4: { sets: '3', reps: '2', ...Z_100_115 }
            }),
            ...acc1(),
          ]}
        }
      }
    }
  })(),
}


// Name-based PR key detection — covers exercises not explicitly in EXERCISE_PR_KEYS
function detectPrKey(name) {
  if (!name) return null
  const n = name.toLowerCase()
  // Check explicit map first
  if (EXERCISE_PR_KEYS[name] !== undefined) return EXERCISE_PR_KEYS[name]
  // Name-based fallback
  if (n.includes('snatch')) return 'snatch'
  // Clean + Jerk / Clean + Push Press combos load from the overhead/jerk/press
  // PRs (the jerk/press is the limiter), falling back to clean only if the
  // athlete has no overhead PR recorded.
  if (n.includes('clean') && (n.includes('jerk') || n.includes('push jerk') || n.includes('push press')))
    return ['overhead','jerk','push_press','press','clean']
  if (n.includes('clean')) return 'clean'
  if (n.includes('jerk') || n.includes('push press')) return ['overhead','jerk','push_press','press']
  if (n.includes('front squat') || n.includes('ohs')) return 'front_squat'
  if (n.includes('back squat')) return 'back_squat'
  if (n.includes('deadlift')) return 'deadlift'
  if (n.includes('bench press')) return 'bench_press'
  if (n.includes('press')) return 'press'
  if (n.includes('chin up') || n.includes('pull up')) return 'chin_up'
  return null
}

function ExerciseInput({ value, onChange, library: libProp }) {
  const lib = libProp || LIBRARY
  const [pattern, setPattern] = useState(() => {
    for (const [p, exs] of Object.entries(lib)) { if (exs.includes(value)) return p }
    return ''
  })
  const [text, setText] = useState(value)
  const [showDrop, setShowDrop] = useState(false)
  const [filtered, setFiltered] = useState([])
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setText(value)
    // Re-sync pattern when value is set externally (e.g. loaded from Supabase)
    if (value) {
      for (const [p, exs] of Object.entries(lib)) {
        if (exs.includes(value)) { setPattern(p); return }
      }
    }
  }, [value])
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowDrop(false)
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePatternChange = (p) => { setPattern(p); setFiltered(lib[p] || []); setShowDrop(true); setText(''); setEditing(true) }
  const handleTextChange = (e) => {
    const v = e.target.value; setText(v); onChange(v)
    if (pattern) { setFiltered((lib[pattern] || []).filter(ex => ex.toLowerCase().includes(v.toLowerCase()))); setShowDrop(true) }
  }
  const handleSelect = (ex) => { setText(ex); onChange(ex); setShowDrop(false); setEditing(false) }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <select value={pattern} onChange={e => handlePatternChange(e.target.value)}
        style={{ fontSize: 8, color: '#aaa', border: 'none', background: 'transparent', padding: '0 0 1px 0', cursor: 'pointer', width: '100%', outline: 'none' }}>
        <option value="">— pattern —</option>
        {Object.keys(lib).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      {editing ? (
        <input type="text" value={text} autoFocus onChange={handleTextChange}
          onFocus={() => { if (pattern) { setFiltered(lib[pattern] || []); setShowDrop(true) } }}
          onBlur={() => { setTimeout(() => { setEditing(false); setShowDrop(false) }, 150) }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') { setEditing(false); setShowDrop(false); e.currentTarget.blur() } }}
          placeholder="exercise..."
          style={{ width: '100%', border: 'none', borderBottom: '1px dashed #bbb', background: 'transparent', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', outline: 'none', padding: '1px 0' }} />
      ) : (
        <div onClick={() => setEditing(true)}
          style={{
            width: '100%', minHeight: 16, cursor: 'text',
            borderBottom: '1px dashed #bbb',
            fontWeight: 700, fontFamily: 'inherit', padding: '1px 0',
            // Fit-to-width: long names shrink one notch and wrap to two lines
            fontSize: (text && text.length > 20) ? 10 : 12,
            lineHeight: (text && text.length > 20) ? 1.15 : 1.3,
            overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal',
            color: text ? '#111' : '#bbb',
          }}>
          {text || 'exercise...'}
        </div>
      )}
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

function EditField({ value, onChange, style = {}, placeholder = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  useEffect(() => { setVal(value) }, [value])
  const finish = () => {
    setEditing(false)
    const trimmed = val.trim()
    if (trimmed !== value) onChange(trimmed)
  }
  if (editing) return (
    <input autoFocus value={val} onChange={e => setVal(e.target.value)}
      onBlur={finish} onKeyDown={e => { if (e.key === 'Enter') finish(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
      placeholder={placeholder}
      style={{ border: 'none', borderBottom: '2px solid #111', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', outline: 'none', padding: 0, width: 80, ...style }} />
  )
  return (
    <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc', minWidth: 16, display: 'inline-block', ...style }}>
      {value || <span style={{ color: '#ccc', fontStyle: 'italic', fontWeight: 400 }}>{placeholder || ' '}</span>}
    </span>
  )
}

export default function App() {
  const [athletes, setAthletes] = useState([])
  const [prs, setPrs] = useState({})
  const [athleteId, setAthleteId] = useState(() => { try { return JSON.parse(localStorage.getItem('ws_athleteId')) || null } catch { return null } })
  const [tab, setTab] = useState(() => localStorage.getItem('ws_tab') || 'builder')
  const [tier, setTier] = useState(() => {
    const saved = localStorage.getItem('ws_tier') || 'beginner'
    // Old matts_program was replaced — redirect to matt_linear
    if (saved === 'matts_program') { localStorage.setItem('ws_tier', 'matt_linear'); return 'matt_linear' }
    return saved
  })
  const [block, setBlock] = useState(() => parseInt(localStorage.getItem('ws_block')) || 1)
  const [search, setSearch] = useState('')
  const [showAthDrop, setShowAthDrop] = useState(false)
  const [status, setStatus] = useState('Loading...')
  const [edits, setEdits] = useState({})
  const [cellNotes, setCellNotes] = useState({ ...DEFAULT_CELL_NOTES })
  const [saving, setSaving] = useState(false)
  const [kgExercises, setKgExercises] = useState(new Set())
  const [library, setLibrary] = useState(() => {
    const copy = {}
    Object.entries(LIBRARY).forEach(([k,v]) => { copy[k] = [...v] })
    return copy
  })
  const [customTemplates, setCustomTemplates] = useState({})
  const [removedTemplates, setRemovedTemplates] = useState(() => new Set())
  const athRef = useRef(null)
  const saveTimers = useRef({})

  const toggleKg = (exerciseName) => {
    setKgExercises(prev => {
      const next = new Set(prev)
      next.has(exerciseName) ? next.delete(exerciseName) : next.add(exerciseName)
      return next
    })
  }

  // Persist last-used state so page reloads in the same spot
  useEffect(() => { localStorage.setItem('ws_tab', tab) }, [tab])
  useEffect(() => { localStorage.setItem('ws_tier', tier) }, [tier])
  useEffect(() => { localStorage.setItem('ws_block', String(block)) }, [block])
  useEffect(() => { localStorage.setItem('ws_athleteId', JSON.stringify(athleteId)) }, [athleteId])
  useEffect(() => { localStorage.setItem('ws_tab', tab) }, [tab])

  useEffect(() => {
    async function load() {
      const { data: ath, error } = await sb.from('athletes').select('id,first_name,last_name').in('status', ['active','Active']).order('first_name')
      if (error) { setStatus('Error: ' + error.message); return }
      setAthletes(ath)
      setStatus('Fetching PRs...')
      let all = [], from = 0
      while (true) {
        const { data } = await sb.from('results').select('athlete_id,test_id,test_date,converted_value,raw_value').range(from, from + 499)
        if (data) all = [...all, ...data]
        if (!data || data.length < 500) break
        from += 500
      }
      // Use MOST RECENT max per (athlete, test) rather than all-time PR.
      // If an athlete loses or gains weight, their programming should follow
      // their latest tested capacity. Strict latest test_date wins.
      const latest = {}
      all.forEach(r => {
        const v = parseFloat(r.converted_value ?? r.raw_value)
        if (isNaN(v)) return
        const k = r.athlete_id + '-' + r.test_id
        const d = r.test_date || ''
        if (!latest[k] || d > latest[k].d) latest[k] = { v, d }
      })
      const map = {}
      Object.keys(latest).forEach(k => { map[k] = latest[k].v })
      setPrs(map)
      // Load ALL program_edits rows — paginate past Supabase's default 1000-row cap
      let allEdits = [], editsFrom = 0
      while (true) {
        const { data } = await sb.from('program_edits').select('*').range(editsFrom, editsFrom + 999)
        if (data) allEdits = [...allEdits, ...data]
        if (!data || data.length < 1000) break
        editsFrom += 1000
      }
      if (allEdits.length > 0) {
        const editMap = {}
        allEdits.forEach(r => {
          if (r.field === 'prKey') return
          const k = `${r.template}-${r.block}-${r.day}-${r.ex_index}`
          if (!editMap[k]) editMap[k] = {}
          editMap[k][r.field] = r.value
        })
        setEdits(editMap)
      }
      // Load ALL program_cell_notes rows, same pagination
      let allNotes = [], notesFrom = 0
      while (true) {
        const { data } = await sb.from('program_cell_notes').select('*').range(notesFrom, notesFrom + 999)
        if (data) allNotes = [...allNotes, ...data]
        if (!data || data.length < 1000) break
        notesFrom += 1000
      }
      if (allNotes.length > 0) {
        const noteMap = { ...DEFAULT_CELL_NOTES }
        allNotes.forEach(r => { noteMap[`${r.template}-${r.block}-${r.day}-${r.ex_index}-${r.week}`] = r.value })
        setCellNotes(noteMap)
      }
      const { data: ctData } = await sb.from('custom_templates').select('*')
      if (ctData && ctData.length > 0) {
        const ctMap = {}
        ctData.forEach(r => { try { ctMap[r.id] = JSON.parse(r.template_json) } catch(e) {} })
        setCustomTemplates(ctMap)
      }
      const { data: rmData } = await sb.from('removed_templates').select('id')
      if (rmData) setRemovedTemplates(new Set(rmData.map(r => r.id)))
      // FIX: load custom library exercises persisted in Supabase
      const { data: libData } = await sb.from('library_exercises').select('category,exercise')
      if (libData && libData.length > 0) {
        setLibrary(prev => {
          const updated = {}
          Object.entries(prev).forEach(([k,v]) => { updated[k] = [...v] })
          libData.forEach(({ category, exercise }) => {
            if (!updated[category]) updated[category] = [exercise]
            else if (!updated[category].includes(exercise)) updated[category].push(exercise)
          })
          return updated
        })
      }
      setStatus('Ready')
    }
    load()
  }, [])

  useEffect(() => {
    const handler = (e) => { if (athRef.current && !athRef.current.contains(e.target)) setShowAthDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getPR = (aId, tid) => {
    if (Array.isArray(tid)) {
      const overheadKeys = ['press','push_press','jerk','overhead']
      const structuralKeys = tid.filter(t => !overheadKeys.includes(t))
      const ohKeys = tid.filter(t => overheadKeys.includes(t))
      const structVals = structuralKeys.map(t => prs[aId + '-' + t]).filter(v => v != null)
      const ohVals = ohKeys.map(t => prs[aId + '-' + t]).filter(v => v != null)
      const structMin = structVals.length ? Math.min(...structVals) : null
      const ohMax = ohVals.length ? Math.max(...ohVals) : null
      // For combo lifts like Clean + Jerk, the weight is limited by whichever
      // component is weaker. If BOTH a structural (clean) and an overhead
      // (jerk/press/overhead) PR exist, use the LESSER so the athlete can
      // actually complete the lift.
      if (structMin != null && ohMax != null) return Math.min(structMin, ohMax)
      if (structMin != null) return structMin
      return ohMax
    }
    const direct = prs[aId + '-' + tid] || prs[String(aId) + '-' + tid] || null
    if (direct) return direct
    // Fallback chains — important for jerk/press variants where athletes may only have one OH test
    const PR_FALLBACKS = {
      jerk: ['push_press', 'press', 'overhead'],
      push_press: ['press', 'overhead'],
      press: ['push_press', 'overhead'],
      overhead: ['push_press', 'press', 'jerk'],
    }
    for (const fb of (PR_FALLBACKS[tid] || [])) {
      const v = prs[aId + '-' + fb] || prs[String(aId) + '-' + fb]
      if (v != null) return v
    }
    return null
  }
  const getOverheadPR = (aId) => {
    // Use direct prs lookup to avoid recursive fallback loops
    const vals = ['press','push_press','jerk','overhead'].map(t => prs[aId + '-' + t] || prs[String(aId) + '-' + t]).filter(Boolean)
    return vals.length ? Math.max(...vals) : null
  }
  const getOverheadVariantPR = (aId, primaryKey) => { const d = getPR(aId, primaryKey); return d || getOverheadPR(aId) }

  const PKS = [
    ['snatch','Snatch'],['clean','Clean'],['deadlift','Deadlift'],
    ['front_squat','Fr. Squat'],['back_squat','Bk. Squat'],
    ['bench_press','Bench'],['press','Press'],['push_press','Push Press'],['_overhead','Overhead']
  ]

  const allTemplates = { ...TEMPLATES, ...customTemplates }
  const visibleTemplates = Object.entries(allTemplates).filter(([k]) => !removedTemplates.has(k))
  const tD = allTemplates[tier] || TEMPLATES.beginner

  const deleteTemplate = async (id) => {
    const label = allTemplates[id]?.label || id
    if (!window.confirm(`Delete "${label}" permanently? It will be removed from your template list.`)) return
    await sb.from('removed_templates').upsert({ id }, { onConflict: 'id' })
    if (customTemplates[id]) {
      await sb.from('custom_templates').delete().eq('id', id)
      setCustomTemplates(prev => { const n = { ...prev }; delete n[id]; return n })
    }
    setRemovedTemplates(prev => new Set(prev).add(id))
    if (tier === id) {
      const next = Object.keys(allTemplates).find(k => k !== id && !removedTemplates.has(k)) || 'beginner'
      setTier(next); setBlock(1)
    }
  }

  const bD = tD.blocks[block] || tD.blocks[1]
  const isOly = !['gpp_2day','gpp_3day','upper_lower'].includes(tier)
  const ath = athletes.find(a => a.id === athleteId)
  const filteredAth = athletes.filter(a => (a.first_name + ' ' + a.last_name).toLowerCase().includes(search.toLowerCase()))
  const days = tD.days
  const numWeeks = tD.weeks || 4

  const getExs = (day) => bD[day].exercises.map((ex, i) => {
    const k = `${tier}-${block}-${day}-${i}`
    const edit = edits[k] || {}
    const merged = { ...ex, note: ex.note || '', ...edit }
    if (Array.isArray(ex.prKey) && typeof edit.prKey === 'string') merged.prKey = ex.prKey
    // Parse per-week overrides — all weeks can be range {lo,hi}
    const pctOv = {}
    ;[1,2,3,4].forEach(w => {
      const lo = parseFloat(edit['pct_w' + w])
      if (isNaN(lo)) return
      const hi = parseFloat(edit['pct_w' + w + '_hi'])
      pctOv[w] = isNaN(hi) ? lo : { lo, hi }
    })
    // Parse per-week sets/reps overrides (coach runtime overrides)
    const srOv = {}
    ;[1,2,3,4].forEach(w => {
      const s = edit['sets_w' + w]
      const r = edit['reps_w' + w]
      if (s || r) srOv[w] = { sets: s || null, reps: r || null }
    })
    // Parse per-week intent overrides (5RM/3RM/2RM/1RM/HS/MAX/PR typed into cell)
    const intentOv = {}
    ;[1,2,3,4].forEach(w => {
      const it = edit['intent_w' + w]
      if (it) intentOv[w] = it
    })
    merged.intentOverrides = Object.keys(intentOv).length > 0 ? intentOv : null
    delete merged.intent_w1; delete merged.intent_w2; delete merged.intent_w3; delete merged.intent_w4
    // Merge template-authored perWeek as fallback (coach edits win).
    // Supports both ex.perWeek (custom templates) and ex.matts.perWeek (Matt's Program)
    const applyPerWeek = (source) => {
      if (!source) return
      Object.entries(source).forEach(([wk, data]) => {
        const w = parseInt(wk); if (!w) return
        if (data.pctLo != null && pctOv[w] == null) {
          const lo = data.pctLo / 100
          const hi = data.pctHi != null ? data.pctHi / 100 : lo
          pctOv[w] = lo === hi ? lo : { lo, hi }
        }
        if ((data.sets || data.reps) && !srOv[w]) {
          srOv[w] = { sets: data.sets || null, reps: data.reps || null }
        }
      })
    }
    applyPerWeek(ex.perWeek)
    applyPerWeek(ex.matts?.perWeek)
    merged.pctOverrides = Object.keys(pctOv).length > 0 ? pctOv : null
    merged.setsRepsOverrides = Object.keys(srOv).length > 0 ? srOv : null
    delete merged.pct_w1; delete merged.pct_w1_hi; delete merged.pct_w2; delete merged.pct_w2_hi; delete merged.pct_w3; delete merged.pct_w3_hi; delete merged.pct_w4; delete merged.pct_w4_hi
    delete merged.sets_w1; delete merged.sets_w2; delete merged.sets_w3; delete merged.sets_w4
    delete merged.reps_w1; delete merged.reps_w2; delete merged.reps_w3; delete merged.reps_w4
    // Bug fix: synthesize pct for exercises that don't have it in the template
    if (!merged.pct) {
      const bW1 = parseFloat(edit.pct_base_w1)
      if (!isNaN(bW1)) {
        const bLo = parseFloat(edit.pct_base_lo)
        const bHi = parseFloat(edit.pct_base_hi)
        merged.pct = [bW1, isNaN(bLo) ? bW1 : bLo, isNaN(bHi) ? (isNaN(bLo) ? bW1 : bLo) : bHi]
      }
      if (edit.pct_base_prkey && !merged.prKey) merged.prKey = edit.pct_base_prkey
      else if (!merged.prKey) {
        const detected = EXERCISE_PR_KEYS[merged.exercise]
        if (detected) merged.prKey = detected
      }
    }
    delete merged.pct_base_w1; delete merged.pct_base_lo; delete merged.pct_base_hi; delete merged.pct_base_prkey
    return merged
  })

  const setEdit = (day, i, field, value) => {
    const k = `${tier}-${block}-${day}-${i}`
    if (field === 'exercise') {
      const detectedKey = detectPrKey(value)
      setEdits(prev => ({ ...prev, [k]: { ...(prev[k] || {}), exercise: value, prKey: detectedKey } }))
      const timerKey = `${k}-exercise`
      if (saveTimers.current[timerKey]) clearTimeout(saveTimers.current[timerKey])
      saveTimers.current[timerKey] = setTimeout(async () => {
        setSaving(true)
        await sb.from('program_edits').upsert({ template: tier, block, day, ex_index: i, field: 'exercise', value, updated_at: new Date().toISOString() }, { onConflict: 'template,block,day,ex_index,field' })
        setSaving(false)
      }, 800)
      return
    }
    setEdits(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [field]: value } }))
    const timerKey = `${k}-${field}`
    if (saveTimers.current[timerKey]) clearTimeout(saveTimers.current[timerKey])
    saveTimers.current[timerKey] = setTimeout(async () => {
      setSaving(true)
      await sb.from('program_edits').upsert({ template: tier, block, day, ex_index: i, field, value, updated_at: new Date().toISOString() }, { onConflict: 'template,block,day,ex_index,field' })
      setSaving(false)
    }, 800)
  }

  const setCellNote = (key, val) => {
    setCellNotes(prev => ({ ...prev, [key]: val }))
    const parts = key.split('-')
    const wk = parseInt(parts[parts.length - 1])
    const exIdx = parseInt(parts[parts.length - 2])
    const day = parts[parts.length - 3]
    const blk = parseInt(parts[parts.length - 4])
    const tmpl = parts.slice(0, parts.length - 4).join('-')
    const timerKey = `note-${key}`
    if (saveTimers.current[timerKey]) clearTimeout(saveTimers.current[timerKey])
    saveTimers.current[timerKey] = setTimeout(async () => {
      setSaving(true)
      await sb.from('program_cell_notes').upsert({ template: tmpl, block: blk, day, ex_index: exIdx, week: wk, value: val, updated_at: new Date().toISOString() }, { onConflict: 'template,block,day,ex_index,week' })
      setSaving(false)
    }, 800)
  }

  // Snapshot the current template (merged with all coach edits and cell notes
  // across every block) and save it as a new custom template. All sets/reps/%
  // overrides, accessory fills, exercise swaps, and notes are frozen in.
  const saveAsCustomTemplate = async () => {
    if (!tD) { alert('No template loaded'); return }
    const defaultName = (tD.label || 'Custom') + ' \u2014 Saved'
    const name = window.prompt('Save as new custom template. Name:', defaultName)
    if (!name || !name.trim()) return
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)
    if (!slug) { alert('Invalid name'); return }
    if (TEMPLATES[slug]) { alert('That name conflicts with a built-in template. Pick another.'); return }
    const srcBlocks = tD.blocks || {}
    const blockKeys = Object.keys(srcBlocks).map(n => parseInt(n)).filter(n => !isNaN(n)).sort()
    const newBlocks = {}
    blockKeys.forEach(b => {
      const srcBD = srcBlocks[b]; if (!srcBD) return
      const destBD = {}
      if (srcBD.pctLabel) destBD.pctLabel = srcBD.pctLabel
      if (srcBD.w1note) destBD.w1note = srcBD.w1note
      ;(tD.days || []).forEach(d => {
        const dayData = srcBD[d]; if (!dayData) return
        destBD[d] = { header: dayData.header, exercises: [] }
        dayData.exercises.forEach((ex, exIdx) => {
          const editKey = `${tier}-${b}-${d}-${exIdx}`
          const edit = edits[editKey] || {}
          // Start from the source exercise, then overlay coach edits
          const baseExercise = edit.exercise || ex.exercise
          const baseSeries = edit.series || ex.series
          const baseNote = edit.note || ex.note || ''
          // Prefer an explicitly-edited prKey, else keep source, else detect
          const basePrKey = (edit.prKey !== undefined && edit.prKey !== null && edit.prKey !== '')
            ? edit.prKey
            : (ex.prKey != null ? ex.prKey : detectPrKey(baseExercise))
          // Base pct: prefer coach-defined base (added via the % setup UI), else the source ex.pct
          const basePct = ex.pct ? [...ex.pct] : null
          // Build the baked exercise using mkEx (handles string coercion etc.)
          const baked = mkEx(baseSeries, baseExercise, parseInt(ex.sets) || 0, ex.reps || '', basePct, basePrKey, baseNote)
          // Preserve matts perWeek metadata if present (intent, vFloor, altExercise, bench, etc.)
          if (ex.matts && ex.matts.perWeek) {
            baked.matts = { perWeek: JSON.parse(JSON.stringify(ex.matts.perWeek)) }
          }
          // Freeze per-week sets/reps/pct edits into the exercise.
          // We merge them into matts.perWeek (creating it if needed) so the
          // new template renders them as defaults on every future load.
          const pw = baked.matts ? baked.matts.perWeek : {}
          ;[1,2,3,4].forEach(wk => {
            const sW = edit['sets_w' + wk]
            const rW = edit['reps_w' + wk]
            const pLo = edit['pct_w' + wk]
            const pHi = edit['pct_w' + wk + '_hi']
            const iW = edit['intent_w' + wk]
            if (!sW && !rW && pLo == null && pHi == null && !iW) return
            const current = pw[wk] ? { ...pw[wk] } : {}
            if (sW) current.sets = String(sW)
            if (rW) current.reps = String(rW)
            if (pLo != null && pLo !== '') {
              const loN = parseFloat(pLo)
              if (!isNaN(loN)) current.pctLo = Math.round(loN * 100)
            }
            if (pHi != null && pHi !== '') {
              const hiN = parseFloat(pHi)
              if (!isNaN(hiN)) current.pctHi = Math.round(hiN * 100)
            }
            if (iW) current.intent = iW
            pw[wk] = current
          })
          if (Object.keys(pw).length > 0) {
            baked.matts = { perWeek: pw }
          }
          // Bake cell notes (if any)
          ;[1,2,3,4].forEach(wk => {
            const noteKey = `${tier}-${b}-${d}-${exIdx}-${wk}`
            const nv = cellNotes[noteKey]
            if (nv != null && nv !== '') {
              if (!baked.matts) baked.matts = { perWeek: {} }
              if (!baked.matts.perWeek[wk]) baked.matts.perWeek[wk] = {}
              baked.matts.perWeek[wk].note = nv
            }
          })
          // Apply coach-edited top-level sets/reps overrides (rare but possible)
          if (edit.sets) baked.sets = String(edit.sets)
          if (edit.reps) baked.reps = String(edit.reps)
          destBD[d].exercises.push(baked)
        })
      })
      newBlocks[b] = destBD
    })
    const obj = { label: name.trim(), days: [...(tD.days || [])], blocks: newBlocks }
    // Count how many exercises + how many edits were baked, for visible confirmation
    let totalEx = 0, totalWithEdits = 0
    Object.values(newBlocks).forEach(bd => (tD.days || []).forEach(d => {
      const exs = bd[d]?.exercises || []
      totalEx += exs.length
      exs.forEach(e => { if (e.matts && Object.keys(e.matts.perWeek || {}).length > 0) totalWithEdits++ })
    }))
    setSaving(true)
    // Serialize: custom_templates expects JSON
    const { error } = await sb.from('custom_templates').upsert({
      id: slug, template_json: JSON.stringify(obj), updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
    setSaving(false)
    if (error) { alert('Save failed: ' + (error.message || JSON.stringify(error))); return }
    setCustomTemplates(prev => ({ ...prev, [slug]: obj }))
    // Switch to the new template so further edits build on this snapshot
    setTier(slug)
    localStorage.setItem('ws_tier', slug)
    alert('Saved as "' + name.trim() + '"\n' + totalEx + ' exercises baked, ' + totalWithEdits + ' with per-week edits. Now active.')
  }

  // Print pagination:
  //   Sheet 1 = Day 1 + Day 2
  //   Sheet 2 = Day 3 (+ Day 4 if present)
  // Two days per sheet keeps the athlete from flipping between days on one
  // page. The print CSS makes cells tall so Sheet 2 with just Day 3 still
  // fills the page with writing room.
  const page1Days = days.slice(0, 2)
  const page2Days = days.slice(2)

  return (
    <div style={{ background: '#f0f0f0', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
      {status !== 'Ready' && (
        <div className="no-print" style={{ background: '#fffbe6', borderBottom: '1px solid #ddb', padding: '5px 16px', fontSize: 11, color: '#665500' }}>{status}</div>
      )}
      <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', display: 'flex' }}>
        {[['builder','Program Builder'],['templates','Create Template'],['library','Manage Library'],['online','Online Programs']].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', borderBottom: t === tab ? '3px solid #111' : '3px solid transparent', background: 'transparent', fontWeight: t === tab ? 800 : 400, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</button>
        ))}
      </div>
      {tab === 'online' ? (
        <CoachOnline athletes={athletes} allTemplates={allTemplates} removedTemplates={removedTemplates} sb={sb} />
      ) : tab === 'library' ? (
        <LibraryManager library={library} setLibrary={setLibrary} saving={saving} setSaving={setSaving} sb={sb} />
      ) : tab === 'templates' ? (
        <TemplateCreator allTemplates={allTemplates} customTemplates={customTemplates} setCustomTemplates={setCustomTemplates} library={library} saving={saving} setSaving={setSaving} sb={sb} setTier={setTier} setBlock={setBlock} setTab={setTab} />
      ) : (
        <div>
          <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div style={lbl}>Template</div>
              <select value={tier} onChange={e => { setTier(e.target.value); setBlock(1) }} style={{ border: '1px solid #bbb', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit' }}>
                {visibleTemplates.map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
              <button onClick={() => deleteTemplate(tier)} title="Delete this template permanently" style={{ marginLeft: 6, border: '1px solid #c00', background: '#fff', color: '#c00', fontSize: 10, fontWeight: 700, padding: '6px 9px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>Delete</button>
            </div>
            <div>
              <div style={lbl}>Block</div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3].map(b => (
                  <button key={b} onClick={() => setBlock(b)} style={{ padding: '5px 16px', border: '1px solid #bbb', background: block === b ? '#111' : '#fff', color: block === b ? '#fff' : '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{b}</button>
                ))}
              </div>
            </div>
            <div ref={athRef} style={{ position: 'relative', minWidth: 220 }}>
              <div style={lbl}>Athlete</div>
              {ath && !showAthDrop ? (
                <div onClick={() => setShowAthDrop(true)} style={{ padding: '5px 10px', border: '1px solid #e8b000', background: '#fffbe6', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 700, minWidth: 200 }}>
                  <span>{ath.first_name} {ath.last_name}</span>
                  <span onClick={e => { e.stopPropagation(); setAthleteId(null); setSearch('') }} style={{ color: '#999', marginLeft: 8, fontWeight: 400 }}>×</span>
                </div>
              ) : (
                <div>
                  <input value={search} onChange={e => { setSearch(e.target.value); setShowAthDrop(true) }} onFocus={() => setShowAthDrop(true)} placeholder="Search athlete..." style={{ width: '100%', padding: '5px 8px', border: '1px solid #bbb', fontSize: 12, fontFamily: 'inherit' }} />
                  {showAthDrop && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #999', borderTop: 'none', maxHeight: 220, overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                      {filteredAth.slice(0, 40).map(a => (
                        <div key={a.id} onMouseDown={() => { setAthleteId(a.id); setSearch(''); setShowAthDrop(false) }} style={{ padding: '7px 10px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: 12 }} onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          {a.first_name} {a.last_name}
                        </div>
                      ))}
                      {filteredAth.length === 0 && <div style={{ padding: '7px 10px', color: '#aaa' }}>No results</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
            {saving && <div style={{ fontSize: 10, color: '#aaa', alignSelf: 'center' }}>Saving...</div>}
            <button onClick={() => window.print()} style={{ padding: '6px 18px', background: '#111', border: 'none', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', marginLeft: 'auto', fontFamily: 'inherit' }}>Print / PDF</button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-start', padding: '0 10px' }}>
            <div style={{ flex: '0 1 auto' }}>
              <div id="sheet" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
                <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} />
                <PRBar PKS={PKS} ath={ath} getPR={getPR} getOverheadPR={getOverheadPR} getOverheadVariantPR={getOverheadVariantPR} />
                {page1Days.map(dk => (
                  <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
                    setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block}
                    library={library} kgExercises={kgExercises} toggleKg={toggleKg} numWeeks={numWeeks} />
                ))}
              </div>

              {page2Days.length > 0 && (
                <div id="sheet2" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
                  <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} compact />
                  {page2Days.map(dk => (
                    <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
                      setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block}
                      library={library} kgExercises={kgExercises} toggleKg={toggleKg} numWeeks={numWeeks} />
                  ))}
                </div>
              )}
            </div>

            {/* Block Analytics panel (Reroll/Reset, Save as Custom Template, volume/intensity) removed per coach request. OlyAnalytics component kept in the file if we ever want it back. */}
          </div>

          <style>{`
            * { box-sizing: border-box; }
            .print-only { display: none; }
            @media print {
              @page { size: letter portrait; margin: 0.3in }
              body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important }
              .print-only { display: block !important }
              select { display: none !important }
              input { border: none !important; padding: 0 !important; }
              #sheet, #sheet2 { max-width: none !important; margin: 0 !important; padding: 4px 8px !important; box-shadow: none !important; }
              /* Sheet 2 starts on a new page. page-break-BEFORE only — no
                 AFTER on sheet 1 — so browsers don't insert a blank page
                 between them. Also no page-break-inside: avoid on sheet 1;
                 letting content flow is safer than forcing a push. */
              #sheet2 { page-break-before: always; break-before: page; }
              /* Hide the repeated SheetHeader on sheet 2 (redundant with
                 page 1 and leaves a visible border line if kept). */
              #sheet2 > div:first-child { display: none !important; }
              /* Don't let table theads repeat at top of every page. */
              thead { display: table-row-group !important; }
              thead tr { page-break-inside: avoid; }
              td { padding: 1px 3px !important; }
              table { font-size: 8px !important; }
              /* Sets x reps at top-left of each cell. */
              .sr-display { color: #111 !important; font-weight: 800 !important; font-size: 10px !important; padding: 1px 3px !important; }
              /* Cell height tuned so Day 1 + Day 2 fit on page 1 without
                 the browser pushing anything to a blank page 2. */
              .cell-spacer { height: 42px !important; min-height: 42px !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }

function LibraryManager({ library, setLibrary, saving, setSaving, sb }) {
  const [selectedCat, setSelectedCat] = useState(Object.keys(library)[0])
  const [newExercise, setNewExercise] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [msg, setMsg] = useState('')

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  const addExercise = async () => {
    const ex = newExercise.trim()
    if (!ex || !selectedCat) return
    setLibrary(prev => ({ ...prev, [selectedCat]: [...(prev[selectedCat] || []), ex] }))
    setNewExercise('')
    setSaving(true)
    await sb.from('library_exercises').upsert({ category: selectedCat, exercise: ex }, { onConflict: 'category,exercise' })
    setSaving(false)
    flash(`Added "${ex}" to ${selectedCat}`)
  }

  const removeExercise = async (cat, ex) => {
    setLibrary(prev => ({ ...prev, [cat]: prev[cat].filter(e => e !== ex) }))
    setSaving(true)
    await sb.from('library_exercises').delete().eq('category', cat).eq('exercise', ex)
    setSaving(false)
    flash(`Removed "${ex}"`)
  }

  const moveExercise = async (ex, fromCat, toCat) => {
    if (fromCat === toCat) return
    setLibrary(prev => ({
      ...prev,
      [fromCat]: prev[fromCat].filter(e => e !== ex),
      [toCat]: [...(prev[toCat] || []), ex]
    }))
    setSaving(true)
    await sb.from('library_exercises').delete().eq('category', fromCat).eq('exercise', ex)
    await sb.from('library_exercises').upsert({ category: toCat, exercise: ex }, { onConflict: 'category,exercise' })
    setSaving(false)
    flash(`Moved "${ex}" to ${toCat}`)
  }

  const addCategory = async () => {
    const cat = newCategory.trim()
    if (!cat || library[cat]) return
    setLibrary(prev => ({ ...prev, [cat]: [] }))
    setSelectedCat(cat); setNewCategory(''); setAddingCat(false)
    setSaving(true)
    await sb.from('library_categories').upsert({ category: cat }, { onConflict: 'category' })
    setSaving(false)
    flash(`Created category "${cat}"`)
  }

  const cats = Object.keys(library)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
      <div style={{ width: 200, borderRight: '2px solid #111', background: '#fafafa', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '8px 12px', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd' }}>Categories</div>
        {cats.map(cat => (
          <div key={cat} onClick={() => setSelectedCat(cat)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', background: selectedCat === cat ? '#111' : 'transparent', color: selectedCat === cat ? '#fff' : '#111', fontWeight: selectedCat === cat ? 700 : 400 }}>
            <div>{cat}</div>
            <div style={{ fontSize: 10, color: selectedCat === cat ? '#aaa' : '#999' }}>{(library[cat] || []).length} exercises</div>
          </div>
        ))}
        <div style={{ padding: 8 }}>
          {addingCat ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <input autoFocus value={newCategory} onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAddingCat(false) }}
                placeholder="Category name" style={{ flex: 1, border: '1px solid #bbb', padding: '4px 6px', fontSize: 11, fontFamily: 'inherit' }} />
              <button onClick={addCategory} style={{ background: '#111', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>+</button>
            </div>
          ) : (
            <button onClick={() => setAddingCat(true)} style={{ width: '100%', background: 'transparent', border: '1px dashed #bbb', padding: '5px 8px', cursor: 'pointer', fontSize: 11, color: '#666' }}>+ Add Category</button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>{selectedCat}</h2>
          {msg && <span style={{ fontSize: 11, color: '#090', background: '#e8ffe8', padding: '2px 8px', borderRadius: 3 }}>{msg}</span>}
          {saving && <span style={{ fontSize: 11, color: '#999' }}>Saving...</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={newExercise} onChange={e => setNewExercise(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addExercise() }}
            placeholder={`Add exercise to ${selectedCat}...`} style={{ flex: 1, border: '1.5px solid #bbb', padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={addExercise} style={{ background: '#111', color: '#fff', border: 'none', padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit' }}>Add</button>
        </div>
        <div style={{ border: '1px solid #ddd' }}>
          {(library[selectedCat] || []).length === 0 && <div style={{ padding: '20px', color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>No exercises yet</div>}
          {(library[selectedCat] || []).map((ex, idx) => (
            <div key={ex} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{ex}</span>
              <select defaultValue="" onChange={e => { if (e.target.value) moveExercise(ex, selectedCat, e.target.value) }} style={{ fontSize: 10, border: '1px solid #ccc', padding: '2px 4px', marginRight: 8, fontFamily: 'inherit', color: '#555', background: '#fff' }}>
                <option value="">Move to...</option>
                {cats.filter(c => c !== selectedCat).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => removeExercise(selectedCat, ex)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 14, fontWeight: 700, padding: '0 4px', lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TemplateCreator({ allTemplates, customTemplates, setCustomTemplates, library, saving, setSaving, sb, setTier, setBlock, setTab }) {
  const [templateId, setTemplateId] = useState('')
  const [label, setLabel] = useState('')
  const [days, setDays] = useState(['dayA','dayB'])
  const [dayHeaders, setDayHeaders] = useState({ dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day', dayE:'E Day' })
  const [numBlocks, setNumBlocks] = useState(3)
  const [blocks, setBlocks] = useState(() => {
    const b = {}
    ;[1,2,3].forEach(n => { b[n] = { pctLabel:'', w1note:'', ranges: JSON.parse(JSON.stringify(DEFAULT_BLOCK_RANGES[n])) } })
    return b
  })
  const [editBlock, setEditBlock] = useState(1)
  const [msg, setMsg] = useState('')
  const [copyFrom, setCopyFrom] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [perWeekOpen, setPerWeekOpen] = useState({}) // key: `${day}-${idx}` -> bool

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const DAY_OPTIONS = ['dayA','dayB','dayC','dayD','dayE']
  const DAY_LABELS = { dayA:'A', dayB:'B', dayC:'C', dayD:'D', dayE:'E' }
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,30)
  const CATS = ['STR','OLY','PULL','PWR']

  const resetForm = () => {
    setTemplateId(''); setLabel(''); setDays(['dayA','dayB'])
    setDayHeaders({ dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day', dayE:'E Day' })
    setNumBlocks(3)
    const b = {}
    ;[1,2,3].forEach(n => { b[n] = { pctLabel:'', w1note:'', ranges: JSON.parse(JSON.stringify(DEFAULT_BLOCK_RANGES[n])) } })
    setBlocks(b); setEditBlock(1); setCopyFrom(''); setEditingId(null); setPerWeekOpen({})
  }

  const reverseDetectCat = (pctArr, blockRanges) => {
    if (!pctArr || pctArr.length < 3) return null
    const pctInts = pctArr.map(p => Math.round(p * 100))
    for (const cat of CATS) {
      const r = blockRanges[cat]
      if (r && r[0] === pctInts[0] && r[1] === pctInts[1] && r[2] === pctInts[2]) return cat
    }
    return null
  }

  const loadFromTemplate = (key, suffix) => {
    const t = allTemplates[key]; if (!t) return
    setCopyFrom(key); setLabel(t.label + (suffix || ' (copy)')); setTemplateId(slugify(t.label) + (suffix ? '' : '_copy'))
    setDays([...t.days])
    const dh = { dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day', dayE:'E Day' }
    const bks = {}
    // Determine how many blocks the template has
    const nBlocks = [1,2,3].filter(b => t.blocks[b]).length || 1
    setNumBlocks(nBlocks)
    ;[1,2,3].forEach(b => {
      const bd = t.blocks[b]
      const ranges = JSON.parse(JSON.stringify(DEFAULT_BLOCK_RANGES[b]))
      if (bd) {
        t.days.forEach(d => {
          const dayData = bd[d]; if (!dayData) return
          dayData.exercises.forEach(ex => {
            if (!ex.pct) return
            const cat = detectPctCategory(ex.exercise); if (!cat) return
            const pctInts = ex.pct.map(p => Math.round(p * 100))
            if (ranges[cat][0] !== pctInts[0] || ranges[cat][1] !== pctInts[1] || ranges[cat][2] !== pctInts[2]) ranges[cat] = pctInts
          })
        })
      }
      bks[b] = { pctLabel: bd?.pctLabel || '', w1note: bd?.w1note || '', ranges }
      if (bd) {
        t.days.forEach(d => {
          const dayData = bd[d]; if (!dayData) return
          dh[d] = dayData.header || dh[d]
          bks[b][d] = dayData.exercises.map(ex => {
            let pctCat = 'none'
            if (ex.pct) { pctCat = reverseDetectCat(ex.pct, ranges) ? 'auto' : 'custom' }
            return { series: ex.series, exercise: ex.exercise, sets: ex.sets, reps: ex.reps, pctCat, customPct: pctCat === 'custom' ? ex.pct.map(p => Math.round(p*100)) : null, prKey: ex.prKey, note: ex.note || '', perWeek: ex.perWeek ? JSON.parse(JSON.stringify(ex.perWeek)) : null }
          })
        })
      }
    })
    setDayHeaders(dh); setBlocks(bks); setPerWeekOpen({})
  }

  const editExisting = (key) => { setEditingId(key); loadFromTemplate(key, '') }

  const getExs = (d) => blocks[editBlock]?.[d] || []
  const setExs = (d, exs) => setBlocks(prev => ({ ...prev, [editBlock]: { ...prev[editBlock], [d]: exs } }))
  const addEx = (d) => {
    const cur = getExs(d)
    setExs(d, [...cur, { series: cur.length ? cur[cur.length-1].series : 'A1', exercise: '', sets: '3', reps: '8', pctCat: 'auto', customPct: null, prKey: null, note: '', perWeek: null }])
  }
  const updateEx = (d, idx, field, val) => {
    const cur = [...getExs(d)]; cur[idx] = { ...cur[idx], [field]: val }
    if (field === 'exercise') {
      cur[idx].prKey = EXERCISE_PR_KEYS[val] || null
      const det = detectPctCategory(val)
      if (cur[idx].pctCat === 'auto' || cur[idx].pctCat === 'none') cur[idx].pctCat = det ? 'auto' : 'none'
    }
    setExs(d, cur)
  }
  const removeEx = (d, idx) => { const cur = [...getExs(d)]; cur.splice(idx,1); setExs(d,cur) }
  const moveEx = (d, idx, dir) => {
    const cur = [...getExs(d)]; const ni = idx + dir
    if (ni < 0 || ni >= cur.length) return
    ;[cur[idx],cur[ni]] = [cur[ni],cur[idx]]; setExs(d,cur)
  }
  const copyBlockTo = (fromB, toB) => {
    setBlocks(prev => {
      const src = prev[fromB] || {}
      const copy = { pctLabel: src.pctLabel||'', w1note: src.w1note||'', ranges: JSON.parse(JSON.stringify(src.ranges || DEFAULT_BLOCK_RANGES[toB])) }
      days.forEach(d => { if (src[d]) copy[d] = src[d].map(ex => ({...ex, customPct: ex.customPct ? [...ex.customPct] : null, perWeek: ex.perWeek ? JSON.parse(JSON.stringify(ex.perWeek)) : null})) })
      return { ...prev, [toB]: copy }
    })
    flash('Block ' + fromB + ' copied to Block ' + toB)
  }
  const setRange = (cat, idx, val) => {
    const num = val === '' ? 0 : parseInt(val) || 0
    setBlocks(prev => {
      const b = { ...prev[editBlock] }; const r = { ...(b.ranges || {}) }
      const arr = [...(r[cat] || DEFAULT_BLOCK_RANGES[editBlock][cat])]; arr[idx] = num; r[cat] = arr; b.ranges = r
      return { ...prev, [editBlock]: b }
    })
  }
  const resolvePct = (ex, blockNum) => {
    if (ex.pctCat === 'none') return null
    if (ex.pctCat === 'custom' && ex.customPct) return ex.customPct.map(p => p / 100)
    const cat = ex.pctCat === 'auto' ? detectPctCategory(ex.exercise) : ex.pctCat
    if (!cat) return null
    const r = (blocks[blockNum]?.ranges || DEFAULT_BLOCK_RANGES[blockNum])[cat]
    return r ? r.map(p => p / 100) : null
  }
  const buildTemplateObj = () => {
    const obj = { label, days: [...days], blocks: {} }
    // Only save blocks that are in use (1..numBlocks)
    const activeBlocks = [1,2,3].filter(b => b <= numBlocks)
    activeBlocks.forEach(b => {
      const bData = blocks[b] || {}; const bd = {}
      if (bData.pctLabel) bd.pctLabel = bData.pctLabel
      if (bData.w1note) bd.w1note = bData.w1note
      days.forEach(d => {
        bd[d] = { header: dayHeaders[d] || (d.replace('day','') + ' Day'), exercises: (bData[d] || []).map(ex => {
          const base = mkEx(ex.series, ex.exercise, parseInt(ex.sets)||3, ex.reps, resolvePct(ex,b), ex.prKey, ex.note)
          // Attach perWeek when authored (non-empty object)
          if (ex.perWeek && Object.keys(ex.perWeek).length > 0) {
            // Strip empty weeks
            const pw = {}
            Object.entries(ex.perWeek).forEach(([wk, data]) => {
              if (!data) return
              const clean = {}
              if (data.sets != null && data.sets !== '') clean.sets = String(data.sets)
              if (data.reps != null && data.reps !== '') clean.reps = String(data.reps)
              if (data.pctLo != null && data.pctLo !== '') clean.pctLo = parseInt(data.pctLo) || null
              if (data.pctHi != null && data.pctHi !== '') clean.pctHi = parseInt(data.pctHi) || null
              if (Object.keys(clean).length > 0) pw[wk] = clean
            })
            if (Object.keys(pw).length > 0) base.perWeek = pw
          }
          return base
        }) }
      })
      obj.blocks[b] = bd
    })
    return obj
  }
  const saveTemplate = async () => {
    const id = editingId || slugify(templateId || label)
    if (!id || !label.trim()) { flash('Need a name'); return }
    if (!editingId && TEMPLATES[id]) { flash('Cannot overwrite built-in template'); return }
    const obj = buildTemplateObj()
    setSaving(true)
    const { error } = await sb.from('custom_templates').upsert({ id, template_json: JSON.stringify(obj), updated_at: new Date().toISOString() }, { onConflict: 'id' })
    setSaving(false)
    if (error) { flash('Error: ' + error.message); return }
    setCustomTemplates(prev => ({ ...prev, [id]: obj }))
    flash('Saved "' + label + '"!')
    if (!editingId) { setTier(id); setBlock(1); setTab('builder'); resetForm() }
  }
  const deleteTemplate = async (key) => {
    if (!window.confirm('Delete "' + (customTemplates[key]?.label || key) + '"?')) return
    setSaving(true)
    await sb.from('custom_templates').delete().eq('id', key)
    setSaving(false)
    setCustomTemplates(prev => { const n = {...prev}; delete n[key]; return n })
    if (editingId === key) resetForm()
    flash('Deleted')
  }

  const bData = blocks[editBlock] || {}
  const ranges = bData.ranges || DEFAULT_BLOCK_RANGES[editBlock]
  const sty = {
    input: { border: '1px solid #bbb', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none' },
    smBtn: { background: '#111', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5, textTransform: 'uppercase' },
    smBtnLight: { background: '#fff', color: '#333', border: '1px solid #bbb', padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    section: { marginBottom: 16 },
    lbl: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 },
  }
  const customKeys = Object.keys(customTemplates)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px' }}>
      {customKeys.length > 0 && (
        <div style={sty.section}>
          <div style={sty.lbl}>Your Custom Templates</div>
          <div style={{ border: '1px solid #ddd', background: '#fff' }}>
            {customKeys.map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #eee', gap: 8 }}>
                <span style={{ flex: 1, fontWeight: 600 }}>{customTemplates[k].label}</span>
                <button onClick={() => editExisting(k)} style={sty.smBtnLight}>Edit</button>
                <button onClick={() => { setTier(k); setBlock(1); setTab('builder') }} style={sty.smBtnLight}>Use</button>
                <button onClick={() => deleteTemplate(k)} title="Delete this template" style={{ background: '#c00', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5, textTransform: 'uppercase' }}>{'\u2715 Delete'}</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={sty.section}>
        <div style={sty.lbl}>{editingId ? 'Editing: ' + label : 'Start New Template'}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={copyFrom} onChange={e => { if (e.target.value) loadFromTemplate(e.target.value) }} style={sty.input}>
            <option value="">Copy from existing...</option>
            {Object.entries(allTemplates).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
          <span style={{ fontSize: 11, color: '#999' }}>or</span>
          <button onClick={resetForm} style={sty.smBtn}>Start Fresh</button>
          {editingId && <button onClick={resetForm} style={sty.smBtnLight}>Cancel Edit</button>}
          {msg && <span style={{ fontSize: 11, color: '#090', background: '#e8ffe8', padding: '2px 8px', borderRadius: 3, marginLeft: 8 }}>{msg}</span>}
          {saving && <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>Saving...</span>}
        </div>
      </div>
      <div style={{ ...sty.section, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={sty.lbl}>Template Name</div>
          <input value={label} onChange={e => { setLabel(e.target.value); if (!editingId) setTemplateId(slugify(e.target.value)) }} placeholder="e.g. Upper Body Only" style={{ ...sty.input, width: 220 }} />
        </div>
        <div>
          <div style={sty.lbl}>Days</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {DAY_OPTIONS.map(d => (
              <button key={d} onClick={() => setDays(prev => prev.includes(d) ? prev.filter(x => x!==d) : [...prev,d].sort())}
                style={{ padding: '5px 14px', border: '1px solid #bbb', background: days.includes(d) ? '#111' : '#fff', color: days.includes(d) ? '#fff' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                {DAY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={sty.lbl}>Day Headers</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {days.map(d => (
              <input key={d} value={dayHeaders[d]} onChange={e => setDayHeaders(prev => ({...prev,[d]:e.target.value}))} style={{ ...sty.input, width: 110, fontSize: 11 }} placeholder={DAY_LABELS[d] + ' Day'} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ ...sty.section, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={sty.lbl}>Blocks to use</div>
        {[1,2,3].map(n => (
          <button key={'nb'+n} onClick={() => { setNumBlocks(n); if (editBlock > n) setEditBlock(1) }} style={{ padding: '4px 10px', border: '1px solid #bbb', background: numBlocks===n?'#555':'#fff', color: numBlocks===n?'#fff':'#555', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>
        ))}
        <span style={{ fontSize: 10, color: '#999', marginLeft: 4 }}>|</span>
        <div style={sty.lbl}>Edit block</div>
        {[1,2,3].filter(b => b <= numBlocks).map(b => (
          <button key={b} onClick={() => setEditBlock(b)} style={{ padding: '5px 18px', border: '1px solid #bbb', background: editBlock===b?'#111':'#fff', color: editBlock===b?'#fff':'#555', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{b}</button>
        ))}
        {numBlocks > 1 && <>
          <span style={{ fontSize: 10, color: '#999', marginLeft: 4 }}>|</span>
          <select onChange={e => { const v = e.target.value; if (v) { const [f,t] = v.split('>'); copyBlockTo(parseInt(f),parseInt(t)) } e.target.value='' }} style={{ ...sty.input, fontSize: 10 }}>
            <option value="">Copy block...</option>
            {[1,2,3].filter(b => b <= numBlocks).flatMap(f => [1,2,3].filter(t => t !== f && t <= numBlocks).map(t => <option key={f+''+t} value={f+'>'+t}>Block {f} → Block {t}</option>))}
          </select>
        </>}
        <div style={{ marginLeft: 12, display: 'flex', gap: 8 }}>
          <div><span style={{ fontSize: 8, color: '#888' }}>Label </span><input value={bData.pctLabel||''} onChange={e => setBlocks(prev => ({...prev,[editBlock]:{...(prev[editBlock]||{}),pctLabel:e.target.value}}))} style={{ ...sty.input, width: 80, fontSize: 10 }} placeholder="65-75%" /></div>
          <div><span style={{ fontSize: 8, color: '#888' }}>Wk1 </span><input value={bData.w1note||''} onChange={e => setBlocks(prev => ({...prev,[editBlock]:{...(prev[editBlock]||{}),w1note:e.target.value}}))} style={{ ...sty.input, width: 80, fontSize: 10 }} placeholder="65% only" /></div>
        </div>
      </div>
      <div style={{ ...sty.section, background: '#fff', border: '1px solid #ddd', padding: '10px 14px' }}>
        <div style={{ ...sty.lbl, marginBottom: 8 }}>Block {editBlock} — Percentage Ranges by Category</div>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 500 }}>
          <thead>
            <tr>{['Category','Wk 1 %','Wk 2-3 Lo %','Wk 2-3 Hi %','Exercises'].map((h,hi) => <th key={hi} style={{ fontSize: 8, fontWeight: 700, textAlign: hi===0||hi===4?'left':'center', padding: '2px 6px', color: '#777', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {CATS.map(cat => {
              const r = ranges[cat] || DEFAULT_BLOCK_RANGES[editBlock][cat]
              const desc = { STR:'Back Squat, Deadlift, Bench, Press', OLY:'Snatch, Clean, Jerk, Front Squat, Push Press', PULL:'Clean Pull, Snatch Pull', PWR:'Power Snatch, Power Clean variants' }
              return (
                <tr key={cat}>
                  <td style={{ padding: '4px 6px', borderBottom: '1px solid #eee' }}><span style={{ fontWeight: 700, color: PCT_CAT_COLORS[cat], fontSize: 11 }}>{cat}</span><span style={{ fontSize: 8, color: '#aaa', marginLeft: 4 }}>{PCT_CAT_LABELS[cat]}</span></td>
                  {[0,1,2].map(idx => <td key={idx} style={{ padding: '4px 4px', borderBottom: '1px solid #eee', textAlign: 'center' }}><input value={r[idx]||''} onChange={e => setRange(cat,idx,e.target.value)} style={{ width: 38, border: '1px solid #ccc', borderRadius: 2, fontSize: 12, fontWeight: 700, textAlign: 'center', padding: '3px 2px', fontFamily: 'inherit', outline: 'none', color: PCT_CAT_COLORS[cat] }} /></td>)}
                  <td style={{ padding: '4px 6px', borderBottom: '1px solid #eee', fontSize: 8, color: '#999', fontStyle: 'italic' }}>{desc[cat]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {days.map(d => {
        const exs = getExs(d)
        return (
          <div key={d} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '4px 8px', background: '#efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{dayHeaders[d] || (DAY_LABELS[d] + ' Day')}</span>
              <button onClick={() => addEx(d)} style={sty.smBtn}>+ Exercise</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr>{['#','Exercise','Sets','Reps','% Cat','Custom %','Note',''].map((h,hi) => <th key={hi} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: '1.5px solid #111', padding: '3px 4px', textAlign: 'left', color: '#555', background: '#fafafa' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {exs.map((ex, idx) => {
                  const detected = detectPctCategory(ex.exercise)
                  const effectiveCat = ex.pctCat === 'auto' ? detected : (CATS.includes(ex.pctCat) ? ex.pctCat : null)
                  const showCustom = ex.pctCat === 'custom'
                  const pwKey = d + '-' + idx
                  const pwOpen = !!perWeekOpen[pwKey]
                  const hasPW = !!(ex.perWeek && Object.keys(ex.perWeek).length > 0)
                  const updatePW = (wk, field, val) => {
                    const cur = { ...(ex.perWeek || {}) }
                    const wkData = { ...(cur[wk] || {}) }
                    if (val === '' || val == null) delete wkData[field]
                    else wkData[field] = val
                    if (Object.keys(wkData).length === 0) delete cur[wk]
                    else cur[wk] = wkData
                    updateEx(d, idx, 'perWeek', Object.keys(cur).length > 0 ? cur : null)
                  }
                  const clearPW = () => updateEx(d, idx, 'perWeek', null)
                  return (
                    <Fragment key={idx}>
                    <tr>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 36 }}><input value={ex.series} onChange={e => updateEx(d,idx,'series',e.target.value)} style={{ width: 30, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 800, outline: 'none', fontFamily: 'inherit', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 180 }}><ExerciseInput value={ex.exercise} onChange={v => updateEx(d,idx,'exercise',v)} library={library} /></td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 40 }}><input value={ex.sets} onChange={e => updateEx(d,idx,'sets',e.target.value)} style={{ width: 30, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textAlign: 'center', background: 'transparent' }} disabled={pwOpen} /></td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 50 }}><input value={ex.reps} onChange={e => updateEx(d,idx,'reps',e.target.value)} style={{ width: 44, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textAlign: 'center', background: 'transparent' }} disabled={pwOpen} /></td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 80 }}>
                        <select value={ex.pctCat} onChange={e => {
                          const v = e.target.value; const updated = [...getExs(d)]; updated[idx] = { ...updated[idx], pctCat: v }
                          if (v !== 'custom') updated[idx].customPct = null
                          if (v === 'custom' && !updated[idx].customPct) { const r = ranges[detected] || ranges.STR || [60,60,70]; updated[idx].customPct = [...r] }
                          setExs(d, updated)
                        }} style={{ fontSize: 10, border: '1px solid #ccc', padding: '2px 3px', fontFamily: 'inherit', background: '#fff', width: 70, fontWeight: 600, color: effectiveCat ? PCT_CAT_COLORS[effectiveCat] : '#555' }}>
                          <option value="auto">{detected ? 'Auto (' + detected + ')' : 'Auto (—)'}</option>
                          <option value="none">None (sets x reps)</option>
                          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="custom">Custom</option>
                        </select>
                      </td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 110 }}>
                        {showCustom ? (
                          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {[0,1,2].map(pi => <input key={pi} value={ex.customPct?.[pi]??''} onChange={e => { const v=e.target.value; const cur=ex.customPct||[0,0,0]; const next=[...cur]; next[pi]=v===''?0:parseInt(v)||0; updateEx(d,idx,'customPct',next) }} placeholder={pi===0?'W1':pi===1?'Lo':'Hi'} style={{ width: 28, border: '1px solid #ccc', borderRadius: 2, fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '2px 1px', fontFamily: 'inherit', outline: 'none', color: '#555' }} />)}
                          </div>
                        ) : effectiveCat ? (
                          <span style={{ fontSize: 9, color: '#aaa' }}>{(ranges[effectiveCat]||[])[0]}% | {(ranges[effectiveCat]||[])[1]}–{(ranges[effectiveCat]||[])[2]}%</span>
                        ) : <span style={{ fontSize: 9, color: '#ddd' }}>—</span>}
                      </td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 4px', width: 60 }}><input value={ex.note} onChange={e => updateEx(d,idx,'note',e.target.value)} placeholder="note" style={{ width: 50, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 9, outline: 'none', fontFamily: 'inherit', fontStyle: 'italic', color: '#888', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: pwOpen ? 'none' : '1px solid #ddd', padding: '3px 2px', width: 90, whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button onClick={() => setPerWeekOpen(prev => ({...prev, [pwKey]: !prev[pwKey]}))}
                          title="Author per-week sets/reps/%"
                          style={{ border: '1px solid', borderColor: pwOpen || hasPW ? '#0055bb' : '#ccc', background: pwOpen ? '#0055bb' : (hasPW ? '#e8f0ff' : '#fff'), color: pwOpen ? '#fff' : (hasPW ? '#0055bb' : '#888'), fontSize: 8, fontWeight: 700, padding: '2px 5px', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', marginRight: 2 }}>W1-4</button>
                        <button onClick={() => moveEx(d,idx,-1)} disabled={idx===0} style={{ border:'none',background:'none',cursor:'pointer',fontSize:10,color:idx===0?'#ddd':'#555',padding:'0 2px' }}>&#9650;</button>
                        <button onClick={() => moveEx(d,idx,1)} disabled={idx===exs.length-1} style={{ border:'none',background:'none',cursor:'pointer',fontSize:10,color:idx===exs.length-1?'#ddd':'#555',padding:'0 2px' }}>&#9660;</button>
                        <button onClick={() => removeEx(d,idx)} style={{ border:'none',background:'none',cursor:'pointer',fontSize:13,color:'#c00',fontWeight:700,padding:'0 3px',lineHeight:1 }}>&times;</button>
                      </td>
                    </tr>
                    {pwOpen && (
                      <tr>
                        <td colSpan={8} style={{ borderBottom: '1px solid #ddd', background: '#f4f8ff', padding: '6px 10px' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#0055bb', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Per-week</div>
                            {[1,2,3,4].map(wk => {
                              const pw = ex.perWeek?.[wk] || {}
                              return (
                                <div key={wk} style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', border: '1px solid #cfd8e8', background: '#fff', padding: '4px 6px', borderRadius: 3 }}>
                                  <div style={{ fontSize: 8, fontWeight: 700, color: '#0055bb' }}>Wk {wk}</div>
                                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <input value={pw.sets||''} onChange={e => updatePW(wk,'sets',e.target.value)} placeholder="sets" style={{ width: 30, border: '1px solid #ccc', borderRadius: 2, fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none' }} />
                                    <span style={{ color: '#888', fontSize: 10 }}>×</span>
                                    <input value={pw.reps||''} onChange={e => updatePW(wk,'reps',e.target.value)} placeholder="reps" style={{ width: 36, border: '1px solid #ccc', borderRadius: 2, fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none' }} />
                                  </div>
                                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <input value={pw.pctLo||''} onChange={e => updatePW(wk,'pctLo',e.target.value)} placeholder="lo" style={{ width: 26, border: '1px solid #ccc', borderRadius: 2, fontSize: 9, fontWeight: 600, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none', color: '#0055bb' }} />
                                    <span style={{ color: '#888', fontSize: 9 }}>–</span>
                                    <input value={pw.pctHi||''} onChange={e => updatePW(wk,'pctHi',e.target.value)} placeholder="hi" style={{ width: 26, border: '1px solid #ccc', borderRadius: 2, fontSize: 9, fontWeight: 600, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none', color: '#0055bb' }} />
                                    <span style={{ color: '#888', fontSize: 9 }}>%</span>
                                  </div>
                                </div>
                              )
                            })}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                              <button onClick={clearPW} style={{ fontSize: 9, padding: '3px 8px', border: '1px solid #c00', color: '#c00', background: '#fff', cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit', fontWeight: 600 }}>Clear per-week</button>
                              <div style={{ fontSize: 8, color: '#666', fontStyle: 'italic', maxWidth: 160 }}>Leave a field blank to inherit the exercise default. % is optional.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
            {exs.length === 0 && <div style={{ padding: 12, color: '#aaa', fontStyle: 'italic', textAlign: 'center', background: '#fff', borderBottom: '1px solid #ddd' }}>No exercises — click + Exercise</div>}
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={saveTemplate} style={{ padding: '10px 32px', background: '#111', color: '#fff', border: 'none', fontWeight: 800, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>{editingId ? 'Update Template' : 'Save & Use Template'}</button>
        {editingId && <button onClick={() => { setTier(editingId); setBlock(1); setTab('builder'); resetForm() }} style={{ padding: '10px 24px', background: '#fff', color: '#111', border: '2px solid #111', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Go to Builder &#8594;</button>}
      </div>
    </div>
  )
}

function OlyAnalytics({ days, getExs, ath, getPR, edits, block, tier, setEdit, bD, setCellNote, saveAsCustomTemplate }) {
  // edits prop forces re-render when any edit changes (percentage, sets, reps)
  void edits

  const GROUP_NAMES = { G1: 'Snatch', G2: 'Clean', G3: 'Pulls', G4: 'Squats', G5: 'Overhead' }
  const GROUP_COLORS = { G1: '#c44', G2: '#2277bb', G3: '#666', G4: '#2a8a2a', G5: '#b08020' }

  // Helper: get sets/reps for a given exercise and week, respecting per-week overrides
  const getWeekSetsReps = (ex, wk) => {
    const ov = ex.setsRepsOverrides?.[wk]
    const sets = parseInt(ov?.sets || ex.sets) || 0
    const reps = ov?.reps || ex.reps
    return { sets, reps: String(reps) }
  }

  // Helper: parse total rep count from a reps string like "3" or "2+1"
  const parseRepCount = (repsStr) => {
    const s = String(repsStr)
    if (s.includes('+')) return s.split('+').reduce((sum, v) => sum + (parseInt(v) || 0), 0)
    return parseInt(s) || 0
  }

  // Helper: get midpoint percentage for a given exercise and week
  const getMidpointPct = (ex, wk) => {
    if (!ex.pct) return null
    const ov = ex.pctOverrides?.[wk]
    if (ov != null) {
      if (typeof ov === 'object') return ((ov.lo + ov.hi) / 2) * 100
      return ov * 100
    }
    if (wk === 1) return ex.pct[0] * 100
    if (wk === 2 || wk === 3) return ((ex.pct[1] + ex.pct[2]) / 2) * 100
    // Week 4: use week 1 percentage (test/deload week)
    return ex.pct[0] * 100
  }

  // --- UNDULATING 4-DAY: Custom generator ---
  // Uses the user's exact intensity zone rules and rep scheme rules
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const ri = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo
  // Write a week entry with percentage RANGE {lo,hi} in decimals
  const wk = (sets, reps, lo, hi) => ({ sets, reps, lo, hi: hi || lo })
  // Build a heavy single ramp-up: returns { sets, reps (as '+' string), lo, hi, note (pct shorthand) }
  // Example squat ramp: 3@70, 3@80, 2@85, 1@90, 1@95 → reps='3+3+2+1+1', note='70,80,85,90,95'
  const buildRamp = (type) => {
    // type: 'squat' | 'oly' | 'pull'
    if (type === 'squat') {
      // Squat/FS/PP heavy single ramp
      const ramps = [
        { reps: '3+3+2+1+1', pcts: [70,78,85,90,95] },
        { reps: '3+2+1+1+1', pcts: [72,80,87,92,97] },
        { reps: '3+3+2+1+1+1', pcts: [65,72,80,87,93,97] },
        { reps: '5+3+2+1+1', pcts: [65,75,82,90,95] },
      ]
      const r = pick(ramps)
      return { sets: 1, reps: r.reps, lo: r.pcts[r.pcts.length-1]/100, hi: r.pcts[r.pcts.length-1]/100, note: r.pcts.join(',') + '%' }
    }
    if (type === 'oly') {
      // Snatch or C&J heavy single ramp
      const ramps = [
        { reps: '3+2+1+1+1', pcts: [70,78,85,90,95] },
        { reps: '2+2+1+1+1+1', pcts: [72,78,82,88,92,95] },
        { reps: '3+2+2+1+1', pcts: [68,75,82,90,95] },
        { reps: '2+2+1+1+1', pcts: [75,80,87,92,95] },
      ]
      const r = pick(ramps)
      return { sets: 1, reps: r.reps, lo: r.pcts[r.pcts.length-1]/100, hi: r.pcts[r.pcts.length-1]/100, note: r.pcts.join(',') + '%' }
    }
    if (type === 'pull') {
      // Pull heavy single ramp — percentages of comp lift
      const ramps = [
        { reps: '3+2+1+1', pcts: [95,105,115,125] },
        { reps: '3+3+2+1+1', pcts: [90,100,110,120,130] },
        { reps: '3+2+1+1+1', pcts: [90,100,112,122,130] },
      ]
      const r = pick(ramps)
      return { sets: 1, reps: r.reps, lo: r.pcts[r.pcts.length-1]/100, hi: r.pcts[r.pcts.length-1]/100, note: r.pcts.join(',') + '%' }
    }
    if (type === 'pp') {
      // Push press heavy single ramp
      const ramps = [
        { reps: '5+3+2+1+1', pcts: [65,75,82,90,95] },
        { reps: '3+3+2+1+1', pcts: [70,78,85,90,95] },
      ]
      const r = pick(ramps)
      return { sets: 1, reps: r.reps, lo: r.pcts[r.pcts.length-1]/100, hi: r.pcts[r.pcts.length-1]/100, note: r.pcts.join(',') + '%' }
    }
    return { sets: 3, reps: '1', lo: 0.90, hi: 0.95, note: '' }
  }

  const doUndulatingReroll = () => {
    if (!bD || !setEdit) return

    // Track B: randomly place heavy snatch single on dayA or dayD, C&J on the other
    const heavySnDay = pick(['dayA','dayD'])
    const heavyCJDay = heavySnDay === 'dayA' ? 'dayD' : 'dayA'

    days.forEach(dk => {
      const exs = bD[dk]?.exercises || []
      exs.forEach((ex, idx) => {
        if (ex.series === 'WU' || !ex.pct) return
        const n = ex.exercise.toLowerCase()
        const cat = detectPctCategory(ex.exercise)

        // ---- Identify exercise ----
        const isSnatch = cat === 'OLY' && n.includes('snatch') && !n.includes('pull') && !n.includes('high pull') && !n.includes(' dl')
        const isTechSnatch = isSnatch && dk === 'dayC'
        const isPowerSnatch = cat === 'PWR' && n.includes('snatch')
        const isSnatchVar = isSnatch && dk === 'dayD'
        const isCJ = (n.includes('clean') && n.includes('jerk')) || (n.includes('jerk') && !n.includes('snatch') && !n.includes('pull'))
        const isVolumeCJ = isCJ && dk === 'dayA'
        const isHeavyCJ = isCJ && dk === 'dayD'
        const isPushPressComplex = n.includes('push press') && dk === 'dayB'
        const isBackSquat = n.includes('back squat')
        const isFrontSquat = n === 'front squat' || n === 'front squat he'
        const isSnatchPull = n.includes('snatch') && (n.includes('pull') || n.includes('high pull') || n.includes(' dl'))
        const isCleanPull = n.includes('clean') && (n.includes('pull') || n.includes(' dl')) && !n.includes('snatch')
        const isPull = isSnatchPull || isCleanPull
        const isJerkFromRack = n.includes('jerk') && !n.includes('clean') && dk === 'dayC'
        const isStrictPress = (cat === 'STR') && (n.includes('press') || n.includes('bench'))

        let wd = [null, null, null, null]
        const isComplex = String(ex.reps).includes('+')

        // =====================================================================
        // INTENSITY ZONES (from user rules):
        //   Oly lifts: 3s 65-75%, 2s 75-85%, 1s 80-95%+
        //   Push press / Press / FS: 5s 65-75%, 3s 75-85%, 2s 80-95%
        //   Back squat: 5s 70-80%, 3s 80-90%, 6s 65-75%. No 8s.
        //   Pulls: 3s 90-105%, 2s 100-120%, 1s 120%+
        // =====================================================================

        // ======= SNATCH — Day 1 (heavy/classic) =======
        if (isSnatch && dk === 'dayA') {
          wd[0] = wk(ri(4,5), '2', 0.75, 0.82)
          wd[1] = wk(ri(5,5), '2', 0.80, 0.85)
          wd[2] = wk(ri(3,4), '2', 0.72, 0.78)
          if (heavySnDay === 'dayA') {
            const r = buildRamp('oly'); wd[3] = { ...r }
          } else { wd[3] = wk(3, '2', 0.70, 0.75) }
        }
        // ======= SNATCH — Day 3 (technical) =======
        else if (isTechSnatch) {
          const tripleWk = pick([0, 2])
          wd[0] = tripleWk === 0 ? wk(ri(3,4), '3', 0.65, 0.72) : wk(ri(4,5), '2', 0.72, 0.78)
          wd[1] = wk(ri(5,5), '2', 0.78, 0.83)
          wd[2] = tripleWk === 2 ? wk(ri(3,4), '3', 0.65, 0.70) : wk(ri(3,4), '2', 0.70, 0.75)
          wd[3] = wk(3, '2', 0.68, 0.73)
        }
        // ======= SNATCH — Day 4 (variation) =======
        else if (isSnatchVar) {
          wd[0] = wk(ri(4,5), isComplex ? '2+1' : '2', 0.72, 0.78)
          wd[1] = wk(ri(5,5), isComplex ? '2+1' : '2', 0.78, 0.85)
          wd[2] = wk(ri(3,4), isComplex ? '2+1' : '2', 0.70, 0.75)
          if (heavySnDay === 'dayD') {
            const r = buildRamp('oly'); wd[3] = { ...r }
          } else { wd[3] = wk(3, isComplex ? '2+1' : '2', 0.68, 0.73) }
        }
        // ======= POWER SNATCH (Day 2 only) =======
        else if (isPowerSnatch) {
          wd[0] = wk(ri(4,5), '2', 0.65, 0.72)
          wd[1] = wk(ri(5,5), '3', 0.60, 0.68)
          wd[2] = wk(ri(3,4), '2', 0.68, 0.73)
          wd[3] = wk(3, '2', 0.62, 0.68)
        }
        // ======= VOLUME C&J (Day 1) =======
        else if (isVolumeCJ) {
          const highRepWk = pick([0, 1])
          wd[0] = highRepWk === 0 ? wk(ri(4,5), pick(['2+3','3+2']), 0.65, 0.72) : wk(ri(4,5), '2+1', 0.72, 0.78)
          wd[1] = highRepWk === 1 ? wk(ri(4,5), pick(['2+3','3+2']), 0.68, 0.75) : wk(ri(5,5), '2+1', 0.78, 0.85)
          wd[2] = wk(ri(3,4), '2+1', 0.70, 0.75)
          if (heavyCJDay === 'dayA') {
            const r = buildRamp('oly'); wd[3] = { ...r }
          } else { wd[3] = wk(3, '1+1', 0.68, 0.73) }
        }
        // ======= HEAVY C&J (Day 4) =======
        else if (isHeavyCJ || (isCJ && dk === 'dayD')) {
          wd[0] = wk(ri(4,5), isComplex ? '2+1' : '2', 0.75, 0.82)
          wd[1] = wk(ri(5,5), isComplex ? '2+1' : '2', 0.80, 0.85)
          wd[2] = wk(ri(3,4), isComplex ? '2+1' : '2', 0.72, 0.78)
          if (heavyCJDay === 'dayD') {
            const r = buildRamp('oly'); wd[3] = { ...r }
          } else { wd[3] = wk(3, isComplex ? '1+1' : '2', 0.70, 0.75) }
        }
        // ======= JERK FROM RACK / FS+JERK (Day 3) =======
        else if (isJerkFromRack || (isCJ && dk === 'dayC')) {
          wd[0] = wk(ri(4,5), isComplex ? ex.reps : '2', 0.72, 0.78)
          wd[1] = wk(ri(5,5), isComplex ? ex.reps : '2', 0.78, 0.85)
          wd[2] = wk(ri(3,4), isComplex ? ex.reps : '2', 0.70, 0.75)
          wd[3] = wk(3, isComplex ? '1+1' : '2', 0.68, 0.73)
        }
        // ======= PUSH PRESS COMPLEX (Day 2) — Track A HS in Wk2 =======
        else if (isPushPressComplex) {
          wd[0] = wk(ri(4,5), '1+5', 0.65, 0.72)
          { const r = buildRamp('pp'); wd[1] = { ...r } } // Track A heavy single ramp
          wd[2] = wk(ri(3,4), '1+3', 0.72, 0.78)
          wd[3] = wk(3, '1+3', 0.65, 0.70)
        }
        // ======= BACK SQUAT (Day 1) — Track A HS in Wk2 =======
        else if (isBackSquat) {
          const w1rep = pick(['5','5','4'])
          const w3rep = pick(['5','6','4'])
          wd[0] = wk(ri(4,5), w1rep, w1rep >= 5 ? 0.70 : 0.75, w1rep >= 5 ? 0.78 : 0.82)
          { const r = buildRamp('squat'); wd[1] = { ...r } } // Track A heavy single ramp
          wd[2] = wk(ri(3,4), w3rep, w3rep >= 5 ? 0.68 : 0.73, w3rep >= 5 ? 0.75 : 0.80)
          wd[3] = wk(ri(3,4), pick(['3','4']), 0.75, 0.82)
        }
        // ======= FRONT SQUAT (Day 3) — Track A HS in Wk2 =======
        else if (isFrontSquat) {
          const w1rep = pick(['3','4','5'])
          const w3rep = pick(['3','4'])
          wd[0] = wk(ri(4,5), w1rep, w1rep >= 5 ? 0.65 : 0.75, w1rep >= 5 ? 0.72 : 0.82)
          { const r = buildRamp('squat'); wd[1] = { ...r } } // Track A heavy single ramp
          wd[2] = wk(ri(3,4), w3rep, w3rep >= 4 ? 0.72 : 0.78, w3rep >= 4 ? 0.78 : 0.85)
          wd[3] = wk(ri(3,4), pick(['2','3']), 0.78, 0.85)
        }
        // ======= PULLS — Track A HS in Wk2 =======
        else if (isPull) {
          wd[0] = wk(ri(3,4), '3', 0.90, 1.00)
          { const r = buildRamp('pull'); wd[1] = { ...r } } // Track A heavy single ramp
          wd[2] = wk(ri(3,4), '3', 0.88, 0.98)
          wd[3] = wk(3, '2', 0.95, 1.05)
        }
        // ======= STRICT PRESS / BENCH (Day 1 accessory with pct) =======
        else if (isStrictPress) {
          wd[0] = wk(ri(3,4), pick(['5','8']), 0.65, 0.72)
          wd[1] = wk(ri(3,4), pick(['5','6']), 0.70, 0.78)
          wd[2] = wk(ri(3,4), pick(['5','8']), 0.62, 0.70)
          wd[3] = wk(3, pick(['5','6']), 0.65, 0.72)
        }
        // ======= FALLBACK =======
        else if (cat) {
          wd[0] = wk(ri(3,4), ex.reps, ex.pct[0], ex.pct[1])
          wd[1] = wk(ri(3,5), ex.reps, ex.pct[1], ex.pct[2])
          wd[2] = wk(ri(3,4), ex.reps, ex.pct[0], ex.pct[1])
          wd[3] = wk(3, ex.reps, ex.pct[0], ex.pct[1])
        }

        // ---- Write overrides for all 4 weeks ----
        if (wd[0]) {
          ;[1,2,3,4].forEach(w => {
            const d = wd[w - 1]
            if (!d) return
            setEdit(dk, idx, 'sets_w' + w, String(d.sets))
            setEdit(dk, idx, 'reps_w' + w, String(d.reps))
            const lo = Math.round(d.lo * 100) / 100
            const hi = Math.round(d.hi * 100) / 100
            setEdit(dk, idx, 'pct_w' + w, String(lo))
            if (w > 1) setEdit(dk, idx, 'pct_w' + w + '_hi', String(hi))
            // Write ramp-up note into cell note if present
            if (d.note && setCellNote) {
              const noteKey = `${tier}-${block}-${dk}-${idx}-${w}`
              setCellNote(noteKey, d.note)
            }
          })
        }
      })
    })
  }

  // --- REROLL: Generate volume wave across 4 weeks ---
  const ZONE_TARGETS = {
    1: { '55-69': [25,30], '70-79': [45,50], '80-89': [20,25], '90+': [3,5] },
    2: { '55-69': [15,20], '70-79': [40,45], '80-89': [30,35], '90+': [5,8] },
    3: { '55-69': [10,15], '70-79': [30,35], '80-89': [35,40], '90+': [10,15] },
  }

  const doReroll = () => {
    if (!bD || !setEdit) return
    // Matt's Program uses simple linear periodization — no undulation
    if (tier === 'matt_linear') return
    days.forEach(dk => {
      const exs = bD[dk]?.exercises || []
      exs.forEach((ex, i) => {
        if (ex.series === 'WU' || !ex.pct) return
        const cat = detectPctCategory(ex.exercise) || detectGroup(ex.exercise)
        // Determine set/rep ranges based on exercise category
        let setRange, repRange
        if (cat === 'OLY' || cat === 'G1' || cat === 'G2') { setRange = [3,6]; repRange = [1,5] }
        else if (cat === 'PULL' || cat === 'G3') { setRange = [3,5]; repRange = [2,5] }
        else if (cat === 'STR' || cat === 'G4') { setRange = [3,6]; repRange = [2,6] }
        else if (cat === 'PWR' || cat === 'G5') { setRange = [3,5]; repRange = [2,5] }
        else { setRange = [3,5]; repRange = [2,6] }

        const baseSets = parseInt(ex.sets) || 4
        const baseReps = String(ex.reps)
        const isComplex = baseReps.includes('+')
        const baseRepCount = isComplex
          ? baseReps.split('+').reduce((s,v) => s + (parseInt(v)||0), 0)
          : (parseInt(baseReps) || 3)
        const pctLo = ex.pct[1] || ex.pct[0]  // range low
        const pctHi = ex.pct[2] || ex.pct[1] || ex.pct[0]  // range high
        const pctW1 = ex.pct[0]

        // Generate 4-week wave: HIGH → MEDIUM → MOD_LOW → TEST
        const waveMultSets = [1.15, 1.0, 0.9, 0.65]
        const waveMultReps = [1.1, 1.0, 0.75, 0.4]
        // Intensity rises as volume drops
        const wavePctScale = [0.15, 0.4, 0.7, 0.95]

        ;[1,2,3,4].forEach(wk => {
          const mi = wk - 1
          let wkSets = Math.round(baseSets * waveMultSets[mi])
          wkSets = Math.max(setRange[0], Math.min(setRange[1], wkSets))

          let wkReps
          if (isComplex) {
            // For complexes, scale each part's reps
            const parts = baseReps.split('+').map(r => parseInt(r) || 1)
            const scaledParts = parts.map(r => Math.max(1, Math.round(r * waveMultReps[mi])))
            wkReps = scaledParts.join('+')
          } else {
            let r = Math.round(baseRepCount * waveMultReps[mi])
            r = Math.max(repRange[0], Math.min(repRange[1], r))
            // Week 4 (test): allow singles
            if (wk === 4) r = Math.max(1, Math.min(2, r))
            // Bread and butter: prefer 2s and 3s, limit singles to wk4 only
            if (wk !== 4 && r <= 1) r = 2
            wkReps = String(r)
          }

          // Percentage: scale within the assigned range
          const scale = wavePctScale[mi]
          // Block shifts the base: later blocks push everything up
          const blockShift = (block - 1) * 0.03
          let wkPct = pctLo + (pctHi - pctLo) * scale + blockShift
          wkPct = Math.max(pctW1, Math.min(pctHi + 0.05, wkPct))
          wkPct = Math.round(wkPct * 100) / 100

          setEdit(dk, i, 'sets_w' + wk, String(wkSets))
          setEdit(dk, i, 'reps_w' + wk, wkReps)
          // Set per-week percentage override
          if (wk <= 3) {
            setEdit(dk, i, 'pct_w' + wk, String(wkPct))
            if (wk > 1) setEdit(dk, i, 'pct_w' + wk + '_hi', String(wkPct))
          }
        })
      })
    })
  }

  const clearReroll = () => {
    if (!bD || !setEdit) return
    days.forEach(dk => {
      const exs = bD[dk]?.exercises || []
      exs.forEach((ex, i) => {
        ;[1,2,3,4].forEach(wk => {
          setEdit(dk, i, 'sets_w' + wk, '')
          setEdit(dk, i, 'reps_w' + wk, '')
          setEdit(dk, i, 'pct_w' + wk, '')
          if (wk > 1) setEdit(dk, i, 'pct_w' + wk + '_hi', '')
        })
      })
    })
  }

  // Compute per-week analytics
  const weekStats = [1,2,3,4].map(wk => {
    let totalReps = 0, ariWeighted = 0, ariReps = 0
    const groups = { G1: 0, G2: 0, G3: 0, G4: 0, G5: 0 }
    const zones = { '55-69': 0, '70-79': 0, '80-89': 0, '90+': 0 }
    days.forEach(dk => {
      const exs = getExs(dk)
      exs.forEach(ex => {
        if (ex.series === 'WU') return
        const { sets, reps } = getWeekSetsReps(ex, wk)
        const rc = parseRepCount(reps)
        const vol = sets * rc
        totalReps += vol

        // ARI: only exercises with percentage assignments
        const midPct = getMidpointPct(ex, wk)
        if (midPct != null && midPct > 0) {
          ariWeighted += midPct * vol
          ariReps += vol
          // Intensity zones
          if (midPct >= 90) zones['90+'] += vol
          else if (midPct >= 80) zones['80-89'] += vol
          else if (midPct >= 70) zones['70-79'] += vol
          else zones['55-69'] += vol
        }

        // Volume by group: only exercises with percentage assignments
        if (ex.pct) {
          const splits = splitComplexVol(ex.exercise, reps, sets)
          splits.forEach(s => { if (groups[s.group] !== undefined) groups[s.group] += s.vol })
        }
      })
    })
    return { totalReps, avgInt: ariReps > 0 ? ariWeighted / ariReps : 0, ariReps, groups, zones }
  })

  // Volume wave labels
  const vols = weekStats.map(w => w.totalReps)
  const sorted = [...vols].sort((a, b) => b - a)
  const waveLabels = vols.map(v => {
    const rank = sorted.indexOf(v)
    if (rank === 0) return 'HIGH'
    if (rank === sorted.length - 1) return 'TEST'
    if (rank === 1) return 'MEDIUM'
    return 'MOD_LOW'
  })

  // Block totals
  const blockReps = weekStats.reduce((s, w) => s + w.totalReps, 0)
  const blockGroups = { G1: 0, G2: 0, G3: 0, G4: 0, G5: 0 }
  const blockZones = { '55-69': 0, '70-79': 0, '80-89': 0, '90+': 0 }
  weekStats.forEach(w => {
    Object.keys(blockGroups).forEach(g => { blockGroups[g] += w.groups[g] })
    Object.keys(blockZones).forEach(z => { blockZones[z] += w.zones[z] })
  })
  const blockAriReps = weekStats.reduce((s, w) => s + w.ariReps, 0)
  const blockAvgInt = blockAriReps > 0 ? weekStats.reduce((s, w) => s + w.avgInt * w.ariReps, 0) / blockAriReps : 0

  // Ratio display
  const ratios = []
  if (ath) {
    const sn = getPR(ath.id, 'snatch'), cl = getPR(ath.id, 'clean'), fs = getPR(ath.id, 'front_squat'), bs = getPR(ath.id, 'back_squat')
    if (sn && cl) { const r = Math.round(sn / cl * 100); ratios.push({ label: 'SN : C&J', value: r + '%', target: '78-83%', ok: r >= 78 && r <= 83 }) }
    if (cl && fs) { const r = Math.round(cl / fs * 100); ratios.push({ label: 'CL : FS', value: r + '%', target: '85-90%', ok: r >= 85 && r <= 90 }) }
    if (fs && bs) { const r = Math.round(fs / bs * 100); ratios.push({ label: 'FS : BS', value: r + '%', target: '~85%', ok: r >= 80 && r <= 90 }) }
    if (bs && cl) { const r = Math.round(bs / cl * 100); ratios.push({ label: 'BS : C&J', value: r + '%', target: '125-135%', ok: r >= 125 && r <= 135 }) }
  }

  const [selWeek, setSelWeek] = useState(1)
  const ws = weekStats[selWeek - 1]

  const bar = (val, max, color) => {
    const pct = max > 0 ? Math.min(val / max * 100, 100) : 0
    return <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 2 }} /></div>
  }

  const maxGroupReps = Math.max(...Object.values(ws.groups), 1)
  const maxBlockGroup = Math.max(...Object.values(blockGroups), 1)
  const maxZone = Math.max(...Object.values(ws.zones), 1)
  const maxWeekVol = Math.max(...weekStats.map(w => w.totalReps), 1)

  const s = { section: { marginBottom: 12 }, label: { fontSize: 8, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginBottom: 4 }, row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, marginBottom: 3 }, val: { fontWeight: 800, fontSize: 12 } }

  return (
    <div className="no-print" style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #ddd', padding: '12px 14px', fontSize: 10, fontFamily: 'Arial, sans-serif', alignSelf: 'flex-start', position: 'sticky', top: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', borderBottom: '2px solid #111', paddingBottom: 4, marginBottom: 10 }}>Block Analytics</div>

      {setEdit && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {tier !== 'matt_linear' && <button onClick={tier === 'oly_4day_undulating' ? doUndulatingReroll : doReroll} style={{ flex: 1, padding: '5px 8px', background: '#e8b000', border: 'none', color: '#111', fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>{tier === 'oly_4day_undulating' ? 'Generate' : 'Reroll'}</button>}
            <button onClick={clearReroll} style={{ flex: 1, padding: '5px 8px', background: '#fff', border: '1.5px solid #ccc', color: '#666', fontWeight: 600, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>Reset</button>
          </div>
          {saveAsCustomTemplate && (
            <button onClick={saveAsCustomTemplate} title="Snapshot this template (all 3 blocks, all edits baked in) and save as a new custom template"
              style={{ width: '100%', padding: '6px 8px', background: '#0055bb', border: 'none', color: '#fff', fontWeight: 800, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 2 }}>
              Save as Custom Template
            </button>
          )}
        </div>
      )}

      <div style={s.section}>
        <div style={s.label}>ARI (Avg Relative Intensity)</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {weekStats.map((w, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: '#999', fontWeight: 600 }}>Wk {i+1}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: w.avgInt > 0 ? '#111' : '#ccc' }}>{w.avgInt > 0 ? w.avgInt.toFixed(1) + '%' : '\u2014'}</div>
            </div>
          ))}
        </div>
        <div style={{ ...s.row, borderTop: '1px solid #eee', paddingTop: 3 }}>
          <span>Block Avg</span><span style={s.val}>{blockAvgInt > 0 ? blockAvgInt.toFixed(1) + '%' : '\u2014'}</span>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.label}>Volume (Number of Lifts)</div>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{vols.join(' \u2192 ')} <span style={{ fontWeight: 400, color: '#888' }}>({blockReps}/block)</span></div>
        <div style={{ fontSize: 9, color: '#666', fontWeight: 600 }}>Wave: {waveLabels.join(' \u2192 ')}</div>
      </div>

      <div style={s.section}>
        <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
          {[1,2,3,4].map(w => (
            <button key={w} onClick={() => setSelWeek(w)} style={{ flex: 1, padding: '4px 0', border: '1px solid #ccc', background: selWeek === w ? '#111' : '#fff', color: selWeek === w ? '#fff' : '#555', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Wk {w}</button>
          ))}
        </div>
        <div style={s.label}>Volume by Group \u2014 Wk {selWeek}</div>
        {Object.entries(GROUP_NAMES).map(([g, name]) => (
          <div key={g} style={{ marginBottom: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
              <span style={{ color: GROUP_COLORS[g], fontWeight: 700 }}>{name}</span>
              <span style={{ fontWeight: 600 }}>{ws.groups[g]} <span style={{ color: '#999' }}>({ws.ariReps > 0 ? Math.round(ws.groups[g] / ws.ariReps * 100) : 0}%)</span></span>
            </div>
            {bar(ws.groups[g], maxGroupReps, GROUP_COLORS[g])}
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.label}>Intensity Zones \u2014 Wk {selWeek}</div>
        {[['55-69', '#88b'], ['70-79', '#4a4'], ['80-89', '#c80'], ['90+', '#c44']].map(([z, col]) => (
          <div key={z} style={{ marginBottom: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
              <span style={{ fontWeight: 600 }}>{z}%</span>
              <span style={{ fontWeight: 600 }}>{ws.zones[z]} <span style={{ color: '#999' }}>({ws.ariReps > 0 ? Math.round(ws.zones[z] / ws.ariReps * 100) : 0}%)</span></span>
            </div>
            {bar(ws.zones[z], maxZone, col)}
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.label}>Block Trend</div>
        {weekStats.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 600, width: 28, flexShrink: 0 }}>Wk {i+1}</span>
            <div style={{ flex: 1 }}>{bar(w.totalReps, maxWeekVol, selWeek === i+1 ? '#111' : '#bbb')}</div>
            <span style={{ fontSize: 9, fontWeight: 700, width: 24, textAlign: 'right' }}>{w.totalReps}</span>
          </div>
        ))}
        <div style={{ ...s.row, marginTop: 6, borderTop: '1px solid #ddd', paddingTop: 4 }}>
          <span>Block Total</span><span style={s.val}>{blockReps}</span>
        </div>
        <div style={s.row}>
          <span>Block Avg Int</span><span style={s.val}>{blockAvgInt > 0 ? blockAvgInt.toFixed(1) + '%' : '\u2014'}</span>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.label}>Block Group Distribution</div>
        {Object.entries(GROUP_NAMES).map(([g, name]) => (
          <div key={g} style={{ marginBottom: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
              <span style={{ color: GROUP_COLORS[g], fontWeight: 700 }}>{name}</span>
              <span style={{ fontWeight: 600 }}>{blockGroups[g]} <span style={{ color: '#999' }}>({blockReps > 0 ? Math.round(blockGroups[g] / blockReps * 100) : 0}%)</span></span>
            </div>
            {bar(blockGroups[g], maxBlockGroup, GROUP_COLORS[g])}
          </div>
        ))}
      </div>

      {ratios.length > 0 && (
        <div style={s.section}>
          <div style={s.label}>Athlete Ratios</div>
          {ratios.map((r, i) => (
            <div key={i} style={{ ...s.row }}>
              <span>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.ok ? '#2a8a2a' : '#c44' }}>{r.value} <span style={{ fontWeight: 400, fontSize: 8, color: '#999' }}>({r.target})</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SheetHeader({ tD, block, bD, ath, isOly, compact }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 4 : 8, paddingBottom: compact ? 4 : 8, borderBottom: '2px solid #111' }}>
      <div>
        <div style={{ fontSize: compact ? 14 : 18, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>{tD.label} — Block {block}</div>
        <div style={{ fontSize: 13, color: ath ? '#111' : '#aaa', marginTop: 2, fontWeight: 600 }}>{ath ? ath.first_name + ' ' + ath.last_name : 'Select an athlete above'}</div>
        {isOly && bD.pctLabel && <div style={{ fontSize: 9, color: '#777', marginTop: 2, letterSpacing: 1 }}>Range: {bD.pctLabel}{bD.w1note ? ' | Wk 1: ' + bD.w1note : ''}</div>}
      </div>
      <div style={{ textAlign: 'right', fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.6 }}>
        <div style={{ fontSize: 22, letterSpacing: 4, fontWeight: 900 }}>WS</div>
        WILMINGTON<br />STRENGTH
      </div>
    </div>
  )
}

function PRBar({ PKS, ath, getPR, getOverheadPR }) {
  return (
    <div style={{ display: 'flex', border: '1.5px solid #999', marginBottom: 10, overflow: 'hidden' }}>
      {PKS.map(([k,lb], idx) => {
        const v = ath ? (k === '_overhead' ? getOverheadPR(ath.id) : getPR(ath.id, k)) : null
        return (
          <div key={k} style={{ flex: 1, textAlign: 'center', padding: '3px 2px', borderRight: idx < PKS.length-1 ? '1px solid #bbb' : 'none' }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#777' }}>{lb}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: v ? '#111' : '#ccc' }}>{v ? Math.round(v) : '—'}</div>
          </div>
        )
      })}
    </div>
  )
}

function PctEdit({ wk, isOverridden, defaultPct, rangeLo, rangeHi, overrideVal, onChange }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  const displayText = () => {
    if (isOverridden) {
      if (overrideVal != null && typeof overrideVal === 'object') {
        return overrideVal.lo === overrideVal.hi ? overrideVal.lo + '%' : overrideVal.lo + '-' + overrideVal.hi + '%'
      }
      return overrideVal + '%'
    }
    if (defaultPct != null) return defaultPct + '%'
    if (rangeLo != null && rangeHi != null) return rangeLo === rangeHi ? rangeLo + '%' : rangeLo + '-' + rangeHi + '%'
    return ''
  }

  const startEdit = () => {
    if (isOverridden && overrideVal != null) {
      if (typeof overrideVal === 'object') setVal(overrideVal.lo + '-' + overrideVal.hi)
      else setVal(String(overrideVal))
    } else if (rangeLo != null) {
      setVal(rangeLo === rangeHi ? String(rangeLo) : rangeLo + '-' + rangeHi)
    } else {
      setVal(defaultPct ? String(defaultPct) : '')
    }
    setEditing(true)
  }

  const finish = () => {
    setEditing(false)
    const v = val.trim()
    if (v === '' || v === 'x' || v === 'X') { onChange(null); return }
    // Support "65-75" range input for any week
    if (v.includes('-')) {
      const parts = v.split('-').map(p => parseInt(p.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
        onChange({ lo: parts[0] / 100, hi: parts[1] / 100 })
        return
      }
    }
    const num = parseInt(v)
    if (!isNaN(num) && num > 0 && num <= 150) {
      onChange({ lo: num / 100, hi: num / 100 })
    }
  }

  if (editing) return (
    <div className="no-print" style={{ position: 'absolute', bottom: 1, right: 2, zIndex: 5, display: 'flex', alignItems: 'baseline' }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={finish} onKeyDown={e => { if (e.key==='Enter') finish(); if (e.key==='Escape') setEditing(false) }}
        placeholder={'65-75'}
        style={{ width: 44, fontSize: 8, border: 'none', borderBottom: '1px solid #0055bb', background: 'transparent', fontFamily: 'inherit', outline: 'none', padding: 0, textAlign: 'right', color: '#0055bb', fontWeight: 700 }} />
      <span style={{ fontSize: 7, color: '#0055bb' }}>%</span>
    </div>
  )
  // Only render visible text when the coach has overridden the percentage.
  // The default percentage range stays hidden from the athlete's view but the
  // cell is still clickable (a tiny invisible hit target) so the coach can add
  // an override from this cell.
  if (isOverridden) {
    return <div className="no-print" onClick={startEdit} style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 7, color: '#0055bb', cursor: 'pointer', fontWeight: 700, zIndex: 5 }} title={'Click to override % (e.g. 65-75)'}>{displayText()}</div>
  }
  return <div className="no-print" onClick={startEdit} style={{ position: 'absolute', bottom: 1, right: 2, width: 14, height: 10, cursor: 'pointer', zIndex: 5, opacity: 0 }} title={'Click to override % (e.g. 65-75)'} />
}

// Accepted intent shortcuts. Typing any of these into the sets/reps input
// (alone, case-insensitive) writes it as an intent override for that week:
//   5RM, 3RM, 2RM, 1RM, HS, MAX, PR
const INTENT_SHORTCUTS = ['5RM','3RM','2RM','1RM','HS','MAX','PR']
function SetsRepsEdit({ sets, reps, isOverridden, onChange, onChangeIntent, displayOverride }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  // When the cell carries an intent override (e.g. "2RM") show that instead
  // of the raw sets x reps so the coach sees what they typed.
  const display = displayOverride || (sets + '\u00d7' + reps)

  const startEdit = () => {
    setVal(displayOverride || (sets + 'x' + reps))
    setEditing(true)
  }

  const finish = () => {
    setEditing(false)
    const v = val.trim()
    if (v === '' || v === 'x' || v === 'X') {
      onChange(null, null)
      if (onChangeIntent) onChangeIntent(null)
      return
    }
    // Intent shortcut?
    const upper = v.toUpperCase().replace(/\s+/g, '')
    if (INTENT_SHORTCUTS.includes(upper)) {
      if (onChangeIntent) onChangeIntent(upper)
      return
    }
    // Clear any intent override when switching back to normal sets x reps
    if (onChangeIntent) onChangeIntent(null)
    // Parse "5x2", "5×2", or just "5" (sets only, keep reps)
    const sep = v.includes('\u00d7') ? '\u00d7' : 'x'
    const parts = v.split(sep).map(p => p.trim())
    if (parts.length === 2 && parts[0] && parts[1]) {
      onChange(parts[0], parts[1])
    } else if (parts.length === 1 && parts[0]) {
      onChange(parts[0], null)
    }
  }

  if (editing) return (
    <div style={{ padding: '2px 4px', position: 'relative', zIndex: 3 }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={finish}
        onKeyDown={e => { if (e.key === 'Enter') finish(); if (e.key === 'Escape') setEditing(false) }}
        placeholder="5x3 or 5RM"
        style={{ width: 56, fontSize: 9, fontWeight: 700, border: 'none', borderBottom: '1px solid #0055bb', background: 'transparent', fontFamily: 'inherit', outline: 'none', padding: 0, color: '#0055bb' }} />
    </div>
  )
  // Visible on screen AND on print. On screen the label is tinted blue when
  // the coach has overridden sets/reps; on print we force black bold so it
  // reads cleanly on paper regardless of override state.
  return (
    <div className="sr-display" onClick={startEdit}
      style={{ padding: '2px 4px', fontSize: 10, fontWeight: 800, cursor: 'pointer', color: isOverridden ? '#0055bb' : '#111', position: 'relative', zIndex: 3 }}
      title="Click to edit sets\u00d7reps (or type 5RM / 3RM / 2RM / HS / MAX / PR)">
      {display}
    </div>
  )
}

function DayTable({ dk, day, exs, isOly, ath, getPR, setEdit, cellNotes, setCellNote, tier, block, library, kgExercises, toggleKg, numWeeks = 4 }) {
  const weekHeaders = Array.from({ length: numWeeks }, (_, i) => 'Week ' + (i + 1))
  const weekCols = Array.from({ length: numWeeks }, (_, i) => <col key={i} />)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '3px 8px', background: '#efefef', borderBottom: '1px solid #bbb' }}>{day.header}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup><col style={{ width: 26 }} /><col style={{ width: 140 }} />{weekCols}</colgroup>
        <thead>
          <tr>
            {['#','Exercise',...weekHeaders].map((h,i) => (
              <th key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1.5px solid #111', borderRight: i < 1 + numWeeks ? '1px solid #777' : 'none', padding: '3px 4px', textAlign: i <= 1 ? 'left' : 'center', color: '#444', background: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exs.map((ex, i) => (
            <ExRow key={i} ex={ex} i={i} dk={dk} isOly={isOly} ath={ath} getPR={getPR} setEdit={setEdit}
              isLast={i === exs.length-1} isWU={ex.series === 'WU'}
              cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block} library={library}
              useKg={kgExercises.has(ex.exercise)} toggleKg={toggleKg} numWeeks={numWeeks} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExRow({ ex, i, dk, isOly, ath, getPR, setEdit, isLast, isWU, cellNotes, setCellNote, tier, block, library, useKg, toggleKg, numWeeks = 4 }) {
  // Prefer the explicit PR key on the exercise; fall back to the global map;
  // fall back to name-based detection (handles custom templates whose saved
  // prKey might not match anything).
  const effectivePrKey = EXERCISE_PR_KEYS[ex.exercise] !== undefined
    ? EXERCISE_PR_KEYS[ex.exercise]
    : (ex.prKey || detectPrKey(ex.exercise))
  const pr = ath && effectivePrKey ? getPR(ath.id, effectivePrKey) : null
  const cellBorder = '1px solid #777'
  const tdBase = { borderBottom: isLast ? '2px solid #111' : '1px solid #999', borderRight: cellBorder, padding: 0, verticalAlign: 'top', background: isWU ? '#fafafa' : 'transparent' }

  const [showPctSetup, setShowPctSetup] = useState(false)
  const [setupLo, setSetupLo] = useState('')
  const [setupHi, setSetupHi] = useState('')
  const [setupPrKey, setSetupPrKey] = useState('')

  const openPctSetup = () => {
    const autoKey = Array.isArray(effectivePrKey) ? effectivePrKey[0] : (effectivePrKey || '')
    setSetupPrKey(autoKey)
    // Prefill from the exercise's current effective % (override wins, else template pct)
    let lo = '', hi = ''
    const ov = ex.pctOverrides?.[1]
    if (ov != null) {
      if (typeof ov === 'object') { lo = Math.round(ov.lo * 100); hi = Math.round(ov.hi * 100) }
      else lo = Math.round(ov * 100)
    } else if (ex.pct) {
      lo = Math.round(ex.pct[0] * 100); hi = Math.round((ex.pct[2] ?? ex.pct[0]) * 100)
    }
    setSetupLo(lo ? String(lo) : ''); setSetupHi(lo && hi && hi !== lo ? String(hi) : '')
    setShowPctSetup(true)
  }
  // Set the % for the WHOLE block (every week) in one shot — writes a per-week
  // override for all weeks, so it works on any exercise (with or without a
  // template %). No more typing week by week.
  const confirmPct = () => {
    const lo = parseInt(setupLo)
    if (isNaN(lo) || lo <= 0) return
    const hiN = parseInt(setupHi)
    const hi = (!isNaN(hiN) && hiN > 0) ? hiN : lo
    for (let w = 1; w <= numWeeks; w++) {
      setEdit(dk, i, 'pct_w' + w, String(lo / 100))
      setEdit(dk, i, 'pct_w' + w + '_hi', hi === lo ? '' : String(hi / 100))
    }
    if (setupPrKey) setEdit(dk, i, 'pct_base_prkey', setupPrKey)
    setShowPctSetup(false)
  }
  // Clear % from every week (for accessories you don't load by percentage)
  const removePct = () => {
    for (let w = 1; w <= numWeeks; w++) { setEdit(dk, i, 'pct_w' + w, ''); setEdit(dk, i, 'pct_w' + w + '_hi', '') }
    ;['pct_base_w1','pct_base_lo','pct_base_hi','pct_base_prkey'].forEach(f => setEdit(dk, i, f, ''))
    setShowPctSetup(false)
  }

  const fmt = (lbs) => {
    if (useKg) { const kg = rKg(lbs); return kg + ' kg' }
    return r5(lbs) + ' lbs'
  }

  // Per-week sets/reps
  const getWeekSR = (wk) => {
    const ov = ex.setsRepsOverrides?.[wk]
    return { sets: ov?.sets || ex.sets, reps: ov?.reps || ex.reps, isOverridden: !!(ov?.sets || ov?.reps) }
  }

  // Returns the weight to display for a given week. When no PR is available,
  // returns '' so the percentage range is NOT shown to the athlete. The
  // coach can still edit the percentage range via the PctEdit override UI.
  const getHint = (wk) => {
    if (!pr) return ''
    const ov = ex.pctOverrides?.[wk]
    // If coach has a per-week override, use it even when there's no base ex.pct.
    if (ov != null) {
      if (typeof ov === 'object') {
        if (useKg) { const lo = rKg(pr * ov.lo), hi = rKg(pr * ov.hi); return lo === hi ? lo + ' kg' : lo + '\u2013' + hi + ' kg' }
        const lo = r5(pr * ov.lo), hi = r5(pr * ov.hi); return lo === hi ? lo + ' lbs' : lo + '\u2013' + hi
      }
      return fmt(pr * ov)
    }
    // No override: fall back to the exercise's base pct if present.
    if (!ex.pct) return ''
    if (wk === 1) return fmt(pr * ex.pct[0])
    if (wk >= 2 && wk <= 4) {
      if (useKg) {
        const lo = rKg(pr * ex.pct[1]), hi = rKg(pr * ex.pct[2])
        return lo === hi ? lo + ' kg' : lo + '\u2013' + hi + ' kg'
      }
      const lo = r5(pr * ex.pct[1]), hi = r5(pr * ex.pct[2])
      return lo === hi ? lo + ' lbs' : lo + '\u2013' + hi
    }
    return ''
  }

  // Matt's Program: fetch the per-week metadata (intent, vFloor, altExercise, bench, etc.)
  const mattsW = (wk) => ex.matts?.perWeek?.[wk] || null

  // Matt's Program: resolve PR for this week (may be an alt PR like deadlift)
  const prForWk = (wk) => {
    const mw = mattsW(wk)
    if (mw?.altPrKey && ath) return getPR(ath.id, mw.altPrKey)
    return pr
  }

  // Matt's Program: compute weight text from pctLo/pctHi + week PR.
  // Falls back to getHint (standard ex.pct + pctOverrides path) if the matts
  // data doesn't include a pct for this week — so custom-template cells
  // that have just an intent override still print the correct weight.
  const mattsWeight = (wk) => {
    const mw = mattsW(wk)
    if (!mw || mw.pctLo == null) {
      // Fall back to standard weight computation (uses ex.pct + ex.pctOverrides).
      return getHint(wk)
    }
    const p = prForWk(wk); if (!p) return ''
    const lo = mw.pctLo / 100, hi = (mw.pctHi != null ? mw.pctHi : mw.pctLo) / 100
    if (useKg) {
      const loK = rKg(p * lo), hiK = rKg(p * hi)
      return loK === hiK ? loK + ' kg' : loK + '\u2013' + hiK + ' kg'
    }
    const loL = r5(p * lo), hiL = r5(p * hi)
    return loL === hiL ? loL + ' lbs' : loL + '\u2013' + hiL + ' lbs'
  }

  const wkCell = (wk) => {
    if (isWU) return <td key={wk} style={{ ...tdBase, borderRight: wk < numWeeks ? cellBorder : 'none' }}><div className="cell-spacer" style={{ height: 46 }}></div></td>
    const noteKey = `${tier}-${block}-${dk}-${i}-${wk}`
    const noteVal = cellNotes[noteKey] !== undefined ? cellNotes[noteKey] : ''

    // ====== Matt's Program custom render path ======
    // Uses the matts-style cell when the template has perWeek metadata OR
    // when the coach has typed an intent shortcut (5RM/3RM/2RM/HS/MAX/PR) into
    // this week's cell — so intent badges work for any template.
    let mw = mattsW(wk)
    const intentOverrideForCell = ex.intentOverrides?.[wk]
    if (!mw && intentOverrideForCell) mw = {}
    if (mw) {
      const designerLines = [
        '1. 3s ecc triple',
        '2. 3s ecc triple',
        '3. 3s iso triple',
        '4. 3s iso triple',
        '5. Fast triple',
      ]
      // Coach edits win: if coach has overridden sets/reps, use those instead of template.
      const srEdit = ex.setsRepsOverrides?.[wk]
      // Effective intent: coach runtime intent override wins over template mw.intent.
      // A coach sets/reps edit clears the template intent (but NOT a coach intent override).
      const intentOv = ex.intentOverrides?.[wk]
      const effIntent = intentOv != null ? intentOv : (srEdit?.sets || srEdit?.reps ? null : mw.intent)
      const displaySets = srEdit?.sets || mw.sets || ex.sets || ''
      const displayReps = srEdit?.reps || mw.reps || ex.reps || ''
      const srIsOverridden = !!(srEdit?.sets || srEdit?.reps || intentOv)

      // Coach pct override (if any)
      const pctOv = ex.pctOverrides?.[wk]
      const pctIsOverridden = pctOv != null
      const pctOverrideVal = pctOv == null ? null : (typeof pctOv === 'object' ? { lo: Math.round(pctOv.lo*100), hi: Math.round(pctOv.hi*100) } : Math.round(pctOv*100))

      // Weight: prefer coach override, then template pctLo/pctHi
      let weightText = ''
      const p = prForWk(wk)
      if (p) {
        if (pctIsOverridden) {
          if (typeof pctOv === 'object') {
            const lo = useKg ? rKg(p * pctOv.lo) : r5(p * pctOv.lo)
            const hi = useKg ? rKg(p * pctOv.hi) : r5(p * pctOv.hi)
            weightText = lo === hi ? lo + (useKg ? ' kg' : ' lbs') : lo + '\u2013' + hi + (useKg ? ' kg' : ' lbs')
          } else {
            weightText = useKg ? rKg(p * pctOv) + ' kg' : r5(p * pctOv) + ' lbs'
          }
        } else if (mw.pctLo != null) {
          weightText = mattsWeight(wk)
        } else if (effIntent === '5RM') {
          weightText = useKg ? rKg(p * 0.85) + ' kg' : r5(p * 0.85) + ' lbs'
        }
      }

      return (
        <td key={wk} style={{ ...tdBase, borderRight: wk < numWeeks ? cellBorder : 'none', position: 'relative' }}>
          {/* Editable sets x reps at top (always) */}
          <SetsRepsEdit
            sets={displaySets} reps={displayReps} isOverridden={srIsOverridden}
            displayOverride={intentOv ? (intentOv === 'HS' ? 'Heavy Single' : intentOv === 'PR' ? 'PR Attempt' : intentOv) : null}
            onChange={(s, r) => {
              if (s === null && r === null) {
                setEdit(dk, i, 'sets_w' + wk, '')
                setEdit(dk, i, 'reps_w' + wk, '')
              } else {
                if (s) setEdit(dk, i, 'sets_w' + wk, s)
                if (r) setEdit(dk, i, 'reps_w' + wk, r)
              }
            }}
            onChangeIntent={(it) => setEdit(dk, i, 'intent_w' + wk, it || '')}
          />
          <div className="cell-spacer" style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minHeight: 46 }}>
            {/* Intent badge (only when no coach sets/reps override) */}
            {effIntent === '5RM' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>5RM</div>}
            {effIntent === '3RM' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>3RM</div>}
            {effIntent === '2RM' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>2RM</div>}
            {effIntent === '1RM' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>1RM</div>}
            {effIntent === 'PR' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>PR Attempt</div>}
            {effIntent === 'HS' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>Heavy Single</div>}
            {effIntent === 'MAX' && <div style={{ fontSize: 11, fontWeight: 800, color: '#c44', letterSpacing: 0.5 }}>MAX</div>}
            {effIntent === 'DESIGN' && (
              <>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#0055bb', letterSpacing: 1, textTransform: 'uppercase' }}>Designer</div>
                <div style={{ fontSize: 7, color: '#333', lineHeight: 1.3, textAlign: 'left' }}>
                  {designerLines.map((l, li) => <div key={li}>{l}</div>)}
                </div>
              </>
            )}
            {/* Weight line (from pct + PR) */}
            {weightText && !mw.bench && (
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{weightText}</div>
            )}
            {/* Bench top + AMRAP */}
            {mw.bench && (() => {
              const bp = prForWk(wk)
              const topP = mw.bench.topPct / 100
              const dropP = (mw.bench.topPct - 10) / 100
              const topW = bp ? (useKg ? rKg(bp * topP) + ' kg' : r5(bp * topP) + ' lbs') : null
              const dropW = bp ? (useKg ? rKg(bp * dropP) + ' kg' : r5(bp * dropP) + ' lbs') : null
              return (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#111', textAlign: 'center' }}>{'Top: 1\u00d7' + mw.bench.topReps + (topW ? ' @ ' + topW : '')}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#111', textAlign: 'center' }}>AMRAP{dropW ? ' @ ' + dropW : ''}</div>
                </>
              )
            })()}
            {/* Alt exercise (e.g. "Deadlift") on swap weeks */}
            {mw.altExercise && (
              <div style={{ fontSize: 8, fontWeight: 700, color: '#0055bb', fontStyle: 'italic' }}>{mw.altExercise}</div>
            )}
            {/* Velocity floor */}
            {mw.vFloor && (
              <div style={{ fontSize: 7, fontStyle: 'italic', color: '#666', textAlign: 'center' }}>{mw.vFloor}</div>
            )}
            {/* Inline tag (moderate, lighter) */}
            {mw.note && !noteVal && (
              <div style={{ fontSize: 7, color: '#888', fontStyle: 'italic' }}>{mw.note}</div>
            )}
            {/* Coach-editable note */}
            {noteVal ? (
              <input value={noteVal} onChange={e => setCellNote(noteKey, e.target.value)}
                style={{ fontSize: 8, color: '#0055bb', fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Arial, sans-serif', padding: 0, width: '100%', textAlign: 'center' }} />
            ) : (
              <input value="" onChange={e => setCellNote(noteKey, e.target.value)} placeholder="+ note"
                className="no-print"
                style={{ fontSize: 7, color: '#bbb', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Arial, sans-serif', padding: 0, width: 40, textAlign: 'center' }} />
            )}
          </div>
          {/* Editable % pinned bottom-right (same UX as every other template) */}
          <PctEdit
            wk={wk}
            isOverridden={pctIsOverridden}
            defaultPct={mw.pctLo != null && mw.pctLo === (mw.pctHi != null ? mw.pctHi : mw.pctLo) ? mw.pctLo : null}
            rangeLo={mw.pctLo != null ? mw.pctLo : null}
            rangeHi={mw.pctHi != null ? mw.pctHi : (mw.pctLo != null ? mw.pctLo : null)}
            overrideVal={pctOverrideVal}
            onChange={v => {
              if (v === null) {
                setEdit(dk, i, 'pct_w' + wk, '')
                setEdit(dk, i, 'pct_w' + wk + '_hi', '')
              } else if (typeof v === 'object') {
                setEdit(dk, i, 'pct_w' + wk, String(v.lo))
                setEdit(dk, i, 'pct_w' + wk + '_hi', String(v.hi))
              } else {
                setEdit(dk, i, 'pct_w' + wk, String(v / 100))
              }
            }}
          />
        </td>
      )
    }
    // ====== end Matt's custom render ======

    const hint = getHint(wk)
    const hasPct = !!ex.pct
    const ov = ex.pctOverrides?.[wk]
    const isOverridden = ov != null
    const overrideVal = ov == null ? null : (typeof ov === 'object' ? { lo: Math.round(ov.lo*100), hi: Math.round(ov.hi*100) } : Math.round(ov*100))
    const wsr = getWeekSR(wk)
    return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < numWeeks ? cellBorder : 'none', position: 'relative' }}>
        <SetsRepsEdit
          sets={wsr.sets} reps={wsr.reps} isOverridden={wsr.isOverridden}
          onChange={(s, r) => {
            if (s === null && r === null) {
              setEdit(dk, i, 'sets_w' + wk, '')
              setEdit(dk, i, 'reps_w' + wk, '')
            } else {
              if (s) setEdit(dk, i, 'sets_w' + wk, s)
              if (r) setEdit(dk, i, 'reps_w' + wk, r)
            }
          }}
          onChangeIntent={(it) => setEdit(dk, i, 'intent_w' + wk, it || '')}
        />
        {/* Weight in the top-right (opposite side of sets x reps).
            Ramp-up percentage notes (e.g. "70,78,85,90,95%") still sit
            centered as the headline since they aren't a single weight. */}
        {(() => {
          const isRamp = noteVal && /^\s*(\d+\s*,\s*)+\d+\s*%?\s*$/.test(noteVal)
          return (
            <>
              {hint && !isRamp && (
                <div style={{ position: 'absolute', top: 2, right: 4, fontSize: 10, color: '#111', fontWeight: 700, fontFamily: 'Arial, sans-serif', textAlign: 'right', pointerEvents: 'none' }}>
                  {hint}
                </div>
              )}
              {isRamp && (
                <div style={{ position: 'absolute', top: 16, left: 3, right: 3, fontSize: 9, color: '#0055bb', fontWeight: 700, fontFamily: 'Arial, sans-serif', textAlign: 'center', pointerEvents: 'none' }}>
                  {noteVal}
                </div>
              )}
              {/* Coach-editable note: only renders visibly when there is actual content.
                  When empty, the input is hidden on both screen and print so the
                  "note" placeholder doesn't clutter the middle of the cell. */}
              {!isRamp && (
                <input value={noteVal} onChange={e => setCellNote(noteKey, e.target.value)}
                  placeholder=""
                  className={noteVal ? '' : 'no-print'}
                  style={{
                    position: 'absolute', top: 18, left: 3,
                    fontSize: 8, color: '#0055bb', fontWeight: 700,
                    border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: 'Arial, sans-serif', padding: 0,
                    width: 'calc(100% - 6px)', textAlign: 'center',
                    // When there is no note value, render invisibly so it
                    // doesn't cover the weight or the empty cell.
                    opacity: noteVal ? 1 : 0,
                  }} />
              )}
            </>
          )
        })()}
        {(hasPct || isOverridden) && (
          <PctEdit
            wk={wk}
            isOverridden={isOverridden}
            defaultPct={wk === 1 && ex.pct ? Math.round(ex.pct[0]*100) : null}
            rangeLo={ex.pct ? Math.round(ex.pct[1]*100) : null}
            rangeHi={ex.pct ? Math.round(ex.pct[2]*100) : null}
            overrideVal={overrideVal}
            onChange={v => {
              if (v === null) {
                setEdit(dk, i, 'pct_w' + wk, '')
                setEdit(dk, i, 'pct_w' + wk + '_hi', '')
              } else if (typeof v === 'object') {
                setEdit(dk, i, 'pct_w' + wk, String(v.lo))
                setEdit(dk, i, 'pct_w' + wk + '_hi', String(v.hi))
              } else {
                setEdit(dk, i, 'pct_w' + wk, String(v / 100))
              }
            }}
          />
        )}
        <div className="cell-spacer" style={{ height: 46 }}></div>
      </td>
    )
  }

  return (
    <tr>
      <td style={{ ...tdBase, borderRight: cellBorder, textAlign: 'center', padding: '5px 2px' }}>
        <EditField value={ex.series} onChange={v => setEdit(dk, i, 'series', v)} style={{ fontSize: 10, fontWeight: 800, color: isWU ? '#bbb' : '#111' }} />
      </td>
      <td style={{ ...tdBase, borderRight: cellBorder, padding: '4px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <ExerciseInput value={ex.exercise} onChange={v => setEdit(dk, i, 'exercise', v)} library={library} />
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 14, flexShrink: 0 }}>
            {((ex.pct || ex.matts) && !isWU) && (
              <button onClick={() => toggleKg(ex.exercise)} title={useKg ? 'Switch to lbs' : 'Switch to kg'}
                style={{ padding: '1px 4px', fontSize: 7, fontWeight: 800, letterSpacing: 0.5, border: '1px solid', borderColor: useKg ? '#0055bb' : '#ccc', background: useKg ? '#e8f0ff' : 'transparent', color: useKg ? '#0055bb' : '#bbb', cursor: 'pointer', borderRadius: 2, lineHeight: 1.4, fontFamily: 'inherit' }}>
                KG
              </button>
            )}
            {!isWU && (
              <button onClick={() => showPctSetup ? setShowPctSetup(false) : openPctSetup()} title="Set % for the whole block"
                style={{ padding: '1px 4px', fontSize: 8, fontWeight: 800, border: '1px solid', borderColor: showPctSetup ? '#0055bb' : '#bbb', background: showPctSetup ? '#e8f0ff' : 'transparent', color: showPctSetup ? '#0055bb' : '#888', cursor: 'pointer', borderRadius: 2, lineHeight: 1.4, fontFamily: 'inherit' }}>
                %
              </button>
            )}
          </div>
        </div>
        {showPctSetup && !isWU && (
          <div className="no-print" style={{ marginTop: 4, padding: '6px', background: '#f0f6ff', border: '1px solid #9bf', borderRadius: 3, fontSize: 9 }}>
            <div style={{ fontWeight: 800, color: '#0055bb', fontSize: 8, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>% for whole block · all weeks</div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={setupLo} onChange={e => setSetupLo(e.target.value)} placeholder="75"
                style={{ width: 32, border: '1px solid #bbb', borderRadius: 2, fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ color: '#999', fontSize: 10 }}>–</span>
              <input value={setupHi} onChange={e => setSetupHi(e.target.value)} placeholder="opt"
                style={{ width: 32, border: '1px solid #bbb', borderRadius: 2, fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '2px', fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ color: '#999', fontSize: 9 }}>%</span>
              <span style={{ fontWeight: 700, color: '#666', fontSize: 8, textTransform: 'uppercase', marginLeft: 4 }}>PR:</span>
              <select value={setupPrKey} onChange={e => setSetupPrKey(e.target.value)}
                style={{ fontSize: 9, border: '1px solid #bbb', padding: '1px 3px', fontFamily: 'inherit', background: '#fff', maxWidth: 84 }}>
                <option value="">auto</option>
                {[['snatch','Snatch'],['clean','Clean'],['jerk','Jerk'],['deadlift','Deadlift'],['front_squat','Front Sq'],['back_squat','Back Sq'],['bench_press','Bench'],['press','Press'],['push_press','Push Press'],['chin_up','Chin Up']].map(([k,l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button onClick={confirmPct} style={{ background: '#0055bb', color: '#fff', border: 'none', padding: '3px 9px', fontSize: 9, fontWeight: 800, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}>Apply</button>
              <button onClick={removePct} title="Clear % from all weeks" style={{ background: 'none', color: '#c00', border: '1px solid #c00', padding: '2px 6px', fontSize: 9, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}>Clear</button>
            </div>
          </div>
        )}
        {<div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 2 }}>
          <EditField value={ex.sets} onChange={v => setEdit(dk, i, 'sets', v)} style={{ fontSize: 11, fontWeight: 800 }} />
          <span style={{ fontSize: 10, color: '#555' }}>×</span>
          <EditField value={ex.reps} onChange={v => setEdit(dk, i, 'reps', v)} style={{ fontSize: 11, fontWeight: 800 }} />
          {!isWU && (ex.note ? (
            <EditField
              value={ex.note}
              onChange={v => setEdit(dk, i, 'note', v)}
              placeholder="add note..."
              style={{ fontSize: 9, color: '#111', fontWeight: 800, marginLeft: 3 }}
            />
          ) : (
            <span className="no-print">
              <EditField
                value=""
                onChange={v => setEdit(dk, i, 'note', v)}
                placeholder="add note..."
                style={{ fontSize: 9, color: '#999', fontStyle: 'italic', marginLeft: 3 }}
              />
            </span>
          ))}
        </div>}
      </td>
      {Array.from({ length: numWeeks }, (_, i) => i + 1).map(wk => wkCell(wk))}
    </tr>
  )
}
