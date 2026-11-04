import type { HeroFrameSequence } from '../types/hero'

// 106 frames captured at 30 fps from the real clip's 2.4s–5.9s jump and landing.
export const motocrossSequence: HeroFrameSequence = {
  basePath: '/videos/motocross-frames',
  frameCount: 106,
  fps: 30,
  focus: [
    { progress: 0, x: .52 },
    { progress: .28, x: .62 },
    { progress: .56, x: .72 },
    { progress: .71, x: .8 },
    { progress: .85, x: .84 },
    { progress: 1, x: .8 },
  ],
}
