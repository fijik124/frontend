<script setup lang="ts">
import { computed } from 'vue'
import Hero from './Hero.vue'
import RaceIcon from './RaceIcon.vue'
import AppLink from './AppLink.vue'
import { useRaceSettings } from '../stores/race'
const { raceSettings, nextRace: race, fullRaceDate, raceMapUrl } = useRaceSettings()
const schedule = computed(() => raceSettings.value.schedule)
const heroTitle = computed(() => raceSettings.value.name.startsWith('Motokros ') ? ['Motokros', raceSettings.value.name.slice(9) + '.'] : [raceSettings.value.name])
const riderInfo = computed(() => [
  { label: 'Registrácia', detail: raceSettings.value.registrationOpen ? 'Registrácia je otvorená. Použi registračný odkaz nižšie a riaď sa pokynmi organizátora.' : 'Prihlasovanie zatiaľ nie je otvorené. Odkaz a termín registrácie zverejníme po potvrdení podujatia.' },
  { label: 'Kategórie a licencia', detail: raceSettings.value.categories || 'Zoznam kategórií, vekové limity a požiadavky na licenciu doplníme do oficiálnych propozícií.' },
  { label: 'Štartovné a doklady', detail: raceSettings.value.riderFee || 'Výšku štartovného a podmienky úhrady doplníme. Platbu neposielaj bez potvrdených pokynov organizátora.' },
  { label: 'Technické požiadavky', detail: raceSettings.value.requirements || 'Motocykel a ochranná výstroj musia spĺňať predpisy podujatia. Presný postup technickej kontroly doplníme.' },
])
</script>

