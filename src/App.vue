<template>
    <component :is="layout"  @socket-send="sendSocket" :component="active_component" :ready="ready" />
</template>

<script>
    import DefaultLayout from "./layouts/DefaultLayout.vue"
    import MainLayout from "./layouts/MainLayout.vue"

    export default {
        components: {
            DefaultLayout,
            MainLayout,
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
        mounted() {
            
        }
    }
</script>