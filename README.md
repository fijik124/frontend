# OŠK AMK Veľký Klíž

Vue 3, TypeScript, Tailwind CSS, Vue Router and Pinia frontend, connected to the club's Express/PostgreSQL/Better Auth backend.

## Setup

Run `npm ci` and `npm run dev`. Development uses only fictional browser-local data; no backend, database or mail worker is needed. API URLs in environment variables and runtime configuration are ignored in development. Local requests never fall back to the backend.

Sign in with `admin@example.test` (administrator), `member@example.test` (member), or `pending@example.test` (pending member). All three use the password `local-demo-2026`. New members added by the local administrator use the same demo password; registered members use their chosen password. Race settings, members, licenses, roles and activity are saved in this browser's `localStorage` under `amk:local-data:v1`. The signed-in member is kept in this tab's `sessionStorage` under `amk:local-session:v1`. Refreshing preserves edits. To reset the sample data, remove both keys in browser developer tools and reload.

Local registration does not require email verification. Local password reset links are printed to the browser console instead of sending email. Use fictional details and demo passwords with the local data.

`npm run build` runs TypeScript checks and creates the production build, which continues to use the real backend and requires `VITE_API_BASE_URL`. The local data adapter and demo credentials are excluded from production. Frontend environment variables are public and must never contain secrets.

## Docker

Build and run the production frontend:

```sh
docker build -t amk-frontend .
docker run --rm -p 8080:80 -e VITE_API_BASE_URL=http://localhost:3000 amk-frontend
```

Open http://localhost:8080. Nginx serves the built app and supports direct links
to Vue routes. The browser calls the backend directly at `VITE_API_BASE_URL`.
Set this required runtime environment variable to the backend's public origin,
including `https://` and without `/api`. The URL must be reachable from the
browser. The backend must allow the frontend's public origin for credentialed
CORS and authentication.

### Dokploy

When using the Dockerfile build type, open the frontend application's
**Environment** tab and add the following under the normal runtime environment
variables:

```dotenv
VITE_API_BASE_URL=https://your-backend-domain.example
```

Save and redeploy. Nginx reads this value from the container environment at
startup and serves it in `/runtime-config.js`, loaded before the app. No build
argument or hardcoded Dockerfile URL is needed. Browser requests go directly to
`https://your-backend-domain.example/api/...`. Deploy this code once; subsequent
URL changes only require recreating the container with the updated environment.
Open `/runtime-config.js` on the frontend domain to check the deployed value.
An empty or relative production API URL is rejected instead of silently using
the frontend's origin.

## Membership workflow

- /prihlasenie uses email and password. The first administrator is created through the backend's controlled CLI and must verify their email.
- /registracia requires an administrator-issued license and matching names, email and password. Verify the email, then wait for approval in /clenska-zona/ziadosti before staff permissions activate.
- /obnova-hesla requests a password reset or completes one using the emailed token.
- Existing member, license, role, profile and race management URLs remain available in /clenska-zona. Members edit only their own phone and start number. Authorized staff manage licensed names, roles, approvals and contribution status.
- Administrators can invite members directly, issue licenses and extend their validity without changing the license number. Built-in roles and custom roles use one unified permission system.
- /clenska-zona/nastavenia contains account information and exports. Demo login, public administrator switching and demo reset are removed.

In production, Pinia contains only in-memory UI state. Members, licenses, roles, race settings and sessions persist in PostgreSQL through the backend. Authentication uses HttpOnly cookie sessions; no credentials or session identifiers are stored in browser storage. Development sample data is not imported as real identities. Production server failures show errors and never activate demo authentication.

Configure production hosting to serve index.html for Vue application routes and set VITE_API_BASE_URL to the backend's public HTTPS origin. Production needs real PostgreSQL and SMTP settings, a random Better Auth secret and the initial administrator; see the backend setup and API documentation.

## Website components

## Ride mode

Select **Zajazdi si** in the homepage or race hero. Use W/A/S/D or the arrow keys to
move the bike; the page follows its vertical movement. On-screen controls
support touch. Escape exits. Controls pause while dialogs or the menu are open.
The active ride controls appear at the lower left. A back-to-top arrow appears
at the lower right on the homepage after scrolling past the hero. Returning to
the top ends an active ride. The site uses native cursors.

## Motorsport hero

`src/components/Hero.vue` supports `mode="main"` and `mode="next-race"`.
The homepage and race page use these modes. Race data comes from the public API and is managed through the authorized race settings page. No race is published until staff save it.

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
