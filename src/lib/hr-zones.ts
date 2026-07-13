export interface HRZone {
  name: string;
  pctMin: number;
  pctMax: number;
  bpmMin: number;
  bpmMax: number;
  effect: string;
}

const ZONE_TEMPLATE: Array<Omit<HRZone, 'bpmMin' | 'bpmMax'>> = [
  { name: 'Zona 1', pctMin: 50, pctMax: 60, effect: 'Calentamiento y recuperación' },
  { name: 'Zona 2', pctMin: 60, pctMax: 70, effect: 'Base aeróbica, quema grasa' },
  { name: 'Zona 3', pctMin: 70, pctMax: 80, effect: 'Aeróbico, eficiencia cardiovascular' },
  { name: 'Zona 4', pctMin: 80, pctMax: 90, effect: 'Umbral anaeróbico' },
  { name: 'Zona 5', pctMin: 90, pctMax: 100, effect: 'VO2 máx, capacidad anaeróbica' },
];

/**
 * Karvonen: target = resting + (max - resting) * (pct / 100)
 * If maxHr is null, fall back to 220 - age.
 */
export function calculateKarvonenZones(restingHr: number, maxHr: number): HRZone[] {
  const hrr = maxHr - restingHr;
  return ZONE_TEMPLATE.map((z) => ({
    ...z,
    bpmMin: Math.round(restingHr + hrr * (z.pctMin / 100)),
    bpmMax: Math.round(restingHr + hrr * (z.pctMax / 100)),
  }));
}

export function estimatedMaxHr(age: number): number {
  return 220 - age;
}
