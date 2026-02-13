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
          <p v-if="disciplineAccessBadge" class="hw-access-pill hw-context-access" :class="disciplineAccessBadge.className">
            {{ disciplineAccessBadge.label }}
          </p>

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
          <h3 class="hw-assignment-title">{{ assignmentTitle }}</h3>

          <div class="vp-tabs hw-assignment-tabs">
            <div class="vp-tabs-nav" role="tablist" aria-label="Задание">
              <button
                type="button"
                class="vp-tab-nav"
                :class="{ active: activeTaskTab === 'condition' }"
                role="tab"
                :aria-selected="activeTaskTab === 'condition' ? 'true' : 'false'"
                @click="activeTaskTab = 'condition'"
              >
                Условие
              </button>
              <button
                type="button"
                class="vp-tab-nav"
                :class="{ active: activeTaskTab === 'solution' }"
                role="tab"
                :aria-selected="activeTaskTab === 'solution' ? 'true' : 'false'"
                @click="activeTaskTab = 'solution'"
              >
                Решение
              </button>
            </div>
            <div
              class="vp-tab"
              :class="{ active: activeTaskTab === 'condition' }"
              role="tabpanel"
              :aria-expanded="activeTaskTab === 'condition' ? 'true' : 'false'"
              v-show="activeTaskTab === 'condition'"
            >
              <div class="vp-tab-title">Условие</div>
              <p v-if="assignmentPrompt" class="hw-prompt">{{ assignmentPrompt }}</p>

              <label class="hw-label" for="hw-code">SQL-код</label>
              <div class="hw-editor-block language-sql line-numbers-mode" data-highlighter="prismjs" data-ext="sql">
                <pre><code
                  id="hw-code"
                  ref="editorCodeEl"
                  class="language-sql"
                  :contenteditable="editorEnabled ? 'true' : 'false'"
                  spellcheck="false"
                  @input="onEditorInput"
                ></code></pre>
                <div class="line-numbers" aria-hidden="true"></div>
              </div>

              <p v-if="autosaveHint" class="hw-autosave" :class="autosaveClass">{{ autosaveHint }}</p>

              <div class="hw-actions hw-actions--task">
                <button class="quiz-btn quiz-btn--ghost" :disabled="busy || !canClear" @click="clearEditor">Очистить</button>
                <button class="quiz-btn" :disabled="busy || !canRun" @click="runCode">Запустить</button>
                <button class="quiz-btn hw-submit-btn" :disabled="busy || !canSubmit" @click="submitCode">
                  Отправить на проверку
                </button>
              </div>

              <p v-if="actionMessage" class="hw-muted hw-message">{{ actionMessage }}</p>

              <section v-if="currentRunResult" class="hw-inline-run">
                <div class="hw-inline-run__head">
                  <p class="hw-inline-run__meta">
                    Результат запуска: {{ formatDate(currentRunResult.createdAt) }}, статус
                    <strong>{{ currentRunResult.runStatus }}</strong>
                  </p>
                  <button class="hw-run-clear-btn" @click="clearRunResult" title="Скрыть результат запуска">✕</button>
                </div>
                <div v-if="currentRunResult.stdout" class="hw-inline-run__stream">
                  <p class="hw-inline-run__label">stdout</p>
                  <div class="hw-codapi-output">
                    <pre>{{ currentRunResult.stdout }}</pre>
                  </div>
                </div>
                <div v-if="currentRunResult.stderr" class="hw-inline-run__stream">
                  <p class="hw-inline-run__label">stderr</p>
                  <div class="hw-codapi-output">
                    <pre>{{ currentRunResult.stderr }}</pre>
                  </div>
                </div>
              </section>
            </div>

            <div
              class="vp-tab"
              :class="{ active: activeTaskTab === 'solution' }"
              role="tabpanel"
              :aria-expanded="activeTaskTab === 'solution' ? 'true' : 'false'"
              v-show="activeTaskTab === 'solution'"
            >
              <div class="vp-tab-title">Решение</div>
              <p v-if="!displayedSolutionSubmission" class="hw-muted">Решение еще не отправлялось.</p>

              <template v-else>
                <p class="hw-solution-heading">{{ solutionHeading }}</p>
                <p class="hw-solution-status">
                  Проверка:
                  <strong>{{ solutionStatusLabel }}</strong>
                  · Статус {{ displayedSolutionSubmission.submissionStatus }} · Балл {{ formatScore(displayedSolutionSubmission.score) }}
                </p>
                <p class="hw-muted">Отправлено: {{ formatDate(displayedSolutionSubmission.createdAt) }}</p>
                <div class="language-sql hw-solution-code line-numbers-mode" data-highlighter="prismjs" data-ext="sql">
                  <pre><code class="language-sql" v-html="displayedSolutionCodeHtml"></code></pre>
                  <div class="line-numbers ln-runtime" aria-hidden="true">
                    <div
                      v-for="lineNumber in displayedSolutionLineCount"
                      :key="lineNumber"
                      class="line-number"
                      :data-line="lineNumber"
                    ></div>
                  </div>
                </div>

                <details class="hw-submissions-list" v-if="submissions.length > 0">
                  <summary>Все отправленные решения</summary>
                  <table class="hw-table hw-table--compact">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Время</th>
                        <th>Принято</th>
                        <th>Балл</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="submission in submissions"
                        :key="submission.id"
                        :class="{ 'hw-row-selected': submission.id === displayedSolutionSubmission.id }"
                      >
                        <td><code>#{{ submission.id }}</code></td>
                        <td>{{ formatDate(submission.createdAt) }}</td>
                        <td>
                          <span
                            class="hw-status-icon"
                            :class="submission.isPassed ? 'hw-status-icon--ok' : 'hw-status-icon--bad'"
                            :title="submission.isPassed ? 'Принято' : 'Не принято'"
                          >
                            {{ submission.isPassed ? "✓" : "✕" }}
                          </span>
                        </td>
                        <td>{{ formatScore(submission.score) }}</td>
                        <td>
                          <button class="hw-link-btn" @click="selectSubmission(submission.id)">
                            Открыть
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </template>
            </div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Prism from "prismjs";
