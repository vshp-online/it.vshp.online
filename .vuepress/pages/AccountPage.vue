<template>
  <main>
    <template v-if="auth.isAuthorized">
      <ul>
        <li>
          USER: <strong>{{ auth.userName }}</strong>
        </li>
        <li>
          ID: <strong>{{ auth.userId }}</strong>
        </li>
      </ul>

      <button @click="logout">Выйти</button>
    </template>

    <template v-else>
      <h1>Доступ ограничен</h1>
      <p>Вы не авторизованы.</p>
      <RouteLink to="/auth/">Перейти к авторизации</RouteLink>
    </template>
  </main>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

onMounted(() => {
  auth.init();
  if (!auth.isAuthorized) router.replace("/auth/");
});

function logout() {
  auth.signOut();
  router.replace("/auth/");
}
</script>
