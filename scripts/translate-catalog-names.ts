// Populates exercises_catalog.name_es with a rule-based Spanish translation
// of each row's English name. Uses a phrase-first, then word-by-word
// dictionary tuned to the fitness vocabulary that dominates this dataset
// (top tokens: dumbbell, curl, press, barbell, cable, seated, raise, ...).
//
// Usage:
//   npm run translate:catalog -- --dry-run   # print samples, no write
//   npm run translate:catalog                # write name_es for every row where it's NULL
//   npm run translate:catalog -- --force     # overwrite all rows including existing name_es
//
// Idempotent by default (only touches rows with name_es IS NULL).

import { adminClient } from './_shared';

// --- Dictionary --------------------------------------------------------------
//
// Order matters within PHRASE_MAP: longer / more specific phrases first so
// they get matched before their constituent words. Keys are lower-cased and
// use single spaces; the replacer normalizes both. Values are the Spanish
// substitution.

const PHRASE_MAP: Array<[string, string]> = [
  // Very common compound movements
  ['bench press', 'press de banca'],
  ['shoulder press', 'press de hombros'],
  ['chest press', 'press de pecho'],
  ['overhead press', 'press militar'],
  ['military press', 'press militar'],
  ['leg press', 'press de piernas'],
  ['leg extension', 'extensión de piernas'],
  ['leg curl', 'curl femoral'],
  ['leg raise', 'elevación de piernas'],
  ['calf raise', 'elevación de talones'],
  ['calf press', 'press de pantorrilla'],
  ['hip thrust', 'empuje de cadera'],
  ['hip raise', 'elevación de cadera'],
  ['hip abduction', 'abducción de cadera'],
  ['hip adduction', 'aducción de cadera'],
  ['lat pulldown', 'jalón al pecho'],
  ['lat pull-down', 'jalón al pecho'],
  ['cable row', 'remo en polea'],
  ['seated row', 'remo sentado'],
  ['bent over row', 'remo inclinado'],
  ['bent-over row', 'remo inclinado'],
  ['upright row', 'remo al mentón'],
  ['front raise', 'elevación frontal'],
  ['lateral raise', 'elevación lateral'],
  ['side raise', 'elevación lateral'],
  ['rear delt raise', 'elevación de deltoides posterior'],
  ['rear delt fly', 'apertura posterior'],
  ['reverse fly', 'apertura inversa'],
  ['chest fly', 'apertura de pecho'],
  ['pec fly', 'apertura de pecho'],
  ['hammer curl', 'curl martillo'],
  ['preacher curl', 'curl predicador'],
  ['concentration curl', 'curl concentrado'],
  ['reverse curl', 'curl inverso'],
  ['wrist curl', 'curl de muñeca'],
  ['bicep curl', 'curl de bíceps'],
  ['biceps curl', 'curl de bíceps'],
  ['triceps extension', 'extensión de tríceps'],
  ['tricep extension', 'extensión de tríceps'],
  ['triceps pushdown', 'extensión de tríceps en polea'],
  ['tricep pushdown', 'extensión de tríceps en polea'],
  ['triceps kickback', 'patada de tríceps'],
  ['tricep kickback', 'patada de tríceps'],
  ['triceps dip', 'fondo de tríceps'],
  ['tricep dip', 'fondo de tríceps'],
  ['pull-up', 'dominada'],
  ['pull up', 'dominada'],
  ['chin-up', 'dominada supina'],
  ['chin up', 'dominada supina'],
  ['push-up', 'flexión'],
  ['push up', 'flexión'],
  ['sit-up', 'abdominal'],
  ['sit up', 'abdominal'],
  ['dead bug', 'dead bug'],
  ['mountain climber', 'escalador'],
  ['jumping jack', 'saltos de tijera'],
  ['burpee', 'burpee'],
  ['plank', 'plancha'],
  ['side plank', 'plancha lateral'],
  ['russian twist', 'giro ruso'],
  ['woodchopper', 'leñador'],
  ['wood chopper', 'leñador'],
  ['dead lift', 'peso muerto'],
  ['deadlift', 'peso muerto'],
  ['romanian deadlift', 'peso muerto rumano'],
  ['stiff leg deadlift', 'peso muerto pierna rígida'],
  ['stiff-leg deadlift', 'peso muerto pierna rígida'],
  ['good morning', 'buenos días'],
  ['thruster', 'thruster'],
  ['clean and jerk', 'cargada y envión'],
  ['clean and press', 'cargada y press'],
  ['snatch', 'arrancada'],
  ['power clean', 'cargada de fuerza'],
  ['hang clean', 'cargada colgante'],
  ['front squat', 'sentadilla frontal'],
  ['back squat', 'sentadilla trasera'],
  ['goblet squat', 'sentadilla goblet'],
  ['jump squat', 'sentadilla con salto'],
  ['bulgarian split squat', 'sentadilla búlgara'],
  ['split squat', 'zancada búlgara'],
  ['pistol squat', 'sentadilla pistola'],
  ['sissy squat', 'sentadilla sissy'],
  ['lunge', 'zancada'],
  ['walking lunge', 'zancada caminando'],
  ['reverse lunge', 'zancada inversa'],
  ['step-up', 'subida al banco'],
  ['step up', 'subida al banco'],
  ['box jump', 'salto al cajón'],
  ['broad jump', 'salto largo'],
  ['tuck jump', 'salto con rodillas al pecho'],
  ['glute bridge', 'puente de glúteos'],
  ['glute kickback', 'patada de glúteos'],
  ['fire hydrant', 'hidrante'],
  ['clam shell', 'almeja'],
  ['clamshell', 'almeja'],
  ['bird dog', 'perro-pájaro'],
  ['superman', 'superman'],
  ['face pull', 'face pull'],
  ['skull crusher', 'press francés'],
  ['french press', 'press francés'],
  ['pullover', 'pullover'],
  ['shrug', 'encogimiento de hombros'],
  ['farmer walk', 'paseo del granjero'],
  ['farmers walk', 'paseo del granjero'],
  ['farmer’s walk', 'paseo del granjero'],
  ['jump rope', 'salto a la cuerda'],
  ['jumping rope', 'salto a la cuerda'],

  // Grip / body-position phrases
  ['close-grip', 'agarre cerrado'],
  ['close grip', 'agarre cerrado'],
  ['wide-grip', 'agarre ancho'],
  ['wide grip', 'agarre ancho'],
  ['reverse-grip', 'agarre invertido'],
  ['reverse grip', 'agarre invertido'],
  ['neutral grip', 'agarre neutro'],
  ['underhand grip', 'agarre supino'],
  ['overhand grip', 'agarre prono'],
  ['one arm', 'a una mano'],
  ['one-arm', 'a una mano'],
  ['one leg', 'a una pierna'],
  ['one-leg', 'a una pierna'],
  ['single arm', 'a una mano'],
  ['single-arm', 'a una mano'],
  ['single leg', 'a una pierna'],
  ['single-leg', 'a una pierna'],
  ['bent over', 'inclinado'],
  ['bent-over', 'inclinado'],
  ['over head', 'sobre la cabeza'],
  ['behind the neck', 'tras la nuca'],
  ['behind neck', 'tras la nuca'],

  // Equipment / setup phrases
  ['ez bar', 'barra Z'],
  ['ez-bar', 'barra Z'],
  ['ez curl bar', 'barra Z'],
  ['smith machine', 'máquina Smith'],
  ['power rack', 'jaula de potencia'],
  ['stability ball', 'pelota de estabilidad'],
  ['swiss ball', 'pelota suiza'],
  ['exercise ball', 'pelota de ejercicio'],
  ['medicine ball', 'balón medicinal'],
  ['resistance band', 'banda de resistencia'],
  ['body weight', 'peso corporal'],
  ['body-weight', 'peso corporal'],
  ['weight plate', 'disco'],
  ['kettle bell', 'kettlebell'],
];

