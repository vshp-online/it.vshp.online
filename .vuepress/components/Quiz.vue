<template>
  <div
    v-if="quizQuestions.length"
    class="quiz"
    :class="{ 'quiz--exam-active': isExam && examStarted }"
  >
    <div v-if="isExam" class="quiz-exam">
      <div v-if="!examStarted" class="quiz-exam__setup">
        <label class="quiz-exam__label">
          ФИО студента
          <input
            v-model.trim="studentName"
            type="text"
            class="quiz-exam__input"
            placeholder="Иванов Иван Иванович"
            :disabled="examStarted"
          />
        </label>
        <button
          type="button"
          class="quiz-btn"
          :disabled="startDisabled"
          @click="startExam"
        >
          Начать тестирование
        </button>
        <p v-if="nameError" class="quiz-exam__error">{{ nameError }}</p>
      </div>

      <div v-else class="quiz-exam__bar">
        <div class="quiz-exam__meta">
          <span class="quiz-exam__name">{{ studentName }}</span>
          <span class="quiz-exam__time">Старт: {{ startedAtLabel }}</span>
        </div>
        <div class="quiz-exam__actions">
          <div class="quiz-exam__timer">
            Осталось: {{ timeLeftLabel }}
          </div>
          <button
            v-if="showSurrenderButton"
            type="button"
            class="quiz-btn quiz-btn--danger"
            @click="requestSurrender"
          >
            Сдаться
          </button>
        </div>
      </div>
      <div
        v-if="showSurrenderConfirm"
        class="quiz-exam__overlay"
        role="dialog"
        aria-modal="true"
      >
        <div class="quiz-exam__confirm">
          <p class="quiz-exam__confirm-text">
            Если вы сейчас сдадитесь, то попытка сгорит и результаты засчитаны не будут. Вы точно уверены что хотите сдаться?
          </p>
          <div class="quiz-exam__confirm-actions">
            <button
              type="button"
              class="quiz-btn quiz-btn--danger"
              @click="confirmSurrender"
            >
              Да, уверен, хочу сдаться
            </button>
            <button
              type="button"
              class="quiz-btn quiz-btn--ghost"
              @click="cancelSurrender"
            >
              Нет, не хочу сдаваться!
            </button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="!isExam || examStarted">
      <div
        v-for="(question, qIndex) in quizQuestions"
        :key="question.id ?? qIndex"
        :class="[
          'quiz-question',
          questionStateClass(qIndex),
          { 'quiz-question--attention': attentionIndex === qIndex },
        ]"
        :ref="(el) => setQuestionRef(el, qIndex)"
      >
        <div class="quiz-question__head">
          <div class="quiz-question__title">
            <span class="quiz-question__index">Вопрос {{ qIndex + 1 }}</span>
            <span class="quiz-question__hint">
              {{ question.multiple ? "Выберите все подходящие ответы" : "Выберите один ответ" }}
            </span>
            <span
              v-if="
                quizOptions.showQuestionCodes &&
                question.id !== null &&
                question.id !== undefined
              "
              class="quiz-question__code"
            >
              {{ String(question.id) }}
            </span>
          </div>
        </div>

        <div
          v-if="question.prompt"
          class="quiz-question__text"
          v-html="question.prompt"
        />

        <ul class="quiz-question__answers">
          <li
            v-for="(answer, aIndex) in question.answers"
            :key="answer.id ?? `${qIndex}-${aIndex}`"
            class="quiz-answer"
            :class="answerStateClass(qIndex, aIndex, answer.isCorrect)"
          >
            <label>
              <input
                :type="question.multiple ? 'checkbox' : 'radio'"
                :name="`${quizName}-${qIndex}`"
                :checked="isSelected(qIndex, aIndex)"
                :disabled="isLocked"
                @change="onSelect(qIndex, aIndex, question.multiple, $event)"
              />
              <span
                v-if="answer.content"
                class="quiz-answer__content"
                v-html="answer.content"
              />
              <span v-else class="quiz-answer__content">
                Ответ {{ aIndex + 1 }}
              </span>
            </label>
          </li>
        </ul>

        <p
          v-if="results[qIndex] !== null"
          class="quiz-question__result"
          :class="results[qIndex] ? 'quiz-question__result--success' : 'quiz-question__result--error'"
        >
          {{ results[qIndex] ? "Верно" : "Не верно" }}
        </p>
      </div>

      <div class="quiz__actions">
        <button
          v-if="showCheckButton"
          type="button"
          class="quiz-btn"
          :class="{ 'quiz-btn--inactive': !canCheck }"
          :aria-disabled="!canCheck"
          @click="handleCheckClick"
        >
          Проверить ответы
        </button>
        <button
          v-if="showDownloadButton"
          type="button"
          class="quiz-btn quiz-btn--ghost"
          @click="downloadResults"
        >
          Скачать результаты
        </button>
        <span
          v-if="showDownloadButton && resetAfterMs"
          class="quiz-exam__reset-hint"
        >
          {{ resetCountdownLabel }}
        </span>
        <button
          v-if="showResetButton"
          type="button"
          class="quiz-btn quiz-btn--ghost"
          @click="resetQuiz"
          :disabled="!hasAnySelection && !hasResults"
        >
          Сбросить
        </button>
        <span v-if="hasResults" class="quiz__score" aria-live="polite">
          {{ correctCount }} / {{ totalQuestions }}
        </span>
      </div>
    </template>

    <div v-else class="quiz-exam__placeholder">
      Введите ФИО и нажмите «Начать тестирование», чтобы получить вопросы.
    </div>
  </div>

  <div v-else class="quiz quiz--invalid">
    В этом блоке нет вопросов или он оформлен некорректно.
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { useQuizStore } from "../stores/quizStore";