import "prismjs/components/prism-sql";
import { rescanEditablePrism } from "../client/editablePrism";
import { useAuthStore } from "../stores/auth";
import { sandboxHomeworkApi } from "../utils/sandboxHomeworkApi";

const auth = useAuthStore();
const AUTO_SAVE_DEBOUNCE_MS = 550;
const EDITABLE_SELECTOR = 'pre > code[contenteditable="true"][class*="language-"]';

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
const editorCodeEl = ref(null);
const runs = ref([]);
const submissions = ref([]);
const currentRunResult = ref(null);
const activeTaskTab = ref("condition");
const selectedSubmissionId = ref(null);
const isManualSubmissionSelection = ref(false);

const assignmentTitle = computed(() => assignment.value?.data?.title || "Выберите задание");
const assignmentPrompt = computed(() => assignment.value?.data?.promptMd || "");

const assignmentAccess = computed(() => assignment.value?.data?.access || null);
const selectedDiscipline = computed(
  () => disciplines.value.find((item) => item.code === selectedDisciplineCode.value) || null,
);

const disciplineAccessBadge = computed(() => {
  if (!selectedDiscipline.value) return null;

  if (selectedDiscipline.value.canSubmit) {
    return {
      className: "hw-access-pill--ok",
      label: "Доступ к домашним заданиям активен: можно запускать и отправлять",
    };
  }

  if (selectedDiscipline.value.canRun) {
    return {
      className: "hw-access-pill--warn",
      label: "Доступ к домашним заданиям ограничен: можно только запускать",
    };
  }

  return {
    className: "hw-access-pill--error",
    label: `Доступ к домашним заданиям ограничен (${selectedDiscipline.value.reason || "UNKNOWN"})`,
  };
});

const editorEnabled = computed(() => !busy.value && !!selectedAssignmentCode.value);
const canRun = computed(() => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canRun);
const canSubmit = computed(
  () => !!selectedAssignmentCode.value && !!editorCode.value.trim() && !!assignmentAccess.value?.canSubmit,
);
const canClear = computed(() => !!selectedAssignmentCode.value && editorCode.value.length > 0);

const lastRun = computed(() => runs.value[0] || null);
const lastSubmission = computed(() => submissions.value[0] || null);
const acceptedSubmissions = computed(() => submissions.value.filter((item) => item.isPassed === true));
const latestAcceptedSubmission = computed(() => acceptedSubmissions.value[0] || null);
const displayedSolutionSubmission = computed(() => {
  if (selectedSubmissionId.value) {
    const selected = submissions.value.find((item) => item.id === selectedSubmissionId.value);
    if (selected) return selected;
  }

  if (latestAcceptedSubmission.value) {
    return latestAcceptedSubmission.value;
  }

  return submissions.value[0] || null;
});

const solutionHeading = computed(() => {
  if (!displayedSolutionSubmission.value) return "";
  if (isManualSubmissionSelection.value) return `Решение #${displayedSolutionSubmission.value.id}`;
  if (latestAcceptedSubmission.value) return `Последнее принятое решение #${latestAcceptedSubmission.value.id}`;
  if (displayedSolutionSubmission.value) return `Решение #${displayedSolutionSubmission.value.id}`;
  return "";
});

