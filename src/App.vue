<template>
    <component :is="layout" />
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
                
            }
        },
        mounted() {
            
        }
    }
</script>