<template>
  <main id="main-content">
    <div class="page-width flex flex-wrap items-center justify-between gap-4 py-6"><AppLink href="/" class="button-sm flex items-center gap-3 text-muted hover:text-white"><RaceIcon class="rotate-180" /> Späť na domov</AppLink><span class="caption-3 rounded-sm bg-race/10 px-3 py-2 text-[#fca692]">{{ raceSettings.confirmed ? 'Potvrdené podujatie' : 'Návrh podujatia · termín nie je potvrdený' }}</span></div>
    <Hero mode="next-race" :race="race" :title="heroTitle" :description="raceSettings.description" :race-confirmed="raceSettings.confirmed" accent-title="Buď pri tom." :primary-action="{ label: 'Informácie pre jazdcov', href: '#jazdci' }" :secondary-action="{ label: 'Program dňa', href: '#program' }" />
    <nav class="race-subnav bg-paper text-ink" aria-label="Informácie o pretekoch"><div class="page-width flex flex-wrap items-center gap-6 py-6"><span class="eyebrow mr-auto">Tvoj pretekový víkend</span><a href="#program" class="button-sm hover:text-race">Program</a><a href="#jazdci" class="button-sm hover:text-race">Pre jazdcov</a><a href="#divaci" class="button-sm hover:text-race">Pre divákov</a><a href="#miesto" class="button-sm hover:text-race">Miesto a kontakt</a></div></nav>
    <section class="page-width py-16 lg:py-24" aria-labelledby="race-overview">
      <p class="eyebrow text-race">Pretekový deň na jednom mieste</p>
      <div class="mt-4 grid gap-8 lg:grid-cols-2"><h2 id="race-overview" class="heading-2">Zvuk motorov.<br />Atmosféra, ktorá zostáva.</h2><div><p class="body-3 max-w-lg text-muted">{{ raceSettings.description }}</p><p class="body-6 mt-4 max-w-lg text-muted">{{ raceSettings.confirmed ? 'Termín je potvrdený. Pred cestou si skontroluj aktuálny harmonogram a pokyny organizátora.' : 'Táto stránka zatiaľ zobrazuje návrh podujatia. Dátum, časy, kategórie aj ceny potvrdíme v oficiálnych propozíciách.' }}</p></div></div>
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article class="world-card"><p class="eyebrow text-race">Kedy</p><h3 class="heading-5 mt-4">{{ fullRaceDate }}</h3><p class="body-6 mt-2 text-muted">{{ raceSettings.confirmed ? 'Potvrdený termín' : 'Ilustračný dátum, nepotvrdené' }}</p></article>
        <article class="world-card"><p class="eyebrow text-race">Kde</p><h3 class="heading-5 mt-4">{{ raceSettings.location }}</h3><p class="body-6 mt-2 text-muted">{{ raceSettings.address || 'Presný vstup do areálu doplníme' }}</p></article>
        <article class="world-card"><p class="eyebrow text-race">Organizátor</p><h3 class="heading-5 mt-4">OŠK AMK</h3><p class="body-6 mt-2 text-muted">Veľký Klíž, Slovensko</p></article>
        <article class="world-card"><p class="eyebrow text-race">Účasť</p><h3 class="heading-5 mt-4">{{ raceSettings.registrationOpen ? 'Registrácia otvorená' : 'Pripravujeme' }}</h3><p class="body-6 mt-2 text-muted">{{ raceSettings.registrationOpen ? 'Odkaz nájdeš v pokynoch pre jazdcov' : 'Registrácia zatiaľ nie je otvorená' }}</p></article>
      </div>
    </section>
    <section id="program" class="bg-paper py-16 text-ink lg:py-24" aria-labelledby="program-title">
      <div class="page-width grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p class="eyebrow text-race">01 / Od prvého štartu</p><h2 id="program-title" class="heading-2 mt-4">Program dňa.</h2><p class="body-6 mt-6 max-w-xs text-ink/65">Priebeh pretekového dňa. Riaď sa aktuálnym harmonogramom a pokynmi organizátora na mieste.</p><span class="caption-3 mt-6 inline-block rounded-sm bg-ink/5 px-3 py-2">{{ schedule.some(item => item.time) ? 'Aktuálny harmonogram' : 'Časy zatiaľ nie sú potvrdené' }}</span></div>
        <ol v-if="schedule.length" class="grid gap-3"><li v-for="(item, index) in schedule" :key="item.id" class="rounded-sm border border-ink/15 p-6"><div class="flex items-start gap-4"><span class="caption-3 mt-1 text-race">0{{ index + 1 }}</span><div><h3 class="title-3">{{ item.title }}</h3><p class="body-6 mt-2 whitespace-pre-line text-ink/65">{{ item.description }}</p><time v-if="item.time" class="caption-3 mt-3 inline-block text-race">{{ item.time }}</time><span v-else class="caption-4 mt-3 inline-block text-ink/55">Čas doplníme</span></div></div></li></ol>
        <div v-else class="rounded-sm border border-ink/15 p-8"><h3 class="heading-5">Program pripravujeme.</h3><p class="body-6 mt-4 text-ink/65">Harmonogram zverejníme pred podujatím.</p></div>
      </div>
    </section>
    <section id="jazdci" class="page-width py-16 lg:py-24" aria-labelledby="riders-title">
      <p class="eyebrow text-race">02 / Na štart pripravený</p><div class="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 id="riders-title" class="heading-2">Informácie pre jazdcov.</h2><span class="caption-3 rounded-sm border border-white/15 px-3 py-2 text-muted">{{ raceSettings.confirmed ? 'Pokyny organizátora' : 'Propozície pripravujeme' }}</span></div>
      <div class="mt-10 grid gap-4 md:grid-cols-2"><article v-for="(item, index) in riderInfo" :key="item.label" class="world-card"><span class="caption-3 text-race">0{{ index + 1 }}</span><h3 class="heading-5 mt-6">{{ item.label }}</h3><p class="body-6 mt-3 max-w-lg whitespace-pre-line text-muted">{{ item.detail }}</p></article></div>
      <a v-if="raceSettings.registrationOpen && raceSettings.registrationUrl" :href="raceSettings.registrationUrl" class="button-md mt-8 inline-flex items-center gap-6 rounded-sm bg-race px-3 py-2 text-white hover:bg-race-hover" target="_blank" rel="noopener noreferrer">Registrovať sa na preteky <RaceIcon name="external" /></a>
    </section>
    <section id="divaci" class="bg-surface py-16 lg:py-24" aria-labelledby="spectators-title">
      <div class="page-width grid gap-10 lg:grid-cols-2"><div class="overflow-hidden rounded-sm"><img src="/images/motocross-racing.jpg" alt="Ilustračná fotografia motokrosového jazdca v zákrute" class="h-full min-h-80 w-full object-cover" loading="lazy" /></div><div><p class="eyebrow text-race">03 / Najlepšie miesto pri trati</p><h2 id="spectators-title" class="heading-2 mt-4">Zaži to zblízka.</h2><div class="mt-8 grid gap-6"><article><h3 class="title-3">Vstup a vstupné</h3><p class="body-6 mt-2 whitespace-pre-line text-muted">{{ raceSettings.spectatorFee || 'Otváracie hodiny areálu, cenu vstupného a podmienky pre deti zverejníme pred podujatím.' }}</p></article><article><h3 class="title-3">Parkovanie a zázemie</h3><p class="body-6 mt-2 whitespace-pre-line text-muted">{{ raceSettings.parking || 'Pokyny k parkovaniu, občerstveniu a sociálnemu zázemiu doplníme do návštevníckych informácií.' }}</p></article><article><h3 class="title-3">Bezpečnosť pri trati</h3><p class="body-6 mt-2 text-muted">Zostaň vo vyznačených priestoroch pre divákov. Nevstupuj na trať a rešpektuj pokyny usporiadateľov.</p></article><article><h3 class="title-3">Počasie a zmeny programu</h3><p class="body-6 mt-2 text-muted">Pred odchodom si over aktuálne oznámenia. Harmonogram môže organizátor upraviť podľa podmienok.</p></article></div></div></div>
    </section>
    <section id="miesto" class="page-width grid gap-10 py-16 lg:grid-cols-2 lg:py-24" aria-labelledby="location-title">
      <div><p class="eyebrow text-race">04 / Cesta na preteky</p><h2 id="location-title" class="heading-2 mt-4">Vidíme sa<br />pri trati.</h2><p class="body-3 mt-6 max-w-sm text-muted">{{ raceSettings.location }}. {{ raceSettings.address || 'Presnú adresu vstupu do areálu a navigáciu na parkovisko doplníme po potvrdení podujatia.' }}</p><a class="button-md mt-8 inline-flex items-center gap-6 rounded-sm bg-race px-3 py-2 text-white hover:bg-race-hover" :href="raceMapUrl" target="_blank" rel="noopener noreferrer">{{ raceSettings.address ? 'Zobraziť areál na mape' : 'Zobraziť obec na mape' }} <RaceIcon name="external" /></a>
        <div v-if="raceSettings.contactEmail || raceSettings.contactPhone" class="mt-8"><h3 class="title-3">Kontakt na organizátora</h3><a v-if="raceSettings.contactEmail" class="body-6 mt-3 block break-all text-muted hover:text-race" :href="'mailto:' + raceSettings.contactEmail">{{ raceSettings.contactEmail }}</a><a v-if="raceSettings.contactPhone" class="body-6 mt-3 block text-muted hover:text-race" :href="'tel:' + raceSettings.contactPhone.replace(/[^+\d]/g, '')">{{ raceSettings.contactPhone }}</a></div>
      </div><div class="race-location-card flex flex-col justify-between rounded-sm border border-white/15 bg-surface p-8"><RaceIcon name="pin" class="h-12 w-12 text-race" /><div class="my-10"><p class="eyebrow text-muted">{{ raceSettings.location }}</p><h3 class="heading-3 mt-4">Tu sa stretneme.</h3></div><p class="caption-4 text-muted">{{ raceSettings.address || 'Mapa obce neurčuje presný vstup na trať.' }}</p></div>
    </section>
    <section class="bg-race py-16 text-white"><div class="page-width flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p class="eyebrow">Sleduj potvrdené informácie</p><h2 class="heading-3 mt-4">Vidíme sa pri štartovacej bráne.</h2></div><AppLink href="/" class="button-md inline-flex items-center gap-6 self-start rounded-sm bg-white px-3 py-2 text-ink md:self-auto">Spoznaj náš klub <RaceIcon /></AppLink></div></section>
  </main>
</template>

