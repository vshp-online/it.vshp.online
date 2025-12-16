import "../utils/ssrStoragePolyfill";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const authorized = ref(false);
  const token = ref(null);
  const userName = ref(null);
  const userId = ref(null);
  const msg = ref("");

  const isAuthorized = computed(() => authorized.value && !!token.value);

  function init() {
    if (typeof window === "undefined") return;
    authorized.value = localStorage.getItem("authorized") === "true";
    token.value = localStorage.getItem("jwtToken");
    userName.value = localStorage.getItem("userName");
    userId.value = localStorage.getItem("userId");
  }

  async function signIn({ login, password }) {
    msg.value = "";
    const res = await fetch("https://api.vshp.online/api/v1/user/session", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    if (data && data.token) {
      // базовые поля
      token.value = data.token;
      authorized.value = true;
      userName.value = data.user?.name ?? null;
      userId.value = String(data.user?.id ?? "");
      // persist
      localStorage.setItem("jwtToken", token.value);
      localStorage.setItem("authorized", "true");
      localStorage.setItem("userName", userName.value ?? "");
      localStorage.setItem("userId", userId.value ?? "");
      return true;
    } else {
      msg.value = data?.error || "Неудачная авторизация";
      return false;
    }
  }

  async function signOut() {
    try {
      if (token.value) {
        await fetch("https://api.vshp.online/api/v1/user/session", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token.value}` },
        });
      }
    } catch {}
    clear();
  }

  function clear() {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    authorized.value = false;
    token.value = null;
    userName.value = null;
    userId.value = null;
    msg.value = "";
  }

  return {
    authorized,
    token,
    userName,
    userId,
    msg,
    isAuthorized,
    init,
    signIn,
    signOut,
    clear,
  };
});
