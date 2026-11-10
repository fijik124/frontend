<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import Hero from "./Hero.vue";
import SectionTransition from "./SectionTransition.vue";
import RaceIcon from "./RaceIcon.vue";
import { navigate } from "../composables/useAppRouter";
import { useRaceSettings } from "../stores/race";
import type { HeroMode } from "../types/hero";

// Change the initial mode here, or control it from your page/CMS.
const heroMode = ref<HeroMode>("main");
const galleryDialog = ref<HTMLDialogElement | null>(null);
const photoIndex = ref(0);
const photos = [
  {
    src: "/images/motocross-racing.jpg",
    title: "Každá zákruta má svoj príbeh.",
    author: "Max Leveridge",
    href: "https://unsplash.com/photos/a-person-riding-a-dirt-bike-on-a-dirt-track-MqbOIZ0XXvY",
    alt: "Motokrosový jazdec v zákrute s prúdom hliny za zadným kolesom",
  },
  {
    src: "/images/motocross-hero.jpg",
    title: "Ten moment, keď ide všetko bokom.",
    author: "John Bearby Images",
    href: "https://unsplash.com/photos/a-man-riding-a-dirt-bike-hGqtVjD1p0Q",
    alt: "Motokrosový jazdec vo vzduchu nad hlinenou traťou",
  },
];
const questions = computed(() => [
  {
    question: "Kedy sa konajú najbližšie preteky?",
    answer: raceSettings.value.confirmed
      ? "Potvrdený termín je " +
        fullRaceDate.value +
        ". Aktuálny program a pokyny nájdeš na stránke Preteky."
      : "Oficiálny termín ešte nie je potvrdený. Zobrazený dátum je ilustračný. Potvrdený termín a program zverejníme na stránke Preteky.",
  },
  {
    question: "Kde nájdem Veľký Klíž?",
    answer:
      "Obec Veľký Klíž sa nachádza v okrese Partizánske. Odkaz na mapu nájdeš nižšie. Presný vstup do areálu a možnosti parkovania doplníme k potvrdenému podujatiu.",
  },
  {
    question: "Čo potrebujem vedieť ako jazdec?",
    answer:
      "Podmienky účasti, registráciu, kategórie a technické požiadavky zverejníme spolu s oficiálnymi propozíciami pretekov. Pred cestou si vždy over aktuálne pokyny organizátora.",
  },
  {
    question: "Môžem prísť aj ako divák?",
    answer:
      "Informácie o vstupnom, otváracích hodinách a zázemí pre divákov doplníme po potvrdení podujatia.",
  },
]);

// Illustrative event only. Replace with the club's confirmed race details.
const { raceSettings, nextRace, raceDay, raceMonth, fullRaceDate } =
  useRaceSettings();
