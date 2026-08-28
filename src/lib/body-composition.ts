// Durnin & Womersley (1974) 4-fold skinfold equation for body density,
// combined with the Siri equation for body fat percentage. Uses the
// bicipital + tricipital + subscapular + suprailiac sum, matching the
// spec and the body_measurements columns.
//
// Body density BD = c - m * log10(sum4folds)
// with (c, m) chosen from a sex/age lookup table. Body fat % via Siri:
// %BF = (4.95 / BD - 4.5) * 100
//
// References:
// - Durnin JVGA, Womersley J. Body fat assessed from total body density and
//   its estimation from skinfold thickness. Br J Nutr 1974;32:77-97.
// - Siri WE. Body composition from fluid spaces and density. 1961.

type Sex = 'male' | 'female';

interface DurninCoefficient {
  c: number;
  m: number;
}

// Rows are [minAge, maxAge, coefficient]. maxAge = Infinity for the last band.
const MALE_TABLE: Array<[number, number, DurninCoefficient]> = [
  [17, 19, { c: 1.1620, m: 0.0630 }],
  [20, 29, { c: 1.1631, m: 0.0632 }],
  [30, 39, { c: 1.1422, m: 0.0544 }],
  [40, 49, { c: 1.1620, m: 0.0700 }],
  [50, Infinity, { c: 1.1715, m: 0.0779 }],
];

const FEMALE_TABLE: Array<[number, number, DurninCoefficient]> = [
  [16, 19, { c: 1.1549, m: 0.0678 }],
  [20, 29, { c: 1.1599, m: 0.0717 }],
  [30, 39, { c: 1.1423, m: 0.0632 }],
  [40, 49, { c: 1.1333, m: 0.0612 }],
  [50, Infinity, { c: 1.1339, m: 0.0645 }],
];

function pickCoefficient(sex: Sex, age: number): DurninCoefficient {
  const table = sex === 'male' ? MALE_TABLE : FEMALE_TABLE;
  const row = table.find(([min, max]) => age >= min && age <= max) ?? table[table.length - 1];
  return row[2];
}

/**
 * @param folds bicipital + tricipital + subscapular + suprailiac, in mm
 * @returns body fat percentage (0-100), or null if inputs are invalid
 */
export function calcBodyFatPct(folds: number, sex: Sex, age: number): number | null {
  if (!folds || folds <= 0 || age <= 0) return null;
  const { c, m } = pickCoefficient(sex, age);
  const bodyDensity = c - m * Math.log10(folds);
  if (bodyDensity <= 0) return null;
  const pct = (4.95 / bodyDensity - 4.5) * 100;
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return Math.round(pct * 10) / 10;
}

export function calcBMI(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calcFatMass(weightKg: number, bodyFatPct: number | null): number | null {
  if (!weightKg || bodyFatPct == null) return null;
  return Math.round(weightKg * (bodyFatPct / 100) * 10) / 10;
}

export function calcLeanMass(weightKg: number, fatMass: number | null): number | null {
  if (!weightKg || fatMass == null) return null;
  return Math.round((weightKg - fatMass) * 10) / 10;
}

export function ageFromBirthDate(birthDate: string | null, referenceDate = new Date()): number | null {
  if (!birthDate) return null;
  // Parse the YYYY-MM-DD column as a local date. `new Date("YYYY-MM-DD")`
  // treats it as UTC midnight, so in west-of-UTC zones the resulting Date's
  // getMonth/getDate resolve to the previous day — enough to return age-1
  // on someone's actual birthday. Match with a local-parsed Date.
  const dobMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate.trim());
  if (!dobMatch) return null;
  const dobYear = Number(dobMatch[1]);
  const dobMonth = Number(dobMatch[2]) - 1;
  const dobDay = Number(dobMatch[3]);
  let age = referenceDate.getFullYear() - dobYear;
  const monthDiff = referenceDate.getMonth() - dobMonth;
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dobDay)) age--;
  return age;
}

export function normalizeSex(profileSex: string | null): Sex | null {
  if (!profileSex) return null;
  const s = profileSex.toLowerCase();
  if (s.startsWith('masc') || s === 'male' || s === 'm') return 'male';
  if (s.startsWith('fem') || s === 'female' || s === 'f') return 'female';
  return null;
}
