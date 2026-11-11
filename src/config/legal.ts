// Doplňte overené údaje pred zverejnením právnych dokumentov.
// Prázdne hodnoty sa na stránkach zobrazujú ako „Doplniť“; nič sa nevymýšľa.
export const legalConfig = {
  version: '2026-11-10',
  effectiveDate: '',
  reviewedAt: '',
  operator: {
    name: 'OŠK AMK Veľký Klíž',
    legalForm: '',
    registrationNumber: '',
    address: '',
    register: '',
    contactEmail: '',
    privacyEmail: '',
  },
  services: {
    hosting: 'Hetzner, server v Nemecku',
    database: 'Databáza na rovnakom serveri v Nemecku',
    technicalOperator: '',
    emailProvider: '',
    transfersOutsideEea: '',
    sessionCookies: '',
  },
  membershipLegalBasis: '',
  minorsProcedure: '',
  retention: {
    membership: '',
    applications: '',
    licenses: '',
    securityLogs: '',
    correspondence: '',
    backups: '',
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
