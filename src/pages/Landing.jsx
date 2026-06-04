import { Link } from 'react-router-dom';
import Logo from '../components/branding/Logo';
import ThemeToggle from '../components/theme/ThemeToggle';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.grid} aria-hidden />
      <div className={styles.gradientBlob} aria-hidden />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Logo size="md" />
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how"      className={styles.navLink}>How It Works</a>
            <a href="#ratios"   className={styles.navLink}>The Science</a>
          </div>
          <div className={styles.navCta}>
            <ThemeToggle variant="icon" size="sm" />
            <Link to="/login"    className={styles.btnGhost}>Sign In</Link>
            <Link to="/register" className={styles.btnAccent}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered Physique &amp; Training Analyzer
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroAccent}>APEX</span>
          </h1>
          <p className={styles.heroTagline}>Reach Your Peak Potential</p>

          <p className={styles.heroSub}>
            Input your body measurements. Our AI engine analyses your aesthetic
            ratios against proven physiological targets, identifies exactly which
            muscle groups are lagging, and generates a fully periodized training
            plan built around <em>your</em> structure.
          </p>

          <div className={styles.heroActions}>
            <Link to="/register" className={styles.heroCta}>
              Analyse My Physique
              <ArrowIcon />
            </Link>
            <a href="#how" className={styles.heroSecondary}>See How It Works</a>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            {STATS.map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className={styles.heroVisual}>
          <div className={styles.analysisMockup}>
            <div className={styles.mockupHeader}>
              <span className={styles.mockupDot} style={{background:'#FF4545'}} />
              <span className={styles.mockupDot} style={{background:'#FFB830'}} />
              <span className={styles.mockupDot} style={{background:'#4DDB8A'}} />
              <span className={styles.mockupTitle}>APEX · Physique Analysis</span>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.scoreRing}>
                <svg viewBox="0 0 100 100" className={styles.ringsvg}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-accent)"
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="263.9" strokeDashoffset="66"
                    transform="rotate(-90 50 50)"/>
                </svg>
                <div className={styles.ringInner}>
                  <span className={styles.ringScore}>75</span>
                  <span className={styles.ringLabel}>Score</span>
                </div>
              </div>
              <div className={styles.mockupRatios}>
                {MOCK_RATIOS.map(r => (
                  <div key={r.name} className={styles.mockupRatio}>
                    <div className={styles.mockupRatioHeader}>
                      <span className={styles.mockupRatioName}>{r.name}</span>
                      <span className={[styles.mockupRatioStatus, styles[r.status]].join(' ')}>{r.status}</span>
                    </div>
                    <div className={styles.mockupTrack}>
                      <div className={styles.mockupFill} style={{width: r.pct + '%', background: r.color}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>What You Get</div>
          <h2 className={styles.sectionTitle}>Everything you need.<br />Nothing you don't.</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.how} id="how">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>The Process</div>
          <h2 className={styles.sectionTitle}>From measurements<br />to program in minutes.</h2>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <div className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className={styles.stepConnector} aria-hidden />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science / Ratios */}
      <section className={styles.science} id="ratios">
        <div className={styles.sectionInner}>
          <div className={styles.scienceGrid}>
            <div className={styles.scienceText}>
              <div className={styles.sectionLabel}>The Science</div>
              <h2 className={styles.sectionTitle}>Built on aesthetic ratio research.</h2>
              <p className={styles.scienceBody}>
                Our AI benchmarks your measurements against the Golden Ratio (1.618)
                and proven physiological targets — the same principles used by
                classical sculptors and modern sports scientists alike.
              </p>
              <p className={styles.scienceBody}>
                By identifying which ratios are lagging, we direct your training
                volume precisely where it will make the biggest visual impact.
              </p>
              <Link to="/register" className={styles.btnAccent} style={{marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8}}>
                Start Your Analysis <ArrowIcon />
              </Link>
            </div>
            <div className={styles.ratioTable}>
              <div className={styles.ratioTableHeader}>
                <span>Ratio</span>
                <span>Target</span>
              </div>
              {RATIO_ROWS.map(r => (
                <div key={r.name} className={styles.ratioRow}>
                  <span className={styles.ratioName}>{r.name}</span>
                  <span className={styles.ratioTarget}>{r.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} aria-hidden />
            <h2 className={styles.ctaTitle}>Ready to train with precision?</h2>
            <p className={styles.ctaSub}>Create your free account and get your physique analysis in under 5 minutes.</p>
            <Link to="/register" className={styles.ctaBtn}>
              Get Your Free Analysis <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <Logo size="sm" to={null} />
            <span style={{fontFamily:'var(--font-heading)',fontSize:12,color:'var(--color-text-muted)',letterSpacing:'0.04em'}}>
              © 2026 APEX. All rights reserved.
            </span>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/login"    className={styles.footerLink}>Sign In</Link>
            <Link to="/register" className={styles.footerLink}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Data ── */
const STATS = [
  { value: '6',    label: 'Key Ratios Analysed' },
  { value: '100%', label: 'Personalised to You' },
  { value: 'AI',   label: 'Decision Engine' },
];

const MOCK_RATIOS = [
  { name: 'Shoulder-to-Waist', pct: 85, status: 'optimal',     color: 'var(--color-success)' },
  { name: 'Chest-to-Waist',    pct: 68, status: 'developing',  color: 'var(--color-warning)' },
  { name: 'Arm-to-Neck',       pct: 52, status: 'lagging',     color: 'var(--color-danger)'  },
  { name: 'Thigh-to-Waist',    pct: 78, status: 'developing',  color: 'var(--color-warning)' },
];

const FEATURES = [
  {
    icon: <ScanIcon />,
    title: 'Physique Ratio Analysis',
    desc: 'We measure your body against the Golden Ratio and 5 other aesthetic benchmarks to pinpoint exactly what needs work.',
  },
  {
    icon: <BrainIcon />,
    title: 'AI Training Engine',
    desc: 'Our decision-tree AI maps your lag points to specific exercises, sets, reps, and frequency recommendations.',
  },
  {
    icon: <CalendarIcon />,
    title: 'Periodized Programming',
    desc: 'Get a structured weekly split with progressive overload baked in — not just a list of exercises.',
  },
  {
    icon: <ChartIcon />,
    title: 'Progress Tracking',
    desc: 'Log your measurements over time and watch your ratios move toward their targets as your physique improves.',
  },
];

const STEPS = [
  { title: 'Log Your Measurements', desc: 'Enter your key body circumferences — shoulders, chest, waist, hips, arms, legs, and calves.' },
  { title: 'AI Analyses Your Ratios', desc: 'Our engine computes your current aesthetic ratios and scores them against physiological targets.' },
  { title: 'Review Your Lag Points', desc: 'See a clear breakdown of which muscle groups are lagging, developing, or already optimal.' },
  { title: 'Get Your Training Plan', desc: 'Receive a fully periodized hypertrophy program built specifically around your weak points.' },
];

const RATIO_ROWS = [
  { name: 'Shoulder-to-Waist', target: '1.618 (Golden)' },
  { name: 'Chest-to-Waist',    target: '1.40' },
  { name: 'Hip-to-Waist',      target: '1.25' },
  { name: 'Thigh-to-Waist',    target: '0.75' },
  { name: 'Calf-to-Thigh',     target: '0.60' },
  { name: 'Arm-to-Neck',       target: '1.00' },
];

/* ── Icons ── */
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function ScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}
function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
