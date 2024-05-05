import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/styles/essential.css'
import 'vuestic-ui/styles/typography.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(
  createVuestic({
    config: {
      colors: {
        variables: {
          primary: '#71c55d',
        },
      },
    },
  }),
)
// app.use(createVuestic())
app.mount('#app')
