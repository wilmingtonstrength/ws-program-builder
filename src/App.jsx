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
const WU_B_pp = mkEx('WU', 'Tall Clean + Push Press', 1, '5+5', null, null, 'bar')
const WU_B_press = mkEx('WU', 'Tall Clean + Press', 1, '5+5', null, null, 'bar')

const STR_B1 = [0.60, 0.60, 0.70]
const STR_B2 = [0.70, 0.70, 0.80]
const STR_B3 = [0.75, 0.75, 0.80]
const FS_B1 = STR_B1
const FS_B2 = STR_B2
const FS_B3 = STR_B3
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
  ],
  'Jerk': [
    'Push Jerk','Power Jerk','Split Jerk','Push Press',
    'Behind-the-Neck Push Jerk','Behind-the-Neck Power Jerk','Behind-the-Neck Split Jerk',
    'Pause Jerk','Tall Jerk',
  ],
  'Complex': [
    'PP Snatch + OHS','PP Snatch + Hang Snatch','Hang Snatch + OHS',
    'PP Clean + Press','PP Clean + Push Press','Hang Clean + Push Press',
    'PP Clean + Hang Clean','Hang Clean + Front Squat',
    'PP Clean + Push Press + Front Squat','Hang Clean + Push Jerk',
    'Low Hang Clean + Pause Jerk','PAK Clean Pull + Clean Pull',
    '3-Position Clean','3-Position Snatch',
    'Tall Snatch + OHS','Tall Clean + Push Press','Tall Clean + Press',
    'Clean + Jerk','Hang Clean + Jerk','PP Clean + Jerk',
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
    'Clean Pull','Pause at Knee Clean Pull','3-Position Clean Pull',
    'Hang Clean High Pull','PAK Clean Pull','PAK Clean Pull + Clean Pull',
    'Snatch Pull','Pause at Knee Snatch Pull','3-Position Snatch Pull',
    'Hang Snatch High Pull',
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
const PATTERN_KEYS = Object.keys(LIBRARY)

const DEFAULT_CELL_NOTES = {
  'beginner-3-dayA-1-2': '2RM', 'beginner-3-dayA-1-3': 'MAX',
  'beginner-3-dayA-2-2': '3RM', 'beginner-3-dayA-2-3': 'MAX',
  'beginner-3-dayA-3-2': '2RM', 'beginner-3-dayA-3-3': 'MAX',
  'beginner-3-dayB-1-2': '3RM', 'beginner-3-dayB-1-3': 'MAX',
  'beginner-3-dayB-2-2': '2RM', 'beginner-3-dayB-2-3': 'MAX',
  'beginner-3-dayB-3-2': '3RM', 'beginner-3-dayB-3-3': 'MAX',
  'oly_athlete-1-dayA-1-4': 'RM', 'oly_athlete-1-dayA-2-4': 'RM', 'oly_athlete-1-dayA-3-4': 'RM',
  'oly_athlete-1-dayB-1-4': 'RM', 'oly_athlete-1-dayB-2-4': 'RM', 'oly_athlete-1-dayB-3-4': 'RM',
  'oly_athlete-2-dayA-1-4': 'RM', 'oly_athlete-2-dayA-2-4': 'RM', 'oly_athlete-2-dayA-3-4': 'RM',
  'oly_athlete-2-dayB-1-4': 'RM', 'oly_athlete-2-dayB-2-4': 'RM', 'oly_athlete-2-dayB-3-4': 'RM',
  'oly_athlete-3-dayA-1-2': '2RM', 'oly_athlete-3-dayA-1-3': 'MAX',
  'oly_athlete-3-dayA-2-2': '3RM', 'oly_athlete-3-dayA-2-3': 'MAX',
  'oly_athlete-3-dayA-3-2': '2RM', 'oly_athlete-3-dayA-3-3': 'MAX',
  'oly_athlete-3-dayB-1-2': '2RM', 'oly_athlete-3-dayB-1-3': 'MAX',
  'oly_athlete-3-dayB-2-2': '2RM', 'oly_athlete-3-dayB-2-3': 'MAX',
  'oly_athlete-3-dayB-3-2': '3RM', 'oly_athlete-3-dayB-3-3': 'MAX',
  'oly_adv-1-dayA-1-4': 'RM', 'oly_adv-1-dayA-2-4': 'RM', 'oly_adv-1-dayA-3-4': 'RM',
  'oly_adv-1-dayB-1-4': 'RM', 'oly_adv-1-dayB-2-4': 'RM', 'oly_adv-1-dayB-3-4': 'RM',
  'oly_adv-2-dayA-1-4': 'RM', 'oly_adv-2-dayA-2-4': 'RM', 'oly_adv-2-dayA-3-4': 'RM',
  'oly_adv-2-dayB-1-4': 'RM', 'oly_adv-2-dayB-2-4': 'RM', 'oly_adv-2-dayB-3-4': 'RM',
  'oly_adv-3-dayA-1-2': '2RM', 'oly_adv-3-dayA-1-3': 'MAX',
  'oly_adv-3-dayA-2-2': '3RM', 'oly_adv-3-dayA-2-3': 'MAX',
  'oly_adv-3-dayA-3-2': '3RM', 'oly_adv-3-dayA-3-3': 'MAX',
  'oly_adv-3-dayB-1-2': '2RM',
  'oly_adv-3-dayB-2-2': '2RM', 'oly_adv-3-dayB-2-3': 'MAX',
  'oly_adv-3-dayB-3-3': 'MAX',
}

const ADULT_TEMPLATES = ['adult_oly', 'gpp_2day', 'gpp_3day', 'upper_lower']

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
        pctLabel: '65-75%', w1note: '65% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+5',OLY_B1,'clean'),
          mkEx('B1','PP Clean + Hang Clean',4,'2+1',OLY_B1,'clean'),
          mkEx('C1','Deadlift',3,'8',STR_B1,'deadlift'),
          mkEx('D1','Nordic Hamstring Curl',3,'8'),
          mkEx('D2','Chest Supported Row',3,'12'),
        ]}
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,'clean'),
          mkEx('B1','Hang Clean',4,'2',OLY_B2,'clean'),
          mkEx('C1','Deadlift',4,'5',STR_B2,'deadlift'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','Farmers Carry',3,'1'),
        ]}
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch + OHS',4,'1+2+1',OLY_B1,'snatch'),
          mkEx('B1','Bench Press',3,'8',STR_B1,'bench_press'),
          mkEx('C1','Back Squat',3,'8',STR_B1,'back_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','PP Clean + Push Press',4,'1+5',OLY_B1,'clean'),
          mkEx('B1','PP Clean + Front Squat',4,'3+1',OLY_B1,'clean'),
          mkEx('C1','Hang Clean High Pull',4,'5',PULL_B1,'clean'),
          mkEx('D1','Chest Supported Row',3,'12'),
          mkEx('D2','Glute Ham Raise',3,'8'),
        ]}
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch + OHS',4,'2+1',OLY_B2,'snatch'),
          mkEx('B1','Bench Press',4,'5',STR_B2,'bench_press'),
          mkEx('C1','Back Squat',4,'5',STR_B2,'back_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Nordic Hamstring Curl',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_B_pp,
          mkEx('A1','Hang Clean + Push Press',4,'1+3',OLY_B2,'clean'),
          mkEx('B1','Hang Clean + Front Squat',4,'2+1',OLY_B2,'clean'),
          mkEx('C1','PAK Clean Pull',4,'3',PULL_B2,'clean'),
          mkEx('D1','Chainsaw Row',3,'8'),
          mkEx('D2','Split Stance RDL',3,'8ea'),
        ]}
      },
      3: {
        pctLabel: '75-90%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,'clean'),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Hollow Hold',3,'30sec'),
          mkEx('D3','TRX Ws',3,'12'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Hang Clean + Push Press',4,'1+3',OLY_B1,'clean'),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','KB Swing',3,'10'),
          mkEx('D2','SA KOB Row',3,'8ea'),
          mkEx('D3','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,'clean'),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Dead Bug',3,'8'),
          mkEx('D3','Band Pull-Aparts',3,'15'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+2',OLY_B2,'clean'),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','45-Deg Back Extension',3,'10'),
          mkEx('D2','Chest Supported Row',3,'10'),
          mkEx('D3','Landmine Anti-Rotation',3,'10ea'),
        ]}
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,'clean'),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','Chin Up',3,'8'),
          mkEx('D2','Hollow Rocks',3,'10'),
          mkEx('D3','YWTs',3,'10'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+1',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,'clean'),
          mkEx('C1','Front Squat',4,'5',FS_B1,'front_squat'),
          mkEx('D1','RFE Split Squat',3,'8ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','PP Snatch + Hang Snatch',4,'2+1',OLY_B1,'snatch'),
          mkEx('B1','Hang Clean + Push Press',4,'1+3',OLY_B1,'clean'),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','DB Bench Press',3,'8'),
          mkEx('D2','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,'clean'),
          mkEx('C1','Front Squat',4,'3',FS_B2,'front_squat'),
          mkEx('D1','Ipsilateral Split Squat',3,'6ea'),
          mkEx('D2','Chin Up',3,'8'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+2',OLY_B2,'clean'),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','Bench Press',3,'5',STR_B2,'bench_press'),
          mkEx('D2','Hollow Rocks',3,'10'),
        ]}
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,'clean'),
          mkEx('C1','Front Squat',4,'3',FS_B3,'front_squat'),
          mkEx('D1','RFE Split Squat',3,'5ea'),
          mkEx('D2','Chin Up',3,'AMAP'),
        ]},
        dayB: { header: 'B Day', exercises: [
          WU_A,
          mkEx('A1','Low Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Hang Clean + Push Jerk',4,'1+1',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
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
          mkEx('A1','Hang Clean + Push Press',4,'1+5',OLY_B1,'clean'),
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
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,'clean'),
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
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
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
          mkEx('A1','Hang Clean + Push Press',4,'1+5',OLY_B1,'clean'),
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
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B2,'clean'),
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
        pctLabel: '75-85%', w1note: '75% only',
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
          mkEx('A1','PP Clean + Push Press',4,'1+3',OLY_B3,'clean'),
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
        pctLabel: '65-75%', w1note: '65% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'3',OLY_B1,'snatch'),
          mkEx('B1','Clean + Jerk',4,'2+2',OLY_B1,'clean'),
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
          mkEx('B1','Hang Clean + Jerk',5,'2+2',CJ_HEAVY_B1,'clean'),
          mkEx('C1','Clean Pull',3,'5',PULL_B1,'clean'),
          mkEx('D1','SA KOB Row',3,'8ea'),
          mkEx('D2','Dead Bug',3,'8'),
        ]}
      },
      2: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B2,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+2',OLY_B2,'clean'),
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
          mkEx('B1','Hang Clean + Jerk',5,'1+2',CJ_HEAVY_B2,'clean'),
          mkEx('C1','PAK Clean Pull',4,'2',PULL_B2,'clean'),
          mkEx('D1','Chest Supported Row',3,'10'),
          mkEx('D2','Paloff Press',3,'10ea'),
        ]}
      },
      3: {
        pctLabel: '75-85%', w1note: '75% only',
        dayA: { header: 'A Day — Snatch + C&J + Squat', exercises: [
          WU_A,
          mkEx('A1','Hang Snatch',4,'2',OLY_B3,'snatch'),
          mkEx('B1','Clean + Jerk',4,'1+1',OLY_B3,'clean'),
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
          mkEx('B1','Hang Clean + Jerk',5,'1+1',CJ_HEAVY_B3,'clean'),
          mkEx('C1','PAK Clean Pull + Clean Pull',4,'1+1',PULL_B3,'clean'),
          mkEx('D1','Flywheel Row',3,'8ea'),
          mkEx('D2','Dragon Flag',3,'8'),
        ]}
      }
    }
  },

  hs_tech_speed: {
    label: 'HS Technique + Speed', days: ['dayA'], blocks: {
      1: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
          mkEx('B1','PP Clean + Push Press',4,'1+5',OLY_B1,'clean'),
          mkEx('C1','Hang Clean',4,'3',OLY_B1,'clean'),
          mkEx('D1','PAK Clean Pull + Clean Pull',3,'3',PULL_B1,'clean'),
          mkEx('E1','Nordic Hamstring Curl',3,'8'),
        ]}
      },
      2: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
          mkEx('B1','PP Clean + Push Press',4,'1+3',OLY_B2,'clean'),
          mkEx('C1','Hang Clean',4,'2',OLY_B2,'clean'),
          mkEx('D1','PAK Clean Pull + Clean Pull',3,'2',PULL_B2,'clean'),
          mkEx('E1','Glute Ham Raise',3,'8'),
        ]}
      },
      3: {
        dayA: { header: 'A Day', exercises: [
          mkEx('A1','Acceleration / Change of Direction',"10'",'1'),
          mkEx('B1','PP Clean + Push Press',4,'1+3',OLY_B3,'clean'),
          mkEx('C1','Hang Clean',4,'2',OLY_B3,'clean'),
          mkEx('D1','PAK Clean Pull + Clean Pull',3,'2',PULL_B3,'clean'),
          mkEx('E1','Razor Curl',3,'8'),
        ]}
      }
    }
  },
}


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
  const [cellNotes, setCellNotes] = useState({ ...DEFAULT_CELL_NOTES })
  const [saving, setSaving] = useState(false)
  const athRef = useRef(null)
  const saveTimers = useRef({})

  useEffect(() => {
    async function load() {
      const { data: ath, error } = await sb.from('athletes').select('id,first_name,last_name').in('status', ['active', 'Active']).order('first_name')
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
      const { data: savedEdits } = await sb.from('program_edits').select('*')
      if (savedEdits && savedEdits.length > 0) {
        const editMap = {}
        savedEdits.forEach(r => {
          const k = `${r.template}-${r.block}-${r.day}-${r.ex_index}`
          if (!editMap[k]) editMap[k] = {}
          editMap[k][r.field] = r.value
        })
        setEdits(editMap)
      }
      const { data: savedNotes } = await sb.from('program_cell_notes').select('*')
      if (savedNotes && savedNotes.length > 0) {
        const noteMap = { ...DEFAULT_CELL_NOTES }
        savedNotes.forEach(r => {
          const k = `${r.template}-${r.block}-${r.day}-${r.ex_index}-${r.week}`
          noteMap[k] = r.value
        })
        setCellNotes(noteMap)
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

  const getPR = (aId, tid) => prs[aId + '-' + tid] || null

  const getOverheadPR = (aId) => {
    const vals = ['press', 'push_press', 'jerk', 'overhead'].map(t => getPR(aId, t)).filter(Boolean)
    return vals.length ? Math.max(...vals) : null
  }

  // For press/push_press/jerk: fall back to legacy 'overhead' if no dedicated entry
  const getOverheadVariantPR = (aId, primaryKey) => {
    const direct = getPR(aId, primaryKey)
    if (direct) return direct
    return getPR(aId, 'overhead')
  }

  const PKS = [
    ['snatch','Snatch'],['clean','Clean'],['deadlift','Deadlift'],
    ['front_squat','Fr. Squat'],['back_squat','Bk. Squat'],
    ['bench_press','Bench'],['press','Press'],['push_press','Push Press'],['_overhead','Overhead']
  ]

  const tD = TEMPLATES[tier]
  const bD = tD.blocks[block]
  const isOly = !['gpp_2day','gpp_3day','upper_lower'].includes(tier)
  const ath = athletes.find(a => a.id === athleteId)
  const filteredAth = athletes.filter(a => (a.first_name + ' ' + a.last_name).toLowerCase().includes(search.toLowerCase()))
  const days = tD.days

  const getExs = (day) => bD[day].exercises.map((ex, i) => {
    const k = `${tier}-${block}-${day}-${i}`
    return edits[k] ? { ...ex, ...edits[k] } : ex
  })

  const setEdit = (day, i, field, value) => {
    const k = `${tier}-${block}-${day}-${i}`
    setEdits(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [field]: value } }))
    const timerKey = `${k}-${field}`
    if (saveTimers.current[timerKey]) clearTimeout(saveTimers.current[timerKey])
    saveTimers.current[timerKey] = setTimeout(async () => {
      setSaving(true)
      await sb.from('program_edits').upsert({
        template: tier, block, day, ex_index: i, field, value, updated_at: new Date().toISOString()
      }, { onConflict: 'template,block,day,ex_index,field' })
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
      await sb.from('program_cell_notes').upsert({
        template: tmpl, block: blk, day, ex_index: exIdx, week: wk, value: val, updated_at: new Date().toISOString()
      }, { onConflict: 'template,block,day,ex_index,week' })
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
      <div className="no-print" style={{ background: '#fff', borderBottom: '2px solid #111', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={lbl}>Template</div>
          <select value={tier} onChange={e => { setTier(e.target.value); setBlock(1) }}
            style={{ border: '1px solid #bbb', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit' }}>
            {Object.entries(TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <div style={lbl}>Block</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3].map(b => (
              <button key={b} onClick={() => setBlock(b)}
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
        {saving && <div style={{ fontSize: 10, color: '#aaa', alignSelf: 'center' }}>Saving...</div>}
        <button onClick={() => window.print()}
          style={{ padding: '6px 18px', background: '#111', border: 'none', color: '#fff', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', marginLeft: 'auto', fontFamily: 'inherit' }}>
          Print / PDF
        </button>
      </div>

      <div id="sheet" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
        <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} />
        <PRBar PKS={PKS} ath={ath} getPR={getPR} getOverheadPR={getOverheadPR} getOverheadVariantPR={getOverheadVariantPR} />
        {page1Days.map(dk => (
          <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
            setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block} />
        ))}
      </div>

      {page2Days.length > 0 && (
        <div id="sheet2" style={{ maxWidth: 800, margin: '10px auto', background: '#fff', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
          <SheetHeader tD={tD} block={block} bD={bD} ath={ath} isOly={isOly} compact />
          {page2Days.map(dk => (
            <DayTable key={dk} dk={dk} day={bD[dk]} exs={getExs(dk)} isOly={isOly} ath={ath} getPR={getPR}
              setEdit={setEdit} cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block} />
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
  )
}

const lbl = { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#555', marginBottom: 3 }

function SheetHeader({ tD, block, bD, ath, isOly, compact }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? 4 : 8, paddingBottom: compact ? 4 : 8, borderBottom: '2px solid #111' }}>
      <div>
        <div style={{ fontSize: compact ? 14 : 18, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase' }}>{tD.label} — Block {block}</div>
        <div style={{ fontSize: 13, color: ath ? '#111' : '#aaa', marginTop: 2, fontWeight: 600 }}>
          {ath ? ath.first_name + ' ' + ath.last_name : 'Select an athlete above'}
        </div>
        {isOly && bD.pctLabel && (
          <div style={{ fontSize: 9, color: '#777', marginTop: 2, letterSpacing: 1 }}>
            Range: {bD.pctLabel}{bD.w1note ? ' | Wk 1: ' + bD.w1note : ''}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', fontSize: 9, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.6 }}>
        <div style={{ fontSize: 22, letterSpacing: 4, fontWeight: 900 }}>WS</div>
        WILMINGTON<br />STRENGTH
      </div>
    </div>
  )
}

function PRBar({ PKS, ath, getPR, getOverheadPR, getOverheadVariantPR }) {
  return (
    <div style={{ display: 'flex', border: '1.5px solid #999', marginBottom: 10, overflow: 'hidden' }}>
      {PKS.map(([k, lb], idx) => {
        const v = ath
          ? (k === '_overhead' ? getOverheadPR(ath.id)
            : (k === 'press' || k === 'push_press' || k === 'jerk') ? getOverheadVariantPR(ath.id, k)
            : getPR(ath.id, k))
          : null
        return (
          <div key={k} style={{ flex: 1, textAlign: 'center', padding: '3px 2px', borderRight: idx < PKS.length - 1 ? '1px solid #bbb' : 'none' }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#777' }}>{lb}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: v ? '#111' : '#ccc' }}>{v ? Math.round(v) : '—'}</div>
          </div>
        )
      })}
    </div>
  )
}

function DayTable({ dk, day, exs, isOly, ath, getPR, setEdit, cellNotes, setCellNote, tier, block }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', borderLeft: '4px solid #111', padding: '3px 8px', background: '#efefef', borderBottom: '1px solid #bbb' }}>
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
              <th key={i} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1.5px solid #111', borderRight: i < 5 ? '1px solid #777' : 'none', padding: '3px 4px', textAlign: i <= 1 ? 'left' : 'center', color: '#444', background: '#fff' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exs.map((ex, i) => (
            <ExRow key={i} ex={ex} i={i} dk={dk} isOly={isOly} ath={ath} getPR={getPR} setEdit={setEdit}
              isLast={i === exs.length - 1} isWU={ex.series === 'WU'}
              cellNotes={cellNotes} setCellNote={setCellNote} tier={tier} block={block} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExRow({ ex, i, dk, isOly, ath, getPR, setEdit, isLast, isWU, cellNotes, setCellNote, tier, block }) {
  const pr = ath && ex.prKey ? getPR(ath.id, ex.prKey) : null
  const cellBorder = '1px solid #777'
  const tdBase = {
    borderBottom: isLast ? '2px solid #111' : '1px solid #999',
    borderRight: cellBorder,
    padding: 0,
    verticalAlign: 'top',
    background: isWU ? '#fafafa' : 'transparent',
  }

  const getHint = (wk) => {
    if (!ex.pct) return ''
    if (wk === 1) return pr ? r5(pr * ex.pct[0]) + ' lbs' : Math.round(ex.pct[0] * 100) + '%'
    if (wk === 2 || wk === 3) {
      if (pr) {
        const lo = r5(pr * ex.pct[1]), hi = r5(pr * ex.pct[2])
        return lo === hi ? lo + ' lbs' : lo + '–' + hi
      }
      const lo = Math.round(ex.pct[1] * 100), hi = Math.round(ex.pct[2] * 100)
      return lo === hi ? lo + '%' : lo + '–' + hi + '%'
    }
    return ''
  }

  const wkCell = (wk) => {
    if (isWU) return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? cellBorder : 'none' }}>
        <div style={{ height: 46 }}></div>
      </td>
    )
    const noteKey = `${tier}-${block}-${dk}-${i}-${wk}`
    const noteVal = cellNotes[noteKey] !== undefined ? cellNotes[noteKey] : ''
    const hint = getHint(wk)

    return (
      <td key={wk} style={{ ...tdBase, borderRight: wk < 4 ? cellBorder : 'none', position: 'relative' }}>
        <input
          value={noteVal}
          onChange={e => setCellNote(noteKey, e.target.value)}
          placeholder={hint}
          style={{
            position: 'absolute', top: 2, left: 3,
            fontSize: 8, color: noteVal ? '#111' : '#0055bb',
            fontWeight: noteVal ? 700 : 600,
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'Arial, sans-serif', padding: 0,
            width: 'calc(100% - 6px)',
          }}
        />
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
        <ExerciseInput value={ex.exercise} onChange={v => setEdit(dk, i, 'exercise', v)} />
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 2 }}>
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
