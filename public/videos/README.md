# Real motocross footage

The incoming section transition uses captured frames from real footage.
The hero itself displays a static racing photograph.

- Creator: Midtrack
- Original: https://www.pexels.com/video/slow-motion-of-rider-on-motocross-track-10839355/
- License: https://www.pexels.com/license/
- Original video: 4096 × 2160, 30 fps
- Selected segment: 2.4s through 5.9s, showing flight, descent, and landing

`motocross-frames/frame-0000.jpg` through `frame-0105.jpg` are 106 real
frames captured from the same segment at 30 fps and 1280 × 675. Capture used
the browser's video decoder and canvas, with JPEG quality 0.8.

The original stock footage illustrates motocross; it does not depict the club
or its track. `SectionTransition.vue` draws these frames only as its section
enters the viewport. There is no idle playback. Focus points in
`src/data/motocrossSequence.ts` keep the rider to the right of the text.