const props = defineProps({
  questions: {
    type: Array,
    default: () => [],
  },
  quizId: {
    type: String,
    default: "",
  },
  options: {
    type: Object,
    default: () => ({}),
  },
});

const quizStore = useQuizStore();

const normalizeAnswers = (answers = []) =>
  (answers || [])
    .filter((answer) => answer)
    .map((answer) => ({
      id: answer.id ?? null,
      content: answer.content || "",
      isCorrect: Boolean(answer.isCorrect),
    }));

const normalizedQuestions = computed(() => {
  return (props.questions || [])
    .filter(
      (question) =>
        question && Array.isArray(question.answers) && question.answers.length
    )
    .map((question) => ({
      id: question.id ?? null,
      prompt: question.prompt || "",
      multiple: Boolean(question.multiple),
      answers: normalizeAnswers(question.answers),
    }));
});

const quizOptions = computed(() => {
  const options = props.options || {};
  return {
    shuffleQuestions: Boolean(options.shuffleQuestions),
    shuffleAnswers: Boolean(options.shuffleAnswers),
    hideCorrectAnswers: Boolean(options.hideCorrectAnswers),
    disableReset: Boolean(options.disableReset),
    questionLimit: Number.isFinite(options.questionLimit)
      ? Number(options.questionLimit)
      : options.questionLimit ?? null,
    source: options.source || null,
    showQuestionCodes: Boolean(options.showQuestionCodes),
    examMode: Boolean(options.examMode),
    requireName: Boolean(options.requireName),
    timeLimitMinutes: Number.isFinite(options.timeLimitMinutes)
      ? Number(options.timeLimitMinutes)
      : options.timeLimitMinutes ?? null,
    resetAfterMinutes: Number.isFinite(options.resetAfterMinutes)
      ? Number(options.resetAfterMinutes)
      : options.resetAfterMinutes ?? null,
  };
});

