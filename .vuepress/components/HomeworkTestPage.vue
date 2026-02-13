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

        <section class="hw-card hw-card--wide hw-task">
          <h3 class="hw-task__title">{{ assignmentTitle }}</h3>

          <div class="hw-task__tabs" role="tablist" aria-label="Задание">
            <span class="hw-task__tab hw-task__tab--active">Условие</span>
            <span class="hw-task__tab">Решение</span>
          </div>

          <div class="hw-task__body">
            <p v-if="assignmentPrompt" class="hw-prompt">{{ assignmentPrompt }}</p>

            <div v-if="accessBadge" class="hw-access" :class="accessBadge.className">
              {{ accessBadge.label }}
            </div>

            <label class="hw-label" for="hw-code">SQL-код</label>
            <div class="hw-editor-wrap">
              <span class="hw-editor-lang">sql</span>
              <textarea
                id="hw-code"
                class="hw-editor"
                v-model="editorCode"
                :disabled="busy || !selectedAssignmentCode"
                spellcheck="false"
                placeholder="Введите SQL-запрос"
              />
            </div>

            <p v-if="autosaveHint" class="hw-autosave" :class="autosaveClass">{{ autosaveHint }}</p>

            <div class="hw-actions">
              <button class="hw-btn" :disabled="busy || !canClear" @click="clearEditor">Очистить</button>
              <button class="hw-btn hw-btn--primary" :disabled="busy || !canRun" @click="runCode">Запустить</button>
              <button class="hw-btn hw-btn--success" :disabled="busy || !canSubmit" @click="submitCode">
                Отправить на проверку
              </button>
            </div>

            <p v-if="actionMessage" class="hw-muted">{{ actionMessage }}</p>
          </div>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { sandboxHomeworkApi } from "../utils/sandboxHomeworkApi";

const auth = useAuthStore();
const AUTO_SAVE_DEBOUNCE_MS = 550;

const busy = ref(false);
const loadError = ref("");
const actionMessage = ref("");
const autosaveState = ref("idle");
const autosaveError = ref("");
const autosaveUpdatedAt = ref(null);
const suppressAutosave = ref(false);
const lastSavedCode = ref("");

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

const canRun = computed(() => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canRun);
const canSubmit = computed(
  () => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canSubmit,
);
const canClear = computed(() => !!selectedAssignmentCode.value && editorCode.value.length > 0);

const lastRun = computed(() => runs.value[0] || null);
const lastSubmission = computed(() => submissions.value[0] || null);
const autosaveHint = computed(() => {
  if (!selectedAssignmentCode.value) return "";

  if (autosaveState.value === "saving") return "Черновик сохраняется...";
  if (autosaveState.value === "error") return autosaveError.value || "Не удалось сохранить черновик";

  if (autosaveState.value === "saved") {
    if (autosaveUpdatedAt.value) {
      return `Черновик сохранен: ${formatDate(autosaveUpdatedAt.value)}`;
    }
    return "Черновик сохранен";
  }

  if (autosaveState.value === "dirty") return "Есть несохраненные изменения...";
  return "";
});

const autosaveClass = computed(() => {
  if (autosaveState.value === "saving") return "hw-autosave--saving";
  if (autosaveState.value === "error") return "hw-autosave--error";
  if (autosaveState.value === "saved") return "hw-autosave--saved";
  if (autosaveState.value === "dirty") return "hw-autosave--dirty";
  return "";
});

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

let autosaveTimer = null;
let autosaveController = null;
let autosaveRequestId = 0;

function resetAutosaveState(code, updatedAt) {
  lastSavedCode.value = code;
  autosaveUpdatedAt.value = updatedAt || null;
  autosaveError.value = "";
  autosaveState.value = selectedAssignmentCode.value ? "saved" : "idle";
}

function clearAutosaveTimer() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

function abortAutosaveRequest() {
  if (autosaveController) {
    autosaveController.abort();
    autosaveController = null;
  }
}

