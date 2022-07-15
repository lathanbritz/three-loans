import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"

export const routes = [
    {
        path: "/xApp",
        name: "Home",
        component: Home,
        props: { msg: "Escrows" },
    },
    {
        path: "/xApp/loans",
        name: "Loan",
        component: Home,
        props: { msg: "Open Loans" },
    },
    {
        path: "/xApp/stash",
        name: "Stash",
        component: Home,
        props: { msg: "Stash Tokens" },
    },
];

const history = createWebHistory()

const router = createRouter({
    history,
    routes,
})

export default router