const quizQuestions = ref([]);
const selections = ref([]);
const results = ref([]);
const questionRefs = ref([]);
const attentionIndex = ref(null);
let attentionTimer = null;
const generationKey = ref("");
const currentSessionKey = ref("");
const studentName = ref("");
const nameError = ref("");
const examStarted = ref(false);
const examFinished = ref(false);
const examStartedAt = ref(null);
const examFinishedAt = ref(null);
const examEndsAt = ref(null);
const examTimeLeftMs = ref(null);
const timerTick = ref(Date.now());
let examTimer = null;
const surrenderOpen = ref(false);

const isExam = computed(() => quizOptions.value.examMode);
const timeLimitMinutes = computed(() => {
  const limit = Number(quizOptions.value.timeLimitMinutes);
  if (Number.isFinite(limit) && limit > 0) return limit;
  return isExam.value ? 60 : null;
});
const timeLimitMs = computed(() =>
  timeLimitMinutes.value ? timeLimitMinutes.value * 60 * 1000 : null
);
const resetAfterMinutes = computed(() => {
  const value = Number(quizOptions.value.resetAfterMinutes);
  if (Number.isFinite(value) && value > 0) return value;
  return null;
});
const resetAfterMs = computed(() =>
  resetAfterMinutes.value ? resetAfterMinutes.value * 60 * 1000 : null
);
const startedAtLabel = computed(() =>
  examStartedAt.value
    ? new Date(examStartedAt.value).toLocaleString("ru-RU")
    : ""
);
const timeLeftMs = computed(() => {
  if (examFinished.value && examTimeLeftMs.value !== null) {
    return examTimeLeftMs.value;
  }
  if (!examEndsAt.value) return null;
  return Math.max(examEndsAt.value - timerTick.value, 0);
});
const resetAvailable = computed(() => {
  if (
    !isExam.value ||
    !examStarted.value ||
    !examFinished.value ||
    !resetAfterMs.value
  ) {
    return false;
  }
  if (!examFinishedAt.value) return false;
  return timerTick.value - examFinishedAt.value.getTime() >= resetAfterMs.value;
});
const timeLeftLabel = computed(() => {
  if (timeLeftMs.value === null) return "--:--";
  const totalSeconds = Math.ceil(timeLeftMs.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const clearAttention = () => {
  if (attentionTimer) {
    clearTimeout(attentionTimer);
    attentionTimer = null;
  }
  attentionIndex.value = null;
};

const quizName = computed(() => props.quizId || "quiz-block");
const questionLimit = computed(() => {
  const limit = Number(quizOptions.value.questionLimit);
  if (!Number.isFinite(limit) || limit <= 0) return null;
  const total = normalizedQuestions.value.length;
  if (!total) return null;
  return Math.min(Math.floor(limit), total);
});

const setupState = (length) => {
  selections.value = Array.from({ length }, () => []);
  results.value = Array.from({ length }, () => null);
};

const shuffleArray = (source) => {
  const list = [...source];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const buildBaseQuestions = () =>
  normalizedQuestions.value.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => ({ ...answer })),
  }));

const reorderAnswers = (question, storedOrder = []) => {
  if (!Array.isArray(storedOrder) || !storedOrder.length) {
    return question.answers;
  }
  const map = new Map(
    question.answers.map((answer) => [String(answer.id), { ...answer }])
  );
  const ordered = [];
  storedOrder.forEach((id) => {
    const answer = map.get(String(id));
    if (answer) {
      ordered.push(answer);
      map.delete(String(id));
    }
  });
  return ordered.concat(Array.from(map.values()));
};

const applyStoredOrder = (base, session) => {
  if (!session?.questionOrder?.length) return null;
  const limit = questionLimit.value;
  const map = new Map(
    base.map((question) => [String(question.id), { ...question, answers: question.answers.map((answer) => ({ ...answer })) }])
  );
  const ordered = [];
  session.questionOrder.forEach((questionId, index) => {
    if (limit && ordered.length >= limit) return;
    const question = map.get(String(questionId));
    if (!question) return;
    question.answers = reorderAnswers(
      question,
      session.answersOrder?.[index] || []
    );
    ordered.push(question);
    map.delete(String(questionId));
  });
  for (const question of map.values()) {
    if (limit && ordered.length >= limit) break;
    ordered.push(question);
  }
  return ordered;
};

