import { createRouter, createWebHistory } from "vue-router";
import LowCode from "@/views/LowCode.vue";
import Login from "@/views/Login.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/lowcode",
    name: "lowcode",
    component: LowCode,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
