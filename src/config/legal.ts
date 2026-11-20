// Doplňte overené údaje pred zverejnením právnych dokumentov.
// Prázdne hodnoty sa na stránkach zobrazujú ako „Doplniť“; nič sa nevymýšľa.
// Všetky textové hodnoty sa môžu zobraziť návštevníkom; nevkladajte sem heslá, tokeny ani interné zmluvy.
// Neznáme údaje nechajte prázdne. „Nevzťahuje sa“ použite iba po overení a doplňte stručný dôvod.
export const legalConfig = {
  // Označenie vydania dokumentov; pri zmene textu ho zvýšte, napr. na „2026-11-20.2“.
  version: '2026-11-20.3',
  // Dátum, od ktorého bude schválené znenie platiť, vo formáte RRRR-MM-DD, napr. „2026-11-20“.
  effectiveDate: '2026-11-20',
  // Skutočný dátum kontroly údajov, služieb a konečného znenia vo formáte RRRR-MM-DD; samotná úprava kódu nie je kontrolou.
  reviewedAt: '2026-11-20',
  // Zmeňte na true až po doplnení a overení všetkých údajov a schválení prevádzkovateľom; pri podstatnej zmene vráťte false.
  publicationApproved: true,
  // Verejné identifikačné a kontaktné údaje subjektu, ktorý web prevádzkuje a rozhoduje o spracúvaní údajov.
  operator: {
    // Úplný oficiálny názov z aktuálneho registra alebo registračného dokladu, nie iba skrátený názov klubu.
    name: 'OŠK AMK Veľký Klíž',
    // Konkrétna právna forma podľa registra, napr. „Občianske združenie“; neuvádzajte zoznam viacerých možných foriem.
    legalForm: 'Občianske združenie',
    // Osemmiestne IČO bez medzier; overené 20.11.2026 vo výpise MV SR uvedenom v registerUrl.
    registrationNumber: '57517193',
    // Úplné zapísané sídlo: ulica alebo časť obce, súpisné/orientačné číslo, PSČ a obec; nejde automaticky o adresu trate.
    address: '958 45 Veľký Klíž - Klíž 156',
    // Názov registra a príslušného registrového úradu podľa aktuálneho výpisu; samotné číslo registrácie patrí do registerEntry.
    register: 'Register mimovládnych neziskových organizácií, Okresný úrad Trenčín',
    // Presné registračné číslo alebo číslo zápisu z dokladu; tento údaj je odlišný od IČO a uvedenú hodnotu treba overiť.
    registerEntry: 'VVS/1-900/90-73916',
    // Verejný odkaz na výpis konkrétneho prevádzkovateľa; tento výpis potvrdzuje názov, IČO, sídlo a registračné číslo.
    registerUrl: 'https://ives.minv.sk/rmno/detail/13542098504748080478',
    // Verejný kontaktný telefón klubu s predvoľbou +421, na ktorom vie zodpovedná osoba vybaviť otázky k službe.
    phone: '+421 940 346 399',
    // Overené postavenie k DPH a príslušné daňové identifikátory; napr. „Nie sme platiteľom DPH“, iba ak to zodpovedá skutočnosti.
    vatStatus: 'Nie sme platiteľom DPH',
    // Názov a adresa orgánu dozoru príslušného pre konkrétne poskytovanú službu; jeho pôsobnosť overte, automaticky sem nepíšte SOI.
    supervisoryAuthority: 'Pre spotrebiteľské služby v pôsobnosti SOI: Slovenská obchodná inšpekcia, Inšpektorát SOI pre Trenčiansky kraj, Hurbanova 59, 911 01 Trenčín. Príslušnosť pre konkrétnu činnosť klubu je potrebné potvrdiť; dohľad nad osobnými údajmi a cookies vykonávajú osobitné úrady.',
    // Funkčná, pravidelne kontrolovaná emailová adresa na bežné otázky o klube, účtoch a obsahu webu.
    contactEmail: 'osk.amk.velky.kliz@gmail.com',
    // Kontrolovaná adresa na žiadosti o prístup, opravu alebo výmaz údajov; môže byť rovnaká ako contactEmail a sama osebe neoznačuje DPO.
    privacyEmail: 'osk.amk.velky.kliz@gmail.com',
  },
  // Skutočne používané služby a ich overené podmienky; údaje zistite zo zmlúv, faktúr, účtov služieb a produkčného nasadenia.
  services: {
    // Poskytovateľ webového/serverového hostingu a krajina umiestnenia, ak je overená; uveďte skutočného dodávateľa služby.
    hosting: 'Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Nemecko. Umiestnenie servera v Nemecku je údaj prevádzkovateľa, ktorý treba porovnať s objednávkou služby.',
    // Kto prevádzkuje a kde hostuje databázu s členskými údajmi; „PostgreSQL“ by označovalo iba technológiu, nie poskytovateľa.
    database: 'Členská databáza na serveri hostovanom u Hetzner Online GmbH; správu databázy zabezpečuje prevádzkovateľ prostredníctvom technického správcu.',
    // Meno alebo názov osoby/firmy zabezpečujúcej technickú správu s prístupom k údajom; uveďte jej skutočné postavenie.
    technicalOperator: 'Filip Toman',
    // Presná používaná emailová služba, napr. Gmail alebo Google Workspace, a rozsah použitia: servisné odosielanie či aj korešpondencia.
    emailProvider: 'Bežný Gmail bez plateného predplatného. Google pre používateľov v EHP uvádza Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Írsko; región konkrétneho účtu treba overiť.',
    // Overené zmluvné názvy poskytovateľov, ich úloha pri spracúvaní a verejné odkazy na príslušné podmienky; interné zmluvy sem nekopírujte.
    providerContracts: 'Hetzner Online GmbH poskytuje hosting; verejná DPA podľa čl. 28 GDPR ho označuje ako sprostredkovateľa údajov uložených zákazníkom. Zhodu zmluvného subjektu s objednávkou a uzavretie DPA musí prevádzkovateľ doložiť v zákazníckom účte. Bežný Gmail sa riadi spotrebiteľskými podmienkami Google a pravidlami ochrany súkromia. Google pre vlastné spracúvanie v EHP uvádza Google Ireland Limited ako prevádzkovateľa. Používanie bezplatného Gmailu samo nepotvrdzuje uzavretie sprostredkovateľskej zmluvy podľa čl. 28 GDPR; vhodnosť tejto služby pre klubovú komunikáciu a servisné emaily zostáva na posúdenie. Oficiálne podmienky a vysvetlenia sú dostupné v odkazoch pod touto časťou.',
    // Či a kam sú údaje prenášané alebo sprístupnené mimo EHP, ktorou službou a na základe akého overeného mechanizmu/záruk; neodhadujte podľa sídla servera.
    transfersOutsideEea: 'Pri používaní Gmailu môžu byť údaje spracúvané aj mimo EHP vrátane USA. Google uvádza globálne spracúvanie a pri príslušných prenosoch rozhodnutia o primeranosti vrátane EU–US Data Privacy Framework alebo štandardné zmluvné doložky. Mechanizmus použiteľný na konkrétny klubový účet a spracúvanie je potrebné overiť; týmto textom sa jeho vhodnosť nepotvrdzuje. Pri Hetzneri treba potvrdiť skutočne objednanú lokalitu a podmienky prístupu podľa DPA. Podrobnosti a spôsob vyžiadania kópie doložiek uvádza Google v odkaze na právne rámce prenosov.',
    // Overené v src/auth.ts backendu a nainštalovanom Better Auth; skutočný hostiteľ a dodatočné cookies hostingu/proxy vyžadujú kontrolu nasadenia.
    sessionCookies: '__Secure-better-auth.session_token: nevyhnutná prihlasovacia cookie autentifikačnej služby prevádzkovateľa, ktorá uchováva podpísaný identifikátor relácie a umožňuje overiť prihlásenie a oprávnenia. Platnosť 7 dní (604 800 sekúnd); pri používaní sa môže obnoviť, najskôr po 24 hodinách od vytvorenia alebo posledného obnovenia relácie. Pri odhlásení sa cookie odstráni a relácia na serveri zruší. V produkcii má Secure, HttpOnly, SameSite=Lax a cestu /. Je obmedzená na hostiteľa autentifikačného API, bez atribútu Domain; konkrétny názov hostiteľa závisí od nasadenia. Pri požiadavke rememberMe=false môže backend nastaviť aj pomocnú cookie __Secure-better-auth.dont_remember s rovnakým rozsahom a zabezpečením. Vtedy obe cookies nemajú trvalú dobu platnosti a končia s reláciou prehliadača, ktorú môže prehliadač pri obnove zachovať; serverová relácia má v tomto režime platnosť 24 hodín bez automatického predlžovania. Aktuálny prihlasovací formulár túto voľbu neponúka. Cache relácie v ďalšej cookie je v nastavení backendu vypnutá. Uvedené cookies neslúžia na analytiku ani reklamu. Tento popis vychádza z overeného kódu a nezahŕňa nepotvrdené dodatočné cookies hostingu alebo proxy.',
  },
  // Príslušný základ podľa čl. 6 GDPR a účel/rozsah spracúvania; tento návrh overte podľa stanov a reálneho členského vzťahu, nestačí iba názov zákona.
  membershipLegalBasis: 'Čl. 6 ods. 1 písm. b) GDPR v rozsahu nevyhnutnom na plnenie členského vzťahu podľa stanov a poskytovanie vyžiadaného členského účtu. Pred vytvorením členského vzťahu sa tento základ vzťahuje iba na kroky vykonané na žiadosť dotknutej osoby.',
  // Skutočná veková podmienka a postup kontroly pred vydaním licencie/vytvorením účtu; podľa vášho zadania sú účty iba pre osoby od 18 rokov.
  minorsProcedure: 'Členské účty poskytujeme iba osobám, ktoré dovŕšili 18 rokov. Maloletým účty nezriaďujeme, a to ani so súhlasom zákonného zástupcu. Pred vydaním registračnej licencie alebo priamym vytvorením účtu správca overí splnenie tejto podmienky. Pri registrácii používateľ potvrdzuje plnoletosť. Dátum narodenia ani kópie dokladov tento web nezhromažďuje.',
  // Pri každej lehote uveďte dĺžku alebo určité kritérium, začiatok plynutia, dôvod a spôsob výmazu/anonymizácie; nejde o nastavenie automatického mazania.
  retention: {
    // Ako dlho zostáva evidencia počas členstva a po jeho skončení, čo sa vymaže a čo sa odôvodnene uchová; samotná deaktivácia účtu údaje nemaže.
    membership: 'Navrhnutá interná lehota: počas členstva a po jeho skončení najviac 5 rokov iba pre údaje preukázateľne potrebné na konkrétne právne nároky; ostatné údaje sa vymažú po zániku účelu. Päť rokov nie je všeobecná zákonná lehota pre všetky členské údaje. Nevyhnutnosť rozsahu a lehoty musí prevádzkovateľ zdôvodniť a zaviesť výmaz alebo anonymizáciu. Záznamy podliehajúce osobitnej zákonnej povinnosti sa posudzujú oddelene.',
    // Dokedy uchovávate nedokončené/zamietnuté žiadosti a neoverené účty; napr. „[počet] dní od zamietnutia“, s reálne zabezpečeným výmazom.
    applications: 'Navrhnutá interná lehota: nedokončené žiadosti 30 dní od odoslania, zamietnuté žiadosti 30 dní od zamietnutia. Následný výmaz musí zabezpečiť správca podľa evidovaného dátumu príslušnej udalosti; automatické vykonávanie tohto pravidla nie je potvrdené. Osobitne odôvodnené právne nároky sa posudzujú individuálne.',
    // Lehota pre nepoužité, exspirované aj použité licencie vrátane mien a histórie; začiatok plynutia a výmaz/anonymizácia aj po odstránení účtu.
    licenses: 'Navrhnutá interná lehota pre použitú licenciu: počas členstva a potom najviac 5 rokov od skončenia členstva iba v rozsahu nevyhnutnom na odôvodnené právne nároky. Nepoužité licencie sa posudzujú po exspirácii alebo odvolaní pozvania; konkrétnu potrebnú lehotu ich výmazu treba ešte určiť. Mená a priezviská zostávajú v súčasnom systéme aj po odstránení účtu. Na zabránenie opätovnému použitiu kódu treba po zániku ďalších účelov ponechať len nevyhnutný záznam bez nepotrebných osobných údajov.',
    // Osobitné lehoty pre bezpečnostné/serverové logy a správcovský audit, od akej udalosti plynú a kto/čo zabezpečí ich odstránenie.
    securityLogs: 'Navrhnutá interná lehota: bezpečnostné udalosti a správcovský audit najviac 1 rok od udalosti, pri konkrétnom vyšetrovanom incidente len po nevyhnutný odôvodnený čas. Prevádzkovateľ musí potvrdiť primeranosť tejto lehoty aj osobitné lehoty prevádzkových logov a zabezpečiť výmaz technickým správcom. Súčasný servisný pracovník backendu ročné mazanie auditu nevykonáva.',
    // Ako dlho uchovávate prijaté/odoslané emaily, napr. „[počet] mesiacov od vybavenia otázky“; rozlíšte bežné otázky a iné odôvodnené účely.
    correspondence: 'Navrhnutá interná lehota pre bežné otázky: 1 rok od vybavenia; výmaz v emailovej schránke musí zabezpečiť správca. Správy potrebné pre konkrétne právne nároky sa uchovávajú iba po odôvodnenú potrebnú dobu. Ak správa alebo príloha predstavuje účtovný doklad podľa § 35 ods. 3 písm. c) zákona č. 431/2002 Z. z., uchováva sa počas 10 rokov nasledujúcich po roku, ktorého sa týka. Táto zákonná lehota sa nevzťahuje automaticky na všetky emaily.',
    // Vlastné aj prípadné dodávateľské zálohy: existencia, doba uchovania a zánik vymazaných údajov z kópií; podľa vás vlastné dátové zálohy nevytvárate.
    backups: 'Prevádzkovateľ podľa svojho vyjadrenia nevytvára vlastné dátové zálohy členskej evidencie. Prípadné nezávislé zálohovanie u poskytovateľov služieb musí overiť osobitne. Stiahnuté exporty a emailové schránky sú samostatné kópie údajov a podliehajú pravidlám uchovávania a výmazu.',
  },
}

