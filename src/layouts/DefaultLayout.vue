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
        methods: {
            sendSocket(params) {
                console.log('sendSocket222', params)
                this.$emit('socket-send', params)
            }
        }
    }
</script>
