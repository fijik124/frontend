<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const number = ref(0)
const premena = ref('')
const rows = ref(8)
const cols = ref(42)

const dlha = computed(() => premena.value.length > 10)
const characterCount = computed(() => premena.value.length)
const remainingCharacters = computed(() => Math.max(0, 10 - characterCount.value))

onMounted(() => {
  number.value = Math.floor(Math.random() * 100)
})
</script>

<template>
  <main class="app-shell">
    <div class="ambient-shape ambient-shape-one"></div>
    <div class="ambient-shape ambient-shape-two"></div>

    <nav class="topbar" aria-label="Hlavná navigácia">
      <a class="brand" href="#" aria-label="TextLab domov">
        <span class="brand-mark">T</span>
        <span>TextLab</span>
      </a>
      <span class="topbar-status"><span class="status-dot"></span> Tvoj osobný priestor</span>
    </nav>

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Tvorivé laboratórium</p>
        <h1>Myšlienky,<br /><span>ktoré dostanú tvar.</span></h1>
        <p class="hero-description">
          Nastav si plochu podľa seba a nechaj svoje slová voľne plynúť.
        </p>
      </div>

      <div class="lucky-card">
        <div class="sparkle">✦</div>
        <div>
          <p class="card-label">Dnešné šťastné číslo</p>
          <strong>{{ number }}</strong>
        </div>
        <span class="card-caption">malý impulz pre veľké nápady</span>
      </div>
    </section>

    <section class="editor-layout" aria-label="Textový editor">
      <article class="editor-card">
        <div class="editor-heading">
          <div>
            <p class="section-kicker">01 / Píš voľne</p>
            <h2>Tvoj priestor</h2>
          </div>
          <span class="live-indicator"><span></span> Živé</span>
        </div>

        <textarea
          v-model="premena"
          :disabled="dlha"
          :rows="rows"
          :cols="cols"
          :class="{ 'is-long': dlha }"
          aria-label="Tvoj text"
          placeholder="Začni písať niečo krásne..."
        ></textarea>

        <div class="editor-footer">
          <span>{{ characterCount }} znakov</span>
          <span v-if="!dlha">Ešte {{ remainingCharacters }} {{ remainingCharacters === 1 ? 'znak' : 'znakov' }}</span>
          <span v-else class="warning-text">Limit dosiahnutý</span>
        </div>

        <button v-if="dlha" class="clear-button" type="button" @click="premena = ''">
          Vyčistiť text <span>↗</span>
        </button>
      </article>

      <aside class="settings-card">
        <div>
          <p class="section-kicker">02 / Nastavenie</p>
          <h2>Rozmer plátna</h2>
          <p class="settings-description">Prispôsob si veľkosť priestoru pre svoje slová.</p>
        </div>

        <div class="field-grid">
          <label>
            <span>Riadky</span>
            <input v-model.number="rows" type="number" min="3" max="24" />
          </label>
          <label>
            <span>Stĺpce</span>
            <input v-model.number="cols" type="number" min="20" max="80" />
          </label>
        </div>

        <div class="tip">
          <span class="tip-icon">i</span>
          <p>Tip: Najlepšie nápady často vzniknú, keď prestaneš premýšľať nad dokonalosťou.</p>
        </div>
      </aside>
    </section>

    <footer class="footer">
      <span>TEXTLAB <span class="footer-dot">·</span> 2024</span>
      <span>Vytvorené pre tvoje nápady</span>
    </footer>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  background: #f4f1ea;
  color: #202a29;
  font-family: 'Manrope', sans-serif;
}

:global(button),
:global(input),
:global(textarea) {
  font: inherit;
}

.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px clamp(24px, 6vw, 96px) 24px;
  background: linear-gradient(135deg, #f8f6f0 0%, #efede6 100%);
}

.ambient-shape {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(2px);
}

.ambient-shape-one {
  top: -180px;
  right: -100px;
  width: 480px;
  height: 480px;
  background: rgba(200, 220, 205, 0.48);
}

.ambient-shape-two {
  bottom: -260px;
  left: -160px;
  width: 500px;
  height: 500px;
  border: 1px solid rgba(44, 74, 64, 0.08);
}

.topbar,
.hero,
.editor-layout,
.footer {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(32, 42, 41, 0.1);
  padding-bottom: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  background: #d6e7db;
  color: #285241;
  font-family: Georgia, serif;
  font-size: 18px;
  font-style: italic;
}

.topbar-status,
.section-kicker,
.card-label,
.live-indicator,
.editor-footer,
.footer {
  font-family: 'DM Mono', monospace;
}

.topbar-status {
  color: #71807a;
  font-size: 11px;
}

.status-dot,
.live-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 7px;
  border-radius: 50%;
  background: #79a989;
  box-shadow: 0 0 0 4px rgba(121, 169, 137, 0.14);
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  padding: clamp(58px, 9vw, 112px) 0 70px;
}