async function saveDraftInternal({ force = false } = {}) {
  if (!auth.token || !selectedAssignmentCode.value) return;

  if (!force && editorCode.value === lastSavedCode.value) {
    if (autosaveState.value === "dirty") {
      autosaveState.value = "saved";
    }
    return;
  }

  abortAutosaveRequest();
  autosaveController = new AbortController();
  const requestId = ++autosaveRequestId;

  autosaveState.value = "saving";
  autosaveError.value = "";

  try {
    const result = await sandboxHomeworkApi.saveDraft(selectedAssignmentCode.value, editorCode.value, {
      token: auth.token,
      signal: autosaveController.signal,
    });

    if (requestId !== autosaveRequestId) {
      return;
    }

    lastSavedCode.value = editorCode.value;
    autosaveUpdatedAt.value = result?.data?.updatedAt || null;
    autosaveState.value = "saved";
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }

    autosaveState.value = "error";
    autosaveError.value = resolveErrorMessage(error, "Не удалось сохранить черновик");
  } finally {
    if (requestId === autosaveRequestId) {
      autosaveController = null;
    }
  }
}

function scheduleAutosave() {
  clearAutosaveTimer();
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null;
    void saveDraftInternal();
  }, AUTO_SAVE_DEBOUNCE_MS);
}

async function flushAutosave() {
  clearAutosaveTimer();
  await saveDraftInternal();
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
      resetAutosaveState("", null);
      autosaveState.value = "idle";
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
    resetAutosaveState("", null);
    autosaveState.value = "idle";
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
    resetAutosaveState("", null);
    autosaveState.value = "idle";
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
    resetAutosaveState("", null);
    autosaveState.value = "idle";
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
    resetAutosaveState("", null);
    autosaveState.value = "idle";
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
    resetAutosaveState("", null);
    autosaveState.value = "idle";
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

    suppressAutosave.value = true;
    const loadedCode = draftRes?.data?.code ?? assignmentRes?.data?.templateSql ?? "";
    editorCode.value = loadedCode;
    resetAutosaveState(loadedCode, draftRes?.data?.updatedAt || null);
    suppressAutosave.value = false;

    runs.value = Array.isArray(runsRes?.data) ? runsRes.data : [];
    submissions.value = Array.isArray(submissionsRes?.data) ? submissionsRes.data : [];
  } catch (error) {
    suppressAutosave.value = false;
    setActionMessage(resolveErrorMessage(error, "Не удалось загрузить данные задания"));
  } finally {
    busy.value = false;
  }
}

async function runCode() {
  if (!auth.token || !selectedAssignmentCode.value) return;

  await flushAutosave();

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

  await flushAutosave();

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

function clearEditor() {
  if (!selectedAssignmentCode.value || !editorCode.value.length) return;

  const shouldClear = window.confirm("Очистить SQL-код в редакторе?");
  if (!shouldClear) return;

  editorCode.value = "";
  setActionMessage("");
}

watch(editorCode, () => {
  if (suppressAutosave.value) return;
  if (!auth.isAuthorized || !auth.token || !selectedAssignmentCode.value) return;

  autosaveState.value = "dirty";
  autosaveError.value = "";
  scheduleAutosave();
});

watch(selectedAssignmentCode, () => {
  clearAutosaveTimer();
  abortAutosaveRequest();
});

onMounted(async () => {
  auth.init();
  if (!auth.isAuthorized) return;
  await reloadAll();
});

onBeforeUnmount(() => {
  clearAutosaveTimer();
  abortAutosaveRequest();
});
</script>

<style scoped>
.hw-test {
  display: grid;
  gap: 1.1rem;
}

.hw-test__header h2 {
  margin-bottom: 0.35rem;
  font-size: clamp(1.9rem, 3.1vw, 2.25rem);
  line-height: 1.18;
}

.hw-test__header p {
  margin: 0;
  color: #52515f;
  font-size: 1.02rem;
}

.hw-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.05rem;
}

.hw-card {
  border: 1px solid #d1d3da;
  border-radius: 1rem;
  padding: 1.05rem;
  background: #fff;
  box-shadow: 0 1px 0 rgba(12, 14, 20, 0.02);
}

.hw-card--wide {
  grid-column: 1 / -1;
}

.hw-muted {
  color: #66687a;
  font-size: 0.92rem;
}

