<script setup lang="ts">
import { computed, ref } from 'vue'

const cislo = ref(0)
const mojstring = ref('Jakubko vie matiku pozri sa na to:')

function krat5() {
  cislo.value *= 5
}

function deleno5() {
  cislo.value /= 5
}

const cisloClass = computed(() =>
  cislo.value >= 0 ? 'text-emerald-400' : 'text-rose-400',
)

const incrementHidden = computed(() => cislo.value > 5)
const decrementHidden = computed(() => cislo.value < -5)

function formatNumber(value: number) {
  return Number.isInteger(value) ? value : value.toFixed(2)
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-slate-100 sm:px-8 lg:px-12">
    <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"></div>

    <div class="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
      <section class="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">
        <div class="flex flex-col justify-between border-b border-white/10 p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <div>
            <div class="mb-12 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
                <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 3h12M6 21h12M8 3v4l8 10v4M16 3v4L8 17v4" />
                </svg>
              </div>
              <span class="text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase">Matika lab</span>
            </div>

            <p class="mb-4 text-sm font-medium text-cyan-300">{{ mojstring }}</p>
            <h1 class="max-w-md text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Malé kroky.<br />
              <span class="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Veľké čísla.</span>
            </h1>
            <p class="mt-6 max-w-sm text-base leading-7 text-slate-400">
              Experimentuj s číslami, násob a deľ. Tvoj výsledok sa zmení okamžite.
            </p>
          </div>

          <div class="mt-12 flex items-center gap-2 text-xs text-slate-500">
            <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            Kalkulátor je pripravený
          </div>
        </div>

        <div class="bg-slate-900/40 p-7 sm:p-10">
          <div class="mb-8 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold tracking-widest text-slate-500 uppercase">Aktuálna hodnota</p>
              <p class="mt-1 text-sm text-slate-400">Vyber si operáciu</p>
            </div>
            <button
              class="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              @click="cislo = 0"
            >
              Reset
            </button>
          </div>

          <div class="mb-8 rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-center">
            <p class="mb-2 text-xs font-medium text-slate-500">Výsledok</p>
            <p :class="['text-7xl font-bold tracking-tighter transition-colors sm:text-8xl', cisloClass]">
              {{ formatNumber(cislo) }}
            </p>
            <div class="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span class="h-px w-8 bg-white/10"></span>
              Druhá mocnina: <span class="font-semibold text-slate-300">{{ formatNumber(cislo * cislo) }}</span>
              <span class="h-px w-8 bg-white/10"></span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              class="group rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-4 text-sm font-semibold text-violet-200 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/20 active:translate-y-0"
              @click="krat5"
            >
              <span class="mb-1 block text-xl text-violet-300">×5</span>
              Krát päť
            </button>
            <button
              class="group rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-4 text-sm font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/20 active:translate-y-0"
              @click="deleno5"
            >
              <span class="mb-1 block text-xl text-cyan-300">÷5</span>
              Deleno päť
            </button>
            <button
              :class="{ 'pointer-events-none opacity-30': incrementHidden }"
              class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
              @click="cislo++"
            >
              Pripočítať <span class="text-slate-500">+1</span>
            </button>
            <button
              :class="{ 'pointer-events-none opacity-30': decrementHidden }"
              class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
              @click="cislo--"
            >
              Odčítať <span class="text-slate-500">−1</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