// Verejné zdroje overené 20.11.2026; ich existencia nepotvrdzuje prijatie konkrétnej zmluvy klubom.
export const legalProviderLinks = [
  { label: 'Hetzner: oficiálny názov a sídlo', href: 'https://www.hetzner.com/legal/legal-notice/' },
  { label: 'Hetzner: obchodné podmienky', href: 'https://www.hetzner.com/legal/terms-and-conditions/' },
  { label: 'Hetzner: zmluva o spracúvaní údajov (DPA)', href: 'https://www.hetzner.com/AV/DPA_en.pdf' },
  { label: 'Hetzner: postup uzavretia DPA a informácie o lokalitách', href: 'https://docs.hetzner.com/general/company-and-policy/data-protection-at-hetzner/' },
  { label: 'Google: podmienky služby a výber krajiny účtu', href: 'https://policies.google.com/terms?hl=sk' },
  { label: 'Google: región účtu a poskytovateľ v EHP', href: 'https://policies.google.com/faq?hl=sk' },
  { label: 'Google: pravidlá ochrany súkromia a postavenie prevádzkovateľa', href: 'https://policies.google.com/privacy?hl=en-GB' },
  { label: 'Google: prenosy údajov, právne rámce a vyžiadanie doložiek', href: 'https://policies.google.com/privacy/frameworks?hl=sk' },
]

export function getLegalMissingFields(config: typeof legalConfig) {
  return [
    ...Object.entries(config.operator).filter(([, value]) => !value.trim()).map(([key]) => `operator.${key}`),
    ...Object.entries(config.services).filter(([, value]) => !value.trim()).map(([key]) => `services.${key}`),
    ...Object.entries(config.retention).filter(([, value]) => !value.trim()).map(([key]) => `retention.${key}`),
    ...(['effectiveDate', 'reviewedAt', 'membershipLegalBasis', 'minorsProcedure'] as const).filter(key => !config[key].trim()),
    ...(config.operator.registrationNumber.trim() && !/^\d{8}$/.test(config.operator.registrationNumber) ? ['operator.registrationNumber'] : []),
    ...(!config.publicationApproved ? ['publicationApproved'] : []),
  ]
}
export const legalMissingFields = getLegalMissingFields(legalConfig)
export const legalReady = legalMissingFields.length === 0
export const legalValue = (value: string) => value.trim() || 'Doplniť pred zverejnením'
