export type HeroMode = 'main' | 'next-race'

export interface HeroFrameSequence {
  /** Directory containing frame-0000.jpg, frame-0001.jpg, etc. */
  basePath: string
  frameCount: number
  fps?: number
  /** Track the rider's horizontal position in the source footage (0 to 1). */
  focus?: Array<{ progress: number; x: number }>
}

export interface HeroAction {
  label: string
  /** Render a link when provided; otherwise emit an action event from a button. */
  href?: string
}

export interface HeroPhotoCredit {
  author: string
  href: string
  source?: string
}

export interface HeroRace {
  name: string
  location?: string
  series?: string
  /** ISO 8601 date with an explicit offset, for example 2027-05-16T09:00:00+02:00. */
  startsAt?: string
  timeZone?: string
}