const applyRandomization = (base) => {
  let prepared = base.map((question) => ({
    ...question,
    answers: quizOptions.value.shuffleAnswers
      ? shuffleArray(question.answers)
      : question.answers,
  }));

  if (quizOptions.value.shuffleQuestions) {
    prepared = shuffleArray(prepared);
  }

  if (questionLimit.value && prepared.length > questionLimit.value) {
    prepared = prepared.slice(0, questionLimit.value);
  }

  return prepared;
};

const restoreSessionState = (session) => {
  if (!session) return false;
  if (
    !Array.isArray(session.selections) ||
    session.selections.length !== quizQuestions.value.length
  ) {
    quizStore.clearSession(currentSessionKey.value);
    return false;
  }
  selections.value = session.selections.map((list) => [...list]);
  if (
    Array.isArray(session.results) &&
    session.results.length === quizQuestions.value.length
  ) {
    results.value = session.results.slice();
  }
  return true;
};

const startExamTimer = () => {
  stopExamTimer();
  timerTick.value = Date.now();
  examTimer = setInterval(() => {
    timerTick.value = Date.now();
    if (!examFinished.value && timeLeftMs.value !== null && timeLeftMs.value <= 0) {
      finalizeExam("timeout");
    }
  }, 1000);
  if (!examFinished.value && timeLeftMs.value !== null && timeLeftMs.value <= 0) {
    finalizeExam("timeout");
  }
};

const restoreExamState = (session) => {
  const state = session?.examState;
  if (!state) return false;
  examStarted.value = Boolean(state.examStarted);
  examFinished.value = Boolean(state.examFinished);
  studentName.value = state.studentName || "";
  nameError.value = "";
  examStartedAt.value = state.examStartedAt
    ? new Date(state.examStartedAt)
    : null;
  examFinishedAt.value = state.examFinishedAt
    ? new Date(state.examFinishedAt)
    : null;
  if (examFinished.value && !examFinishedAt.value) {
    examFinishedAt.value = new Date();
  }
  if (Number.isFinite(state.examEndsAt)) {
    examEndsAt.value = state.examEndsAt;
  } else if (examStartedAt.value && timeLimitMs.value) {
    examEndsAt.value = examStartedAt.value.getTime() + timeLimitMs.value;
  } else {
    examEndsAt.value = null;
  }
  examTimeLeftMs.value = Number.isFinite(state.examTimeLeftMs)
    ? state.examTimeLeftMs
    : null;
  timerTick.value = Date.now();
  const shouldTick =
    examStarted.value &&
    (!examFinished.value ||
      (resetAfterMs.value && !resetAvailable.value));
  if (shouldTick) {
    startExamTimer();
  } else {
    stopExamTimer();
  }
  return true;
};

const computeSignature = () =>
  JSON.stringify({
    questions: normalizedQuestions.value,
    shuffleQuestions: quizOptions.value.shuffleQuestions,
    shuffleAnswers: quizOptions.value.shuffleAnswers,
    limit: questionLimit.value,
    source: quizOptions.value.source || null,
  });

