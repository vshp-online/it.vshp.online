<template>
  <div v-if="quizQuestions.length" class="quiz">
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
        type="button"
        class="quiz-btn"
        :class="{ 'quiz-btn--inactive': !canCheck }"
        :aria-disabled="!canCheck"
        @click="handleCheckClick"
      >
        Проверить ответы
      </button>
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
  </div>

  <div v-else class="quiz quiz--invalid">
    В этом блоке нет вопросов или он оформлен некорректно.
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";

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
  };
});

const quizQuestions = ref([]);
const selections = ref([]);
const results = ref([]);
const questionRefs = ref([]);
const attentionIndex = ref(null);
let attentionTimer = null;
const generationKey = ref("");

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

const prepareQuestions = () => {
  const signature = JSON.stringify({
    questions: normalizedQuestions.value,
    shuffleQuestions: quizOptions.value.shuffleQuestions,
    shuffleAnswers: quizOptions.value.shuffleAnswers,
    limit: questionLimit.value,
  });
  if (signature === generationKey.value) return;
  generationKey.value = signature;

  const base = normalizedQuestions.value.map((question) => ({
    ...question,
    answers: question.answers.map((answer) => ({ ...answer })),
  }));

  if (!base.length) {
    quizQuestions.value = [];
    selections.value = [];
    results.value = [];
    questionRefs.value = [];
    clearAttention();
    return;
  }

  if (quizOptions.value.shuffleAnswers) {
    base.forEach((question) => {
      question.answers = shuffleArray(question.answers);
    });
  }

  let prepared = quizOptions.value.shuffleQuestions
    ? shuffleArray(base)
    : base;

  if (questionLimit.value && questionLimit.value < prepared.length) {
    prepared = prepared.slice(0, questionLimit.value);
  }

  quizQuestions.value = prepared;
  setupState(quizQuestions.value.length);
  questionRefs.value = Array.from({ length: quizQuestions.value.length });
  clearAttention();
};

watch(
  () => JSON.stringify({
    questions: normalizedQuestions.value,
    shuffleQuestions: quizOptions.value.shuffleQuestions,
    shuffleAnswers: quizOptions.value.shuffleAnswers,
    limit: questionLimit.value,
  }),
  () => {
    generationKey.value = "";
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
const isLocked = computed(() => hasResults.value);
const allAnswered = computed(() =>
  quizQuestions.value.length > 0 &&
  selections.value.length === quizQuestions.value.length &&
  selections.value.every((answers) => (answers?.length ?? 0) > 0)
);
const canCheck = computed(() => allAnswered.value);
const showResetButton = computed(() => !quizOptions.value.disableReset);

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
};

const evaluateQuestion = (question, qIndex) => {
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
};

const checkAnswers = () => {
  results.value = quizQuestions.value.map((question, index) => {
    if (!(selections.value[index]?.length)) return null;
    return evaluateQuestion(question, index);
  });
};

const totalQuestions = computed(() => quizQuestions.value.length);
const correctCount = computed(
  () => results.value.filter((result) => result === true).length
);

const resetQuiz = () => {
  setupState(quizQuestions.value.length);
  clearAttention();
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

onBeforeUnmount(() => {
  clearAttention();
});
</script>
