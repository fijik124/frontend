<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { api, json } from '../api'
import { useMembership } from '../stores/membership'
import { raceIsoDate, raceLocalDate } from '../stores/race'
import { emptyEvent, eventDate, eventDay, eventsOnDay, monthDays, upcomingEvents, validateEvent, type ClubEvent, type EventInput, type EventKind } from '../data/events'
import RaceIcon from './RaceIcon.vue'

const props = defineProps<{ kind: EventKind; manage?: boolean }>()
const { hasPermission } = useMembership()
const training = computed(() => props.kind === 'trainings')
const canEdit = computed(() => !!props.manage && hasPermission(training.value ? 'trainings.manage' : 'marshals.manage'))
const events = ref<ClubEvent[]>([])
const loading = ref(false), saving = ref(false), error = ref(''), message = ref('')
const today = ref(eventDay(new Date().toISOString()))
const month = ref(today.value.slice(0, 7)), selectedDay = ref('')
const days = computed(() => monthDays(month.value))
const monthLabel = computed(() => new Intl.DateTimeFormat('sk-SK', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(month.value + '-01T12:00:00Z')))
const upcoming = computed(() => upcomingEvents(events.value, today.value))
const visible = computed(() => selectedDay.value ? eventsOnDay(events.value, selectedDay.value) : upcoming.value)
const editor = ref<HTMLDialogElement | null>(null)
const editing = ref<ClubEvent | null>(null), draft = ref<EventInput>(emptyEvent())
const start = ref(''), end = ref(''), formError = ref('')
let timer: ReturnType<typeof setInterval> | undefined

