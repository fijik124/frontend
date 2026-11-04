# frontend

## Motorsport hero

`src/components/Hero.vue` supports `mode="main"` and `mode="next-race"`.
`src/App.vue` demonstrates switching between them and contains the sample race data.
The sample date is illustrative; replace it with the club's confirmed event.

```vue
<Hero
  mode="next-race"
  :race="{
    name: 'Your race name',
    location: 'Your circuit',
    startsAt: '2027-05-16T09:00:00+02:00',
    timeZone: 'Europe/Bratislava',
  }"
  :primary-action="{ label: 'Race information', href: '/races/your-race' }"
/>
```

Customize `eyebrow`, `title` (an array of lines), `accentTitle`, `description`,
`image`, `imageAlt`, and `imagePosition` through props. Both action props accept
`{ label, href? }`; omit `href` to render a button and handle `@primary-action`
or `@secondary-action`. Types are exported from `src/types/hero.ts`.

The race view includes a live countdown. Missing/invalid dates show a pending
message; after the start it shows that the event has started. Use an ISO date
with a timezone offset. Timers are cleaned up on mode changes and unmount.
The design supports narrow screens, keyboard focus, and reduced motion.
Photograph attribution is in `public/images/README.md`.
The linked photo credit appears at the bottom right of the hero. Pass
`photoCredit: { author, href, source? }` for a replacement image, or `null` to
hide the credit. The default photo is credited to Max Leveridge on Unsplash.

### Motion and scroll transition

The hero is a static racing photograph. It has no autoplay, scroll animation,
or entrance animation. Motion belongs to the separate `SectionTransition.vue`
component, which reveals the next section as it enters the viewport. An angled
edge opens, the incoming content settles into place, and 106 captured motocross
frames carry the rider through to a landing on the right.

Keep the hero and the incoming section as siblings:

```vue
<Hero mode="main" />
<SectionTransition>
  <section class="your-next-section">Your next section</section>
</SectionTransition>
```

`Hero` accepts `image`, `imageAlt`, and `imagePosition` for its photograph.
`SectionTransition` accepts `sequence` (`basePath`, `frameCount`, optional `fps`
and horizontal `focus` points). Frames follow `frame-0000.jpg`, `frame-0001.jpg`,
etc. The current sequence is configured in `src/data/motocrossSequence.ts`.
Set `:animated="false"` on `SectionTransition` to show its final still;
reduced-motion preferences also show the final still without motion.

Frames load around the current position with a bounded decoded-image cache.
Scroll listeners stop when the transition component unmounts. Source and
capture details are recorded in `public/videos/README.md`.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
