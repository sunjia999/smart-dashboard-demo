import { createRouter, createWebHistory } from "vue-router";
import EditorLayout from "@/components/layout/EditorLayout.vue";

const routes = [
  {
    path: "/",
    name: "editor",
    component: EditorLayout,
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
