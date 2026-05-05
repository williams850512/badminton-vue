import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Bootstrap 5
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 自訂前台樣式
import './assets/css/frontend.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
