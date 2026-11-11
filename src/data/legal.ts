import { legalConfig as config, legalValue } from '../config/legal'

export type LegalDocumentId = 'privacy' | 'terms' | 'cookies'
interface LegalSection {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
  rows?: { label: string; value: string }[]
  links?: { label: string; href: string }[]
}
interface LegalDocument {
  title: string
  description: string
  sections: LegalSection[]
}

export const legalNavigation = [
  { id: 'privacy', href: '/ochrana-osobnych-udajov', label: 'Ochrana osobných údajov' },
  { id: 'terms', href: '/pravidla-pouzivania', label: 'Pravidlá používania' },
  { id: 'cookies', href: '/cookies', label: 'Cookies a úložisko' },
] as const

const operator: LegalSection = {
  id: 'prevadzkovatel', title: 'Prevádzkovateľ a kontakt',
  paragraphs: ['Web a členskú zónu prevádzkuje nižšie uvedený subjekt. Na tento kontakt môžete adresovať otázky o účte, podnety k obsahu aj žiadosti týkajúce sa osobných údajov.'],
  rows: [
    { label: 'Názov', value: config.operator.name },
    { label: 'Právna forma', value: legalValue(config.operator.legalForm) },
    { label: 'IČO', value: legalValue(config.operator.registrationNumber) },
    { label: 'Sídlo', value: legalValue(config.operator.address) },
    { label: 'Register a číslo zápisu', value: legalValue(config.operator.register) },
    { label: 'Všeobecný kontakt', value: legalValue(config.operator.contactEmail) },
    { label: 'Kontakt pre ochranu údajov', value: legalValue(config.operator.privacyEmail) },
  ],
}

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Ochrana osobných údajov',
    description: 'Aké údaje používame pri prevádzke webu a členskej zóny, na čo slúžia a ako si môžete uplatniť svoje práva.',
    sections: [
      operator,
      { id: 'rozsah', title: 'Koho a akých údajov sa informácie týkajú',
        paragraphs: ['Informácie sú určené návštevníkom webu, členom združenia používajúcim členskú zónu a osobám, pre ktoré správca pripravuje členský účet alebo registračnú licenciu.'],
        items: [
          'Členská evidencia: meno, priezvisko, email, telefón, štartové číslo, interný identifikátor, dátum evidencie, stav členstva, klubová rola a údaj o úhrade členského príspevku.',
          'Klubové registračné licencie: meno, priezvisko, licenčný kód, pridelená rola, dátum vydania, platnosť, stav a prepojenie na člena. Nejde o oficiálnu športovú licenciu.',
          'Účet a bezpečnosť: heslo odovzdané autentifikačnej službe, overenie emailu, údaje potrebné na obnovenie hesla a prihlásenú reláciu. Technická prevádzka môže zahŕňať IP adresu, čas požiadavky a údaje o prehliadači podľa nastavenia servera.',
          'Správa klubu: záznamy o úpravách členov, licencií, rolí a podujatí. Pri emailovom kontakte tiež obsah vašej správy a odpovede.',
        ],
      },
      { id: 'ucely', title: 'Účely a právne základy',
        paragraphs: ['Údaje používame na vedenie členskej evidencie, sprístupnenie účtu členovi, overenie registračnej licencie, vybavenie žiadostí a zabezpečenie webu. Registrácia účtu sama osebe nenahrádza vznik členstva podľa stanov združenia.'],
        rows: [
          { label: 'Členstvo, účet a licencia', value: legalValue(config.membershipLegalBasis) },
          { label: 'Bezpečnosť a ochrana pred zneužitím', value: 'Oprávnený záujem na bezpečnej prevádzke a ochrane účtov podľa čl. 6 ods. 1 písm. f) GDPR, v nevyhnutnom a primeranom rozsahu.' },
          { label: 'Vybavenie žiadostí o ochranu údajov', value: 'Splnenie povinností podľa GDPR, čl. 6 ods. 1 písm. c) GDPR.' },
        ],
        items: [
          'Meno, priezvisko, email, heslo a platný registračný kód sú potrebné na vytvorenie účtu. Bez nich registráciu účtu nevieme dokončiť. Telefón a štartové číslo sa vo webovom formulári dopĺňajú osobitne.',
          'Marketingové emaily neposielame. Prečítanie tohto dokumentu ani prijatie pravidiel používania nepredstavuje súhlas s reklamou.',
          'Ak v budúcnosti vznikne ďalší účel spracúvania, informácie a príslušný právny základ sa musia doplniť ešte pred začatím takého spracúvania.',
        ],
      },
      { id: 'zdroje', title: 'Odkiaľ údaje získavame',
        paragraphs: ['Údaje zadávate pri registrácii, úprave profilu alebo emailovom kontakte. Meno, priezvisko, licenciu, členský stav, rolu a príspevok môže do evidencie vložiť alebo upraviť poverený správca z členskej evidencie združenia. Informácie o takom spracúvaní vám má združenie poskytnúť aj pri prijatí za člena alebo pri vytvorení pozvánky.'],
      },
      { id: 'prijemcovia', title: 'Príjemcovia, hosting a prenosy',
        rows: [
          { label: 'Hosting', value: config.services.hosting },
          { label: 'Databáza', value: config.services.database },
          { label: 'Osoba zabezpečujúca technickú prevádzku', value: legalValue(config.services.technicalOperator) },
          { label: 'Poskytovateľ odosielania servisných emailov', value: legalValue(config.services.emailProvider) },
          { label: 'Prenosy mimo Európskeho hospodárskeho priestoru', value: legalValue(config.services.transfersOutsideEea) },
        ],
        paragraphs: ['Prístup v členskej zóne závisí od pridelenej roly. Poverený správca vidí údaje potrebné na správu klubu, bežný člen svoj profil a licenciu. Členský zoznam sa cez verejné stránky nezverejňuje.', 'Server a databáza sa podľa informácie prevádzkovateľa nachádzajú v Nemecku. Umiestnenie servera samo osebe nepotvrdzuje miesto spracúvania u všetkých ďalších dodávateľov. Rozsah prístupu technického správcu, emailovej služby, záloh a prípadných ďalších sprostredkovateľov je potrebné doložiť a doplniť vyššie. Údaje môžu byť poskytnuté aj oprávneným orgánom, ak to vyžaduje konkrétna zákonná povinnosť.'],
      },
      { id: 'uchovavanie', title: 'Ako dlho sa údaje uchovávajú',
        paragraphs: ['Doby uchovávania sa vzťahujú aj na údaje v exportoch, emailoch a zálohách. Zrušenie prístupu do účtu neznamená automatické vymazanie všetkých členských záznamov. Konkrétne lehoty a pravidlá výmazu musí prevádzkovateľ doplniť podľa svojej evidencie a reálneho nastavenia systému.'],
        rows: [
          { label: 'Členská evidencia a účty', value: legalValue(config.retention.membership) },
          { label: 'Nedokončené a zamietnuté registrácie', value: legalValue(config.retention.applications) },
          { label: 'Licencie a ich história', value: legalValue(config.retention.licenses) },
          { label: 'Bezpečnostné a správcovské záznamy', value: legalValue(config.retention.securityLogs) },
          { label: 'Korešpondencia', value: legalValue(config.retention.correspondence) },
          { label: 'Zálohy a oneskorenie výmazu zo záloh', value: legalValue(config.retention.backups) },
        ],
      },
      { id: 'prava', title: 'Vaše práva a vybavenie žiadosti',
        paragraphs: ['Za podmienok GDPR môžete požiadať o prístup k údajom, ich opravu, vymazanie alebo obmedzenie spracúvania. Pri príslušnom právnom základe môžete mať právo na prenosnosť. Proti spracúvaniu založenému na oprávnenom záujme môžete namietať z dôvodov týkajúcich sa vašej konkrétnej situácie. Ak by sme spracúvali údaje na základe súhlasu, môžete ho odvolať bez spätného vplyvu na zákonnosť skoršieho spracúvania.', 'Žiadosť pošlite na kontakt pre ochranu údajov uvedený vyššie alebo na sídlo prevádzkovateľa. Uveďte, aké právo uplatňujete a ku ktorému účtu sa žiadosť vzťahuje. Pri odôvodnených pochybnostiach môžeme primerane overiť totožnosť. Heslo nám neposielajte.', 'Odpoveď poskytujeme spravidla bezplatne, bez zbytočného odkladu, najneskôr do jedného mesiaca. Ak je potrebné predĺženie najviac o ďalšie dva mesiace, v pôvodnej lehote oznámime dôvod. Výmaz môže byť obmedzený napríklad potrebou splniť zákonnú povinnosť alebo chrániť právne nároky.'],
        links: [{ label: 'Práva dotknutých osôb podľa ÚOOÚ SR', href: 'https://dataprotection.gov.sk/sk/dotknute-osoby/prava-dotknutych-osob-slovensko/' }, { label: 'Podanie sťažnosti alebo návrhu na ÚOOÚ SR', href: 'https://www.dataprotection.gov.sk/sk/urad/konanie-ochrane-osobnych-udajov/' }],
      },
      { id: 'deti', title: 'Maloletí členovia',
        paragraphs: ['Členská zóna je určená členom združenia. Ak je člen maloletý, je potrebné zohľadniť jeho vek, spôsobilosť na právne úkony, stanovy a prípadné zastúpenie zákonným zástupcom. Samotná registračná licencia nenahrádza overenie týchto podmienok.'],
        rows: [{ label: 'Postup pre maloletých a zákonných zástupcov', value: legalValue(config.minorsProcedure) }],
      },
      { id: 'rozhodovanie', title: 'Rozhodovanie a externé služby',
        paragraphs: ['Schválenie členstva a priradenie klubovej roly vykonáva poverená osoba. Automatická kontrola platnosti registračného kódu slúži na overenie pozvánky; nevykonávame profilovanie na reklamné účely.', 'Písmo, fotografie a obrazové snímky videa sa načítavajú z tohto webu. Odkazy na Google Maps, Unsplash alebo Pexels otvárajú služby iných prevádzkovateľov až po kliknutí. Ich následné spracúvanie sa riadi ich vlastnými informáciami o ochrane údajov.'],
      },
      { id: 'lokalny-vyvoj', title: 'Lokálna vývojová ukážka',
        paragraphs: ['Pri lokálnom vývoji sa používajú fiktívne členské údaje uložené v prehliadači. Úpravy sa uchovávajú v localStorage a prihlásenie v sessionStorage. Táto ukážka neodosiela členské údaje do produkčnej databázy a nie je určená na zadávanie skutočných osobných údajov alebo používaných hesiel. Produkčná členská zóna používa backend a prihlasovaciu reláciu. Podrobnosti o úložisku sú na stránke Cookies a úložisko.'],
      },
    ],
  },
  terms: {
    title: 'Pravidlá používania',
    description: 'Pravidlá verejného webu a prístupu členov združenia do členskej zóny.',
    sections: [
      operator,
      { id: 'ucel-webu', title: 'Účel webu a rozsah pravidiel',
        paragraphs: ['Web informuje o klube a podujatiach. Členská zóna slúži členom združenia na prístup k ich evidencii a povereným osobám na správu členov, registračných licencií, rolí a pretekov.', 'Tieto pravidlá upravujú používanie webu. Nenahrádzajú stanovy, rozhodnutie o prijatí za člena, športové pravidlá ani osobitné podmienky konkrétneho podujatia. Verejné informácie môžete prezerať bez vytvorenia účtu.'],
      },
      { id: 'registracia', title: 'Účet, licencia a členstvo',
        items: ['Účet si vytvára člen združenia s registračnou licenciou vystavenou na jeho meno a priezvisko. Kód je určený konkrétnej osobe a na jednorazové dokončenie registrácie.', 'Používajte správne a aktuálne údaje. Údaje iných osôb zadávajte iba s oprávnením. Vytvorenie účtu ani úspešné overenie kódu samo osebe nepotvrdzuje vznik alebo schválenie členstva.', 'Rozsah prístupu závisí od stavu členstva a pridelenej roly. Rolu a stav evidencie spravuje poverená osoba. Bežný člen upravuje vlastný telefón a štartové číslo.', 'Klubový registračný kód nenahrádza športovú licenciu, zdravotnú spôsobilosť, poistenie ani oprávnenie zúčastniť sa pretekov.', 'Pri maloletom členovi musí združenie pred zriadením účtu vyriešiť potrebné zastúpenie a podmienky podľa stanov. Podrobnosti sa uvádzajú v informáciách o ochrane údajov.'],
      },
      { id: 'bezpecnost', title: 'Bezpečnosť a povolené používanie',
        items: ['Chráňte heslo a registračný kód. Používajte vlastný účet, nezdieľajte prihlásenie a na cudzom zariadení sa odhláste. Podozrenie na zneužitie oznámte prevádzkovateľovi.', 'Nepokúšajte sa obchádzať oprávnenia, preberať cudzie účty, získavať členskú evidenciu bez poverenia alebo narúšať dostupnosť webu.', 'Poverení správcovia používajú údaje a exporty iba na účely združenia a v rozsahu svojich oprávnení. Export členského zoznamu nie je oprávnením zverejniť ho alebo použiť na súkromný marketing.', 'Pri dôvodnom podozrení na zneužitie môže byť prístup primerane obmedzený alebo dočasne pozastavený. S otázkou alebo námietkou sa môžete obrátiť na prevádzkovateľa. Obmedzenie účtu samo osebe nerozhoduje o členstve v združení.'],
      },
      { id: 'podujatia', title: 'Podujatia, poplatky a bezpečnosť na trati',
        paragraphs: ['Termín, miesto, program, vstupné a štartovné sa uvádzajú pri konkrétnom podujatí. Pred cestou si overte aktuálne oznámenie a pokyny organizátora. Zmeny počasia, trate alebo bezpečnostných podmienok môžu ovplyvniť priebeh podujatia.', 'Táto verzia webu nemá objednávkový formulár ani platobnú bránu. Informácia o poplatku alebo údaj o úhrade členského príspevku nie je online objednávkou. Externá registrácia môže mať vlastné podmienky, s ktorými sa oboznámite pred jej dokončením.', 'Účasť na motokrose vyžaduje dodržiavanie pokynov organizátora, ochrannú výstroj a príslušné oprávnenia. Tieto pravidlá webu nenahrádzajú bezpečnostné poučenie, prevádzkový poriadok trate, podmienky pretekov ani poistenie. Používanie webu nepredstavuje vzdanie sa nárokov pri úraze alebo škode.'],
      },
      { id: 'obsah', title: 'Obsah, fotografie a odkazy',
        paragraphs: ['Texty, grafika, fotografie a videá môžu byť chránené právami prevádzkovateľa alebo ďalších osôb. Ich použitie sa riadi príslušnou licenciou a zákonom. Samotná dostupnosť na webe neudeľuje neobmedzené právo obsah ďalej používať.', 'Ilustračné fotografie Maxa Leveridgea a John Bearby Images pochádzajú z Unsplash. Obrazové snímky motokrosového videa pochádzajú od autora Midtrack zo služby Pexels. Ilustračné zábery nezobrazujú automaticky klub, jeho členov ani jeho trať. Písmo Manrope sa poskytuje lokálne pod licenciou SIL Open Font License.', 'Externý odkaz vás presmeruje k inému prevádzkovateľovi. Tým nie sú dotknuté naše vlastné zákonné povinnosti týkajúce sa obsahu alebo spôsobu uvedenia odkazu. Ak namietate neoprávnené použitie fotografie alebo iného obsahu, kontaktujte prevádzkovateľa a označte konkrétny obsah.'],
        links: [{ label: 'Licencia fotografií Unsplash', href: 'https://unsplash.com/license' }, { label: 'Licencia videa Pexels', href: 'https://www.pexels.com/license/' }, { label: 'Licencia písma Manrope', href: '/fonts/OFL-Manrope.txt' }],
      },
      { id: 'dostupnost', title: 'Dostupnosť a zodpovednosť',
        paragraphs: ['Prevádzka webu môže byť prerušená pre údržbu, technickú poruchu alebo bezpečnostný zásah. Prevádzkovateľ môže opravovať neaktuálne informácie. Ak zistíte chybu v evidencii alebo ozname, oznámte ju na uvedený kontakt.', 'Tieto pravidlá nevylučujú ani neobmedzujú zodpovednosť, ktorú podľa platného práva nemožno vylúčiť alebo obmedziť. Nedotýkajú sa zákonných práv dotknutých osôb, spotrebiteľov ani práva obrátiť sa na príslušný orgán alebo súd.'],
      },
      { id: 'zmeny', title: 'Zmeny pravidiel a riešenie podnetov',
        paragraphs: ['Aktuálna verzia a dátum účinnosti sú uvedené na tejto stránke. Podstatné zmeny týkajúce sa účtu oznámime dotknutým členom primerane vopred. Nové pravidlá nemajú spätne meniť už vzniknuté práva alebo ukladať dodatočné platobné povinnosti.', 'Podnety k používaniu webu posielajte na kontakt prevádzkovateľa. Pravidlá sa riadia právom Slovenskej republiky pri zachovaní záväzných práv používateľa. Práva týkajúce sa osobných údajov a možnosť podať sťažnosť sú vysvetlené v samostatnom dokumente o ochrane osobných údajov.'],
      },
    ],
  },
  cookies: {
    title: 'Cookies a úložisko',
    description: 'Čo sa ukladá v prehliadači a ktoré služby sa načítavajú pri návšteve webu.',
    sections: [
      { id: 'prehlad', title: 'Aktuálna verzia webu',
        paragraphs: ['Táto verzia frontendu neobsahuje analytické nástroje, reklamné pixely ani vložené mapy či sociálne siete. Písmo, fotografie a snímky videa poskytuje priamo web. Externé mapy a zdroje fotografií sú obyčajné odkazy.', 'Produkčné prihlásenie používa reláciu spravovanú backendom. Názvy, účel, doménu a platnosť jeho cookies musí prevádzkovateľ overiť v produkčnom prostredí. Táto informácia zahŕňa aj prípadné ďalšie technické cookies hostingu alebo ochrany pred útokmi.'],
        rows: [{ label: 'Produkčné cookies a ich doba platnosti', value: legalValue(config.services.sessionCookies) }],
      },
      { id: 'nevyhnutne', title: 'Nevyhnutné technické uloženie',
        paragraphs: ['Prihlásená relácia slúži na rozpoznanie prihláseného člena a kontrolu prístupu. Bez potrebného technického uloženia nemusí členská zóna fungovať. Pri ukladaní nevyhnutnom pre službu, ktorú používateľ výslovne požaduje, zákon ustanovuje výnimku zo súhlasu.', 'Ak sa pridá analytika, reklama alebo iné úložisko, na ktoré sa výnimka nevzťahuje, musí sa vopred zabezpečiť platný súhlas a možnosť jeho odvolania. Také technológie sa nesmú spustiť pred potrebným súhlasom. Samotné pokračovanie v prehliadaní webu súhlas nepredstavuje.'],
        links: [{ label: 'Informácie slovenského regulačného úradu o cookies', href: 'https://www.teleoff.gov.sk/urad/odbory-oddelenia/odbor-statneho-dohladu-elektronickych-komunikacii/problematika-cookies/' }],
      },
      { id: 'vyvoj', title: 'Úložisko pri lokálnom vývoji',
        paragraphs: ['Nasledujúce položky používa iba vývojová ukážka s fiktívnymi údajmi. Nepoužívajú sa na produkčné prihlasovanie.'],
        rows: [
          { label: 'amk:local-data:v1 · localStorage', value: 'Fiktívni členovia, demo heslá, licencie, roly, preteky a lokálne záznamy. Uchováva sa bez automatického vypršania, kým údaje nevymažete alebo ich neodstráni prehliadač.' },
          { label: 'amk:local-session:v1 · sessionStorage', value: 'Identifikátor prihláseného demo člena v danej karte. Odstráni sa pri odhlásení alebo skončení relácie karty; obnova relácie prehliadača ho môže zachovať.' },
        ],
      },
      { id: 'sprava', title: 'Ako uložené údaje spravovať',
        paragraphs: ['Cookies a údaje konkrétneho webu môžete vymazať v nastaveniach prehliadača. Vývojové údaje môžete vymazať aj v nástrojoch pre vývojárov v častiach Local Storage a Session Storage. Vymazanie lokálnej ukážky nenahrádza žiadosť o vymazanie produkčných údajov.', 'Zablokovanie nevyhnutných cookies môže znemožniť prihlásenie. O právach k osobným údajom a kontaktoch prevádzkovateľa sa dočítate na stránke Ochrana osobných údajov.'],
      },
    ],
  },
}
