<template>
  <section class="hw-test">
    <header class="hw-test__header">
      <h2>Тест домашних заданий (ИТ.03)</h2>
      <p>
        Пилотный раздел для ручной проверки интеграции it.vshp.online с sandbox API.
      </p>
    </header>

    <div v-if="!auth.isAuthorized" class="hw-banner hw-banner--info">
      <h3>Для выполнения домашних заданий нужна авторизация</h3>
      <p>После входа будет доступен список дисциплин, заданий и история отправок.</p>
      <RouteLink to="/auth/" class="hw-btn hw-btn--primary">Перейти к авторизации</RouteLink>
    </div>

    <template v-else>
      <div v-if="loadError" class="hw-banner hw-banner--error">
        <strong>Ошибка загрузки:</strong> {{ loadError }}
      </div>

      <div class="hw-grid">
        <section class="hw-card">
          <h3>Контекст</h3>
          <p class="hw-muted">Пользователь: {{ auth.userName || "не указан" }} (ID: {{ auth.userId || "-" }})</p>

          <label class="hw-label" for="hw-discipline">Дисциплина</label>
          <select
            id="hw-discipline"
            class="hw-select"
            :disabled="busy || disciplines.length === 0"
            v-model="selectedDisciplineCode"
            @change="onDisciplineChange"
          >
            <option v-for="discipline in disciplines" :key="discipline.code" :value="discipline.code">
              {{ discipline.code.toUpperCase() }} — {{ discipline.title }}
            </option>
          </select>

          <label class="hw-label" for="hw-group">Группа заданий</label>
          <select
            id="hw-group"
            class="hw-select"
            :disabled="busy || groups.length === 0"
            v-model="selectedGroupCode"
            @change="onGroupChange"
          >
            <option v-for="group in groups" :key="group.code" :value="group.code">
              {{ group.title }} ({{ group.code }})
            </option>
          </select>

          <label class="hw-label" for="hw-assignment">Задание</label>
          <select
            id="hw-assignment"
            class="hw-select"
            :disabled="busy || assignments.length === 0"
            v-model="selectedAssignmentCode"
            @change="onAssignmentChange"
          >
            <option v-for="assignment in assignments" :key="assignment.code" :value="assignment.code">
              {{ assignment.title }} ({{ assignment.code }})
            </option>
          </select>

          <div class="hw-actions">
            <button class="hw-btn" :disabled="busy" @click="reloadAll">Обновить</button>
            <button class="hw-btn" :disabled="busy || !selectedAssignmentCode" @click="reloadAssignmentState">
              Обновить задание
            </button>
          </div>
        </section>

        <section class="hw-card hw-card--wide">
          <h3>{{ assignmentTitle }}</h3>
          <p v-if="assignmentPrompt" class="hw-prompt">{{ assignmentPrompt }}</p>

          <div v-if="accessBadge" class="hw-access" :class="accessBadge.className">
            {{ accessBadge.label }}
          </div>

          <label class="hw-label" for="hw-code">SQL-код</label>
          <textarea
            id="hw-code"
            class="hw-editor"
            v-model="editorCode"
            :disabled="busy || !selectedAssignmentCode"
            spellcheck="false"
            placeholder="Введите SQL-запрос"
          />

          <div class="hw-actions">
            <button class="hw-btn" :disabled="busy || !canSave" @click="saveDraft">Сохранить черновик</button>
            <button class="hw-btn hw-btn--primary" :disabled="busy || !canRun" @click="runCode">Запустить</button>
            <button class="hw-btn hw-btn--success" :disabled="busy || !canSubmit" @click="submitCode">
              Отправить на проверку
            </button>
          </div>

          <p v-if="actionMessage" class="hw-muted">{{ actionMessage }}</p>
        </section>
      </div>

      <div class="hw-grid">
        <section class="hw-card">
          <h3>Последний запуск</h3>
          <p class="hw-muted" v-if="!lastRun">Запусков пока нет.</p>
          <template v-else>
            <p><strong>Статус:</strong> {{ lastRun.runStatus }}</p>
            <p><strong>Время:</strong> {{ formatDate(lastRun.createdAt) }}</p>
            <p><strong>Длительность:</strong> {{ formatDuration(lastRun.durationMs) }}</p>
            <details v-if="lastRun.stdout">
              <summary>stdout</summary>
              <pre>{{ lastRun.stdout }}</pre>
            </details>
            <details v-if="lastRun.stderr">
              <summary>stderr</summary>
              <pre>{{ lastRun.stderr }}</pre>
            </details>
          </template>
        </section>

        <section class="hw-card">
          <h3>Последняя отправка</h3>
          <p class="hw-muted" v-if="!lastSubmission">Отправок пока нет.</p>
          <template v-else>
            <p><strong>Статус:</strong> {{ lastSubmission.submissionStatus }}</p>
            <p><strong>Пройдено:</strong> {{ formatPassed(lastSubmission.isPassed) }}</p>
            <p><strong>Балл:</strong> {{ formatScore(lastSubmission.score) }}</p>
            <p><strong>Время:</strong> {{ formatDate(lastSubmission.createdAt) }}</p>
            <p v-if="lastSubmission.feedback"><strong>Комментарий:</strong> {{ lastSubmission.feedback }}</p>
          </template>
        </section>
      </div>

      <div class="hw-grid">
        <section class="hw-card hw-card--wide">
          <h3>История запусков</h3>
          <p class="hw-muted" v-if="runs.length === 0">Запусков пока нет.</p>
          <table v-else class="hw-table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Статус</th>
                <th>Длительность</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="run in runs" :key="run.id">
                <td>{{ formatDate(run.createdAt) }}</td>
                <td>{{ run.runStatus }}</td>
                <td>{{ formatDuration(run.durationMs) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="hw-card hw-card--wide">
          <h3>История отправок</h3>
          <p class="hw-muted" v-if="submissions.length === 0">Отправок пока нет.</p>
          <table v-else class="hw-table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Статус</th>
                <th>Пройдено</th>
                <th>Балл</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="submission in submissions" :key="submission.id">
                <td>{{ formatDate(submission.createdAt) }}</td>
                <td>{{ submission.submissionStatus }}</td>
                <td>{{ formatPassed(submission.isPassed) }}</td>
                <td>{{ formatScore(submission.score) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { sandboxHomeworkApi } from "../utils/sandboxHomeworkApi";

const auth = useAuthStore();

const busy = ref(false);
const loadError = ref("");
const actionMessage = ref("");

const disciplines = ref([]);
const groups = ref([]);
const assignments = ref([]);

const selectedDisciplineCode = ref("");
const selectedGroupCode = ref("");
const selectedAssignmentCode = ref("");

const assignment = ref(null);
const editorCode = ref("");
const runs = ref([]);
const submissions = ref([]);

const assignmentTitle = computed(() => assignment.value?.data?.title || "Выберите задание");
const assignmentPrompt = computed(() => assignment.value?.data?.promptMd || "");

const assignmentAccess = computed(() => assignment.value?.data?.access || null);

const accessBadge = computed(() => {
  if (!assignmentAccess.value) return null;
  if (assignmentAccess.value.canSubmit) {
    return {
      className: "hw-access--ok",
      label: "Доступ активен: можно запускать и отправлять",
    };
  }
  if (assignmentAccess.value.canRun) {
    return {
      className: "hw-access--warn",
      label: "Можно запускать код, но отправка недоступна",
    };
  }
  return {
    className: "hw-access--error",
    label: `Доступ ограничен (${assignmentAccess.value.reason || "UNKNOWN"})`,
  };
});

const canSave = computed(() => !!selectedAssignmentCode.value && !!editorCode.value.trim());
const canRun = computed(() => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canRun);
const canSubmit = computed(
  () => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canSubmit,
);

const lastRun = computed(() => runs.value[0] || null);
const lastSubmission = computed(() => submissions.value[0] || null);

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ru-RU");
}

function formatDuration(value) {
  if (value === null || value === undefined) return "-";
  return `${value} мс`;
}

function formatScore(score) {
  if (score === null || score === undefined) return "-";
  return `${Number(score).toFixed(2)}`;
}

function formatPassed(value) {
  if (value === true) return "Да";
  if (value === false) return "Нет";
  return "-";
}

function setActionMessage(message) {
  actionMessage.value = message;
}

function resolveErrorMessage(error, fallback) {
  if (!error) return fallback;
  const core = error.message || fallback;
  if (error.code) {
    return `${core} (${error.code})`;
  }
  return core;
}

async function reloadAll() {
  if (!auth.token) return;

  busy.value = true;
  loadError.value = "";

  try {
    const disciplinesResponse = await sandboxHomeworkApi.getDisciplines({ token: auth.token });
    disciplines.value = Array.isArray(disciplinesResponse?.data) ? disciplinesResponse.data : [];

    if (!disciplines.value.length) {
      selectedDisciplineCode.value = "";
      groups.value = [];
      assignments.value = [];
      selectedGroupCode.value = "";
      selectedAssignmentCode.value = "";
      assignment.value = null;
      editorCode.value = "";
      runs.value = [];
      submissions.value = [];
      return;
    }

    if (!disciplines.value.some((item) => item.code === selectedDisciplineCode.value)) {
      selectedDisciplineCode.value = disciplines.value[0].code;
    }

    await reloadGroups();
  } catch (error) {
    loadError.value = resolveErrorMessage(error, "Не удалось загрузить список дисциплин");
  } finally {
    busy.value = false;
  }
}

async function reloadGroups() {
  if (!auth.token || !selectedDisciplineCode.value) {
    groups.value = [];
    assignments.value = [];
    selectedGroupCode.value = "";
    selectedAssignmentCode.value = "";
    return;
  }

  const groupsResponse = await sandboxHomeworkApi.getHomeworkGroups(selectedDisciplineCode.value, {
    token: auth.token,
  });
  groups.value = Array.isArray(groupsResponse?.data) ? groupsResponse.data : [];

  if (!groups.value.length) {
    selectedGroupCode.value = "";
    assignments.value = [];
    selectedAssignmentCode.value = "";
    assignment.value = null;
    editorCode.value = "";
    runs.value = [];
    submissions.value = [];
    return;
  }

  if (!groups.value.some((item) => item.code === selectedGroupCode.value)) {
    selectedGroupCode.value = groups.value[0].code;
  }

  await reloadAssignments();
}

async function reloadAssignments() {
  if (!auth.token || !selectedGroupCode.value) {
    assignments.value = [];
    selectedAssignmentCode.value = "";
    return;
  }

  const assignmentsResponse = await sandboxHomeworkApi.getAssignments(selectedGroupCode.value, {
    token: auth.token,
  });
  assignments.value = Array.isArray(assignmentsResponse?.data) ? assignmentsResponse.data : [];

  if (!assignments.value.length) {
    selectedAssignmentCode.value = "";
    assignment.value = null;
    editorCode.value = "";
    runs.value = [];
    submissions.value = [];
    return;
  }

  if (!assignments.value.some((item) => item.code === selectedAssignmentCode.value)) {
    selectedAssignmentCode.value = assignments.value[0].code;
  }

  await reloadAssignmentState();
}

async function reloadAssignmentState() {
  if (!auth.token || !selectedAssignmentCode.value) {
    assignment.value = null;
    editorCode.value = "";
    runs.value = [];
    submissions.value = [];
    return;
  }

  busy.value = true;
  setActionMessage("");

  try {
    const [assignmentRes, draftRes, runsRes, submissionsRes] = await Promise.all([
      sandboxHomeworkApi.getAssignment(selectedAssignmentCode.value, { token: auth.token }),
      sandboxHomeworkApi.getDraft(selectedAssignmentCode.value, { token: auth.token }),
      sandboxHomeworkApi.getRuns(selectedAssignmentCode.value, { token: auth.token, limit: 20 }),
      sandboxHomeworkApi.getSubmissions(selectedAssignmentCode.value, { token: auth.token, limit: 20 }),
    ]);

    assignment.value = assignmentRes;
    editorCode.value = draftRes?.data?.code || assignmentRes?.data?.templateSql || "";
    runs.value = Array.isArray(runsRes?.data) ? runsRes.data : [];
    submissions.value = Array.isArray(submissionsRes?.data) ? submissionsRes.data : [];
  } catch (error) {
    setActionMessage(resolveErrorMessage(error, "Не удалось загрузить данные задания"));
  } finally {
    busy.value = false;
  }
}

async function saveDraft() {
  if (!auth.token || !selectedAssignmentCode.value) return;

  busy.value = true;
  setActionMessage("");

  try {
    await sandboxHomeworkApi.saveDraft(selectedAssignmentCode.value, editorCode.value, {
      token: auth.token,
    });
    setActionMessage("Черновик сохранен");
  } catch (error) {
    setActionMessage(resolveErrorMessage(error, "Не удалось сохранить черновик"));
  } finally {
    busy.value = false;
  }
}

async function runCode() {
  if (!auth.token || !selectedAssignmentCode.value) return;

  busy.value = true;
  setActionMessage("");

  try {
    const result = await sandboxHomeworkApi.run(selectedAssignmentCode.value, editorCode.value, {
      token: auth.token,
    });

    if (result?.data) {
      runs.value = [result.data, ...runs.value.filter((item) => item.id !== result.data.id)];
    }

    setActionMessage(`Запуск выполнен: ${result?.data?.runStatus || "OK"}`);
  } catch (error) {
    setActionMessage(resolveErrorMessage(error, "Ошибка запуска"));
  } finally {
    busy.value = false;
  }
}

async function submitCode() {
  if (!auth.token || !selectedAssignmentCode.value) return;

  busy.value = true;
  setActionMessage("");

  try {
    const result = await sandboxHomeworkApi.submit(selectedAssignmentCode.value, editorCode.value, {
      token: auth.token,
    });

    if (result?.data) {
      submissions.value = [result.data, ...submissions.value.filter((item) => item.id !== result.data.id)];
      const passed = result.data.isPassed === true ? "пройдено" : "не пройдено";
      setActionMessage(`Отправка выполнена: ${passed}, балл ${formatScore(result.data.score)}`);
    } else {
      setActionMessage("Отправка выполнена");
    }
  } catch (error) {
    setActionMessage(resolveErrorMessage(error, "Ошибка отправки"));
  } finally {
    busy.value = false;
  }
}

async function onDisciplineChange() {
  if (!auth.isAuthorized || !selectedDisciplineCode.value) return;
  busy.value = true;
  loadError.value = "";
  try {
    await reloadGroups();
  } catch (error) {
    loadError.value = resolveErrorMessage(error, "Не удалось загрузить группы заданий");
  } finally {
    busy.value = false;
  }
}

async function onGroupChange() {
  if (!auth.isAuthorized || !selectedGroupCode.value) return;
  busy.value = true;
  loadError.value = "";
  try {
    await reloadAssignments();
  } catch (error) {
    loadError.value = resolveErrorMessage(error, "Не удалось загрузить задания группы");
  } finally {
    busy.value = false;
  }
}

async function onAssignmentChange() {
  if (!auth.isAuthorized || !selectedAssignmentCode.value) return;
  await reloadAssignmentState();
}

onMounted(async () => {
  auth.init();
  if (!auth.isAuthorized) return;
  await reloadAll();
});
</script>

<style scoped>
.hw-test {
  display: grid;
  gap: 1rem;
}

.hw-test__header h2 {
  margin-bottom: 0.25rem;
}

.hw-test__header p {
  margin: 0;
  color: #4b5563;
}

.hw-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.hw-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.75rem;
  padding: 1rem;
  background: #fff;
}

.hw-card--wide {
  grid-column: 1 / -1;
}

.hw-muted {
  color: #6b7280;
  font-size: 0.92rem;
}

.hw-label {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.hw-select,
.hw-editor {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.18);
  padding: 0.55rem 0.65rem;
  font: inherit;
}

.hw-editor {
  min-height: 220px;
  font-family: "Fira Code", monospace;
  font-size: 0.92rem;
  line-height: 1.45;
  resize: vertical;
}

.hw-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.hw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.22);
  background: #f3f4f6;
  color: #111827;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  text-decoration: none;
}

.hw-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hw-btn--primary {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #fff;
}

.hw-btn--success {
  background: #047857;
  border-color: #047857;
  color: #fff;
}

.hw-banner {
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
}

.hw-banner--info {
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: rgba(59, 130, 246, 0.12);
}

.hw-banner--error {
  border: 1px solid rgba(185, 28, 28, 0.35);
  background: rgba(239, 68, 68, 0.12);
}

.hw-prompt {
  margin-top: 0;
  white-space: pre-wrap;
}

.hw-access {
  margin: 0.5rem 0 0.75rem;
  padding: 0.4rem 0.65rem;
  border-radius: 0.45rem;
  font-size: 0.92rem;
}

.hw-access--ok {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.hw-access--warn {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.hw-access--error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.hw-table {
  width: 100%;
  border-collapse: collapse;
}

.hw-table th,
.hw-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  padding: 0.45rem 0.35rem;
  font-size: 0.92rem;
}

pre {
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.65rem;
  overflow: auto;
}

@media (max-width: 980px) {
  .hw-grid {
    grid-template-columns: 1fr;
  }
}
</style>
