import { markdownContainerPlugin } from "@vuepress/plugin-markdown-container";

/**
 * Регистрирует кастомные markdown-контейнеры проекта.
 * Сейчас поддерживаем только ::: play, но список легко расширить.
 */
export const markdownContainersPlugin = () => {
  const containers = [createPlayContainer()];
  return containers.map((options) => markdownContainerPlugin(options));
};

function createPlayContainer() {
  return {
    type: "play",
    // принимаем "play" и любые параметры после него
    validate: (params) => params.trim().startsWith("play"),
    render: (tokens, idx) => {
      const token = tokens[idx];

      // Помощник: найти соответствующий open-токен для текущего close
      const findOpenIndex = (closeIdx) => {
        let level = 0;
        for (let i = closeIdx - 1; i >= 0; i--) {
          if (tokens[i].type === "container_play_close") level++;
          if (tokens[i].type === "container_play_open") {
            if (level === 0) return i;
            level--;
          }
        }
        return -1;
      };

      // Разбор пары key=value из строки после "play"
      const parseAttrs = (s) => {
        const tail = s.trim().replace(/^play\s*/, "");
        const map = {};
        for (const m of tail.matchAll(/([\w-]+)=("[^"]*"|'[^']*'|[^\s]+)/g)) {
          map[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
        }
        return map;
      };

      if (token.nesting === 1) {
        // OPEN: распарсим attrs и сохраним в token.meta
        const attrs = parseAttrs(token.info || "");
        token.meta = { attrs };
        return ""; // ничего не выводим здесь, чтобы кодовый блок отрендерился как обычно
      }

      // CLOSE: достаём attrs из соответствующего open-токена
      const openIdx = findOpenIndex(idx);
      const open = tokens[openIdx];
      const attrs = (open?.meta && open.meta.attrs) || {};

      // Попробуем авто-определить sandbox по предыдущему fenced-блоку
      // (ищем ближайший токен типа 'fence' перед close)
      let inferredSandbox = "";
      for (let i = idx - 1; i >= 0; i--) {
        const t = tokens[i];
        if (t.type === "fence") {
          // t.info — это язык, например "python" / "sql" / "bash"
          inferredSandbox = (t.info || "").trim().split(/\s+/)[0];
          break;
        }
        if (t.type === "container_play_open") break;
      }

      const sandbox = attrs.sandbox || inferredSandbox || "javascript";
      const editor = attrs.editor || "basic";
      const id = attrs.id ? ` id="${attrs.id}"` : "";
      const dep = attrs["depends-on"] ? ` depends-on="${attrs["depends-on"]}"` : "";
      const template = attrs.template ? ` template="${attrs.template}"` : "";
      const engine = attrs.engine ? ` engine="${attrs.engine}"` : "";

      // ВАЖНО: <codapi-snippet> должен идти ПОСЛЕ <pre><code>, чтобы «прицепиться» к нему
      return `<codapi-snippet sandbox="${sandbox}" editor="${editor}"${id}${dep}${engine}${template}></codapi-snippet>\n`;
    },
  };
}
