/**
 * Aesthetic Ratio Targets (Steve Reeves / Golden Ratio benchmarks)
 * All ratios relative to waist unless noted.
 */
export const RATIO_TARGETS = {
  shoulderToWaist:  1.618,   // Golden ratio
  chestToWaist:     1.4,
  hipToWaist:       1.25,
  thighToWaist:     0.75,
  calfToThigh:      0.6,
  upperArmToNeck:   1.0,     // upper arm ≈ neck circumference
  wristToUpperArm:  0.67,
};

export const MUSCLE_GROUPS = [
  'Shoulders', 'Chest', 'Back', 'Arms', 'Forearms',
  'Core', 'Glutes', 'Quads', 'Hamstrings', 'Calves',
];

/**
 * Calculates ratios and returns a score + lag list.
 */
export function analyzePhysique(m) {
  const results = [];

  const push = (name, current, target, musclePrimary) => {
    if (!current || !target) return;
    const diff = current - target;
    const pct  = Math.round((current / target) * 100);
    const status =
      pct >= 95 && pct <= 105 ? 'optimal' :
      pct < 80               ? 'lagging' :
      pct < 95               ? 'developing' : 'overdeveloped';
    results.push({ name, current: +current.toFixed(3), target: +target.toFixed(3), pct, status, diff: +diff.toFixed(3), musclePrimary });
  };

  const { shoulder, chest, waist, hip, thigh, calf, upperArm, forearm, neck } = m;

  if (shoulder && waist) push('Shoulder-to-Waist', shoulder / waist, RATIO_TARGETS.shoulderToWaist, 'Shoulders');
  if (chest && waist)    push('Chest-to-Waist',    chest / waist,    RATIO_TARGETS.chestToWaist,    'Chest');
  if (hip && waist)      push('Hip-to-Waist',      hip / waist,      RATIO_TARGETS.hipToWaist,      'Glutes');
  if (thigh && waist)    push('Thigh-to-Waist',    thigh / waist,    RATIO_TARGETS.thighToWaist,    'Quads');
  if (calf && thigh)     push('Calf-to-Thigh',     calf / thigh,     RATIO_TARGETS.calfToThigh,     'Calves');
  if (upperArm && neck)  push('Arm-to-Neck',       upperArm / neck,  RATIO_TARGETS.upperArmToNeck,  'Arms');

  const lagging = results.filter(r => r.status === 'lagging' || r.status === 'developing');
  const score   = results.length
    ? Math.round(results.reduce((s, r) => s + Math.min(r.pct, 100), 0) / results.length)
    : 0;

  return { ratios: results, lagging, score };
}

export function getStatusVariant(status) {
  return { optimal: 'success', developing: 'warning', lagging: 'danger', overdeveloped: 'accent' }[status] ?? 'default';
}