const prepareQuestions = () => {
  const signature = computeSignature();
  generationKey.value = signature;
  const sessionKey = `${quizName.value || "quiz-block"}::${signature}`;
  currentSessionKey.value = sessionKey;
  const storedSession = quizStore.getSession(sessionKey);

  const base = buildBaseQuestions();

  if (!base.length) {
    quizQuestions.value = [];
    selections.value = [];
    results.value = [];
    questionRefs.value = [];
    clearAttention();
    return;
  }

  let prepared =
    storedSession && storedSession.questionOrder?.length
      ? applyStoredOrder(base, storedSession)
      : null;

  if (!prepared) {
    prepared = applyRandomization(base);
  }

  quizQuestions.value = prepared;
  setupState(prepared.length);
  questionRefs.value = Array.from({ length: prepared.length });
  clearAttention();

  const restoredSession = storedSession
    ? restoreSessionState(storedSession)
    : false;

  if (isExam.value) {
    const restored = restoredSession && restoreExamState(storedSession);
    if (!restored) {
      examStarted.value = false;
      examFinished.value = false;
      examStartedAt.value = null;
      examFinishedAt.value = null;
      examEndsAt.value = null;
      examTimeLeftMs.value = null;
      surrenderOpen.value = false;
      stopExamTimer();
    }
  }
};

watch(
  () => computeSignature(),
  () => {
    prepareQuestions();
  },
  { immediate: true }
);

const hasAnySelection = computed(() =>
  selections.value.some((answerIndexes) => (answerIndexes?.length ?? 0) > 0)
);
const hasResults = computed(() =>
  results.value.some((result) => result !== null)
);
const isLocked = computed(() => {
  if (isExam.value) {
    return !examStarted.value || examFinished.value;
  }
  return hasResults.value;
});
const allAnswered = computed(() =>
  quizQuestions.value.length > 0 &&
  selections.value.length === quizQuestions.value.length &&
  selections.value.every((answers) => (answers?.length ?? 0) > 0)
);
const canCheck = computed(() => allAnswered.value);
const showResetButton = computed(() => {
  if (!isExam.value) return !quizOptions.value.disableReset;
  return resetAvailable.value;
});
const showCheckButton = computed(
  () => !isExam.value || (examStarted.value && !examFinished.value)
);
const showDownloadButton = computed(
  () => isExam.value && examFinished.value
);
const showSurrenderButton = computed(
  () => isExam.value && examStarted.value && !examFinished.value
);
const showSurrenderConfirm = computed(() => surrenderOpen.value);

function persistSession() {
  if (!currentSessionKey.value) return;
  const payload = {
    questionOrder: quizQuestions.value.map((question) => question.id),
    answersOrder: quizQuestions.value.map((question) =>
      question.answers.map((answer) => answer.id)
    ),
    selections: selections.value.map((items) => [...items]),
    results: results.value.slice(),
    examState: isExam.value
      ? {
          examStarted: examStarted.value,
          examFinished: examFinished.value,
          studentName: studentName.value,
          examStartedAt: examStartedAt.value
            ? examStartedAt.value.getTime()
            : null,
          examFinishedAt: examFinishedAt.value
            ? examFinishedAt.value.getTime()
            : null,
          examEndsAt: examEndsAt.value ?? null,
          examTimeLeftMs: examTimeLeftMs.value ?? null,
        }
      : null,
  };
  if (!isExam.value && !hasAnySelection.value) {
    quizStore.clearSession(currentSessionKey.value);
    return;
  }
  if (isExam.value && !examStarted.value) {
    quizStore.clearSession(currentSessionKey.value);
    return;
  }
  quizStore.saveSession(currentSessionKey.value, payload);
}

const isSelected = (qIndex, aIndex) => {
  return selections.value[qIndex]?.includes(aIndex) ?? false;
};

const onSelect = (qIndex, aIndex, isMultiple, event) => {
  if (isLocked.value) return;
  const input = event.target;
  const current = selections.value[qIndex] ?? [];
  let next;

  if (isMultiple) {
    if (input.checked) {
      next = Array.from(new Set([...current, aIndex]));
    } else {
      next = current.filter((idx) => idx !== aIndex);
    }
  } else {
    next = input.checked ? [aIndex] : [];
  }

  selections.value = selections.value.map((items, idx) =>
    idx === qIndex ? next : items
  );

  if (results.value[qIndex] !== null) {
    results.value = results.value.map((result, idx) =>
      idx === qIndex ? null : result
    );
  }

  persistSession();
};

