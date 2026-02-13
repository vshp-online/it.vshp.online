<template>
  <section class="hw-history">
    <header class="hw-history__head">
      <h2>Домашние задания</h2>
      <button class="hw-history__refresh" :disabled="busy" @click="loadHistory">Обновить</button>
    </header>

    <p v-if="error" class="hw-history__error">{{ error }}</p>
    <p v-else-if="busy" class="hw-history__muted">Загрузка истории...</p>
    <p v-else-if="rows.length === 0" class="hw-history__muted">Пока нет отправок на проверку.</p>
    <table v-else class="hw-history__table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Дисциплина</th>
          <th>Задание</th>
          <th>Статус</th>
          <th>Пройдено</th>
          <th>Балл</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>{{ formatDate(row.createdAt) }}</td>
          <td>{{ row.disciplineCode.toUpperCase() }}</td>
          <td>{{ row.assignmentTitle }}</td>
          <td>{{ row.submissionStatus }}</td>
          <td>{{ formatPassed(row.isPassed) }}</td>
          <td>{{ formatScore(row.score) }}</td>
        </tr>
      </tbody>
    </table>

    <p class="hw-history__hint">
      Для интерактивной проверки заданий откройте
      <RouteLink to="/test/homework-it03.html">тестовый раздел домашних заданий</RouteLink>.
    </p>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { sandboxHomeworkApi } from "../utils/sandboxHomeworkApi";

const auth = useAuthStore();
const busy = ref(false);
const error = ref("");
const rows = ref([]);

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ru-RU");
}

function formatPassed(value) {
  if (value === true) return "Да";
  if (value === false) return "Нет";
  return "-";
}

function formatScore(value) {
  if (value === null || value === undefined) return "-";
  return Number(value).toFixed(2);
}

async function loadHistory() {
  if (!auth.token) return;

  busy.value = true;
  error.value = "";

  try {
    const response = await sandboxHomeworkApi.getAccountHomeworkHistory({ token: auth.token });
    rows.value = Array.isArray(response?.data) ? response.data : [];
  } catch (loadError) {
    const msg = loadError?.message || "Не удалось загрузить историю домашних заданий";
    error.value = loadError?.code ? `${msg} (${loadError.code})` : msg;
    rows.value = [];
  } finally {
    busy.value = false;
  }
}

onMounted(loadHistory);
</script>

<style scoped>
.hw-history {
  margin-top: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.75rem;
  padding: 1rem;
  background: #fff;
}

.hw-history__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.hw-history__head h2 {
  margin: 0;
  font-size: 1.15rem;
}

.hw-history__refresh {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.45rem;
  background: #f3f4f6;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.hw-history__refresh:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hw-history__error {
  margin: 0.5rem 0;
  color: #b91c1c;
}

.hw-history__muted {
  margin: 0.5rem 0;
  color: #6b7280;
}

.hw-history__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.hw-history__table th,
.hw-history__table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  padding: 0.4rem 0.3rem;
}

.hw-history__hint {
  margin-top: 0.75rem;
  color: #4b5563;
  font-size: 0.9rem;
}
</style>
