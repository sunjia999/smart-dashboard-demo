import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const isLoggedIn = ref(false);
  const username = ref("");

  const login = (user) => {
    isLoggedIn.value = true;
    username.value = user;
  };

  const logout = () => {
    isLoggedIn.value = false;
    username.value = "";
  };

  return { isLoggedIn, username, login, logout };
});
