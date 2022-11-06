import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"

export const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        props: { msg: "flush" },
    }
];

const history = createWebHistory()

const router = createRouter({
    history,
    routes,
})

export default router