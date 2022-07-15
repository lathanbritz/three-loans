import { createApp } from "vue"

import "bootstrap/scss/bootstrap.scss"
import "bootstrap-icons/font/bootstrap-icons.css"

import axios from 'axios'
import VueAxios from 'vue-axios'
import App from "./App.vue"
import VueNumerals from 'vue-numerals'
import router from "./router"
import Connection from './plugins/connection.js'

// const connection = {
// 	site: 'https://panicbot.app',
// 	socket: 'ws://127.0.0.1:3006',
// 	url: 'http://127.0.0.1:3006'
// }

const connection = {
	site: 'https://panicbot.xyz',
	socket: 'wss://panicbot.xyz:3006',
	url: 'https://panicbot.xyz:3006'
}

const app = createApp(App)
app.use(router)
app.use(Connection, connection)
app.use(VueNumerals)
app.use(VueAxios, axios)
app.mount('#app')