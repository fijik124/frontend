# OŠK AMK Veľký Klíž

Motocross club website and local membership demo built with Vue 3, Tailwind CSS 4,
Vue Router 4, and Pinia 4.

## Pages

- `/` — club homepage, photography gallery, and visitor information.
- `/preteky` — next race, countdown, schedule, rider information, and location.
- `/prihlasenie` — passwordless demo account selection or email login.
- `/registracia` — registration using a license issued for a specific first and last name.
- `/clenska-zona` — member overview.
- `/clenska-zona/clenovia` — member search, editing, approvals, and CSV export.
- `/clenska-zona/licencie` — license generation, assignment, and validity.
- `/clenska-zona/roly` — custom roles and permissions.
- `/clenska-zona/preteky` — next race settings.
- `/clenska-zona/moj-profil` — personal member details and license.
- `/clenska-zona/nastavenia` — demo information and reset.

Vue Router handles navigation, direct links, route guards, browser history,
scroll restoration, document titles, and the branded 404. Configure production
hosting to serve `index.html` for application routes.

## Local demo workflow

1. Open `/prihlasenie` and select **Správca klubu**.
2. Open **Licencie** and generate a license for a first name and last name.
   Select its club role and either permanent validity or an expiry date.
3. Open `/registracia`. Enter that name, license number, and a demo email.
   Names must match, including diacritics; case and extra spacing are normalized.
4. The license remains attached to the new member. The same license cannot
   activate another account. Expired and revoked licenses are rejected.
5. Approve the application in **Žiadosti**. Members can edit their phone and
   start number afterward; assigned roles are controlled by authorized staff.

Member type is part of the role system. Built-in roles include Správca, Člen,
Jazdec, Dobrovoľník, and Podporovateľ. Custom roles can grant member viewing,
member management, license management, race management, role assignment, and
role management. Permissions control both the interface and store actions.

Members created directly by an authorized administrator also receive a license
automatically. Administrators can extend a license or make it permanent while
keeping its number and member association. Expiry dates include the entire
specified day in `Europe/Bratislava`.

## Data and persistence

Pinia owns member, license, role, session, and race state. Browser storage
provides persistence for this local demo:

- `amk-members-demo-v1` in localStorage contains the versioned membership data.
  Older demo schemas migrate to the combined role model.
- `amk-race-demo-v1` in localStorage contains next race settings.
- `amk-member-session-v1` in sessionStorage remembers the demo account in a tab.

This demo has no backend, password verification, or real identity checks.
Use fictional data. Changes are local to the browser and synchronize between
tabs; they are not shared with other visitors or devices. Race settings update
the homepage and race page in the same browser. The default race date and
photographs are illustrative.

## Ride mode

Select **Zajazdi si** in the homepage or race hero. Use W/A/S/D or the arrow keys to
move the bike; the page follows its vertical movement. On-screen controls
support touch. Escape exits. Controls pause while dialogs or the menu are open.
The active ride controls appear at the lower left. A back-to-top arrow appears
at the lower right on the homepage after scrolling past the hero. Returning to
the top ends an active ride. The site uses native cursors.

## Motorsport hero

`src/components/Hero.vue` supports `mode="main"` and `mode="next-race"`.
The homepage and race page use these modes. Sample race data lives in
`src/stores/race.ts` and can be edited through the local admin dashboard.
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