.hw-label {
  display: block;
  margin-top: 0.8rem;
  margin-bottom: 0.3rem;
  font-weight: 600;
}

.hw-select,
.hw-editor {
  width: 100%;
  border-radius: 0.7rem;
  border: 1px solid #cdd0d9;
  padding: 0.55rem 0.65rem;
  font: inherit;
  background: #fff;
}

.hw-editor {
  min-height: 320px;
  padding: 1rem 1.05rem;
  border: 0;
  border-radius: 0.85rem;
  background: #d8dfeb;
  color: #2b2f3a;
  font-family: "Fira Code", monospace;
  font-size: 1.02rem;
  line-height: 1.5;
  resize: vertical;
}

.hw-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.95rem;
}

.hw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  border: 1px solid #bcc1cc;
  background: #eef0f6;
  color: #323646;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.57rem 1.05rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.hw-btn:hover:not(:disabled) {
  filter: brightness(0.97);
  transform: translateY(-1px);
}

.hw-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.hw-btn--primary {
  background: #2457d5;
  border-color: #2457d5;
  color: #fff;
}

.hw-btn--success {
  background: #078166;
  border-color: #078166;
  color: #fff;
}

.hw-banner {
  border-radius: 0.95rem;
  padding: 0.95rem 1.05rem;
}

.hw-banner--info {
  border: 1px solid rgba(38, 93, 176, 0.28);
  background: rgba(54, 107, 196, 0.12);
}

.hw-banner--error {
  border: 1px solid rgba(170, 24, 24, 0.34);
  background: rgba(239, 68, 68, 0.12);
}

.hw-prompt {
  margin: 0.1rem 0 0.95rem;
  color: #3e404c;
  font-size: 1.12rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.hw-access {
  margin: 0.2rem 0 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.7rem;
  font-size: 0.92rem;
}

.hw-access--ok {
  background: rgba(12, 166, 116, 0.12);
  border: 1px solid rgba(12, 166, 116, 0.34);
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
  border-bottom: 1px solid rgba(38, 42, 51, 0.08);
  text-align: left;
  padding: 0.5rem 0.4rem;
  font-size: 0.92rem;
}

pre {
  margin-top: 0.55rem;
  border-radius: 0.7rem;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.75rem;
  overflow: auto;
}

.hw-task {
  overflow: hidden;
  padding: 0;
  background: #ececf1;
}

.hw-task__title {
  margin: 0;
  padding: 1.15rem 1.25rem 0.9rem;
  font-size: clamp(1.8rem, 2.7vw, 2.15rem);
  line-height: 1.2;
}

.hw-task__tabs {
  display: flex;
  align-items: flex-end;
  gap: 0.22rem;
  padding: 0 1rem;
  background: #d7d8df;
}

.hw-task__tab {
  display: inline-flex;
  padding: 0.68rem 1.02rem;
  border-radius: 0.85rem 0.85rem 0 0;
  color: #343744;
  font-size: 1.08rem;
  font-weight: 700;
}

.hw-task__tab--active {
  background: #ececf1;
}

.hw-task__body {
  padding: 1.05rem 1.1rem 1.2rem;
}

.hw-editor-wrap {
  position: relative;
}

.hw-editor-lang {
  position: absolute;
  top: 0.65rem;
  right: 0.9rem;
  font-size: 1.65rem;
  line-height: 1;
  color: rgba(50, 54, 70, 0.9);
}

.hw-autosave {
  margin-top: 0.5rem;
  margin-bottom: 0;
  font-size: 0.9rem;
}

.hw-autosave--saving,
.hw-autosave--dirty {
  color: #4f586f;
}

.hw-autosave--saved {
  color: #0b7a60;
}

.hw-autosave--error {
  color: #b01d1d;
}

@media (max-width: 980px) {
  .hw-grid {
    grid-template-columns: 1fr;
  }

  .hw-editor {
    min-height: 230px;
    font-size: 0.94rem;
  }

  .hw-task__title {
    font-size: 1.75rem;
  }

  .hw-task__tab {
    font-size: 1rem;
  }

  .hw-editor-lang {
    font-size: 1.2rem;
  }
}
</style>
