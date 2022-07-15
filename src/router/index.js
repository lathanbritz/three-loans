import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Contacts from "../views/Contacts.vue";

export const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
        props: { msg: "Escrows" },
    },
    {
        path: "/loans",
        name: "Loan",
        component: Home,
        props: { msg: "Open Loans" },
    },
    {
        path: "/stash",
        name: "Stash",
        component: Home,
        props: { msg: "Stash Tokens" },
    },
];

const history = createWebHistory();

const router = createRouter({
    history,
    routes,
});

export default router;
