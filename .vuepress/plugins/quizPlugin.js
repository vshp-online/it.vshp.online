import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

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
      const questions = buildQuestions(token.content, md, token.meta);
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
  token.meta = {
    options: parseOptions(params),
    filePath: state.env?.filePath || "",
  };
  token.content = state.getLines(startLine + 1, nextLine, 0, true).trimEnd();

  state.line = nextLine + 1;
  return true;
}

function buildQuestions(rawContent, md, meta = {}) {
  const options = meta.options || {};
  if (options.source) {
    const sources = Array.isArray(options.source)
      ? options.source
      : [options.source];
    const lecturesFilter = buildLectureFilter(options?.lectures);
    let collected = [];
    for (const source of sources) {
      const external = loadExternalQuestions(
        { ...options, source, lectures: null },
        meta.filePath,
        md
      );
      if (external.length) {
        collected = collected.concat(external);
      }
    }
    const normalized = normalizeQuestions(collected);
  if (lecturesFilter && normalized.length) {
    return normalized.filter((question) =>
      shouldKeepQuestion(question, lecturesFilter)
    );
  }
    if (normalized.length) return normalized;
  }
  return parseInlineQuestions(rawContent, md);
}

function parseInlineQuestions(rawContent, md) {
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

  return normalizeQuestions(questions);
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
    questionLimit: null,
    source: null,
    lectures: null,
    showQuestionCodes: false,
  };

  for (const token of tokens) {
    const [rawKey, rawValue] = token.split("=", 2);
    const key = rawKey.toLowerCase();

    if (rawValue !== undefined) {
      if (key === "source") {
        if (!options.source) {
          options.source = rawValue;
        } else if (Array.isArray(options.source)) {
          options.source.push(rawValue);
        } else {
          options.source = [options.source, rawValue];
        }
        continue;
      }
      if (key === "lecture" || key === "lectures" || key === "topics" || key === "blocks") {
        const values = rawValue
          .split(/[,;]/)
          .map((value) => value.trim())
          .filter(Boolean);
        if (values.length) {
          options.lectures = values;
        }
        continue;
      }
      if (
        key === "limit" ||
        key === "question-limit" ||
        key === "questions-limit" ||
        key === "questions"
      ) {
        const value = Number(rawValue);
        if (Number.isFinite(value) && value > 0) {
          options.questionLimit = Math.floor(value);
        }
      }
      continue;
    }

    if (
      key === "randomize-questions" ||
      key === "shuffle-questions" ||
      key === "questions-random" ||
      key === "questions-shuffle"
    ) {
      options.shuffleQuestions = true;
      continue;
    }
    if (
      key === "randomize-answers" ||
      key === "shuffle-answers" ||
      key === "answers-random" ||
        key === "answers-shuffle"
    ) {
      options.shuffleAnswers = true;
      continue;
    }
    if (key === "hide-correct" || key === "hide-correct-answers" || key === "no-correct") {
      options.hideCorrectAnswers = true;
      continue;
    }
    if (key === "disable-reset" || key === "no-reset" || key === "hide-reset" || key === "reset-off") {
      options.disableReset = true;
      continue;
    }
    if (
      key === "show-code" ||
      key === "show-codes" ||
      key === "show-question-code" ||
      key === "show-question-codes" ||
      key === "show-question-id" ||
      key === "show-question-ids"
    ) {
      options.showQuestionCodes = true;
    }
  }

  return options;
}

function loadExternalQuestions(options, filePath, md) {
  const source = options?.source;
  try {
    const absolute = resolveSourcePath(source, filePath);
    if (!absolute) return [];
    const content = readFileSync(absolute, "utf8");
    const ext = path.extname(absolute).toLowerCase();
    let data;
    if (ext === ".json") {
      data = JSON.parse(content);
    } else if (ext === ".yaml" || ext === ".yml") {
      data = parseYaml(content);
    } else {
      return [];
    }
    const sourceQuestions = extractQuestionsFromSource(data);
    if (!sourceQuestions.length) return [];
    return sourceQuestions
      .map((question) => normalizeExternalQuestion(question, md))
      .filter(Boolean);
  } catch (error) {
    console.warn(`[quizPlugin] Failed to load quiz source \"${source}\":`, error);
    return [];
  }
}

