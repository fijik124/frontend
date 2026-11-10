# OŠK AMK Veľký Klíž

Vue 3, TypeScript, Tailwind CSS, Vue Router and Pinia frontend, connected to the club's Express/PostgreSQL/Better Auth backend.

## Setup

Run npm ci and npm run dev. Vite proxies /api to http://localhost:3000. Start the backend, apply its migrations and run its mail worker using the backend repository's README. Set VITE_API_BASE_URL only when using another same-site API origin. Frontend environment variables are public and must never contain secrets. Run npm run build for TypeScript checks and the production build.

## Docker

Build and run the production frontend:

```sh
docker build -t amk-frontend .
docker run --rm -p 8080:80 amk-frontend
```

Open http://localhost:8080. Nginx serves the built app and supports direct links
to Vue routes. API calls are proxied to `http://backend:3000` by default. Put
both containers on the same user-defined Docker network with the backend named
`backend`, or set `BACKEND_URL` to a backend origin reachable from the container
(without a trailing slash):

```sh
docker run --rm -p 8080:80 -e BACKEND_URL=http://host.docker.internal:3000 amk-frontend
```

The example above reaches a backend running on the host with Docker Desktop.
The backend must allow the frontend's public origin in its authentication/CORS
configuration. Use HTTPS through your reverse proxy for production.

To use a different public API origin, pass
`--build-arg VITE_API_BASE_URL=https://api.example.com` to `docker build`.
Vite embeds this value during the build; changing it requires rebuilding the
image. Local `.env` files are excluded from the build context.

### Dokploy

When using the Dockerfile build type, open the frontend application's
**Environment** tab and add the following under **Build Time Arguments**:

```dotenv
VITE_API_BASE_URL=https://your-backend-domain.example
```

Use the full backend origin, including `https://`, without `/api`; the frontend
adds `/api` itself. Save and rebuild/redeploy the application. Setting this
variable only in runtime environment variables or restarting the existing
container does not change the compiled frontend.

Alternatively, leave `VITE_API_BASE_URL` empty and set `BACKEND_URL` in the
runtime environment variables to the backend origin reachable from the frontend
container (for example, `http://backend:3000`). In this mode, browser requests to
the frontend's own `/api` are expected: Nginx forwards them to `BACKEND_URL`.

## Membership workflow

- /prihlasenie uses email and password. The first administrator is created through the backend's controlled CLI and must verify their email.
- /registracia requires an administrator-issued license and matching names, email and password. Verify the email, then wait for approval in /clenska-zona/ziadosti before staff permissions activate.
- /obnova-hesla requests a password reset or completes one using the emailed token.
- Existing member, license, role, profile and race management URLs remain available in /clenska-zona. Members edit only their own phone and start number. Authorized staff manage licensed names, roles, approvals and contribution status.
- Administrators can invite members directly, issue licenses and extend their validity without changing the license number. Built-in roles and custom roles use one unified permission system.
- /clenska-zona/nastavenia contains account information and exports. Demo login, public administrator switching and demo reset are removed.

Pinia contains only in-memory UI state. Members, licenses, roles, race settings and sessions persist in PostgreSQL through the backend. Authentication uses HttpOnly cookie sessions; no credentials or session identifiers are stored in browser storage. Previous demo data is not imported as real identities. Server failures show errors and never activate demo authentication.

Configure production hosting to serve index.html for Vue application routes and proxy /api to the backend. Prefer a single HTTPS origin. Production needs real PostgreSQL and SMTP settings, a random Better Auth secret and the initial administrator; see the backend setup and API documentation.

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