function evaluateQuestion(question, qIndex) {
  const selected = new Set(selections.value[qIndex] ?? []);
  const correct = new Set();

  question.answers.forEach((answer, index) => {
    if (answer.isCorrect) correct.add(index);
  });

  if (!correct.size) return false;
  if (selected.size !== correct.size) return false;
  for (const index of correct) {
    if (!selected.has(index)) return false;
  }
  return true;
}

function buildResults(markUnansweredAsFalse = false) {
  return quizQuestions.value.map((question, index) => {
    if (!(selections.value[index]?.length)) {
      return markUnansweredAsFalse ? false : null;
    }
    return evaluateQuestion(question, index);
  });
}

const checkAnswers = () => {
  results.value = buildResults(false);
  persistSession();
};

const totalQuestions = computed(() => quizQuestions.value.length);
const correctCount = computed(
  () => results.value.filter((result) => result === true).length
);

const resetQuiz = () => {
  setupState(quizQuestions.value.length);
  clearAttention();
  quizStore.clearSession(currentSessionKey.value);
  if (isExam.value) {
    examStarted.value = false;
    examFinished.value = false;
    examStartedAt.value = null;
    examFinishedAt.value = null;
    examEndsAt.value = null;
    examTimeLeftMs.value = null;
    studentName.value = "";
    nameError.value = "";
    surrenderOpen.value = false;
    stopExamTimer();
  }
};

const questionStateClass = (qIndex) => {
  const state = results.value[qIndex];
  if (state === null) return "";
  return state ? "quiz-question--success" : "quiz-question--error";
};

const answerStateClass = (qIndex, aIndex, isCorrect) => {
  const state = results.value[qIndex];
  if (state === null) return "";
  const selected = isSelected(qIndex, aIndex);

  if (quizOptions.value.hideCorrectAnswers) {
    if (isCorrect && selected) return "quiz-answer--correct";
    if (!isCorrect && selected) return "quiz-answer--wrong";
    return "";
  }

  if (isCorrect && selected) return "quiz-answer--correct";
  if (!isCorrect && selected) return "quiz-answer--wrong";
  if (isCorrect && !selected) return "quiz-answer--missed";
  return "";
};

const setQuestionRef = (el, index) => {
  if (el) {
    questionRefs.value[index] = el;
  }
};