function setMode(mode: HeroMode) {
  void navigate(mode === "main" ? "/" : "/preteky");
}
function openPhoto(index: number) {
  photoIndex.value = index;
  galleryDialog.value?.showModal();
}
function movePhoto(direction: number) {
  photoIndex.value =
    (photoIndex.value + direction + photos.length) % photos.length;
}
let observer: IntersectionObserver | undefined;
onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 },
  );
  document
    .querySelectorAll(".reveal-word")
    .forEach((word) => observer?.observe(word));
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <main id="main-content">
    <Hero
      :mode="heroMode"
      :race="nextRace"
      :primary-action="
        heroMode === 'main'
          ? { label: 'Vstúp do nášho sveta', href: '#o-klube' }
          : { label: 'Pozri informácie', href: '#podujatie' }
      "
      :secondary-action="{
        label:
          heroMode === 'main' ? 'Najbližšie preteky' : 'Späť do nášho sveta',
      }"
      @secondary-action="setMode(heroMode === 'main' ? 'next-race' : 'main')"
    />
    <div
      class="manifesto-strip overflow-hidden bg-race py-4 text-white"
      aria-label="Pre jazdcov. Pre fanúšikov. Pre motokros."
    >
      <div
        class="page-width flex items-center justify-between gap-8 whitespace-nowrap"
      >
        <span class="title-3 flex items-center gap-4"
          ><span class="checkered-mark" aria-hidden="true"></span> Pre
          jazdcov.</span
        >
        <span class="title-3 flex items-center gap-4"
          ><span class="checkered-mark" aria-hidden="true"></span> Pre
          fanúšikov.</span
        >
        <span class="title-3 flex items-center gap-4"
          ><span class="checkered-mark" aria-hidden="true"></span> Pre
          motokros.</span
        >
        <span class="caption-3 hidden lg:block">Jeden klub. Jedna vášeň.</span>
      </div>
    </div>
    <section
      id="podujatie"
      class="bg-paper py-12 text-ink lg:py-16"
      aria-labelledby="race-heading"
    >
      <div
        class="page-width grid items-center gap-8 lg:grid-cols-[.7fr_1.5fr_1fr]"
      >
        <div>
          <p class="eyebrow text-race">Ďalšia zastávka</p>
          <h2 id="race-heading" class="heading-4 mt-3">
            Stretneme sa<br />pri trati.
          </h2>
        </div>
        <div class="flex items-center gap-6">
          <div class="race-date shrink-0">
            <span class="heading-2 block">{{ raceDay }}</span
            ><span class="caption-3 uppercase">{{ raceMonth }}</span>
          </div>
          <div>
            <span
              class="caption-3 inline-flex rounded-sm bg-ink/5 px-2 py-1 text-ink/70"
              >{{
                raceSettings.confirmed
                  ? "Potvrdené podujatie"
                  : "Ilustračný termín"
              }}</span
            >
            <h3 class="heading-5 mt-3">{{ raceSettings.name }}</h3>
            <p class="body-6 mt-2 flex items-center gap-2 text-ink/65">
              <RaceIcon name="pin" /> {{ raceSettings.location }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-start gap-3 lg:items-end">
          <button
            class="button-md inline-flex items-center gap-8 rounded-sm bg-ink px-3 py-2 text-white hover:bg-surface active:scale-[.98]"
            @click="setMode('next-race')"
          >
            Všetko o pretekoch <RaceIcon />
          </button>
          <p class="caption-5 text-ink/65">
            {{
              raceSettings.confirmed
                ? "Aktuálny program a pokyny na stránke pretekov."
                : "Oficiálny dátum a program pripravujeme."
            }}
          </p>
        </div>
      </div>
    </section>
    <SectionTransition>
      <section
        id="o-klube"
        class="club-section page-width relative z-10"
        aria-labelledby="club-heading"
      >
        <div class="club-copy">
          <p class="eyebrow flex items-center gap-3 text-race">
            <span class="section-number">01</span> Toto sme my
          </p>
          <h2 id="club-heading" class="heading-2 mt-8">
            <span class="reveal-word">Spoznaj </span>
            <span class="reveal-word">našu </span>
            <span class="reveal-word">lásku k</span><br /><span
              class="reveal-word"
              >Motokrosu </span
            >
          </h2>
          <p class="body-3 mt-6 max-w-sm text-muted">
            Hlina na topánkach. Zvuk motorov. Ľudia, ktorích to naplná. Sme
            OŠK AMK Veľký Klíž a motokros je náš spoločný jazyk.
          </p>
          <p class="body-6 mt-4 max-w-sm text-muted">
            Za každým štartom stoja jazdci, fanúšikovia a partia, ktorá drží
            spolu. Na trati aj mimo nej.
          </p>
          <a
            href="#nas-svet"
            class="button-sm mt-8 inline-flex items-center gap-6 text-white hover:text-race"
            >Spoznaj náš svet <RaceIcon
          /></a>
        </div>
        <div class="club-scene-label caption-4">
          <span class="h-1 w-1 bg-race"></span> Vášeň, ktorá nás ženie dopredu.
        </div>
      </section>
    </SectionTransition>
    <section
      id="nas-svet"
      class="page-width py-16 lg:py-24"
      aria-labelledby="world-heading"
    >
      <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p class="eyebrow text-race">02 / Jeden spoločný svet</p>
          <h2 id="world-heading" class="heading-2 mt-4">
            Motokros je o ľuďoch.
          </h2>
        </div>
        <p class="body-6 max-w-xs text-muted">
          Od prvého otočenia plynom až po poslednú vlajku. Každý tu má svoje
          miesto.
        </p>
      </div>
      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <article class="world-card">
          <span class="caption-3 text-race">01 / Na štarte</span
          ><RaceIcon name="helmet" class="my-8 h-12 w-12" />
          <h3 class="heading-5">Pre jazdcov.</h3>
          <p class="body-6 mt-3 text-muted">
            Sústredenie za okuliarmi. Rešpekt k trati. Chuť posunúť vlastné
            hranice s každým ďalším kolom.
          </p>
        </article>
        <article class="world-card">
          <span class="caption-3 text-race">02 / Pri trati</span
          ><RaceIcon name="flag" class="my-8 h-12 w-12" />
          <h3 class="heading-5">Pre fanúšikov.</h3>
          <p class="body-6 mt-3 text-muted">
            Najlepší výhľad nie je z gauča. Zaži súboje zblízka a atmosféru,
            ktorú cez obrazovku nepocítiš.
          </p>
        </article>
        <article class="world-card">
          <span class="caption-3 text-race">03 / Spolu</span
          ><RaceIcon name="people" class="my-8 h-12 w-12" />
          <h3 class="heading-5">Pre našu partiu.</h3>
          <p class="body-6 mt-3 text-muted">
            Motokros nás dal dokopy. Spoločné víkendy, rozhovory v depe a
            zážitky, ktoré si vezmeš domov.
          </p>
        </article>
      </div>
    </section>
    <section
      id="galeria"
      class="bg-paper py-16 text-ink lg:py-24"
      aria-labelledby="gallery-heading"
    >
      <div class="page-width">
        <div
          class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p class="eyebrow text-race">03 / Zblízka a naplno</p>
            <h2 id="gallery-heading" class="heading-2 mt-4">
              Toto sa nedá opísať.
            </h2>
          </div>
          <p class="body-6 max-w-xs text-ink/65">
            Tak ti to ukážeme.<br />Dva pohľady na svet motokrosu.
          </p>
        </div>
        <div class="mt-10 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <button
            v-for="(photo, index) in photos"
            :key="photo.src"
            class="gallery-card group text-left"
            :aria-label="'Zväčšiť fotografiu: ' + photo.alt"
            @click="openPhoto(index)"
          >
            <div class="relative overflow-hidden rounded-sm bg-surface">
              <img
                :src="photo.src"
                :alt="photo.alt"
                loading="lazy"
                class="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-race group-hover:scale-105"
              /><span
                class="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-sm bg-paper text-ink"
                ><RaceIcon name="expand"
              /></span>
            </div>
            <div class="mt-4 flex items-start justify-between gap-4">
              <h3 class="title-3">{{ photo.title }}</h3>
              <span class="caption-4 shrink-0 text-ink/60"
                >0{{ index + 1 }}</span
              >
            </div>
          </button>
        </div>
        <p class="caption-5 mt-6 text-ink/60">
          Ilustračné fotografie motokrosu · Max Leveridge a John Bearby Images /
          Unsplash
        </p>
      </div>
    </section>
    <section
      id="informacie"
      class="page-width grid gap-10 py-16 lg:grid-cols-[.8fr_1.2fr] lg:py-24"
      aria-labelledby="faq-heading"
    >
      <div>
        <p class="eyebrow text-race">04 / Predtým, než vyrazíš</p>
        <h2 id="faq-heading" class="heading-2 mt-4">Dobre vedieť.</h2>
        <p class="body-6 mt-6 max-w-xs text-muted">
          Všetko podstatné pre prvú návštevu aj ďalší pretekový víkend.
        </p>
      </div>
      <div class="grid gap-3">
        <details
          v-for="(item, index) in questions"
          :key="item.question"
          class="faq-item rounded-sm border border-white/10 bg-surface px-6"
        >
          <summary
            class="title-3 flex cursor-pointer items-center justify-between gap-4 py-6"
          >
            <span class="flex gap-4"
              ><span class="caption-4 mt-1 text-race">0{{ index + 1 }}</span
              >{{ item.question }}</span
            ><span class="faq-plus shrink-0" aria-hidden="true">+</span>
          </summary>
          <p class="body-6 pb-6 text-muted">{{ item.answer }}</p>
        </details>
      </div>
    </section>
    <section
      class="bg-race py-16 text-white lg:py-20"
      aria-labelledby="contact-heading"
    >
      <div
        class="page-width flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
      >
        <div>
          <p class="eyebrow text-white/80">Motory stíchnu. Zážitky zostanú.</p>
          <h2 id="contact-heading" class="heading-1 mt-6">
            Vidíme sa<br />na štarte.
          </h2>
        </div>
        <div class="max-w-sm">
          <p class="body-3">
            Príď zažiť motokros do Veľkého Klíža.<br />My už sa nevieme dočkať.
          </p>
          <a
            class="button-md mt-6 inline-flex items-center gap-8 rounded-sm bg-white px-3 py-2 text-ink hover:bg-paper active:scale-[.98]"
            href="https://www.google.com/maps/search/?api=1&amp;query=Ve%C4%BEk%C3%BD+Kl%C3%AD%C5%BE+Slovensko"
            target="_blank"
            rel="noopener noreferrer"
            >Nájdi obec na mape <RaceIcon name="external"
          /></a>
          <p class="caption-5 mt-3 text-white/80">
            Presné pokyny k areálu doplníme pred podujatím.
          </p>
        </div>
      </div>
    </section>
  </main>
  <dialog
    ref="galleryDialog"
    class="photo-dialog"
    aria-label="Fotogaléria"
    @click="$event.target === galleryDialog && galleryDialog?.close()"
    @keydown.esc.prevent="galleryDialog?.close()"
    @keydown.right="movePhoto(1)"
    @keydown.left="movePhoto(-1)"
  >
    <div class="relative mx-auto w-full max-w-6xl">
      <div class="mb-4 flex items-center justify-between gap-4">
        <span class="caption-3">Galéria / 0{{ photoIndex + 1 }}</span
        ><button
          class="button-sm flex items-center gap-3 rounded-sm px-3 py-2 hover:bg-white/10"
          autofocus
          @click="galleryDialog?.close()"
        >
          Zavrieť <span aria-hidden="true">×</span>
        </button>
      </div>
      <img
        :src="photos[photoIndex]!.src"
        :alt="photos[photoIndex]!.alt"
        class="max-h-[70svh] w-full rounded-sm object-contain"
      />
      <div class="mt-6 flex items-center justify-between gap-4">
        <div>
          <h2 class="title-3">{{ photos[photoIndex]!.title }}</h2>
          <a
            class="caption-4 mt-2 inline-block text-muted hover:text-white"
            :href="photos[photoIndex]!.href"
            target="_blank"
            rel="noopener noreferrer"
            >Foto: {{ photos[photoIndex]!.author }} / Unsplash</a
          >
        </div>
        <div class="flex gap-3">
          <button
            class="icon-button"
            aria-label="Predchádzajúca fotografia"
            @click="movePhoto(-1)"
          >
            <RaceIcon class="rotate-180" /></button
          ><button
            class="icon-button"
            aria-label="Nasledujúca fotografia"
            @click="movePhoto(1)"
          >
            <RaceIcon />
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>