const WORD_MAP: Record<string, string> = {
  // Equipment
  dumbbell: 'con mancuernas',
  dumbbells: 'con mancuernas',
  barbell: 'con barra',
  cable: 'en polea',
  band: 'con banda',
  kettlebell: 'con kettlebell',
  machine: 'en máquina',
  lever: 'en palanca',
  smith: 'Smith',
  ball: 'con pelota',
  bar: 'con barra',
  rope: 'con cuerda',
  chain: 'con cadena',
  sled: 'trineo',

  // Actions / core movements
  curl: 'curl',
  press: 'press',
  raise: 'elevación',
  row: 'remo',
  squat: 'sentadilla',
  lunge: 'zancada',
  extension: 'extensión',
  fly: 'apertura',
  crunch: 'crunch',
  pulldown: 'jalón',
  pushdown: 'extensión en polea',
  pushup: 'flexión',
  pullup: 'dominada',
  chinup: 'dominada supina',
  situp: 'abdominal',
  dip: 'fondo',
  stretch: 'estiramiento',
  twist: 'torsión',
  jump: 'salto',
  bridge: 'puente',
  thrust: 'empuje',
  swing: 'balanceo',
  kickback: 'patada',
  pull: 'jalón',
  push: 'empuje',
  hold: 'sostenimiento',
  step: 'paso',
  run: 'correr',
  running: 'correr',
  walk: 'caminar',
  walking: 'caminar',
  climb: 'escalar',
  cycle: 'ciclismo',
  cycling: 'ciclismo',
  rowing: 'remo',
  skip: 'salto a la cuerda',
  skipping: 'salto a la cuerda',
  bounce: 'rebote',
  hop: 'salto',
  kick: 'patada',
  punch: 'golpe',
  clap: 'aplauso',
  spider: 'araña',
  scissor: 'tijera',
  scissors: 'tijeras',
  butterfly: 'mariposa',
  bear: 'oso',
  crab: 'cangrejo',
  frog: 'rana',
  windmill: 'molino',
  cocoon: 'capullo',
  elevator: 'ascensor',

  // Body parts / muscles
  chest: 'de pecho',
  back: 'de espalda',
  shoulder: 'de hombros',
  shoulders: 'de hombros',
  arm: 'de brazo',
  arms: 'de brazos',
  leg: 'de pierna',
  legs: 'de piernas',
  hip: 'de cadera',
  hips: 'de cadera',
  glute: 'de glúteo',
  glutes: 'de glúteos',
  calf: 'de pantorrilla',
  calves: 'de pantorrillas',
  bicep: 'de bíceps',
  biceps: 'de bíceps',
  tricep: 'de tríceps',
  triceps: 'de tríceps',
  abs: 'abdominales',
  ab: 'abdominal',
  abdominal: 'abdominal',
  wrist: 'de muñeca',
  ankle: 'de tobillo',
  knee: 'de rodilla',
  neck: 'de cuello',
  quad: 'de cuádriceps',
  quads: 'de cuádriceps',
  hamstring: 'de isquios',
  hamstrings: 'de isquios',
  lat: 'dorsal',
  lats: 'dorsales',
  pec: 'pectoral',
  pecs: 'pectorales',
  delt: 'deltoides',
  delts: 'deltoides',
  trap: 'trapecio',
  traps: 'trapecio',
  forearm: 'de antebrazo',
  forearms: 'de antebrazos',
  core: 'core',

  // Position / modifier
  seated: 'sentado',
  standing: 'de pie',
  lying: 'acostado',
  kneeling: 'arrodillado',
  incline: 'inclinado',
  decline: 'declinado',
  flat: 'plano',
  inclined: 'inclinado',
  reverse: 'inverso',
  weighted: 'con peso',
  assisted: 'asistido',
  alternate: 'alterno',
  alternating: 'alterno',
  hammer: 'martillo',
  wide: 'ancho',
  close: 'cerrado',
  narrow: 'estrecho',
  overhead: 'sobre la cabeza',
  front: 'frontal',
  rear: 'posterior',
  side: 'lateral',
  lateral: 'lateral',
  straight: 'recto',
  bent: 'inclinado',
  high: 'alto',
  low: 'bajo',
  single: 'a una',
  double: 'a dos',
  supine: 'supino',
  prone: 'prono',
  isometric: 'isométrico',
  static: 'estático',
  dynamic: 'dinámico',
  slow: 'lento',
  explosive: 'explosivo',
  half: 'medio',
  quarter: 'cuarto',
  full: 'completo',
  partial: 'parcial',

  // Small connectors
  on: 'en',
  in: 'en',
  with: 'con',
  and: 'y',
  or: 'o',
  the: '',
  a: '',
  an: '',
  of: 'de',
  to: 'a',
  from: 'desde',
  over: 'sobre',
  under: 'bajo',
  behind: 'tras',
  around: 'alrededor',
  up: 'arriba',
  down: 'abajo',

  // Body-position descriptors used in this dataset
  floor: 'en el suelo',
  bench: 'banco',
  wall: 'pared',
  chair: 'silla',

  // Numeric grip / body words the dataset uses
  one: 'una',
  two: 'dos',
  three: 'tres',
  four: 'cuatro',
  five: 'cinco',
  six: 'seis',
};

