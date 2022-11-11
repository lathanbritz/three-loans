<template>
    <component :is="layout" />
</template>

<script>
    import DefaultLayout from './layouts/DefaultLayout.vue'

    export default {
        components: {
            DefaultLayout
        },
        data() {
            return {
                layout: null,
            }
        },
        watch: {
            $route(to) {
                console.log(to)
                this.layout = to.meta.layout !== undefined ? to.meta.layout : 'DefaultLayout'
            },
        },
    }
</script>