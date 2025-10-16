<template>
  <main>
    <h1>Авторизация</h1>

    <form class="auth-form" @submit.prevent="onSubmit">
      <p v-if="auth.msg" class="error_msg" v-html="auth.msg"></p>

      <input
        type="text"
        placeholder="Введите логин"
        v-model="login"
        autocomplete="username"
        required
      />
      <input
        type="password"
        placeholder="Введите пароль"
        v-model="password"
        autocomplete="current-password"
        required
      />

      <button type="submit">Авторизоваться</button>
      <a href="https://my.vshp.online/recovery" target="_blank" rel="noreferrer"
        >Забыли пароль?</a
      >

      <p class="status">
        Статус:
        <strong>{{ auth.isAuthorized ? "авторизован" : "гость" }}</strong>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const login = ref("");
const password = ref("");

onMounted(() => {
  auth.init();
  if (auth.isAuthorized) router.replace("/account/");
});

async function onSubmit() {
  const ok = await auth.signIn({
    login: login.value,
    password: password.value,
  });
  if (ok) router.replace("/account/");
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 420px;
}
.error_msg {
  color: #b00020;
}
.status {
  opacity: 0.75;
  font-size: 0.9rem;
}
</style>