const solutionStatusLabel = computed(() => {
  if (!displayedSolutionSubmission.value) return "-";
  return displayedSolutionSubmission.value.isPassed === true ? "принято" : "не принято";
});

const displayedSolutionCodeHtml = computed(() => {
  const code = displayedSolutionSubmission.value?.code || "-- Решение еще не отправлялось";

  try {
    return Prism.highlight(code, Prism.languages.sql, "sql");
  } catch {
    return escapeHtml(code);
  }
});
const displayedSolutionLineCount = computed(() => {
  const code = displayedSolutionSubmission.value?.code || "";
  return Math.max(1, code.split("\n").length);
});
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getEditorText() {
  return editorCodeEl.value?.textContent || "";
}

async function syncEditorDomFromState() {
  await nextTick();

  if (!editorCodeEl.value) return;
  if (getEditorText() === editorCode.value) return;

  editorCodeEl.value.textContent = editorCode.value;
  rescanEditablePrism(Prism, EDITABLE_SELECTOR);
}

function onEditorInput() {
  if (!editorCodeEl.value) return;
  editorCode.value = getEditorText();
}

function selectDefaultSubmission() {
  isManualSubmissionSelection.value = false;
  if (latestAcceptedSubmission.value) {
    selectedSubmissionId.value = latestAcceptedSubmission.value.id;
    return;
  }

  selectedSubmissionId.value = submissions.value[0]?.id || null;
}

function normalizeInitialCode(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/^\n+/, "");
}

function selectSubmission(submissionId) {
  selectedSubmissionId.value = submissionId;
  isManualSubmissionSelection.value = true;
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
      await syncEditorDomFromState();
      resetAutosaveState("", null);
      autosaveState.value = "idle";
      runs.value = [];
      submissions.value = [];
      currentRunResult.value = null;
      selectedSubmissionId.value = null;
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
    await syncEditorDomFromState();
    resetAutosaveState("", null);
    autosaveState.value = "idle";
    runs.value = [];
    submissions.value = [];
    currentRunResult.value = null;
    selectedSubmissionId.value = null;
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
    await syncEditorDomFromState();
    resetAutosaveState("", null);
    autosaveState.value = "idle";
    runs.value = [];
    submissions.value = [];
    currentRunResult.value = null;
    selectedSubmissionId.value = null;
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
    await syncEditorDomFromState();
    resetAutosaveState("", null);
    autosaveState.value = "idle";
    runs.value = [];
    submissions.value = [];
    currentRunResult.value = null;
    selectedSubmissionId.value = null;
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
    const loadedCode = normalizeInitialCode(draftRes?.data?.code ?? assignmentRes?.data?.templateSql ?? "");
    editorCode.value = loadedCode;
    await syncEditorDomFromState();
    resetAutosaveState(loadedCode, draftRes?.data?.updatedAt || null);
    suppressAutosave.value = false;

    runs.value = Array.isArray(runsRes?.data) ? runsRes.data : [];
    submissions.value = Array.isArray(submissionsRes?.data) ? submissionsRes.data : [];
    currentRunResult.value = null;
    selectDefaultSubmission();
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
      currentRunResult.value = result.data;
    }
    setActionMessage("");
  } catch (error) {
    currentRunResult.value = null;
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
      if (result.data.isPassed === true) {
        selectedSubmissionId.value = result.data.id;
      } else if (!latestAcceptedSubmission.value) {
        selectedSubmissionId.value = result.data.id;
      }
      isManualSubmissionSelection.value = false;
      activeTaskTab.value = "solution";
      setActionMessage("");
    } else {
      setActionMessage("");
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

function clearRunResult() {
  currentRunResult.value = null;
}

function clearEditor() {
  if (!selectedAssignmentCode.value || !editorCode.value.length) return;

  const shouldClear = window.confirm("Очистить SQL-код в редакторе?");
  if (!shouldClear) return;

  editorCode.value = "";
  void syncEditorDomFromState();
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
  activeTaskTab.value = "condition";
  currentRunResult.value = null;
  selectedSubmissionId.value = null;
  isManualSubmissionSelection.value = false;
});

watch(editorEnabled, (enabled) => {
  if (!editorCodeEl.value) return;
  if (!enabled) {
    editorCodeEl.value.blur();
  }
});

onMounted(async () => {
  auth.init();
  if (!auth.isAuthorized) return;
  await reloadAll();
  await syncEditorDomFromState();
  rescanEditablePrism(Prism, EDITABLE_SELECTOR);
});

