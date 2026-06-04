import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import {
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_REASONS,
  GENDERS,
} from '../context/MetricsContext';
import { analyzePhysique } from '../utils/physiqueRatios';
import styles from './TrainingPlan.module.css';

/* ── Training plan generator ── */
function generatePlan({ lagging = [], focusAreas = [], experienceLevel = 'intermediate' }) {
  const lagMuscles = lagging.map(r => r.musclePrimary);

  /* Volume multiplier based on experience level */
  const VOL_MULTIPLIER = {
    beginner:     0.7,
    intermediate: 1.0,
    advanced:     1.25,
  }[experienceLevel] ?? 1.0;

  const adjustSets = (sets) => Math.max(2, Math.round(parseInt(sets) * VOL_MULTIPLIER));

  /* Map UI focus-area names → internal muscle keys */
  const FOCUS_MAP = {
    Chest:     ['Chest'],
    Shoulders: ['Shoulders'],
    Back:      ['Back'],
    Biceps:    ['Arms'],
    Triceps:   ['Arms'],
    Forearms:  ['Arms'],
    Abs:       ['Core'],
    Legs:      ['Quads', 'Hamstrings'],
    Glutes:    ['Glutes'],
    Calves:    ['Calves'],
    'Full Body': ['Chest','Back','Shoulders','Arms','Quads','Hamstrings','Glutes','Calves','Core'],
  };
  const priorityMuscles = new Set([
    ...lagMuscles,
    ...focusAreas.flatMap(a => FOCUS_MAP[a] ?? []),
  ]);

  const EXERCISE_DB = {
    Shoulders: [
      { name: 'Overhead Press', sets: '4', reps: '6–8',   rest: '3 min', type: 'Compound', notes: 'Key mass builder — prioritise progressive overload' },
      { name: 'Lateral Raise',  sets: '4', reps: '12–15', rest: '90 s',  type: 'Isolation', notes: 'Control the negative; avoid swinging' },
      { name: 'Face Pull',      sets: '3', reps: '15–20', rest: '60 s',  type: 'Isolation', notes: 'Essential for rear delt and rotator cuff health' },
    ],
    Chest: [
      { name: 'Incline Barbell Press', sets: '4', reps: '6–8',   rest: '3 min', type: 'Compound', notes: 'Upper chest priority — set bench at 30–45°' },
      { name: 'Flat Dumbbell Press',   sets: '3', reps: '8–12',  rest: '2 min', type: 'Compound', notes: 'Full stretch at bottom for maximum activation' },
      { name: 'Cable Crossover',       sets: '3', reps: '12–15', rest: '90 s',  type: 'Isolation', notes: 'High-to-low cable for lower chest sweep' },
    ],
    Back: [
      { name: 'Weighted Pull-Up',     sets: '4', reps: '5–8',   rest: '3 min', type: 'Compound', notes: 'Width builder — keep elbows flared' },
      { name: 'Barbell Row',          sets: '4', reps: '6–10',  rest: '2 min', type: 'Compound', notes: 'Lean at 45°; drive elbows back and up' },
      { name: 'Straight-Arm Pulldown', sets: '3', reps: '12–15', rest: '90 s', type: 'Isolation', notes: 'Constant tension on lats throughout movement' },
    ],
    Arms: [
      { name: 'Barbell Curl',        sets: '4', reps: '8–10',  rest: '2 min', type: 'Compound', notes: 'Full supination at top; controlled negative' },
      { name: 'Incline Dumbbell Curl', sets: '3', reps: '10–12', rest: '90 s', type: 'Isolation', notes: 'Long head stretch position — great for peak' },
      { name: 'Close-Grip Bench',    sets: '4', reps: '6–10',  rest: '2 min', type: 'Compound', notes: 'Primary tricep mass builder' },
      { name: 'Overhead Tricep Ext', sets: '3', reps: '10–15', rest: '90 s',  type: 'Isolation', notes: 'Long head stretch — critical for arm thickness' },
    ],
    Quads: [
      { name: 'Barbell Back Squat', sets: '4', reps: '6–8',   rest: '3 min', type: 'Compound', notes: 'Full depth; drive knees out over toes' },
      { name: 'Leg Press',          sets: '3', reps: '10–12', rest: '2 min', type: 'Compound', notes: 'High and wide foot placement for glute emphasis' },
      { name: 'Leg Extension',      sets: '3', reps: '12–15', rest: '90 s',  type: 'Isolation', notes: 'Pause at full extension; slow negative' },
    ],
    Hamstrings: [
      { name: 'Romanian Deadlift', sets: '4', reps: '8–10',  rest: '2 min', type: 'Compound', notes: 'Push hips back; feel stretch in hamstrings' },
      { name: 'Leg Curl',          sets: '3', reps: '10–15', rest: '90 s',  type: 'Isolation', notes: 'Full range of motion; slow negative' },
    ],
    Glutes: [
      { name: 'Hip Thrust',        sets: '4', reps: '10–12', rest: '2 min', type: 'Compound', notes: 'Full hip extension at top; squeeze hard' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '10–12', rest: '2 min', type: 'Compound', notes: 'Rear foot elevated; torso upright for quad focus' },
    ],
    Calves: [
      { name: 'Standing Calf Raise', sets: '4', reps: '10–12', rest: '90 s', type: 'Compound', notes: 'Full stretch at bottom — do NOT skip this' },
      { name: 'Seated Calf Raise',   sets: '3', reps: '15–20', rest: '60 s', type: 'Isolation', notes: 'Targets soleus; use slower tempo' },
    ],
    Core: [
      { name: 'Ab Wheel Rollout', sets: '3', reps: '8–12',  rest: '90 s', type: 'Compound', notes: 'Keep lower back from hyperextending' },
      { name: 'Cable Crunch',     sets: '3', reps: '12–15', rest: '60 s', type: 'Isolation', notes: 'Round upper back; crunch against the cable' },
    ],
  };

  const SPLIT = [
    { day: 'Monday',    label: 'Push A',  focus: ['Chest', 'Shoulders', 'Arms'],      tag: 'push' },
    { day: 'Tuesday',   label: 'Pull A',  focus: ['Back', 'Arms'],                    tag: 'pull' },
    { day: 'Wednesday', label: 'Legs A',  focus: ['Quads', 'Hamstrings', 'Calves'],   tag: 'legs' },
    { day: 'Thursday',  label: 'Rest',    focus: [],                                  tag: 'rest' },
    { day: 'Friday',    label: 'Push B',  focus: ['Shoulders', 'Chest'],              tag: 'push' },
    { day: 'Saturday',  label: 'Pull B',  focus: ['Back', 'Arms'],                    tag: 'pull' },
    { day: 'Sunday',    label: 'Legs B',  focus: ['Glutes', 'Quads', 'Calves', 'Core'], tag: 'legs' },
  ];

  return SPLIT.map(day => {
    if (day.tag === 'rest') return { ...day, exercises: [] };

    const exercises = [];
    day.focus.forEach(muscle => {
      const db = EXERCISE_DB[muscle] ?? [];
      const isPriority = priorityMuscles.has(muscle);
      const toAdd = isPriority ? db : db.slice(0, 2);
      toAdd.forEach(ex => {
        if (!exercises.find(e => e.name === ex.name)) {
          exercises.push({
            ...ex,
            sets: String(adjustSets(ex.sets)),
            muscle,
            priority: isPriority,
          });
        }
      });
    });
    return { ...day, exercises };
  });
}

