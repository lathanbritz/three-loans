<template>
    <Nav />

    <header class="container">
        <TakeLoan @socket-send="sendSocket" :component="component">What is the point of all?</TakeLoan>
        <LandingScreen :component="component">{escrows}</LandingScreen>
    </header>

    <main class="container flex-shrink-0 mb-4">
        <router-view />
    </main>

    <footer class="container footer mb-2 mt-auto">
        <div class="border-top py-3">
            &copy; Three
            <Refs />
        </div>
    </footer>
</template>

<script>
    import xapp from '../plugins/xapp.js'
    import client from '../plugins/ws-client.js'

    import Nav from "../components/Nav.vue"
    import Refs from "../components/Refs.vue"
    import TakeLoan from "../components/TakeLoan.vue"
    import LandingScreen from "../components/LandingScreen.vue"

    export default {
        name: "DefaultLayout",
        props: ['component'],
        emits: ['socket-send'],
        components: {
            Nav,
            Refs,
            TakeLoan,
            LandingScreen
        },
        data() {
            return {
                active_component: 'LandingScreen',
                account: '',
                socket: null,
                active_socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                layout: null,
                pong: false,
                ready: false
            };
        },
        methods: {
            sendSocket(params) {
                // bubble message to parent
                console.log('mid point', params)
                this.$emit('socket-send', params)
            }
        }
    }
</script>
