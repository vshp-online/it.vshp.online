<template>
  <RouteLink
    v-if="!auth.isAuthorized"
    class="auth-link nav-icon"
    to="/auth/"
    aria-label="Авторизация"
  >
    <img
      src="/images/icons/auth-icon.svg"
      width="20"
      height="20"
      alt="Авторизация"
    />
  </RouteLink>

  <RouteLink
    v-else
    to="/account/"
    class="account-link nav-icon"
    aria-label="Личный кабинет"
  >
    <img
      src="/images/icons/user-icon.svg"
      width="20"
      height="20"
      alt="Личный кабинет"
    />
  </RouteLink>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { onMounted } from "vue";
const auth = useAuthStore();
onMounted(() => auth.init());
</script>
