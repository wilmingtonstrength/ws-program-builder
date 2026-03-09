import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://xxtomnbvinxuvnrrqnqb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dG9tbmJ2aW54dXZucnJxbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTk5MTksImV4cCI6MjA4NTc5NTkxOX0.Ty-KRgr9JsYr7ZEZtvm7lB2TxcdWeW1CCsJQdWyFND8'
)

function r5(v) { return Math.round(v / 5) * 5 }
function rKg(lbs) { return Math.round(lbs / 2.2046 * 2) / 2 }
function mkEx(s, e, st, r, p, pk, n) {
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
  if (['back squat','back squat he','deadlift','sumo deadlift','trap bar deadlift','bench press','press','behind-the-neck press','db bench press'].includes(n)) return 'STR'
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
  ],
  'Clean': [
    'Hang Clean','Power Position Clean','Low Hang Clean','No Foot Clean',
    'No Foot No Hook Clean','Pause at Knee Clean','Hang Power Clean',
    'Power Position Power Clean','Low Hang Power Clean','Tall Clean','3-Position Clean',
    'PP Clean + Hang Clean','PAK Clean Pull + Clean Pull',
  ],
  'Jerk': [
    'Push Jerk','Power Jerk','Split Jerk',
    'Behind-the-Neck Push Jerk','Behind-the-Neck Power Jerk','Behind-the-Neck Split Jerk',
    'Pause Jerk','Tall Jerk',
    'Clean + Jerk','Hang Clean + Jerk','PP Clean + Jerk',
    'Hang Clean + Push Jerk','Low Hang Clean + Pause Jerk',
  ],
  'Overhead': [
    'Press','Push Press','Behind-the-Neck Press',
    'SA KB Overhead Press','Double KB Overhead Press','SA KB Push Press','Double KB Push Press',
    'PP Clean + Press','PP Clean + Push Press','Hang Clean + Push Press',
    'Power Clean + Push Press','Hang Power Clean + Push Press','Low Hang Power Clean + Push Press',
    'PP Clean + Push Press + Front Squat','Tall Clean + Push Press','Tall Clean + Press',
  ],
  'Squat': [
    'Front Squat','Back Squat','Goblet Squat','OHS',
    'Front Squat HE','Back Squat HE','Goblet Squat HE',
    'Double KB Front Squat','Zercher Squat',
  ],
  'Pulls / Hinge': [
    'Deadlift','Sumo Deadlift','Trap Bar Deadlift','KB Deadlift','RDL','DB RDL',
    'Clean Pull','Pause at Knee Clean Pull','3-Position Clean Pull',
    'Hang Clean High Pull','PAK Clean Pull','PAK Clean Pull + Clean Pull',
    'Snatch Pull','Pause at Knee Snatch Pull','3-Position Snatch Pull','Hang Snatch High Pull',
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
}

const TEMPLATES = {
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
}


