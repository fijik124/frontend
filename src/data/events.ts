import { raceLocalDate } from '../stores/race'

export type EventKind = 'trainings' | 'marshal-events'
export interface EventInput {
  title: string
  startsAt: string
  endsAt: string
  location: string
  meetingPoint: string
  notes: string
  cancelled: boolean
  cancellationReason: string
}
export interface ClubEvent extends EventInput { id: string; version: number }
export const emptyEvent = (): EventInput => ({ title: '', startsAt: '', endsAt: '', location: '', meetingPoint: '', notes: '', cancelled: false, cancellationReason: '' })
export const eventDay = (iso: string) => raceLocalDate(iso).slice(0, 10)
export const eventDate = (iso: string) => new Intl.DateTimeFormat('sk-SK', { timeZone: 'Europe/Bratislava', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

export function validateEvent(input: EventInput): string {
  for (const [field, max] of [['title', 120], ['location', 200], ['meetingPoint', 300], ['notes', 3000], ['cancellationReason', 500]] as const) {
    if (typeof input[field] !== 'string' || input[field].length > max) return 'Skontroluj dĺžku a obsah polí podujatia.'
  }
  if (!input.title.trim() || !input.location.trim()) return 'Vyplň názov a miesto konania.'
  const validDate = (value: string) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value.slice(0, 10) + 'T00:00:00Z').toISOString().slice(0, 10) === value.slice(0, 10)
  if (!validDate(input.startsAt) || (input.endsAt !== '' && !validDate(input.endsAt))) return 'Zadaj platný dátum a čas.'
  if (input.endsAt && Date.parse(input.endsAt) <= Date.parse(input.startsAt)) return 'Koniec musí byť neskôr ako začiatok.'
  if (typeof input.cancelled !== 'boolean') return 'Vyber platný stav podujatia.'
  return ''
}

export function upcomingEvents(events: ClubEvent[], today: string) {
  return events.filter(event => eventDay(event.endsAt || event.startsAt) >= today).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}
export function monthDays(month: string) {
  const [year, number] = month.split('-').map(Number) as [number, number]
  const first = new Date(Date.UTC(year, number - 1, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate()
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1
    return day > 0 && day <= count ? `${month}-${String(day).padStart(2, '0')}` : ''
  })
}
export const eventsOnDay = (events: ClubEvent[], day: string) => events.filter(event => eventDay(event.startsAt) <= day && eventDay(event.endsAt || event.startsAt) >= day).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
