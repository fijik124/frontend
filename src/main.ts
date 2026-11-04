import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { pinia } from './pinia'

const app = createApp(App)
app.use(pinia)
app.use(router)
router.isReady().then(() => app.mount('#app'))
