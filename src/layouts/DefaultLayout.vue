<template>
    <Nav />

    <header class="container">
        <TakeLoan :socket="socket" :component="component">What is the point of all?</TakeLoan>
        <LandingScreen :socket="socket" :component="component">{escrows}</LandingScreen>
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
        props: ['socket', 'component'],
        components: {
            Nav,
            Refs,
            TakeLoan,
            LandingScreen
        },
    }
</script>