const scrollToQuestion = (index) => {
  const el = questionRefs.value[index];
  if (el?.scrollIntoView) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const highlightQuestion = (index) => {
  clearAttention();
  attentionIndex.value = index;
  attentionTimer = setTimeout(() => {
    clearAttention();
  }, 1000);
};

const focusFirstUnanswered = () => {
  const index = selections.value.findIndex(
    (answers) => (answers?.length ?? 0) === 0
  );
  if (index === -1) return;
  scrollToQuestion(index);
  highlightQuestion(index);
};

const handleCheckClick = () => {
  if (isLocked.value) return;
  if (!canCheck.value) {
    focusFirstUnanswered();
    return;
  }
  checkAnswers();
};

function stopExamTimer() {
  if (examTimer) {
    clearInterval(examTimer);
    examTimer = null;
  }
}

function finalizeExam(reason = "completed") {
  if (examFinished.value) return;
  results.value = buildResults(true);
  examFinished.value = true;
  surrenderOpen.value = false;
  const finishedAt =
    reason === "timeout" && examEndsAt.value
      ? new Date(examEndsAt.value)
      : new Date();
  examFinishedAt.value = finishedAt;
  if (examEndsAt.value) {
    examTimeLeftMs.value = Math.max(
      examEndsAt.value - finishedAt.getTime(),
      0
    );
  }
  if (!resetAfterMs.value) {
    stopExamTimer();
  }
  persistSession();
}

const startDisabled = computed(() => {
  if (examStarted.value) return true;
  if (quizOptions.value.requireName && !studentName.value.trim()) return true;
  return false;
});

const startExam = () => {
  if (startDisabled.value) {
    nameError.value = quizOptions.value.requireName
      ? "Введите ФИО перед началом тестирования."
      : "";
    return;
  }
  nameError.value = "";
  examStarted.value = true;
  examFinished.value = false;
  surrenderOpen.value = false;
  const startedAt = new Date();
  examStartedAt.value = startedAt;
  examFinishedAt.value = null;
  if (timeLimitMs.value) {
    examEndsAt.value = startedAt.getTime() + timeLimitMs.value;
  }
  examTimeLeftMs.value = null;
  startExamTimer();
  persistSession();
};

const requestSurrender = () => {
  if (!showSurrenderButton.value) return;
  surrenderOpen.value = true;
};

const cancelSurrender = () => {
  surrenderOpen.value = false;
};

const confirmSurrender = () => {
  surrenderOpen.value = false;
  resetQuiz();
};

const plainText = (html) => {
  if (typeof window === "undefined") return html || "";
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent?.trim() || "";
};

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("ru-RU") : "";

const formatDuration = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return "00:00";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const resetRemainingMs = computed(() => {
  if (!resetAfterMs.value || !examFinishedAt.value) return null;
  const elapsed = timerTick.value - examFinishedAt.value.getTime();
  return Math.max(resetAfterMs.value - elapsed, 0);
});

const resetCountdownLabel = computed(() => {
  if (!resetAfterMs.value) return "";
  if (resetAvailable.value) return "";
  const remaining = resetRemainingMs.value;
  if (remaining === null) return "";
  return `Сброс доступен через ${formatDuration(remaining)}`;
});

const downloadResults = () => {
  const started = formatDateTime(examStartedAt.value);
  const finishedAt = examFinishedAt.value || new Date();
  const finished = formatDateTime(finishedAt);
  const startedAt = examStartedAt.value || new Date();
  const rawDuration = finishedAt.getTime() - startedAt.getTime();
  const durationMs = timeLimitMs.value
    ? Math.min(rawDuration, timeLimitMs.value)
    : rawDuration;
  const lines = [];
  lines.push(`ФИО: ${studentName.value || "Не указано"}`);
  lines.push(`Начало: ${started}`);
  lines.push(`Окончание: ${finished}`);
  lines.push(`Длительность: ${formatDuration(durationMs)}`);
  lines.push(`Результат: ${correctCount.value} / ${totalQuestions.value}`);
  lines.push("");
  quizQuestions.value.forEach((question, qIndex) => {
    const qTitle = plainText(question.prompt);
    lines.push(`Вопрос ${qIndex + 1}: ${qTitle}`);
    if (question.id !== null && question.id !== undefined) {
      lines.push(`Код вопроса: ${question.id}`);
    }
    const selectedIndexes = selections.value[qIndex] ?? [];
    if (!selectedIndexes.length) {
      lines.push("Ответ: нет");
    } else {
      const selectedTexts = selectedIndexes
        .map((aIndex) => plainText(question.answers[aIndex]?.content))
        .filter(Boolean);
      lines.push(`Ответ: ${selectedTexts.join("; ") || "нет"}`);
    }
    lines.push(`Статус: ${results.value[qIndex] ? "верно" : "неверно"}`);
    lines.push("");
  });
  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const safeName = (studentName.value || "student").replace(/[\\/:*?\"<>|]/g, "_");
  const fileName = `quiz_result_${safeName}.txt`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

watch(
  () => allAnswered.value,
  (value) => {
    if (!isExam.value || !examStarted.value || examFinished.value) return;
    if (value) {
      finalizeExam("completed");
    }
  }
);

watch(
  () => studentName.value,
  (value) => {
    if (value && nameError.value) {
      nameError.value = "";
    }
  }
);

watch(
  () => resetAvailable.value,
  (value) => {
    if (value && examFinished.value) {
      stopExamTimer();
    }
  }
);

onBeforeUnmount(() => {
  clearAttention();
  stopExamTimer();
});
</script>