// --- Translator --------------------------------------------------------------

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function applyPhrases(nameLower: string): string {
  let out = ` ${nameLower} `;
  for (const [en, es] of PHRASE_MAP) {
    const pattern = ` ${en} `;
    while (out.includes(pattern)) {
      out = out.replace(pattern, ` ${es} `);
    }
  }
  return normalizeSpaces(out);
}

function applyWords(name: string): string {
  return normalizeSpaces(
    name
      .split(/\s+/)
      .map((token) => {
        const lowered = token.toLowerCase();
        if (WORD_MAP[lowered] !== undefined) return WORD_MAP[lowered];
        return token; // keep original (proper noun, unmapped term, punctuation)
      })
      .join(' '),
  );
}

function toSentenceCase(s: string): string {
  const trimmed = normalizeSpaces(s);
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function translateExerciseName(nameEnglish: string): string {
  const lowered = nameEnglish.toLowerCase();
  const phrased = applyPhrases(lowered);
  const words = applyWords(phrased);
  // Body-part word mappings prepend "de " (e.g. "chest" → "de pecho") which
  // reads well mid-phrase ("press de pecho") but weirdly at the very start
  // ("De cuádriceps"). Strip a leading "de " so single-word body-part names
  // still work.
  const trimmed = words.replace(/^de\s+/, '');
  return toSentenceCase(trimmed);
}

// --- Main --------------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const force = args.has('--force');

  const query = adminClient
    .from('exercises_catalog')
    .select('id, name, name_es')
    .order('id', { ascending: true });

  const collected: { id: string; name: string; name_es: string | null }[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await query.range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    collected.push(...data);
    if (data.length < pageSize) break;
    page += 1;
  }

  console.log(`Loaded ${collected.length} catalog rows.`);

  const todo = collected.filter((row) => force || row.name_es == null);
  console.log(`${todo.length} to translate (${force ? 'force mode' : 'name_es IS NULL'}).`);

  const previews = todo.slice(0, 15);
  console.log('\nPreview (first 15):');
  for (const row of previews) {
    console.log(`  ${row.name}  →  ${translateExerciseName(row.name)}`);
  }

  if (dryRun) {
    console.log('\nDry run — no writes.');
    return;
  }

  const updates = todo.map((row) => ({ id: row.id, name_es: translateExerciseName(row.name) }));
  const batchSize = 200;
  let done = 0;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const { error } = await adminClient.from('exercises_catalog').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch starting at ${i} failed: ${error.message}`);
      throw error;
    }
    done += batch.length;
    console.log(`  ${done}/${updates.length} upserted`);
  }

  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
