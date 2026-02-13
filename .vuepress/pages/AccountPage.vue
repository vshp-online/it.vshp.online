<template>
  <main>
    <template v-if="auth.isAuthorized">
      <section class="account-summary">
        <ul>
          <li>
            USER: <strong>{{ auth.userName }}</strong>
          </li>
          <li>
            ID: <strong>{{ auth.userId }}</strong>
          </li>
        </ul>

        <button @click="logout">Выйти</button>
      </section>

      <AccountHomeworkHistory />
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
import AccountHomeworkHistory from "../components/AccountHomeworkHistory.vue";

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

<style scoped>
.account-summary {
  display: grid;
  gap: 0.75rem;
}

.account-summary ul {
  margin: 0;
}
</style>
