import './assets/globals.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { config } from './config/wagmi'

import App from './App.vue'
import router from './router'

const queryClient = new QueryClient()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.use(WagmiPlugin, { config })

app.mount('#app')
