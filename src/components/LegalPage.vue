<script setup lang="ts">
import { computed } from 'vue'
import AppLink from './AppLink.vue'
import { legalDocuments, legalNavigation, type LegalDocumentId } from '../data/legal'
import { legalConfig, legalReady, legalValue } from '../config/legal'

const props = defineProps<{ document: LegalDocumentId }>()
const content = computed(() => legalDocuments[props.document])
const isDevelopment = import.meta.env.DEV
</script>

<template>
  <main id="main-content" class="mt-8 bg-paper py-12 text-ink sm:py-16">
    <div class="page-width">
      <div class="mx-auto max-w-6xl">
        <AppLink href="/" class="button-sm text-race underline underline-offset-4 hover:text-race-hover">Späť na úvod</AppLink>
        <header class="mt-8 max-w-2xl">
          <p class="eyebrow text-race">OŠK AMK Veľký Klíž / Právne informácie</p>
          <h1 class="heading-2 mt-4">{{ content.title }}</h1>
          <p class="body-3 mt-6 text-ink/70">{{ content.description }}</p>
          <p class="caption-4 mt-6 text-ink/60">Verzia {{ legalConfig.version }} · Účinnosť: {{ legalValue(legalConfig.effectiveDate) }}</p>
        </header>
        <aside v-if="!legalReady" class="body-6 mt-8 rounded-sm border border-amber-700/30 bg-amber-50 p-6 text-amber-950" aria-label="Stav dokumentu">
          <p class="title-3">Návrh pred zverejnením</p>
          <p class="mt-2">Prevádzkovateľ ešte musí doplniť označené údaje, potvrdiť skutočné nastavenie služieb a schváliť konečné znenie. Tento návrh nie je potvrdením úplného právneho súladu.</p>
        </aside>
        <p v-if="isDevelopment" class="body-6 mt-6 rounded-sm border border-ink/15 p-4">Lokálna vývojová ukážka používa iba fiktívne údaje v tomto prehliadači. Informácie o produkcii sa vzťahujú na nasadenú členskú zónu.</p>
        <nav aria-label="Súvisiace dokumenty" class="body-6 mt-8 flex flex-wrap gap-4">
          <AppLink v-for="item in legalNavigation" :key="item.id" :href="item.href" class="rounded-sm border border-ink/20 px-3 py-2 hover:bg-ink/5 active:scale-[.98]" :class="item.id === document ? 'bg-ink text-white hover:bg-ink' : ''">{{ item.label }}</AppLink>
        </nav>
        <div class="mt-12 grid items-start gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <nav aria-label="Obsah dokumentu" class="rounded-sm border border-ink/15 p-6 lg:sticky lg:top-8">
            <p class="title-3">V tomto dokumente</p>
            <ol class="body-6 mt-4 space-y-4">
              <li v-for="(section, index) in content.sections" :key="section.id"><a :href="`#${section.id}`" class="flex gap-3 text-ink/70 hover:text-race"><span class="caption-4 mt-1 text-race" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>{{ section.title }}</a></li>
            </ol>
          </nav>
          <article :aria-label="content.title" class="min-w-0 space-y-12">
            <section v-for="(section, index) in content.sections" :id="section.id" :key="section.id" :aria-labelledby="`${section.id}-heading`" class="scroll-mt-8">
              <p class="caption-3 text-race" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</p>
              <h2 :id="`${section.id}-heading`" class="heading-5 mt-2">{{ section.title }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph" class="body-3 mt-4 text-ink/80">{{ paragraph }}</p>
              <ul v-if="section.items" class="body-3 mt-4 list-disc space-y-4 pl-6 text-ink/80"><li v-for="item in section.items" :key="item">{{ item }}</li></ul>
              <dl v-if="section.rows" class="body-6 mt-6 space-y-4 rounded-sm border border-ink/15 bg-white p-6">
                <div v-for="row in section.rows" :key="row.label" class="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)]"><dt class="font-semibold">{{ row.label }}</dt><dd class="min-w-0 break-words" :class="row.value === 'Doplniť pred zverejnením' ? 'text-amber-800' : 'text-ink/75'">{{ row.value }}</dd></div>
              </dl>
              <ul v-if="section.links" class="body-6 mt-6 space-y-4"><li v-for="link in section.links" :key="link.href"><a :href="link.href" target="_blank" rel="noopener noreferrer" class="text-race underline underline-offset-4 hover:text-race-hover">{{ link.label }} <span class="sr-only">(otvorí sa v novej karte)</span></a></li></ul>
            </section>
          </article>
        </div>
      </div>
    </div>
  </main>
</template>
