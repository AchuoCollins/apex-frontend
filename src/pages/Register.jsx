import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMetrics } from '../hooks/useMetrics';
import { authService } from '../services/authService';
import {
  GENDERS,
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  TRAINING_REASONS,
} from '../context/MetricsContext';
import FocusAreaSelector from '../components/shared/FocusAreaSelector';
import styles from './Auth.module.css';

const STEPS = ['Account', 'Profile', 'Goal', 'Focus', 'Reason'];

export default function Register() {
  const { login }       = useAuth();
  const { saveMetrics } = useMetrics();
  const navigate        = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    /* account */
    name: '', email: '', password: '', confirmPassword: '',
    /* profile */
    gender: '', age: '', height: '', weight: '',
    experienceLevel: '',
    /* goal */
    goal: '',
    /* focus areas */
    focusAreas: [],
    /* training reason */
    trainingReason: '',
    eventName: '', eventType: '', eventDate: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set    = (k) => (e) => { setError(''); setForm(p => ({ ...p, [k]: e.target.value })); };
  const setVal = (k, v) => { setError(''); setForm(p => ({ ...p, [k]: v })); };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim())    return 'Please enter your name.';
      if (!form.email.trim())   return 'Please enter your email.';
      if (form.password.length < 6) return 'Password must be at least 6 characters.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (step === 1) {
      if (!form.gender)          return 'Please select your gender.';
      if (!form.age)             return 'Please enter your age.';
      if (!form.height)          return 'Please enter your height.';
      if (!form.weight)          return 'Please enter your weight.';
      if (!form.experienceLevel) return 'Please select your experience level.';
    }
    if (step === 2) {
      if (!form.goal) return 'Please select a fitness goal.';
    }
    if (step === 3) {
      if (form.focusAreas.length === 0) return 'Please select at least one focus area.';
    }
    if (step === 4) {
      if (!form.trainingReason) return 'Please choose why you are training.';
      if (form.trainingReason === 'upcoming-event') {
        if (!form.eventName || !form.eventType || !form.eventDate) {
          return 'Please complete the event details.';
        }
      }
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(/\s+/);
      const lastName = rest.join(' ') || firstName;

      await authService.register({
        first_name: firstName,
        last_name:  lastName,
        email:      form.email,
        password:   form.password,
      });

      const tokens = await authService.login({ email: form.email, password: form.password });
      localStorage.setItem('pa_user', JSON.stringify({ token: tokens.access_token, refreshToken: tokens.refresh_token }));
      const me = await authService.me();

      login({
        id:    me.id,
        name:  [me.first_name, me.last_name].filter(Boolean).join(' ') || form.name,
        email: me.email,
        firstName: me.first_name,
        lastName:  me.last_name,
        refreshToken: tokens.refresh_token,
        /* onboarding profile fields */
        gender: form.gender,
        age:    form.age,
        height: form.height,
        weight: form.weight,
        goal:   form.goal,
        experienceLevel: form.experienceLevel,
        focusAreas:      form.focusAreas,
        trainingReason:  form.trainingReason,
        eventName:       form.eventName,
        eventType:       form.eventType,
        eventDate:       form.eventDate,
      }, tokens.access_token);

      /* Persist core metrics so the rest of the app picks them up */
      saveMetrics({
        gender:          form.gender,
        age:             form.age,
        height:          form.height,
        weight:          form.weight,
        goal:            form.goal,
        experienceLevel: form.experienceLevel,
        focusAreas:      form.focusAreas,
        trainingReason:  form.trainingReason,
        eventName:       form.eventName,
        eventType:       form.eventType,
        eventDate:       form.eventDate,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Join APEX</h2>
        <p className={styles.cardSub}>Set up your personalised training profile in a few quick steps and reach your peak potential.</p>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={styles.stepItem}>
            <div className={[
              styles.stepCircle,
              i < step  ? styles.stepDone   : '',
              i === step ? styles.stepActive : '',
            ].join(' ')}>
              {i < step ? <CheckIcon /> : <span>{i + 1}</span>}
            </div>
            <span className={[styles.stepLabel, i === step ? styles.stepLabelActive : ''].join(' ')}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className={[styles.stepLine, i < step ? styles.stepLineDone : ''].join(' ')} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <div className={styles.form}>
        {error && <div className={styles.errorBanner}><AlertIcon />{error}</div>}

        {/* Step 0 — Account */}
        {step === 0 && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full Name</label>
              <input id="name" type="text" className={styles.input}
                placeholder="John Doe" value={form.name} onChange={set('name')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" className={styles.input}
                placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className={styles.input}
                placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" className={styles.input}
                placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
          </>
        )}

        {/* Step 1 — Profile */}
        {step === 1 && (
          <>
            <p className={styles.stepHint}>
              These core stats personalise your training plan and analysis.
            </p>

            <div className={styles.field}>
              <label className={styles.label}>Gender</label>
              <div className={styles.goalGrid}>
                {GENDERS.map(g => (
                  <button
                    type="button"
                    key={g.value}
                    className={[styles.goalCard, form.gender === g.value ? styles.goalSelected : ''].join(' ')}
                    onClick={() => setVal('gender', g.value)}
                  >
                    <span className={styles.goalIcon}>{g.icon}</span>
                    <span className={styles.goalLabel}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="age">Age</label>
                <div className={styles.inputSuffix}>
                  <input id="age" type="number" className={styles.input}
                    placeholder="25" min="16" max="80" value={form.age} onChange={set('age')} />
                  <span className={styles.suffix}>yrs</span>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="height">Height</label>
                <div className={styles.inputSuffix}>
                  <input id="height" type="number" className={styles.input}
                    placeholder="178" value={form.height} onChange={set('height')} />
                  <span className={styles.suffix}>cm</span>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="weight">Body Weight</label>
              <div className={styles.inputSuffix}>
                <input id="weight" type="number" className={styles.input}
                  placeholder="80" value={form.weight} onChange={set('weight')} />
                <span className={styles.suffix}>kg</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Experience Level</label>
              <div className={styles.goalGrid}>
                {EXPERIENCE_LEVELS.map(l => (
                  <button
                    type="button"
                    key={l.value}
                    className={[styles.goalCard, form.experienceLevel === l.value ? styles.goalSelected : ''].join(' ')}
                    onClick={() => setVal('experienceLevel', l.value)}
                  >
                    <span className={styles.goalLabel}>{l.label}</span>
                    <span className={styles.goalDesc}>{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2 — Fitness Goal */}
        {step === 2 && (
          <>
            <p className={styles.stepHint}>
              Your primary fitness goal shapes the structure and intensity of your program.
            </p>
            <div className={styles.goalGrid}>
              {FITNESS_GOALS.map(g => (
                <button
                  type="button"
                  key={g.value}
                  className={[styles.goalCard, form.goal === g.value ? styles.goalSelected : ''].join(' ')}
                  onClick={() => setVal('goal', g.value)}
                >
                  <span className={styles.goalIcon}>{g.icon}</span>
                  <span className={styles.goalLabel}>{g.label}</span>
                  <span className={styles.goalDesc}>{g.desc}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3 — Focus Areas */}
        {step === 3 && (
          <>
            <p className={styles.stepHint}>
              Select the muscle groups you want to prioritise. You can pick multiple — choose
              <strong> Full Body</strong> for an even, balanced focus.
            </p>
            <FocusAreaSelector
              value={form.focusAreas}
              onChange={(v) => { setError(''); setForm(p => ({ ...p, focusAreas: v })); }}
            />
            <p className={styles.stepMeta}>
              {form.focusAreas.length === 0
                ? 'Pick at least one focus area to continue.'
                : `${form.focusAreas.length} selected · ${form.focusAreas.join(', ')}`}
            </p>
          </>
        )}

        {/* Step 4 — Training Reason */}
        {step === 4 && (
          <>
            <p className={styles.stepHint}>
              Why are you training? Your reason helps tailor recommendations and milestones.
            </p>
            <div className={styles.goalGrid}>
              {TRAINING_REASONS.map(r => (
                <button
                  type="button"
                  key={r.value}
                  className={[styles.goalCard, form.trainingReason === r.value ? styles.goalSelected : ''].join(' ')}
                  onClick={() => setVal('trainingReason', r.value)}
                >
                  <span className={styles.goalIcon}>{r.icon}</span>
                  <span className={styles.goalLabel}>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Conditional Event Details */}
            {form.trainingReason === 'upcoming-event' && (
              <div className={styles.eventBlock}>
                <p className={styles.eventTitle}>📅 Event Details</p>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="eventName">Event Name</label>
                  <input id="eventName" type="text" className={styles.input}
                    placeholder="Summer Beach Trip" value={form.eventName} onChange={set('eventName')} />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="eventType">Event Type</label>
                    <input id="eventType" type="text" className={styles.input}
                      placeholder="Wedding, competition, photoshoot…"
                      value={form.eventType} onChange={set('eventType')} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="eventDate">Event Date</label>
                    <input id="eventDate" type="date" className={styles.input}
                      value={form.eventDate} onChange={set('eventDate')} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className={styles.actionRow}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => { setError(''); setStep(s => s - 1); }}>
              <BackIcon /> Back
            </button>
          )}
          <button className={styles.submitBtn} onClick={next} disabled={loading} style={{flex:1}}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Creating account…' : step < STEPS.length - 1 ? 'Continue' : 'Create Account'}
            {!loading && <ArrowIcon />}
          </button>
        </div>
      </div>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.switchLink}>Sign in</Link>
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