async function load() {
  loading.value = true; error.value = ''
  try { events.value = await api<ClubEvent[]>('/' + props.kind) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Termíny sa nepodarilo načítať.' }
  finally { loading.value = false }
}
function moveMonth(step: number) {
  const date = new Date(month.value + '-01T12:00:00Z')
  date.setUTCMonth(date.getUTCMonth() + step)
  month.value = date.toISOString().slice(0, 7); selectedDay.value = ''
}
function edit(event?: ClubEvent) {
  editing.value = event ?? null
  if (event) { const { id: _id, version: _version, ...input } = event; draft.value = input }
  else draft.value = { ...emptyEvent(), title: training.value ? 'Tréning' : '' }
  start.value = event ? raceLocalDate(event.startsAt) : ''
  end.value = event ? raceLocalDate(event.endsAt) : ''
  formError.value = ''; message.value = ''
  editor.value?.showModal()
}
async function save() {
  if (!canEdit.value || saving.value) return
  formError.value = ''; saving.value = true
  try {
    const input: EventInput = { ...draft.value, title: draft.value.title.trim(), location: draft.value.location.trim(), startsAt: raceIsoDate(start.value), endsAt: raceIsoDate(end.value), cancellationReason: draft.value.cancelled ? draft.value.cancellationReason.trim() : '' }
    const invalid = validateEvent(input)
    if (invalid) throw new Error(invalid)
    const event = await api<ClubEvent>('/' + props.kind + (editing.value ? '/' + encodeURIComponent(editing.value.id) : ''), {
      ...json(editing.value ? 'PUT' : 'POST', input),
      ...(editing.value ? { headers: { 'If-Match': `"${editing.value.version}"` } } : {}),
    })
    events.value = [...events.value.filter(item => item.id !== event.id), event]
    month.value = eventDay(event.startsAt).slice(0, 7); selectedDay.value = eventDay(event.startsAt)
    editor.value?.close(); message.value = 'Termín bol uložený.'
  } catch (cause) { formError.value = cause instanceof Error ? cause.message : 'Termín sa nepodarilo uložiť.' }
  finally { saving.value = false }
}
onMounted(() => {
  void load()
  timer = setInterval(() => { today.value = eventDay(new Date().toISOString()) }, 60000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-6">
      <div><p class="eyebrow text-race">{{ training ? 'Čas na trať' : 'Spolu pri trati' }}</p><h1 class="heading-3 mt-3">{{ training ? 'Tréningy.' : 'Zóna traťových komisárov.' }}</h1><p class="body-3 mt-4 max-w-2xl text-ink/65">{{ training ? 'Najbližšie tréningové termíny a aktuálne zmeny. Pred cestou si skontroluj, či tréning nebol zrušený.' : 'Kalendár podujatí, kde budeme pôsobiť. Miesto stretnutia a pokyny pre náš tím na jednom mieste.' }}</p></div>
      <button v-if="canEdit" class="dashboard-primary" :disabled="loading || !!error" @click="edit()"><RaceIcon name="plus" />{{ training ? 'Pridať tréning' : 'Pridať podujatie' }}</button>
    </div>
    <p class="body-6 mt-4 text-ink/55">Všetky časy sú uvedené v časovom pásme Europe/Bratislava. {{ training ? '' : 'Interné informácie pre oprávnených členov tímu.' }}</p>
    <p v-if="message" class="dashboard-toast mt-6" role="status">{{ message }}</p>
    <p v-if="loading" class="body-3 mt-8" role="status">Načítavame termíny…</p>
    <div v-if="error" class="form-error mt-6" role="alert"><p>{{ error }}</p><button class="dashboard-secondary mt-4" @click="load">Skúsiť znova</button></div>
    <div v-if="!loading && !error" class="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section class="dashboard-card p-4 sm:p-6" aria-label="Kalendár podujatí">
        <div class="flex items-center justify-between gap-3"><button class="dashboard-secondary" aria-label="Predchádzajúci mesiac" @click="moveMonth(-1)"><RaceIcon class="rotate-180" /></button><h2 class="title-3 capitalize" aria-live="polite">{{ monthLabel }}</h2><button class="dashboard-secondary" aria-label="Nasledujúci mesiac" @click="moveMonth(1)"><RaceIcon /></button></div>
        <div class="body-6 mt-6 grid grid-cols-7 text-center"><span v-for="day in ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']" :key="day" class="py-2 text-ink/55">{{ day }}</span></div>
        <div class="grid grid-cols-7 gap-1">
          <template v-for="(day, index) in days" :key="index">
            <button v-if="day" class="calendar-day body-6" :class="{ 'is-selected': selectedDay === day, 'is-today': today === day }" :aria-pressed="selectedDay === day" :aria-current="today === day ? 'date' : undefined" :aria-label="`${day}, ${eventsOnDay(events, day).length} podujatí`" @click="selectedDay = selectedDay === day ? '' : day">
              <span>{{ Number(day.slice(-2)) }}</span><span v-if="eventsOnDay(events, day).length" class="calendar-count" :class="{ 'all-cancelled': eventsOnDay(events, day).every(event => event.cancelled) }" aria-hidden="true">{{ eventsOnDay(events, day).length }}</span>
            </button><span v-else></span>
          </template>
        </div>
        <p class="body-6 mt-4 text-ink/55">Číslo pod dátumom označuje počet podujatí. Sivé označenie znamená, že všetky sú zrušené.</p>
        <button class="dashboard-secondary mt-4" @click="month = today.slice(0, 7); selectedDay = ''">Dnes a najbližšie termíny</button>
      </section>
      <section class="min-w-0" aria-labelledby="event-list-title" aria-live="polite">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="event-list-title" class="heading-5">{{ selectedDay ? `Termíny: ${selectedDay.split('-').reverse().join('. ')}` : 'Najbližšie termíny' }}</h2><button v-if="selectedDay" class="dashboard-secondary" @click="selectedDay = ''">Všetky najbližšie</button></div>
        <div class="grid gap-4">
          <article v-for="event in visible" :key="event.id" class="dashboard-card p-6" :class="{ 'border-red-700/30': event.cancelled }">
            <div class="flex flex-wrap items-start justify-between gap-3"><h3 class="heading-5 min-w-0 break-words" :class="{ 'line-through': event.cancelled }">{{ event.title }}</h3><span class="body-6 rounded-sm px-3 py-1" :class="event.cancelled ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'">{{ event.cancelled ? (training ? 'Tréning zrušený' : 'Podujatie zrušené') : 'Plánované' }}</span></div>
            <p class="body-3 mt-4"><time :datetime="event.startsAt">{{ eventDate(event.startsAt) }}</time><template v-if="event.endsAt"><br />Do <time :datetime="event.endsAt">{{ eventDate(event.endsAt) }}</time></template></p>
            <p class="title-3 mt-3 break-words">{{ event.location }}</p>
            <p v-if="event.cancelled" class="body-3 mt-4 whitespace-pre-line break-words text-red-800">{{ event.cancellationReason || 'Termín bol zrušený organizátorom.' }}</p>
            <p v-if="event.meetingPoint" class="body-3 mt-4 whitespace-pre-line break-words"><strong>Miesto stretnutia:</strong> {{ event.meetingPoint }}</p>
            <p v-if="event.notes" class="body-3 mt-4 whitespace-pre-line break-words text-ink/65">{{ event.notes }}</p>
            <button v-if="canEdit" class="dashboard-secondary mt-6" :aria-label="'Upraviť termín: ' + event.title" @click="edit(event)">Upraviť / {{ event.cancelled ? 'obnoviť termín' : 'zrušiť termín' }}</button>
          </article>
          <div v-if="!visible.length" class="dashboard-card p-6"><h3 class="heading-5">{{ selectedDay ? 'Na tento deň nie je naplánované podujatie.' : (training ? 'Nové tréningy pripravujeme.' : 'Ďalšie podujatia pripravujeme.') }}</h3><p class="body-3 mt-4 text-ink/65">{{ selectedDay ? 'Vyber iný deň alebo zobraz všetky najbližšie termíny.' : 'Keď bude známy nový termín, nájdeš ho tu.' }}</p></div>
        </div>
      </section>
    </div>
    <dialog v-if="canEdit" ref="editor" class="member-dialog" aria-labelledby="event-editor-title" @cancel="saving && $event.preventDefault()">
      <form :inert="saving" :aria-busy="saving" @submit.prevent="save">
        <div class="flex items-start justify-between gap-4"><h2 id="event-editor-title" class="heading-5">{{ editing ? 'Upraviť termín' : (training ? 'Nový tréning' : 'Nové podujatie') }}</h2><button type="button" class="table-icon-button" aria-label="Zavrieť formulár" @click="editor?.close()">×</button></div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="form-label sm:col-span-2">Názov<input v-model="draft.title" class="form-input" required maxlength="120" /></label>
          <label class="form-label">Začiatok<input v-model="start" class="form-input" type="datetime-local" required /></label>
          <label class="form-label">Koniec (nepovinný)<input v-model="end" class="form-input" type="datetime-local" /></label>
          <p class="body-6 text-ink/55 sm:col-span-2">Dátum a čas v časovom pásme Europe/Bratislava.</p>
          <label class="form-label sm:col-span-2">Miesto konania<input v-model="draft.location" class="form-input" required maxlength="200" /></label>
          <label v-if="!training" class="form-label sm:col-span-2">Miesto stretnutia tímu<input v-model="draft.meetingPoint" class="form-input" maxlength="300" /></label>
          <label class="form-label sm:col-span-2">{{ training ? 'Podrobnosti k tréningu' : 'Pokyny, kontakt a čas zrazu' }}<textarea v-model="draft.notes" class="form-input min-h-24" maxlength="3000"></textarea></label>
          <label class="body-3 flex items-center gap-3 sm:col-span-2"><input v-model="draft.cancelled" type="checkbox" class="h-4 w-4 accent-race" />{{ training ? 'Tréning je zrušený' : 'Podujatie je zrušené' }}</label>
          <label v-if="draft.cancelled" class="form-label sm:col-span-2">Dôvod zrušenia<textarea v-model="draft.cancellationReason" class="form-input" maxlength="500"></textarea></label>
        </div>
        <p v-if="training" class="body-6 mt-4 text-ink/55">Všetky údaje tréningu budú verejné. Zrušený termín zostane viditeľný.</p>
        <p v-if="formError" class="form-error mt-4" role="alert">{{ formError }}</p>
        <div class="mt-6 flex flex-wrap justify-end gap-3"><button type="button" class="dashboard-secondary" @click="editor?.close()">Zavrieť bez uloženia</button><button class="dashboard-primary" type="submit">{{ saving ? 'Ukladáme…' : 'Uložiť termín' }}</button></div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.calendar-day { min-width: 0; min-height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 1px solid transparent; border-radius: 4px; }
.calendar-day:hover { background: #1818180d; }
.calendar-day.is-today { border-color: var(--color-race); }
.calendar-day.is-selected { background: var(--color-race); color: white; }
.calendar-count { font-size: 12px; line-height: 16px; min-width: 16px; border-radius: 4px; background: #181818; color: white; }
.calendar-count.all-cancelled { background: #e5e7eb; color: #374151; }
</style>