.eyebrow,
.section-kicker {
  margin: 0 0 16px;
  color: #709078;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 24px;
  color: #203a31;
  font-size: clamp(42px, 6vw, 78px);
  font-weight: 700;
  letter-spacing: -0.07em;
  line-height: 0.98;
}

h1 span {
  color: #88a994;
  font-family: Georgia, serif;
  font-style: italic;
  font-weight: 400;
}

.hero-description {
  max-width: 370px;
  margin-bottom: 0;
  color: #76817b;
  font-size: 15px;
  line-height: 1.7;
}

.lucky-card {
  display: grid;
  min-width: 248px;
  grid-template-columns: auto 1fr;
  gap: 12px 15px;
  padding: 21px;
  border: 1px solid rgba(68, 104, 83, 0.16);
  border-radius: 16px;
  background: rgba(226, 238, 226, 0.68);
}

.sparkle {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: #c9dfce;
  color: #38634b;
  font-size: 18px;
}

.card-label {
  margin: 1px 0 2px;
  color: #698574;
  font-size: 10px;
  text-transform: uppercase;
}

.lucky-card strong {
  color: #2e5f46;
  font-size: 25px;
  font-weight: 800;
}

.card-caption {
  grid-column: 1 / -1;
  color: #7f9987;
  font-size: 11px;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.8fr);
  gap: 20px;
}

.editor-card,
.settings-card {
  border: 1px solid rgba(32, 42, 41, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 20px 60px rgba(50, 62, 56, 0.07);
}

.editor-card {
  padding: clamp(22px, 3.5vw, 38px);
}

.settings-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(22px, 3.5vw, 32px);
}

.editor-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

h2 {
  margin-bottom: 26px;
  color: #263633;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.editor-heading h2,
.settings-card h2 {
  margin-bottom: 0;
}

.live-indicator {
  color: #7a8c82;
  font-size: 10px;
  text-transform: uppercase;
}

.live-indicator span {
  width: 5px;
  height: 5px;
  margin-right: 5px;
  box-shadow: none;
}

textarea {
  display: block;
  width: 100%;
  min-height: 225px;
  margin-top: 30px;
  resize: vertical;
  border: 0;
  border-top: 1px solid rgba(32, 42, 41, 0.1);
  outline: none;
  padding: 25px 0 10px;
  background: transparent;
  color: #2c3e37;
  font-family: Georgia, serif;
  font-size: 21px;
  line-height: 1.7;
}

textarea::placeholder {
  color: #b2bbb5;
}

textarea:focus {
  border-top-color: #8aac96;
}

textarea.is-long {
  color: #c95c5c;
}

textarea:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(32, 42, 41, 0.07);
  color: #9ba49f;
  font-size: 10px;
}

.warning-text {
  color: #c95c5c;
}

.clear-button {
  margin-top: 22px;
  cursor: pointer;
  border: 0;
  border-radius: 9px;
  padding: 11px 16px;
  background: #dbeadf;
  color: #38634b;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s ease;
}

.clear-button:hover {
  background: #c9dfce;
  transform: translateY(-1px);
}

.clear-button span {
  margin-left: 8px;
}

.settings-description {
  max-width: 230px;
  margin: 17px 0 32px;
  color: #8b9690;
  font-size: 13px;
  line-height: 1.6;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label span {
  display: block;
  margin-bottom: 8px;
  color: #7e8b84;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
}

input {
  width: 100%;
  border: 1px solid #dbe2dc;
  border-radius: 10px;
  outline: none;
  padding: 12px;
  background: #fafbf8;
  color: #365643;
  font-size: 16px;
  font-weight: 700;
}

input:focus {
  border-color: #88a994;
  box-shadow: 0 0 0 3px rgba(136, 169, 148, 0.16);
}

.tip {
  display: flex;
  gap: 10px;
  margin-top: 32px;
  border-top: 1px solid rgba(32, 42, 41, 0.08);
  padding-top: 22px;
}

.tip-icon {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border: 1px solid #a7b9ab;
  border-radius: 50%;
  color: #7d9b83;
  font-family: Georgia, serif;
  font-size: 12px;
  line-height: 17px;
  text-align: center;
}

.tip p {
  margin-bottom: 0;
  color: #89958d;
  font-family: Georgia, serif;
  font-size: 13px;
  font-style: italic;
  line-height: 1.5;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding-top: 30px;
  color: #a3aaa5;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.footer-dot {
  padding: 0 5px;
  color: #84a48d;
}

@media (max-width: 700px) {
  .app-shell {
    padding: 20px 18px;
  }

  .topbar-status {
    display: none;
  }

  .hero {
    display: block;
    padding: 64px 0 45px;
  }

  .hero-description {
    margin-bottom: 30px;
  }

  .lucky-card {
    width: 100%;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }

  .footer {
    gap: 12px;
    line-height: 1.5;
  }
}
</style>