onBeforeUnmount(() => {
  clearAutosaveTimer();
  abortAutosaveRequest();
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
  padding: 0.85rem 1rem 1rem;
  background: #fff;
}

.hw-card--wide {
  grid-column: 1 / -1;
}

.hw-assignment-title {
  margin: 0 0 0.4rem;
  padding: 0 !important;
}

.hw-card > h3 {
  margin-top: 0;
  padding-top: 0 !important;
  margin-bottom: 0.55rem;
}

:deep(.hw-test h2),
:deep(.hw-test h3),
:deep(.hw-test h4) {
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.hw-muted {
  color: #6b7280;
  font-size: 0.92rem;
}

.hw-label {
  display: block;
  margin-top: 0.2rem;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.hw-select {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.18);
  padding: 0.55rem 0.65rem;
  font: inherit;
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
  background: var(--vp-c-accent);
  border-color: var(--vp-c-accent);
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
  margin: 0 0 0.2rem;
  white-space: pre-wrap;
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

.hw-assignment-tabs {
  margin-top: 0.5rem;
}

.hw-assignment-tabs :deep(.vp-tab) {
  padding: 0.85rem !important;
}

.hw-editor-block {
  margin: 0 !important;
  border-radius: 0.5rem;
  overflow: hidden;
}

.hw-editor-block > pre {
  margin: 0;
}

.hw-editor-block > pre > code[contenteditable="true"]:focus {
  outline: none;
}

.hw-editor-block > pre > code[contenteditable="false"] {
  cursor: not-allowed;
  opacity: 0.78;
}

.hw-access-pill {
  margin: 0.35rem 0 0.6rem;
  display: inline-flex;
  align-items: center;
  border-radius: 0.55rem;
  border: 1px solid transparent;
  padding: 0.35rem 0.7rem;
  font-size: 0.9rem;
}

.hw-context-access {
  margin-top: 0.55rem;
  margin-bottom: 0.2rem;
}

.hw-access-pill--ok {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.35);
}

.hw-access-pill--warn {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
}

.hw-access-pill--error {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
}

.hw-autosave {
  margin-top: 0.3rem;
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

.hw-actions--task {
  margin-top: 0.3rem;
  gap: 0.65rem;
}

.hw-submit-btn {
  background: #0f8a5f;
}

.hw-submit-btn:hover:not(:disabled) {
  background: #0d754f;
}

.hw-message {
  margin-top: 0.45rem;
  margin-bottom: 0;
}

.hw-inline-run {
  margin-top: 0.5rem;
}

.hw-inline-run__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.hw-inline-run__meta {
  margin: 0;
  font-size: 0.92rem;
  color: #4b5563;
}

.hw-inline-run__stream + .hw-inline-run__stream {
  margin-top: 0.5rem;
}

.hw-inline-run__label {
  margin: 0.2rem 0 0.25rem;
  font-size: 0.82rem;
  color: #4b5563;
}

.hw-run-clear-btn {
  border: 1px solid #b91c1c;
  border-radius: 0.45rem;
  background: #b91c1c;
  color: #fff;
  line-height: 1;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.18rem 0.38rem;
  cursor: pointer;
}

.hw-run-clear-btn:hover {
  background: #991b1b;
  border-color: #991b1b;
}

.hw-solution-status {
  margin: 0 0 0.25rem;
}

.hw-solution-heading {
  margin: 0 0 0.3rem;
  font-weight: 600;
}

.hw-solution-code {
  margin: 0.35rem 0 0;
}

.hw-submissions-list {
  margin-top: 0.7rem;
}

.hw-submissions-list > summary {
  cursor: pointer;
  color: #374151;
  font-weight: 600;
}

.hw-table--compact {
  margin-top: 0.45rem;
}

.hw-table--compact th,
.hw-table--compact td {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
}

.hw-status-icon {
  display: inline-flex;
  width: 1.25rem;
  justify-content: center;
  font-weight: 700;
}

.hw-status-icon--ok {
  color: #0f8a5f;
}

.hw-status-icon--bad {
  color: #c03745;
}

.hw-link-btn {
  border: 0;
  background: transparent;
  color: var(--vp-c-accent);
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.hw-link-btn:hover {
  text-decoration: underline;
}

.hw-row-selected {
  background: rgba(15, 23, 42, 0.04);
}

.hw-codapi-output > pre {
  margin-top: 0;
  padding: 8px 16px;
  border-radius: 5px;
  background-color: rgb(255 251 240);
  overflow: auto;
  line-height: 1.2;
  font-size: var(--code-font-size);
}

@media (max-width: 980px) {
  .hw-grid {
    grid-template-columns: 1fr;
  }
}
</style>
