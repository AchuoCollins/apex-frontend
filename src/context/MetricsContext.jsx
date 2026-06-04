import { createContext, useState, useEffect } from 'react';

export const MetricsContext = createContext(null);

/* ── Option constants (shared across the app) ── */
export const GENDERS = [
  { value: 'male',         label: 'Male',         icon: '♂' },
  { value: 'female',       label: 'Female',       icon: '♀' },
  { value: 'non-binary',   label: 'Non-binary',   icon: '⚧' },
  { value: 'prefer-not',   label: 'Prefer not to say', icon: '•' },
];

export const FITNESS_GOALS = [
  { value: 'build-muscle',        icon: '💪', label: 'Build Muscle',          desc: 'Hypertrophy-focused programming' },
  { value: 'get-stronger',        icon: '🏋️', label: 'Get Stronger',          desc: 'Maximal strength development' },
  { value: 'lose-weight',         icon: '🔥', label: 'Lose Weight',           desc: 'Calorie deficit & conditioning' },
  { value: 'body-recomposition',  icon: '🔁', label: 'Body Recomposition',    desc: 'Build muscle while losing fat' },
  { value: 'athletic-performance',icon: '⚡', label: 'Athletic Performance',  desc: 'Power, speed & explosiveness' },
  { value: 'general-fitness',     icon: '🌿', label: 'General Fitness',       desc: 'Balanced, well-rounded health' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Less than 1 year of consistent training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years of consistent training' },
  { value: 'advanced',     label: 'Advanced',     desc: '3+ years of consistent training' },
];

export const FOCUS_AREAS = [
  'Chest', 'Shoulders', 'Back', 'Biceps', 'Triceps', 'Forearms',
  'Abs', 'Legs', 'Glutes', 'Calves', 'Full Body',
];

export const TRAINING_REASONS = [
  { value: 'general-fitness',    icon: '🌿', label: 'General Fitness' },
  { value: 'build-muscle',       icon: '💪', label: 'Build Muscle' },
  { value: 'get-stronger',       icon: '🏋️', label: 'Get Stronger' },
  { value: 'weight-loss',        icon: '🔥', label: 'Weight Loss' },
  { value: 'sports-performance', icon: '🏆', label: 'Sports Performance' },
  { value: 'upcoming-event',     icon: '📅', label: 'Upcoming Event' },
  { value: 'recovery',           icon: '🧘', label: 'Recovery' },
  { value: 'other',              icon: '✨', label: 'Other' },
];

const DEFAULTS = {
  /* Required */
  gender:          '',
  age:             '',
  height:          '',
  weight:          '',
  goal:            '',
  experienceLevel: '',

  /* Focus + reason */
  focusAreas:      [],
  trainingReason:  '',
  eventName:       '',
  eventType:       '',
  eventDate:       '',

  /* Advanced Physique Assessment (optional) */
  chest:    '',
  waist:    '',
  shoulder: '',
  upperArm: '',
  forearm:  '',
  neck:     '',
  thigh:    '',
  calf:     '',
  bodyFat:  '',

  /* Legacy supporting fields kept for ratio analysis compatibility */
  hip: '',
};

/* Required-field check (used elsewhere to gate analysis / training plan) */
const REQUIRED_KEYS = ['gender', 'age', 'height', 'weight', 'goal', 'experienceLevel'];

export function MetricsProvider({ children }) {
  const [metrics, setMetrics] = useState(DEFAULTS);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pa_metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        setMetrics({ ...DEFAULTS, ...(parsed.metrics ?? {}) });
        setSavedAt(parsed.savedAt ?? null);
      }
    } catch (_) {}
  }, []);

  const saveMetrics = (data) => {
    const merged = { ...DEFAULTS, ...metrics, ...data };
    const ts = new Date().toISOString();
    setMetrics(merged);
    setSavedAt(ts);
    localStorage.setItem('pa_metrics', JSON.stringify({ metrics: merged, savedAt: ts }));
  };

  const clearMetrics = () => {
    setMetrics(DEFAULTS);
    setSavedAt(null);
    localStorage.removeItem('pa_metrics');
  };

  /* Has the user completed the basic required fields? */
  const hasRequired = REQUIRED_KEYS.every(k => {
    const v = metrics[k];
    return v !== '' && v !== null && v !== undefined;
  });

  /* Backwards-compatible flag — true when any meaningful data exists */
  const hasMetrics = hasRequired || Object.values(metrics).some(v =>
    Array.isArray(v) ? v.length > 0 : (v !== '' && v !== null && v !== undefined)
  );

  /* Does the user have at least the advanced circumference measurements? */
  const hasAdvanced = ['chest', 'waist', 'shoulder'].every(k => metrics[k] !== '' && metrics[k] != null);

  return (
    <MetricsContext.Provider value={{
      metrics, savedAt,
      hasMetrics, hasRequired, hasAdvanced,
      saveMetrics, clearMetrics,
    }}>
      {children}
    </MetricsContext.Provider>
  );
}
