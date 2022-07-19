<template>
    <component :is="layout" :component="active_component" />
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
                layout: null,
                active_component: 'LandingScreen',
            }
        },
        watch: {
            $route(to) {
                console.log(to)
                switch (to.fullPath) {
                    case '/':
                        this.active_component = 'LandingScreen'
                        break
                    case '/loans':
                        this.active_component = 'TakeLoan'
                        break
                
                    default:
                        break
                }
                this.layout = to.meta.layout !== undefined ? to.meta.layout : "DefaultLayout";
            },
        },
    }
</script>