function normalizeExternalQuestion(item, md) {
  if (!item || typeof item !== "object") return null;
  const rawPrompt =
    item.question ?? item.prompt ?? item.text ?? item.title ?? "";
  const prompt =
    typeof rawPrompt === "string" ? cleanHtml(md.render(rawPrompt)) : "";
  const multiple =
    typeof item.multiple === "boolean"
      ? item.multiple
      : item.type === "multiple";
  const answers = Array.isArray(item.answers)
    ? item.answers
        .map((answer) => normalizeExternalAnswer(answer, md))
        .filter(Boolean)
    : [];
  if (!answers.length) return null;
  const normalized = { prompt, multiple, answers };
  const questionId =
    item.id ?? item.code ?? item.questionId ?? item.uid ?? item.slug ?? null;
  if (questionId) normalized.id = questionId;
  if (item.lectureId ?? item.lecture_id ?? item._lectureId) {
    normalized.lectureId =
      item.lectureId ?? item.lecture_id ?? item._lectureId ?? null;
  }
  if (item.lectureTitle ?? item.lecture_title ?? item._lectureTitle) {
    normalized.lectureTitle =
      item.lectureTitle ?? item.lecture_title ?? item._lectureTitle ?? null;
  }
  return normalized;
}

function normalizeExternalAnswer(answer, md) {
  if (!answer) return null;
  if (typeof answer === "string") {
    return {
      content: cleanHtml(md.renderInline(answer)),
      isCorrect: false,
    };
  }
  if (typeof answer !== "object") return null;
  const rawContent =
    answer.content ?? answer.text ?? answer.value ?? answer.title ?? "";
  if (!rawContent) return null;
  const isCorrect =
    typeof answer.isCorrect === "boolean"
      ? answer.isCorrect
      : typeof answer.correct === "boolean"
      ? answer.correct
      : answer.right === true;
  return {
    content: cleanHtml(md.renderInline(String(rawContent))),
    isCorrect: !!isCorrect,
  };
}

function extractQuestionsFromSource(data, lectureFilter) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.questions)) return data.questions;
  if (Array.isArray(data?.lectures)) {
    const result = [];
    data.lectures.forEach((lecture) => {
      const lectureQuestions = Array.isArray(lecture?.questions)
        ? lecture.questions
        : [];
      const lectureId = deriveLectureId(lecture);
      const lectureTitle =
        lecture?.lecture_title ?? lecture?.lectureTitle ?? lecture?.title ?? null;
      lectureQuestions.forEach((question) => {
        result.push({
          ...question,
          lectureId,
          lectureTitle,
        });
      });
    });
    return result;
  }
  return [];
}

function buildLectureFilter(rawList) {
  if (!rawList) return null;
  const items = Array.isArray(rawList)
    ? rawList
    : String(rawList)
        .split(/[,;]/)
        .map((value) => value.trim())
        .filter(Boolean);
  if (!items.length) return null;
  const set = new Set();
  items.forEach((value) => {
    createLectureTokens(value).forEach((token) => set.add(token));
  });
  return set.size ? set : null;
}

function shouldIncludeLecture(lecture, filterSet) {
  if (!filterSet || !filterSet.size) return true;
  const tokens = createLectureTokens(deriveLectureId(lecture));
  if (!tokens.length) return false;
  return tokens.some((token) => filterSet.has(token));
}

function shouldKeepQuestion(question, filterSet) {
  if (!filterSet || !filterSet.size) return true;
  const tokens = createLectureTokens(question.lectureId);
  if (!tokens.length) return false;
  return tokens.some((token) => filterSet.has(token));
}

function deriveLectureId(lecture) {
  const candidate =
    lecture?.lecture_id ??
    lecture?.lectureId ??
    lecture?.id ??
    lecture?.code ??
    null;
  if (candidate === null || candidate === undefined) return null;
  const str = String(candidate).trim();
  return str || null;
}

function createLectureTokens(value) {
  if (value === null || value === undefined) return [];
  const str = String(value).trim();
  if (!str) return [];
  const tokens = new Set([str]);
  if (/^-?\d+$/.test(str)) {
    const numeric = String(Number(str));
    tokens.add(numeric);
    if (!numeric.startsWith("-")) {
      const padded =
        numeric.length >= 2 ? numeric : numeric.padStart(2, "0");
      tokens.add(padded);
    }
  }
  return Array.from(tokens).filter(Boolean);
}

function normalizeQuestions(raw) {
  return raw.map((question, index) => {
    const questionId =
      question.id ?? question.code ?? question.questionId ?? null;
    return {
      id: questionId ?? index + 1,
      prompt: question.prompt,
      multiple: !!question.multiple,
      answers: question.answers.map((answer, answerIndex) => ({
        id: `${questionId ?? index + 1}-${answerIndex + 1}`,
        content: answer.content,
        isCorrect: !!answer.isCorrect,
      })),
      lectureId: question.lectureId ?? undefined,
      lectureTitle: question.lectureTitle ?? undefined,
    };
  });
}

function resolveSourcePath(source, filePath) {
  if (!source) return null;
  if (path.isAbsolute(source)) {
    return source;
  }
  const candidates = [];
  if (source.startsWith("@/")) {
    candidates.push(path.resolve(process.cwd(), source.slice(2)));
  } else {
    if (filePath) {
      candidates.push(path.resolve(path.dirname(filePath), source));
    }
    candidates.push(path.resolve(process.cwd(), source));
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0] || null;
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
