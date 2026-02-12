import { createRouter, createWebHistory } from "vue-router";
import LowCode from "@/views/LowCode.vue";

const routes = [
  {
    path: "/",
    name: "lowcode",
    component: LowCode,
  },
  //   {
  //     path: "/preview",
  //     name: "preview",
  //     component: () => import("@/views/Preview.vue"),
  //   },
  //   {
  //     path: "/demo/websocket",
  //     name: "websocket-demo",
  //     component: () => import("@/views/demo/WebSocketDemo.vue"),
  //   },
  //   {
  //     path: "/demo/encryption",
  //     name: "encryption-demo",
  //     component: () => import("@/views/demo/EncryptionDemo.vue"),
  //   },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
