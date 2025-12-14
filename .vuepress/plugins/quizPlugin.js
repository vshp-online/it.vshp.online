/**
 * Плагин Markdown для синтаксиса ::: quiz
 * Позволяет описывать вопросы/ответы и конвертирует их в Vue-компонент <Quiz>.
 */
export const quizPlugin = () => ({
  name: "quiz-plugin",
  extendsMarkdown: (md) => {
    md.block.ruler.before("fence", "quiz", quizBlock, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    md.renderer.rules.quiz = (tokens, idx) => {
      const token = tokens[idx];
      const questions = buildQuestions(token.content, md);
      if (!questions.length) {
        return `<div class="quiz quiz--invalid">Не удалось разобрать блок quiz.</div>`;
      }
      const payload = escapeAttribute(JSON.stringify(questions));
      const options = token.meta?.options || {};
      const optionsPayload = escapeAttribute(JSON.stringify(options));
      const quizId = `quiz-${token.map?.[0] ?? 0}-${idx}`;
      const idAttr = `quiz-id="${escapeAttribute(quizId)}"`;
      return `<ClientOnly><Quiz :questions='${payload}' :options='${optionsPayload}' ${idAttr} /></ClientOnly>`;
    };
  },
});

/**
 * Обработчик ::: quiz
 */
function quizBlock(state, startLine, endLine, silent) {
  const startPos = state.bMarks[startLine] + state.tShift[startLine];
  const maxPos = state.eMarks[startLine];
  const marker = state.src.slice(startPos, maxPos);
  if (!marker.trimStart().startsWith(":::")) return false;

  const markup = marker.match(/^:::+/)?.[0];
  if (!markup) return false;

  const params = marker.slice(marker.indexOf(markup) + markup.length).trim();
  if (!params.startsWith("quiz")) return false;

  let nextLine = startLine;
  let found = false;

  while (nextLine < endLine) {
    nextLine += 1;
    if (nextLine >= endLine) break;

    const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
    const lineEnd = state.eMarks[nextLine];
    const line = state.src.slice(lineStart, lineEnd).trim();

    if (!line.startsWith(markup)) continue;
    const tail = line.slice(markup.length).trim();
    if (tail === "") {
      found = true;
      break;
    }
  }

  if (!found) return false;
  if (silent) return true;

  const token = state.push("quiz", "", 0);
  token.block = true;
  token.info = params;
  token.map = [startLine, nextLine];
  token.markup = markup;
  token.meta = { options: parseOptions(params) };
  token.content = state.getLines(startLine + 1, nextLine, 0, true).trimEnd();

  state.line = nextLine + 1;
  return true;
}

function buildQuestions(rawContent, md) {
  const lines = dedent(rawContent).split(/\r?\n/);
  const questions = [];
  let current = null;
  let mode = "idle";
  let questionBuffer = [];
  let answerBuffer = [];

  const flushQuestionText = () => {
    if (!current) return;
    if (current.prompt) return;
    const source = questionBuffer.join("\n").trim();
    questionBuffer = [];
    current.prompt = source ? cleanHtml(md.render(source)) : "";
  };

  const flushAnswerBuffer = () => {
    if (!current || !current.answers.length) return;
    const source = answerBuffer.join("\n").trim();
    answerBuffer = [];
    const last = current.answers[current.answers.length - 1];
    if (!last) return;
    if (!source) {
      last.content = "";
      return;
    }
    const withBreaks = source.replace(/\n/g, "  \n");
    last.content = cleanHtml(md.renderInline(withBreaks));
  };

  const finalizeQuestion = () => {
    if (!current) return;
    if (mode === "question") flushQuestionText();
    if (mode === "answers") flushAnswerBuffer();
    if (current.answers.length) {
      questions.push(current);
    }
    current = null;
    mode = "idle";
    questionBuffer = [];
    answerBuffer = [];
  };

  for (const originalLine of lines) {
    const line = originalLine;
    const trimmed = line.trim();

    if (/^@question\b/.test(trimmed)) {
      finalizeQuestion();
      current = { prompt: "", answers: [], multiple: false };
      mode = "question";
      continue;
    }

    if (/^@answers?\b/.test(trimmed)) {
      if (!current) continue;
      flushQuestionText();
      current.multiple = trimmed.startsWith("@answers");
      mode = "answers";
      continue;
    }

    if (!current) continue;

    if (mode === "question") {
      questionBuffer.push(line);
      continue;
    }

    if (mode === "answers") {
      const match = line.match(/^\s*[-*+]\s*\[(x|X| )\]\s*(.*)$/);
      if (match) {
        flushAnswerBuffer();
        current.answers.push({
          isCorrect: match[1].toLowerCase() === "x",
          content: "",
        });
        answerBuffer = [match[2] ?? ""];
        continue;
      }

      if (current.answers.length) {
        answerBuffer.push(line.replace(/^\s{0,4}/, ""));
      }
    }
  }

  finalizeQuestion();

  return questions.map((question, index) => ({
    id: index + 1,
    prompt: question.prompt,
    multiple: question.multiple,
    answers: question.answers.map((answer, answerIndex) => ({
      id: `${index + 1}-${answerIndex + 1}`,
      content: answer.content,
      isCorrect: !!answer.isCorrect,
    })),
  }));
}

function parseOptions(params) {
  const tail = params.replace(/^quiz\b/, "").trim();
  if (!tail) return {};
  const tokens = tail.split(/\s+/).filter(Boolean);
  const options = {
    shuffleQuestions: false,
    shuffleAnswers: false,
    hideCorrectAnswers: false,
    disableReset: false,
  };

  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (
      normalized === "randomize-questions" ||
      normalized === "shuffle-questions" ||
      normalized === "questions-random" ||
      normalized === "questions-shuffle"
    ) {
      options.shuffleQuestions = true;
    }
    if (
      normalized === "randomize-answers" ||
      normalized === "shuffle-answers" ||
      normalized === "answers-random" ||
      normalized === "answers-shuffle"
    ) {
      options.shuffleAnswers = true;
    }
    if (
      normalized === "hide-correct" ||
      normalized === "hide-correct-answers" ||
      normalized === "no-correct"
    ) {
      options.hideCorrectAnswers = true;
    }
    if (
      normalized === "disable-reset" ||
      normalized === "no-reset" ||
      normalized === "hide-reset" ||
      normalized === "reset-off"
    ) {
      options.disableReset = true;
    }
  }

  return options;
}

function dedent(content) {
  const lines = content.replace(/\t/g, "  ").split(/\r?\n/);
  let indent = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    const leading = line.match(/^ */)?.[0].length ?? 0;
    if (indent === null) {
      indent = leading;
    } else {
      indent = Math.min(indent, leading);
    }
    if (indent === 0) break;
  }

  if (!indent) return content;
  return lines.map((line) => line.slice(Math.min(indent, line.length))).join("\n");
}

const ESCAPE_RE = /[&<>'"]/g;
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeAttribute(str) {
  return str.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]);
}

function cleanHtml(html) {
  return html.trim();
}
