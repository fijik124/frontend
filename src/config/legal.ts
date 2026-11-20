// Doplňte overené údaje pred zverejnením právnych dokumentov.
// Prázdne hodnoty sa na stránkach zobrazujú ako „Doplniť“; nič sa nevymýšľa.
export const legalConfig = {
  version: '20-11-2026',
  effectiveDate: '20-11-2026',
  reviewedAt: '20-11-2026',
  operator: {
    name: 'OŠK AMK Veľký Klíž',
    legalForm: 'Občianske združenie, odborová organizácia a organizácia zamestnávateľov',
    registrationNumber: 'VVS/1-900/90-73916',
    address: '958 45 Veľký Klíž - Klíž 156',
    register: 'Okresný úrad Trencin',
    contactEmail: 'osk.amk.velky.kliz@gmail.com',
    privacyEmail: 'osk.amk.velky.kliz@gmail.com',
  },
  services: {
    hosting: 'Hetzner',
    database: 'Hetzner',
    technicalOperator: 'Filip Toman',
    emailProvider: 'google',
    transfersOutsideEea: 'Nie',
    sessionCookies: 'Absolútne nevyhnutné, funkčné a analytické',
  },
  membershipLegalBasis: 'Zákon č. 128/2000 Z.z. o občianskom združení',
  minorsProcedure: 'Pre deti a mládež platí zvláštny postup podľa zákona.',
  retention: {
    membership: 'Po ukončení členstva alebo po uplynutí platnosti licencie.',
    applications: 'Po uplynutí platnosti žiadosti.',
    licenses: 'Po ukončení členstva alebo po uplynutí platnosti licencie.',
    securityLogs: 'Po uplynutí 12 mesiacov.',
    correspondence: '3 roky',
    backups: 'Nezálohujeme osobné údaje, iba technické zálohy servera.',
  },
}

export const legalMissingFields = [
  ...Object.entries(legalConfig.operator).filter(([, value]) => !value.trim()).map(([key]) => `operator.${key}`),
  ...Object.entries(legalConfig.services).filter(([, value]) => !value.trim()).map(([key]) => `services.${key}`),
  ...Object.entries(legalConfig.retention).filter(([, value]) => !value.trim()).map(([key]) => `retention.${key}`),
  ...(['effectiveDate', 'reviewedAt', 'membershipLegalBasis', 'minorsProcedure'] as const).filter(key => !legalConfig[key].trim()),
]
export const legalReady = legalMissingFields.length === 0
export const legalValue = (value: string) => value.trim() || 'Doplniť pred zverejnením'