// Name-based PR key detection — covers exercises not explicitly in EXERCISE_PR_KEYS
function detectPrKey(name) {
  if (!name) return null
  const n = name.toLowerCase()
  // Check explicit map first
  if (EXERCISE_PR_KEYS[name] !== undefined) return EXERCISE_PR_KEYS[name]
  // Name-based fallback
  if (n.includes('snatch')) return 'snatch'
  if (n.includes('clean') && (n.includes('jerk') || n.includes('push jerk') || n.includes('push press')))
    return ['clean','press','push_press','jerk','overhead']
  if (n.includes('clean')) return 'clean'
  if (n.includes('jerk') || n.includes('push press')) return ['press','push_press','jerk','overhead']
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
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePatternChange = (p) => { setPattern(p); setFiltered(lib[p] || []); setShowDrop(true); setText('') }
  const handleTextChange = (e) => {
    const v = e.target.value; setText(v); onChange(v)
    if (pattern) { setFiltered((lib[pattern] || []).filter(ex => ex.toLowerCase().includes(v.toLowerCase()))); setShowDrop(true) }
  }
  const handleSelect = (ex) => { setText(ex); onChange(ex); setShowDrop(false) }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <select value={pattern} onChange={e => handlePatternChange(e.target.value)}
        style={{ fontSize: 8, color: '#aaa', border: 'none', background: 'transparent', padding: '0 0 1px 0', cursor: 'pointer', width: '100%', outline: 'none' }}>
        <option value="">— pattern —</option>
        {Object.keys(lib).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <input type="text" value={text} onChange={handleTextChange}
        onFocus={() => { if (pattern) { setFiltered(lib[pattern] || []); setShowDrop(true) } }}
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
    <span onClick={() => setEditing(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc', ...style }}>
      {value || <span style={{ color: '#ccc', fontStyle: 'italic', fontWeight: 400 }}>{placeholder}</span>}
    </span>
  )
}

export default function App() {
  const [athletes, setAthletes] = useState([])
  const [prs, setPrs] = useState({})
  const [athleteId, setAthleteId] = useState(() => { try { return JSON.parse(localStorage.getItem('ws_athleteId')) || null } catch { return null } })
  const [tab, setTab] = useState(() => localStorage.getItem('ws_tab') || 'builder')
  const [tier, setTier] = useState(() => localStorage.getItem('ws_tier') || 'beginner')
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
        const { data } = await sb.from('results').select('athlete_id,test_id,converted_value,raw_value').range(from, from + 499)
        if (data) all = [...all, ...data]
        if (!data || data.length < 500) break
        from += 500
      }
      const map = {}
      all.forEach(r => { const k = r.athlete_id + '-' + r.test_id; const v = parseFloat(r.converted_value ?? r.raw_value); if (!isNaN(v) && (!map[k] || v > map[k])) map[k] = v })
      setPrs(map)
      const { data: savedEdits } = await sb.from('program_edits').select('*')
      if (savedEdits && savedEdits.length > 0) {
        const editMap = {}
        savedEdits.forEach(r => {
          if (r.field === 'prKey') return
          const k = `${r.template}-${r.block}-${r.day}-${r.ex_index}`
          if (!editMap[k]) editMap[k] = {}
          editMap[k][r.field] = r.value
        })
        setEdits(editMap)
      }
      const { data: savedNotes } = await sb.from('program_cell_notes').select('*')
      if (savedNotes && savedNotes.length > 0) {
        const noteMap = { ...DEFAULT_CELL_NOTES }
        savedNotes.forEach(r => { noteMap[`${r.template}-${r.block}-${r.day}-${r.ex_index}-${r.week}`] = r.value })
        setCellNotes(noteMap)
      }
      const { data: ctData } = await sb.from('custom_templates').select('*')
      if (ctData && ctData.length > 0) {
        const ctMap = {}
        ctData.forEach(r => { try { ctMap[r.id] = JSON.parse(r.template_json) } catch(e) {} })
        setCustomTemplates(ctMap)
      }
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
      // Structural keys (clean, squat, etc.) are the limiting factor — use them if present
      if (structVals.length > 0) return Math.min(...structVals)
      // Fallback: best overhead-type PR only if no structural found
      const ohVals = ohKeys.map(t => prs[aId + '-' + t]).filter(v => v != null)
      return ohVals.length ? Math.max(...ohVals) : null
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
  const tD = allTemplates[tier] || TEMPLATES.beginner
  const bD = tD.blocks[block] || tD.blocks[1]
  const isOly = !['gpp_2day','gpp_3day','upper_lower'].includes(tier)
  const ath = athletes.find(a => a.id === athleteId)
  const filteredAth = athletes.filter(a => (a.first_name + ' ' + a.last_name).toLowerCase().includes(search.toLowerCase()))
  const days = tD.days

  const getExs = (day) => bD[day].exercises.map((ex, i) => {
    const k = `${tier}-${block}-${day}-${i}`
    const edit = edits[k] || {}
    const merged = { ...ex, note: ex.note || '', ...edit }
    if (Array.isArray(ex.prKey) && typeof edit.prKey === 'string') merged.prKey = ex.prKey
    // Parse per-week overrides — wk1 single, wk2/3 can be range {lo,hi}
    const pctOv = {}
    ;[1,2,3].forEach(w => {
      const lo = parseFloat(edit['pct_w' + w])
      if (isNaN(lo)) return
      if (w > 1) {
        const hi = parseFloat(edit['pct_w' + w + '_hi'])
        pctOv[w] = isNaN(hi) ? lo : { lo, hi }
      } else {
        pctOv[w] = lo
      }
    })
    merged.pctOverrides = Object.keys(pctOv).length > 0 ? pctOv : null
    delete merged.pct_w1; delete merged.pct_w2; delete merged.pct_w2_hi; delete merged.pct_w3; delete merged.pct_w3_hi
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

  const page1Days = days.slice(0, 2)
  const page2Days = days.slice(2)

  return (
    <div style={{ background: '#f0f0f0', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
      {status !== 'Ready' && (
        <div className="no-print" style={{ background: '#fffbe6', borderBottom: '1px solid #ddb', padding: '5px 16px', fontSize: 11, color: '#665500' }}>{status}</div>
      )}
      <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', display: 'flex' }}>
        {[['builder','Program Builder'],['templates','Create Template'],['library','Manage Library']].map(([t,label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', border: 'none', borderBottom: t === tab ? '3px solid #111' : '3px solid transparent', background: 'transparent', fontWeight: t === tab ? 800 : 400, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</button>
        ))}
      </div>
      {tab === 'library' ? (
        <LibraryManager library={library} setLibrary={setLibrary} saving={saving} setSaving={setSaving} sb={sb} />
      ) : tab === 'templates' ? (
        <TemplateCreator allTemplates={allTemplates} customTemplates={customTemplates} setCustomTemplates={setCustomTemplates} library={library} saving={saving} setSaving={setSaving} sb={sb} setTier={setTier} setBlock={setBlock} setTab={setTab} />
      ) : (
        <div>
          <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div style={lbl}>Template</div>
              <select value={tier} onChange={e => { setTier(e.target.value); setBlock(1) }} style={{ border: '1px solid #bbb', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit' }}>
                {Object.entries(allTemplates).map(([k,t]) => <option key={k} value={k}>{t.label}</option>)}
              </select>
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

          <div id="sheet" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
            <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} />
            <PRBar PKS={PKS} ath={ath} getPR={getPR} getOverheadPR={getOverheadPR} getOverheadVariantPR={getOverheadVariantPR} />
            {page1Days.map(dk => (
              <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
                setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block}
                library={library} kgExercises={kgExercises} toggleKg={toggleKg} />
            ))}
          </div>

          {page2Days.length > 0 && (
            <div id="sheet2" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
              <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} compact />
              {page2Days.map(dk => (
                <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
                  setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block}
                  library={library} kgExercises={kgExercises} toggleKg={toggleKg} />
              ))}
            </div>
          )}

          <style>{`
            * { box-sizing: border-box; }
            @media print {
              @page { size: letter portrait; margin: 0.4in }
              body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important }
              #sheet, #sheet2 { max-width: none !important; margin: 0 !important; padding: 8px 12px !important; box-shadow: none !important; }
              #sheet2 { page-break-before: always; }
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
  const [dayHeaders, setDayHeaders] = useState({ dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day' })
  const [blocks, setBlocks] = useState(() => {
    const b = {}
    ;[1,2,3].forEach(n => { b[n] = { pctLabel:'', w1note:'', ranges: JSON.parse(JSON.stringify(DEFAULT_BLOCK_RANGES[n])) } })
    return b
  })
  const [editBlock, setEditBlock] = useState(1)
  const [msg, setMsg] = useState('')
  const [copyFrom, setCopyFrom] = useState('')
  const [editingId, setEditingId] = useState(null)

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }
  const DAY_OPTIONS = ['dayA','dayB','dayC','dayD']
  const DAY_LABELS = { dayA:'A', dayB:'B', dayC:'C', dayD:'D' }
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,30)
  const CATS = ['STR','OLY','PULL','PWR']

  const resetForm = () => {
    setTemplateId(''); setLabel(''); setDays(['dayA','dayB'])
    setDayHeaders({ dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day' })
    const b = {}
    ;[1,2,3].forEach(n => { b[n] = { pctLabel:'', w1note:'', ranges: JSON.parse(JSON.stringify(DEFAULT_BLOCK_RANGES[n])) } })
    setBlocks(b); setEditBlock(1); setCopyFrom(''); setEditingId(null)
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
    const dh = { dayA:'A Day', dayB:'B Day', dayC:'C Day', dayD:'D Day' }
    const bks = {}
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
            return { series: ex.series, exercise: ex.exercise, sets: ex.sets, reps: ex.reps, pctCat, customPct: pctCat === 'custom' ? ex.pct.map(p => Math.round(p*100)) : null, prKey: ex.prKey, note: ex.note || '' }
          })
        })
      }
    })
    setDayHeaders(dh); setBlocks(bks)
  }

  const editExisting = (key) => { setEditingId(key); loadFromTemplate(key, '') }

  const getExs = (d) => blocks[editBlock]?.[d] || []
  const setExs = (d, exs) => setBlocks(prev => ({ ...prev, [editBlock]: { ...prev[editBlock], [d]: exs } }))
  const addEx = (d) => {
    const cur = getExs(d)
    setExs(d, [...cur, { series: cur.length ? cur[cur.length-1].series : 'A1', exercise: '', sets: '3', reps: '8', pctCat: 'auto', customPct: null, prKey: null, note: '' }])
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
      days.forEach(d => { if (src[d]) copy[d] = src[d].map(ex => ({...ex, customPct: ex.customPct ? [...ex.customPct] : null})) })
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
    ;[1,2,3].forEach(b => {
      const bData = blocks[b] || {}; const bd = {}
      if (bData.pctLabel) bd.pctLabel = bData.pctLabel
      if (bData.w1note) bd.w1note = bData.w1note
      days.forEach(d => {
        bd[d] = { header: dayHeaders[d] || (d.replace('day','') + ' Day'), exercises: (bData[d] || []).map(ex => mkEx(ex.series, ex.exercise, parseInt(ex.sets)||3, ex.reps, resolvePct(ex,b), ex.prKey, ex.note)) }
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
                <button onClick={() => deleteTemplate(k)} style={{ ...sty.smBtnLight, color: '#c00', borderColor: '#c00' }}>Delete</button>
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
        <div style={sty.lbl}>Block</div>
        {[1,2,3].map(b => (
          <button key={b} onClick={() => setEditBlock(b)} style={{ padding: '5px 18px', border: '1px solid #bbb', background: editBlock===b?'#111':'#fff', color: editBlock===b?'#fff':'#555', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>{b}</button>
        ))}
        <span style={{ fontSize: 10, color: '#999', marginLeft: 4 }}>|</span>
        <select onChange={e => { const v = e.target.value; if (v) { const [f,t] = v.split('>'); copyBlockTo(parseInt(f),parseInt(t)) } e.target.value='' }} style={{ ...sty.input, fontSize: 10 }}>
          <option value="">Copy block...</option>
          {[1,2,3].flatMap(f => [1,2,3].filter(t=>t!==f).map(t => <option key={f+''+t} value={f+'>'+t}>Block {f} → Block {t}</option>))}
        </select>
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
                  return (
                    <tr key={idx}>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 36 }}><input value={ex.series} onChange={e => updateEx(d,idx,'series',e.target.value)} style={{ width: 30, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 800, outline: 'none', fontFamily: 'inherit', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 180 }}><ExerciseInput value={ex.exercise} onChange={v => updateEx(d,idx,'exercise',v)} library={library} /></td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 40 }}><input value={ex.sets} onChange={e => updateEx(d,idx,'sets',e.target.value)} style={{ width: 30, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textAlign: 'center', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 50 }}><input value={ex.reps} onChange={e => updateEx(d,idx,'reps',e.target.value)} style={{ width: 44, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 11, fontWeight: 700, outline: 'none', fontFamily: 'inherit', textAlign: 'center', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 80 }}>
                        <select value={ex.pctCat} onChange={e => {
                          const v = e.target.value; const updated = [...getExs(d)]; updated[idx] = { ...updated[idx], pctCat: v }
                          if (v !== 'custom') updated[idx].customPct = null
                          if (v === 'custom' && !updated[idx].customPct) { const r = ranges[detected] || ranges.STR || [60,60,70]; updated[idx].customPct = [...r] }
                          setExs(d, updated)
                        }} style={{ fontSize: 10, border: '1px solid #ccc', padding: '2px 3px', fontFamily: 'inherit', background: '#fff', width: 70, fontWeight: 600, color: effectiveCat ? PCT_CAT_COLORS[effectiveCat] : '#555' }}>
                          <option value="auto">{detected ? 'Auto (' + detected + ')' : 'Auto (—)'}</option>
                          <option value="none">None</option>
                          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="custom">Custom</option>
                        </select>
                      </td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 110 }}>
                        {showCustom ? (
                          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {[0,1,2].map(pi => <input key={pi} value={ex.customPct?.[pi]??''} onChange={e => { const v=e.target.value; const cur=ex.customPct||[0,0,0]; const next=[...cur]; next[pi]=v===''?0:parseInt(v)||0; updateEx(d,idx,'customPct',next) }} placeholder={pi===0?'W1':pi===1?'Lo':'Hi'} style={{ width: 28, border: '1px solid #ccc', borderRadius: 2, fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '2px 1px', fontFamily: 'inherit', outline: 'none', color: '#555' }} />)}
                          </div>
                        ) : effectiveCat ? (
                          <span style={{ fontSize: 9, color: '#aaa' }}>{(ranges[effectiveCat]||[])[0]}% | {(ranges[effectiveCat]||[])[1]}–{(ranges[effectiveCat]||[])[2]}%</span>
                        ) : <span style={{ fontSize: 9, color: '#ddd' }}>—</span>}
                      </td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 4px', width: 60 }}><input value={ex.note} onChange={e => updateEx(d,idx,'note',e.target.value)} placeholder="note" style={{ width: 50, border: 'none', borderBottom: '1px dashed #bbb', fontSize: 9, outline: 'none', fontFamily: 'inherit', fontStyle: 'italic', color: '#888', background: 'transparent' }} /></td>
                      <td style={{ borderBottom: '1px solid #ddd', padding: '3px 2px', width: 60, whiteSpace: 'nowrap' }}>
                        <button onClick={() => moveEx(d,idx,-1)} disabled={idx===0} style={{ border:'none',background:'none',cursor:'pointer',fontSize:10,color:idx===0?'#ddd':'#555',padding:'0 2px' }}>&#9650;</button>
                        <button onClick={() => moveEx(d,idx,1)} disabled={idx===exs.length-1} style={{ border:'none',background:'none',cursor:'pointer',fontSize:10,color:idx===exs.length-1?'#ddd':'#555',padding:'0 2px' }}>&#9660;</button>
                        <button onClick={() => removeEx(d,idx)} style={{ border:'none',background:'none',cursor:'pointer',fontSize:13,color:'#c00',fontWeight:700,padding:'0 3px',lineHeight:1 }}>&times;</button>
                      </td>
                    </tr>
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
    } else if (wk > 1 && rangeLo != null) {
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
    // Support "65-75" range input for wk 2-3
    if (wk > 1 && v.includes('-')) {
      const parts = v.split('-').map(p => parseInt(p.trim()))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
        onChange({ lo: parts[0] / 100, hi: parts[1] / 100 })
        return
      }
    }
    const num = parseInt(v)
    if (!isNaN(num) && num > 0 && num <= 150) {
      if (wk > 1) onChange({ lo: num / 100, hi: num / 100 })
      else onChange(num)
    }
  }

  const inputWidth = wk > 1 ? 44 : 32
  if (editing) return (
    <div className="no-print" style={{ position: 'absolute', bottom: 1, right: 2, zIndex: 5, display: 'flex', alignItems: 'baseline' }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={finish} onKeyDown={e => { if (e.key==='Enter') finish(); if (e.key==='Escape') setEditing(false) }}
        placeholder={wk > 1 ? '65-75' : (defaultPct || rangeLo || '')}
        style={{ width: inputWidth, fontSize: 8, border: 'none', borderBottom: '1px solid #0055bb', background: 'transparent', fontFamily: 'inherit', outline: 'none', padding: 0, textAlign: 'right', color: '#0055bb', fontWeight: 700 }} />
      <span style={{ fontSize: 7, color: '#0055bb' }}>%</span>
    </div>
  )
  return <div className="no-print" onClick={startEdit} style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 7, color: isOverridden ? '#0055bb' : '#ccc', cursor: 'pointer', fontWeight: isOverridden ? 700 : 400, zIndex: 5 }} title={wk > 1 ? 'Click to override % (e.g. 65-75)' : 'Click to override %'}>{displayText()}</div>
}

function DayTable({ dk, day, exs, isOly, ath, getPR, setEdit, cellNotes, setCellNote, tier, block, library, kgExercises, toggleKg }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '3px 8px', background: '#efefef', borderBottom: '1px solid #bbb' }}>{day.header}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup><col style={{ width: 26 }} /><col style={{ width: 190 }} /><col /><col /><col /><col /></colgroup>
        <thead>
          <tr>
            {['#','Exercise','Week 1','Week 2','Week 3','Week 4'].map((h,i) => (
              <th key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1.5px solid #111', borderRight: i < 5 ? '1px solid #777' : 'none', padding: '3px 4px', textAlign: i <= 1 ? 'left' : 'center', color: '#444', background: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exs.map((ex, i) => (
            <ExRow key={i} ex={ex} i={i} dk={dk} isOly={isOly} ath={ath} getPR={getPR} setEdit={setEdit}
              isLast={i === exs.length-1} isWU={ex.series === 'WU'}
              cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block} library={library}
              useKg={kgExercises.has(ex.exercise)} toggleKg={toggleKg} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExRow({ ex, i, dk, isOly, ath, getPR, setEdit, isLast, isWU, cellNotes, setCellNote, tier, block, library, useKg, toggleKg }) {
  const effectivePrKey = EXERCISE_PR_KEYS[ex.exercise] !== undefined ? EXERCISE_PR_KEYS[ex.exercise] : ex.prKey
  const pr = ath && effectivePrKey ? getPR(ath.id, effectivePrKey) : null
  const cellBorder = '1px solid #777'
  const tdBase = { borderBottom: isLast ? '2px solid #111' : '1px solid #999', borderRight: cellBorder, padding: 0, verticalAlign: 'top', background: isWU ? '#fafafa' : 'transparent' }

  const [showPctSetup, setShowPctSetup] = useState(false)
  const [setupW1, setSetupW1] = useState('65')
  const [setupRange, setSetupRange] = useState('65-75')
  const [setupPrKey, setSetupPrKey] = useState('')

  const openPctSetup = () => {
    const autoKey = Array.isArray(effectivePrKey) ? effectivePrKey[0] : (effectivePrKey || '')
    setSetupPrKey(autoKey)
    setSetupW1('65'); setSetupRange('65-75')
    setShowPctSetup(true)
  }
  const confirmPct = () => {
    const w1 = parseInt(setupW1) / 100
    if (isNaN(w1) || w1 <= 0) return
    const parts = setupRange.split('-').map(p => parseInt(p.trim()))
    const lo = (!isNaN(parts[0]) && parts[0] > 0 ? parts[0] : parseInt(setupW1)) / 100
    const hi = (parts.length === 2 && !isNaN(parts[1]) && parts[1] > 0 ? parts[1] : parts[0]) / 100
    setEdit(dk, i, 'pct_base_w1', String(w1))
    setEdit(dk, i, 'pct_base_lo', String(lo))
    setEdit(dk, i, 'pct_base_hi', String(hi))
    if (setupPrKey) setEdit(dk, i, 'pct_base_prkey', setupPrKey)
    setShowPctSetup(false)
  }
  const removePct = () => {
    ;['pct_base_w1','pct_base_lo','pct_base_hi','pct_base_prkey'].forEach(f => setEdit(dk, i, f, ''))
    setShowPctSetup(false)
  }

  const fmt = (lbs) => {
    if (useKg) { const kg = rKg(lbs); return kg + ' kg' }
    return r5(lbs) + ' lbs'
  }

  const getHint = (wk) => {
    if (!ex.pct) return ''
    const ov = ex.pctOverrides?.[wk]
    if (ov != null) {
      if (typeof ov === 'object') {
        if (pr) {
          if (useKg) { const lo = rKg(pr * ov.lo), hi = rKg(pr * ov.hi); return lo === hi ? lo + ' kg' : lo + '\u2013' + hi + ' kg' }
          const lo = r5(pr * ov.lo), hi = r5(pr * ov.hi); return lo === hi ? lo + ' lbs' : lo + '\u2013' + hi
        }
        const lo = Math.round(ov.lo*100), hi = Math.round(ov.hi*100); return lo === hi ? lo + '%' : lo + '\u2013' + hi + '%'
      }
      return pr ? fmt(pr * ov) : Math.round(ov * 100) + '%'
    }
    if (wk === 1) return pr ? fmt(pr * ex.pct[0]) : Math.round(ex.pct[0] * 100) + '%'
    if (wk === 2 || wk === 3) {
      if (pr) {
        if (useKg) {
          const lo = rKg(pr * ex.pct[1]), hi = rKg(pr * ex.pct[2])
          return lo === hi ? lo + ' kg' : lo + '\u2013' + hi + ' kg'
        }
        const lo = r5(pr * ex.pct[1]), hi = r5(pr * ex.pct[2])
        return lo === hi ? lo + ' lbs' : lo + '\u2013' + hi
      }
      const lo = Math.round(ex.pct[1]*100), hi = Math.round(ex.pct[2]*100)
      return lo === hi ? lo + '%' : lo + '\u2013' + hi + '%'
    }
    return ''
  }

  const wkCell = (wk) => {
    if (isWU) return <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? cellBorder : 'none' }}><div style={{ height: 46 }}></div></td>
    const noteKey = `${tier}-${block}-${dk}-${i}-${wk}`
    const noteVal = cellNotes[noteKey] !== undefined ? cellNotes[noteKey] : ''
    const hint = getHint(wk)
    const hasPct = ex.pct && wk <= 3
    const ov = ex.pctOverrides?.[wk]
    const isOverridden = ov != null
    const overrideVal = ov == null ? null : (typeof ov === 'object' ? { lo: Math.round(ov.lo*100), hi: Math.round(ov.hi*100) } : Math.round(ov*100))
    const isWk4 = wk === 4
    return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? cellBorder : 'none', position: 'relative' }}>
        <input value={noteVal} onChange={e => setCellNote(noteKey, e.target.value)}
          placeholder={hint}
          style={{ position: 'absolute', top: 2, left: 3, fontSize: 8, color: noteVal ? '#111' : '#0055bb', fontWeight: noteVal ? 700 : 600, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Arial, sans-serif', padding: 0, width: 'calc(100% - 6px)' }} />
        {hasPct && (
          <PctEdit
            wk={wk}
            isOverridden={isOverridden}
            defaultPct={wk === 1 ? Math.round(ex.pct[0]*100) : null}
            rangeLo={wk > 1 ? Math.round(ex.pct[1]*100) : null}
            rangeHi={wk > 1 ? Math.round(ex.pct[2]*100) : null}
            overrideVal={overrideVal}
            onChange={v => {
              if (v === null) {
                setEdit(dk, i, 'pct_w' + wk, '')
                if (wk > 1) setEdit(dk, i, 'pct_w' + wk + '_hi', '')
              } else if (typeof v === 'object') {
                setEdit(dk, i, 'pct_w' + wk, String(v.lo))
                setEdit(dk, i, 'pct_w' + wk + '_hi', String(v.hi))
              } else {
                setEdit(dk, i, 'pct_w' + wk, String(v / 100))
              }
            }}
          />
        )}
        <div style={{ height: 46 }}></div>
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
            {ex.pct && !isWU && (
              <button onClick={() => toggleKg(ex.exercise)} title={useKg ? 'Switch to lbs' : 'Switch to kg'}
                style={{ padding: '1px 4px', fontSize: 7, fontWeight: 800, letterSpacing: 0.5, border: '1px solid', borderColor: useKg ? '#0055bb' : '#ccc', background: useKg ? '#e8f0ff' : 'transparent', color: useKg ? '#0055bb' : '#bbb', cursor: 'pointer', borderRadius: 2, lineHeight: 1.4, fontFamily: 'inherit' }}>
                KG
              </button>
            )}
            {!ex.pct && !isWU && (
              <button onClick={() => showPctSetup ? setShowPctSetup(false) : openPctSetup()} title="Add percentage loading"
                style={{ padding: '1px 3px', fontSize: 7, fontWeight: 800, border: '1px solid', borderColor: showPctSetup ? '#888' : '#ddd', background: showPctSetup ? '#f0f0f0' : 'transparent', color: showPctSetup ? '#555' : '#ccc', cursor: 'pointer', borderRadius: 2, lineHeight: 1.4, fontFamily: 'inherit' }}>
                %
              </button>
            )}
          </div>
        </div>
        {showPctSetup && !isWU && (
          <div className="no-print" style={{ marginTop: 4, padding: '5px 6px', background: '#f8f8f8', border: '1px solid #ccc', borderRadius: 2, fontSize: 9 }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#666', fontSize: 8, textTransform: 'uppercase' }}>PR:</span>
              <select value={setupPrKey} onChange={e => setSetupPrKey(e.target.value)}
                style={{ fontSize: 9, border: '1px solid #ccc', padding: '1px 3px', fontFamily: 'inherit', background: '#fff', maxWidth: 90 }}>
                <option value="">auto</option>
                {[['snatch','Snatch'],['clean','Clean'],['jerk','Jerk'],['deadlift','Deadlift'],['front_squat','Front Sq'],['back_squat','Back Sq'],['bench_press','Bench'],['press','Press'],['push_press','Push Press'],['chin_up','Chin Up']].map(([k,l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <span style={{ fontWeight: 700, color: '#666', fontSize: 8, textTransform: 'uppercase' }}>W1:</span>
              <input value={setupW1} onChange={e => setSetupW1(e.target.value)} placeholder="65"
                style={{ width: 28, border: '1px solid #ccc', borderRadius: 2, fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '1px 2px', fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ color: '#999', fontSize: 8 }}>%</span>
              <span style={{ fontWeight: 700, color: '#666', fontSize: 8, textTransform: 'uppercase' }}>Rng:</span>
              <input value={setupRange} onChange={e => setSetupRange(e.target.value)} placeholder="65-75"
                style={{ width: 44, border: '1px solid #ccc', borderRadius: 2, fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '1px 2px', fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ color: '#999', fontSize: 8 }}>%</span>
              <button onClick={confirmPct} style={{ background: '#111', color: '#fff', border: 'none', padding: '2px 7px', fontSize: 9, fontWeight: 700, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}>✓</button>
              <button onClick={removePct} style={{ background: 'none', color: '#c00', border: '1px solid #c00', padding: '1px 5px', fontSize: 9, cursor: 'pointer', borderRadius: 2, fontFamily: 'inherit' }}>×</button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 2 }}>
          <EditField value={ex.sets} onChange={v => setEdit(dk, i, 'sets', v)} style={{ fontSize: 13, fontWeight: 800 }} />
          <span style={{ fontSize: 11, color: '#555' }}>×</span>
          <EditField value={ex.reps} onChange={v => setEdit(dk, i, 'reps', v)} style={{ fontSize: 13, fontWeight: 800 }} />
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
        </div>
      </td>
      {[1,2,3,4].map(wk => wkCell(wk))}
    </tr>
  )
}
