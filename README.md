# OŠK AMK Veľký Klíž

Vue 3, TypeScript, Tailwind CSS, Vue Router and Pinia frontend, connected to the club's Express/PostgreSQL/Better Auth backend.

## Legal documents and publication

The Slovak privacy, usage and cookie documents use `src/config/legal.ts` and `src/data/legal.ts`. They remain visibly marked as drafts and excluded from indexing until all required details are filled, the review and effective dates are set, and `publicationApproved` is explicitly set to `true`. Filling fields alone is not approval or proof of compliance. After a material change, reset approval and review the documents again.

Confirmed by the operator: accounts are for adults only, email uses Google/Gmail, and the operator does not make its own data backups. The registration declaration covers adulthood and acceptance of the usage rules, independently of GDPR consent. Staff must check adulthood before issuing a registration license or creating an account directly; the frontend declaration is not identity or age verification. No date of birth or document copy is collected by this site.

Before approving the documents:

- The [official MV SR record for OŠK AMK Veľký Klíž](https://ives.minv.sk/rmno/detail/13542098504748080478), checked on 2026-11-20, confirms IČO `57517193`, registered address `958 45 Veľký Klíž - Klíž 156`, registration `VVS/1-900/90-73916` and the Trenčín district registry office. IČO `42140935` belongs to another club and must not be used here. Phone and non-VAT status are operator-supplied details. The SOI address is public, but its applicability depends on the club's actual consumer services.
- Confirm the proposed GDPR Article 6 bases against the club statutes and actual activities; document the balancing of legitimate interests. The association law is [83/1990 Zb.](https://static.slov-lex.sk/static/SK/ZZ/1990/83/20260204.print.html).
- The provider field and `legalProviderLinks` now contain the public Hetzner identity, DPA and guidance, plus Google's consumer terms, regional-entity explanation, privacy notice and transfer frameworks. The operator confirmed ordinary Gmail without a subscription. Public documents do not prove acceptance of a DPA. Verify the actual Hetzner order and signed/accepted DPA, the Google account region and the suitability of consumer Gmail for the club's processing. Do not claim all data stays in the EEA; Google's notice describes worldwide processing. Verify provider snapshots/backups separately.
- The operator-entered five-year member/license periods, 30-day application period and one-year audit/correspondence periods remain proposed internal rules, not statutory periods or verified automation. Justify their scope and duration, determine the unused-license period, record the relevant start dates, and implement a documented manual or automated deletion/anonymisation process before approval. Expired licenses and inactive accounts currently do not delete member data; account deletion retains named license records and audit entries. The reviewed worker does not enforce annual audit deletion. Review erasure requests individually. Accounting documents falling under §35(3)(c) of [Act 431/2002](https://static.slov-lex.sk/static/SK/ZZ/2002/431/20260601.html) have a ten-year period following the relevant year; this does not justify retaining all accounts or emails for ten years.
- `services.sessionCookies` documents the code-verified `__Secure-better-auth.session_token`, seven-day lifetime, renewal after 24 hours, host-only scope and Secure/HttpOnly/SameSite=Lax attributes. It also explains the conditional `__Secure-better-auth.dont_remember` cookie and 24-hour server session when `rememberMe=false`; the current frontend does not offer that option. The backend disables session-cookie caching. Verify the actual API hostname and any extra hosting/proxy cookies in a deployed browser before login, after login, after renewal and after logout; the source review is not a live cookie scan. Strictly necessary storage does not require a consent banner; any added nonessential storage must stay off until valid consent and support refusal/withdrawal. See the [Slovak regulator](https://www.teleoff.gov.sk/urad/informacie-urade/najcastejsie-otazky/).
- Deliver the privacy notice when inviting or adding a person, following Article 14 deadlines where applicable. Staff prompts link the notice. Maintain a process for rights requests, access/export, correction, erasure and incident handling; assess records-of-processing, DPO and DPIA obligations against actual processing. See [EU GDPR guidance](https://europa.eu/youreurope/business/dealing-with-customers/data-protection/data-protection-gdpr/index_en.htm).
- The operator reports no own data backups. Assess and document how timely recovery of personal-data availability after an incident is achieved, proportionate to the risks under [GDPR Article 32](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/). A statement that no backups exist does not establish adequate recovery measures; creating backups or changing production infrastructure was outside this source review.
- If paid event registration creates a consumer contract, provide the applicable pre-contract, cancellation/refund, complaint, withdrawal or exception, and dispute-resolution information before the contract is made, including when registration is external or payment is offline. Assess [108/2024 Z. z.](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2024/108/) and accessibility applicability/exemptions under [351/2022 Z. z.](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2022/351/).

Run `node --test tests/legal.test.mjs` and `npm run build` after changing the legal configuration or rendering. Production deployment, provider contracts and operational verification are separate from these code checks.

The 2026-11-20 review covers the source-controlled public documents, legal-link availability, registration/adult declaration, local storage, self-hosted assets, external links and the associated backend's session/cleanup configuration. The frontend has no analytics, ads, embedded maps, checkout or marketing subscriptions. Remaining release checks are live cookies and hosting/proxy behavior, actual retention/rights procedures, provider contracts and transfers, and consumer/accessibility applicability for the activities actually offered. This review is not a legal certification or a full security audit. Source configuration alone cannot establish those operational facts.

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
- Staff with `licenses.manage` can permanently remove unused licenses after confirmation, including revoked or expired unused codes. Used licenses remain protected as part of the member record. `DELETE /api/licenses/:id` returns 204 on success, 409 for a used license, and 404 when missing; it rechecks eligibility atomically against registration. License responses include `removable` for displaying the delete action.
- /clenska-zona/nastavenia contains account information and exports. Demo login, public administrator switching and demo reset are removed.

In production, Pinia contains only in-memory UI state. Members, licenses, roles, race settings and sessions persist in PostgreSQL through the backend. Authentication uses HttpOnly cookie sessions; no credentials or session identifiers are stored in browser storage. Development sample data is not imported as real identities. Production server failures show errors and never activate demo authentication.

Configure production hosting to serve index.html for Vue application routes and set VITE_API_BASE_URL to the backend's public HTTPS origin. Production needs real PostgreSQL and SMTP settings, a random Better Auth secret and the initial administrator; see the backend setup and API documentation.

## Website components

## Training dates and track marshals

- `/treningy` is the public training calendar. Cancelled dates remain visible with a reason; past dates can be found by selecting their day in the calendar.
- `/clenska-zona/treningy` lets staff with `trainings.manage` add, edit, cancel, restore and permanently remove training dates after confirmation. Removed dates disappear from the public list and calendar. All training details are public.
- `/clenska-zona/komisari` shows the private marshal calendar with locations, team meeting points and instructions. Access requires `marshals.read` or `marshals.manage`; only `marshals.manage` can edit. Assign these permissions through Roles. New local datasets also include a read-only **Traťový komisár** role.
- Date entry and display use `Europe/Bratislava`, including daylight saving time. The default list includes today and future dates; the month calendar also allows viewing past dates.
- Development saves both calendars in the existing browser-local dataset. Existing local data gains empty calendars and the administrator gains the new permissions without resetting members or race settings.

### Production backend contract

The matching backend implementation is in `C:/Users/Filip/Documents/git/backend`. Deploy its calendar endpoints and apply `002_event_calendars.sql` through the normal migration runner before releasing this frontend. The migration creates persistent storage, adds the three permissions above to the administrator role and adds a read-only marshal role. Client route guards are backed by server authorization.

| Endpoint | Access | Response |
| --- | --- | --- |
| `GET /api/trainings` | Public | `ClubEvent[]`, including cancelled and historical dates |
| `POST /api/trainings` | Active session with `trainings.manage` | Created `ClubEvent`, status 201 |
| `PUT /api/trainings/:id` | Active session with `trainings.manage` | Updated `ClubEvent` |
| `DELETE /api/trainings/:id` | Active session with `trainings.manage` | Requires `If-Match: "<version>"`; permanently removes the training, status 204 |
| `GET /api/marshal-events` | Active session with `marshals.read` or `marshals.manage` | `ClubEvent[]` |
| `POST /api/marshal-events` | Active session with `marshals.manage` | Created `ClubEvent`, status 201 |
| `PUT /api/marshal-events/:id` | Active session with `marshals.manage` | Updated `ClubEvent` |

The request body is `EventInput` in `src/data/events.ts`: required `title`, `startsAt` (ISO timestamp with timezone), `location` and `cancelled` (boolean), plus `endsAt`, `meetingPoint`, `notes` and `cancellationReason` (empty strings when unused). Responses add a server-generated `id` and integer `version` starting at 1. Updates require `If-Match: "<version>"`; the backend checks and increments versions atomically, returning 412 for conflicts and 404 for missing dates. Server validation enforces the same field limits as `validateEvent`, rejects unknown fields and clears cancellation reasons on restoration. Errors use the existing `{ error: { code, message } }` envelope.

Marshal details are excluded from public endpoints, caches and general activity logs. Verify local flows with `node --test tests/local-data.test.mjs` and `npm run build`; the backend's integration and browser suites verify the production API and UI with disposable PostgreSQL databases.

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