const TAG_COLORS = { push: 'var(--color-accent)', pull: 'var(--color-success)', legs: 'var(--color-warning)', rest: 'var(--color-text-muted)' };

export default function TrainingPlan() {
  const { metrics, hasRequired, hasAdvanced } = useMetrics();
  const [activeDay, setActiveDay] = useState(0);

  if (!hasRequired) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}><DumbellIcon /></div>
        <h2 className={styles.emptyTitle}>Complete your profile first</h2>
        <p className={styles.emptySub}>
          We need a few basics — gender, age, height, weight, goal and experience level — to generate
          a training plan tailored to you.
        </p>
        <Link to="/metrics" className={styles.emptyBtn}>Complete Profile <ArrowIcon /></Link>
      </div>
    );
  }

  const { lagging, score } = hasAdvanced ? analyzePhysique(metrics) : { lagging: [], score: null };
  const plan = useMemo(
    () => generatePlan({
      lagging,
      focusAreas:      metrics.focusAreas ?? [],
      experienceLevel: metrics.experienceLevel,
    }),
    [metrics, lagging]
  );
  const lagMuscles     = lagging.map(r => r.musclePrimary);
  const totalExercises = plan.reduce((a, d) => a + d.exercises.length, 0);
  const totalSets      = plan.reduce((a, d) => a + d.exercises.reduce((b, e) => b + parseInt(e.sets), 0), 0);
  const activeDay_data = plan[activeDay];

  const goalMeta       = FITNESS_GOALS.find(g => g.value === metrics.goal);
  const experienceMeta = EXPERIENCE_LEVELS.find(l => l.value === metrics.experienceLevel);
  const reasonMeta     = TRAINING_REASONS.find(r => r.value === metrics.trainingReason);
  const genderMeta     = GENDERS.find(g => g.value === metrics.gender);
  const focusAreas     = metrics.focusAreas ?? [];

  const eventCountdown = metrics.trainingReason === 'upcoming-event' && metrics.eventDate
    ? Math.max(0, daysUntil(metrics.eventDate))
    : null;

  const handleDownload = () => {
    const blob = new Blob([buildPlanHtml({ plan, metrics, goalMeta, experienceMeta, focusAreas, reasonMeta, eventCountdown })], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `APEX-Training-Plan-${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Training Plan</h2>
          <p className={styles.pageSub}>
            AI-generated periodized hypertrophy program tailored to your profile.
            {lagMuscles.length > 0 && <> Lagging priority: <strong>{lagMuscles.join(', ')}</strong>.</>}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/analysis" className={styles.btnSecondary}><ScanIcon /> View Analysis</Link>
          <button className={styles.btnSecondary} onClick={handleDownload}><DownloadIcon /> Download PDF</button>
          <button className={styles.btnAccent} onClick={() => window.print()}><PrintIcon /> Print Plan</button>
        </div>
      </div>

      {/* ── Profile snapshot strip ── */}
      <div className={styles.profileStrip}>
        <ProfileChip label="Goal" value={goalMeta ? `${goalMeta.icon} ${goalMeta.label}` : '—'} />
        <ProfileChip label="Gender" value={genderMeta?.label ?? '—'} />
        <ProfileChip label="Experience" value={experienceMeta?.label ?? '—'} />
        <ProfileChip label="Focus Areas" value={focusAreas.length > 0 ? `${focusAreas.length} selected` : 'None'} />
        {reasonMeta && <ProfileChip label="Training Reason" value={`${reasonMeta.icon} ${reasonMeta.label}`} />}
        {eventCountdown != null && (
          <ProfileChip
            label="Event Countdown"
            value={`${eventCountdown} days`}
            accent
            sub={metrics.eventName || metrics.eventType}
          />
        )}
      </div>

      {/* Focus area tag row */}
      {focusAreas.length > 0 && (
        <div className={styles.focusTagRow}>
          <span className={styles.focusTagLabel}>Focus on:</span>
          {focusAreas.map(a => <span key={a} className={styles.focusTag}>{a}</span>)}
        </div>
      )}

      {/* ── Plan overview strip ── */}
      <div className={styles.overviewStrip}>
        <StatPill label="Training Days" value="6 / week" icon="📅" />
        <StatPill label="Split" value="Push / Pull / Legs" icon="🔁" />
        <StatPill label="Total Exercises" value={totalExercises} icon="💪" />
        <StatPill label="Total Sets / Week" value={totalSets} icon="📊" />
        <StatPill label="Priority Groups" value={lagMuscles.length || 'None'} icon="⚡" accent={lagMuscles.length > 0} />
        <StatPill label="Physique Score" value={score != null ? `${score} / 100` : '—'} icon="🎯" />
      </div>

      {/* ── Priority callout ── */}
      {lagMuscles.length > 0 && (
        <div className={styles.priorityCallout}>
          <span className={styles.calloutIcon}>⚡</span>
          <div>
            <p className={styles.calloutTitle}>Lagging group prioritisation active</p>
            <p className={styles.calloutSub}>
              Extra volume has been added for <strong>{lagMuscles.join(' and ')}</strong>. These groups appear in multiple training days with increased exercise selection to accelerate ratio correction.
            </p>
          </div>
        </div>
      )}

      {/* ── Day selector ── */}
      <div className={styles.daySelector}>
        {plan.map((d, i) => (
          <button
            key={d.day}
            className={[styles.dayBtn, activeDay === i ? styles.dayBtnActive : '', d.tag === 'rest' ? styles.dayBtnRest : ''].join(' ')}
            onClick={() => setActiveDay(i)}
            style={activeDay === i && d.tag !== 'rest' ? { '--tag-color': TAG_COLORS[d.tag] } : {}}
          >
            <span className={styles.dayName}>{d.day.slice(0, 3)}</span>
            <span className={styles.dayLabel}
              style={{ color: activeDay === i ? TAG_COLORS[d.tag] : 'var(--color-text-muted)' }}>
              {d.label}
            </span>
            {d.tag !== 'rest' && (
              <span className={styles.dayCount}>{d.exercises.length} ex</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Day detail ── */}
      <div className={styles.dayDetail}>
        <div className={styles.dayDetailHeader}>
          <div>
            <h3 className={styles.dayDetailTitle}>
              {activeDay_data.day} — {activeDay_data.label}
            </h3>
            {activeDay_data.tag !== 'rest' && (
              <p className={styles.dayDetailSub}>
                Focus: {activeDay_data.focus.join(', ')} · {activeDay_data.exercises.length} exercises
              </p>
            )}
          </div>
          <span className={styles.tagChip} style={{ background: TAG_COLORS[activeDay_data.tag] + '22', color: TAG_COLORS[activeDay_data.tag], border: `1px solid ${TAG_COLORS[activeDay_data.tag]}44` }}>
            {activeDay_data.label}
          </span>
        </div>

        {activeDay_data.tag === 'rest' ? (
          <div className={styles.restDay}>
            <span className={styles.restIcon}>😴</span>
            <h4 className={styles.restTitle}>Rest & Recovery Day</h4>
            <p className={styles.restSub}>Active recovery recommended — light walking, stretching, or mobility work. Avoid any resistance training to allow muscle protein synthesis to peak.</p>
            <div className={styles.restTips}>
              {['Prioritise 8+ hours of sleep', 'High protein intake (2g/kg bodyweight)', 'Light stretching or yoga', 'Stay well hydrated'].map(t => (
                <div key={t} className={styles.restTip}><span className={styles.restTipDot} />{t}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.exerciseList}>
            {activeDay_data.exercises.map((ex, idx) => (
              <ExerciseCard key={ex.name} ex={ex} idx={idx} isLagging={ex.priority} />
            ))}
          </div>
        )}
      </div>

      {/* ── Weekly volume overview ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Weekly Volume Overview</h3>
        <div className={styles.volumeGrid}>
          {Object.entries(
            plan.flatMap(d => d.exercises).reduce((acc, ex) => {
              acc[ex.muscle] = (acc[ex.muscle] || 0) + parseInt(ex.sets);
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1]).map(([muscle, sets]) => {
            const isLag = lagMuscles.includes(muscle);
            const maxSets = 20;
            return (
              <div key={muscle} className={[styles.volumeRow, isLag ? styles.volumeRowLag : ''].join(' ')}>
                <div className={styles.volumeLabel}>
                  <span className={styles.volumeMuscle}>{muscle}</span>
                  {isLag && <span className={styles.lagTag}>priority</span>}
                </div>
                <div className={styles.volumeBar}>
                  <div
                    className={styles.volumeFill}
                    style={{ width: (sets / maxSets * 100) + '%', background: isLag ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
                  />
                </div>
                <span className={styles.volumeSets}>{sets} sets</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Progressive overload note ── */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>📈</span>
        <div>
          <p className={styles.infoTitle}>Progressive Overload Protocol</p>
          <p className={styles.infoBody}>
            Aim to add weight or reps each session. When you reach the top of the rep range across all sets, increase the load by the smallest increment available (typically 2.5–5kg). Track your lifts session-to-session and re-measure your body circumferences every 4–6 weeks to update your analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Profile chip ── */
function ProfileChip({ label, value, sub, accent }) {
  return (
    <div className={[styles.profileChip, accent ? styles.profileChipAccent : ''].join(' ')}>
      <span className={styles.profileChipLabel}>{label}</span>
      <span className={styles.profileChipValue}>{value}</span>
      {sub && <span className={styles.profileChipSub}>{sub}</span>}
    </div>
  );
}

/* ── Exercise card ── */
function ExerciseCard({ ex, idx, isLagging }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={[styles.exCard, isLagging ? styles.exCardPriority : ''].join(' ')}>
      <div className={styles.exCardMain} onClick={() => setOpen(o => !o)}>
        <span className={styles.exIdx}>{String(idx + 1).padStart(2, '0')}</span>
        <div className={styles.exInfo}>
          <div className={styles.exTop}>
            <span className={styles.exName}>{ex.name}</span>
            {isLagging && <span className={styles.priorityTag}>⚡ priority</span>}
            <span className={[styles.exType, ex.type === 'Compound' ? styles.typeCompound : styles.typeIsolation].join(' ')}>
              {ex.type}
            </span>
          </div>
          <span className={styles.exMuscle}>{ex.muscle}</span>
        </div>
        <div className={styles.exStats}>
          <div className={styles.exStat}><span className={styles.exStatVal}>{ex.sets}</span><span className={styles.exStatLabel}>Sets</span></div>
          <div className={styles.exStatDiv} />
          <div className={styles.exStat}><span className={styles.exStatVal}>{ex.reps}</span><span className={styles.exStatLabel}>Reps</span></div>
          <div className={styles.exStatDiv} />
          <div className={styles.exStat}><span className={styles.exStatVal}>{ex.rest}</span><span className={styles.exStatLabel}>Rest</span></div>
        </div>
        <button className={[styles.exToggle, open ? styles.exToggleOpen : ''].join(' ')}>
          <ChevronIcon />
        </button>
      </div>
      {open && (
        <div className={styles.exNotes}>
          <span className={styles.exNotesLabel}>Coaching Cue</span>
          <p className={styles.exNotesText}>{ex.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({ label, value, icon, accent }) {
  return (
    <div className={[styles.statPill, accent ? styles.statPillAccent : ''].join(' ')}>
      <span className={styles.statPillIcon}>{icon}</span>
      <div>
        <div className={styles.statPillVal}>{value}</div>
        <div className={styles.statPillLabel}>{label}</div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function daysUntil(dateStr) {
  const today  = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr); target.setHours(0,0,0,0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/* Build a printable / downloadable HTML plan (opens in browser, then user "Save as PDF") */
function buildPlanHtml({ plan, metrics, goalMeta, experienceMeta, focusAreas, reasonMeta, eventCountdown }) {
  const today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  const safe = (v) => v == null ? '' : String(v).replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c]));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>APEX Training Plan — ${safe(today)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #fff; padding: 32px; max-width: 880px; margin: auto; }
  h1   { font-size: 28px; margin: 0 0 6px; letter-spacing: 0.04em; text-transform: uppercase; }
  h2   { font-size: 18px; margin: 24px 0 8px; border-bottom: 2px solid #00C48C; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
  h3   { font-size: 15px; margin: 16px 0 6px; color: #444; text-transform: uppercase; letter-spacing: 0.04em; }
  .meta { color: #666; font-size: 13px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
  .card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; }
  .card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
  .card-value { font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; }
  th { background: #f5f5f5; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #555; }
  .priority { color: #b58800; font-weight: 700; }
  .tag { display: inline-block; padding: 2px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; margin-right: 4px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <h1>APEX Training Plan</h1>
  <p class="meta">Generated ${safe(today)}</p>

  <h2>Your Profile</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Goal</div><div class="card-value">${safe(goalMeta?.label ?? '—')}</div></div>
    <div class="card"><div class="card-label">Gender</div><div class="card-value">${safe(metrics.gender || '—')}</div></div>
    <div class="card"><div class="card-label">Experience</div><div class="card-value">${safe(experienceMeta?.label ?? '—')}</div></div>
    <div class="card"><div class="card-label">Age / Height / Weight</div><div class="card-value">${safe(metrics.age || '—')} yrs · ${safe(metrics.height || '—')}cm · ${safe(metrics.weight || '—')}kg</div></div>
    <div class="card"><div class="card-label">Training Reason</div><div class="card-value">${safe(reasonMeta?.label ?? '—')}</div></div>
    ${eventCountdown != null
      ? `<div class="card"><div class="card-label">Event</div><div class="card-value">${safe(metrics.eventName || metrics.eventType || 'Upcoming')} · ${eventCountdown} days</div></div>`
      : ''}
  </div>

  <h3>Focus Areas</h3>
  <div>${focusAreas.length ? focusAreas.map(a => `<span class="tag">${safe(a)}</span>`).join('') : '<em>None selected — balanced plan</em>'}</div>

  <h2>Weekly Schedule</h2>
  ${plan.map(day => `
    <h3>${safe(day.day)} — ${safe(day.label)}</h3>
    ${day.tag === 'rest'
      ? '<p><em>Rest & recovery day. Light walking, stretching, and mobility work recommended.</em></p>'
      : `<table>
          <thead><tr><th>#</th><th>Exercise</th><th>Muscle</th><th>Sets</th><th>Reps</th><th>Rest</th><th>Notes</th></tr></thead>
          <tbody>
            ${day.exercises.map((ex, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${safe(ex.name)} ${ex.priority ? '<span class="priority">⚡</span>' : ''}</td>
                <td>${safe(ex.muscle)}</td>
                <td>${safe(ex.sets)}</td>
                <td>${safe(ex.reps)}</td>
                <td>${safe(ex.rest)}</td>
                <td>${safe(ex.notes)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`}
  `).join('')}

  <p class="meta">Tip: open this file in your browser and use <strong>Print → Save as PDF</strong> to convert it to PDF.</p>
</body>
</html>`;
}

/* ── Icons ── */
function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function DumbellIcon() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v14"/><path d="M18 5v14"/><path d="M2 9h4"/><path d="M2 15h4"/><path d="M18 9h4"/><path d="M18 15h4"/><line x1="6" y1="12" x2="18" y2="12"/></svg>;
}
function ScanIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>;
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function PrintIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}
