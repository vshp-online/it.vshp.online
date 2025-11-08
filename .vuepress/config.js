// https://vuepress.vuejs.org/reference/config.html
import { defineUserConfig } from "vuepress";

// https://vuepress.vuejs.org/advanced/cookbook/adding-extra-pages.html
import { createPage } from "vuepress/core";

// https://vuepress.vuejs.org/reference/bundler/vite.html
import { viteBundler } from "@vuepress/bundler-vite";

// https://ecosystem.vuejs.press/themes/default/
import { defaultTheme } from "@vuepress/theme-default";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-chart/
import { markdownChartPlugin } from "@vuepress/plugin-markdown-chart";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-math.html
import { markdownMathPlugin } from "@vuepress/plugin-markdown-math";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-ext.html
import { markdownExtPlugin } from "@vuepress/plugin-markdown-ext";

// https://ecosystem.vuejs.press/plugins/markdown/prismjs.html
import { prismjsPlugin } from "@vuepress/plugin-prismjs";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-preview.html
import { markdownPreviewPlugin } from "@vuepress/plugin-markdown-preview";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-include.html
import { markdownIncludePlugin } from "@vuepress/plugin-markdown-include";

// https://ecosystem.vuejs.press/plugins/search/search.html
import { searchPlugin } from "@vuepress/plugin-search";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-image.html
import { markdownImagePlugin } from "@vuepress/plugin-markdown-image";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-container.html
import { markdownContainerPlugin } from "@vuepress/plugin-markdown-container";

import YAML from "yaml";
import { blogPlugin } from "./plugins/blogPlugin.js";

function loadYaml(relPath, fallback = []) {
  const file = path.resolve(__dirname, relPath);
  const src = fs.readFileSync(file, "utf8");
  const data = YAML.parse(src);
  return Array.isArray(data) ? data : fallback;
}

import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")
);

const APP_VERSION = pkg.version ?? "dev";
const VSHP_EML_VERSION = pkg.config.vshpLicenseRef ?? "";

const EXCLUDE_FROM_SEARCH = ["/", "/test/", "/account/"];

// приводим page.path к базовому виду:
// '/', '/a', '/a/', '/a.html', '/a/index.html' → '/', '/a'
const normalize = (p) => {
  if (!p) return "/";
  let s = String(p).replace(/[#?].*$/, "");
  // убираем '.html' и '/index.html'
  s = s.replace(/(?:\/index)?\.html$/i, "");
  // убираем хвостовой слэш
  s = s.replace(/\/+$/, "");
  return s === "" ? "/" : s;
};

const EXCLUDE_PREFIXES = EXCLUDE_FROM_SEARCH.map(normalize);

const isExcluded = (p) => {
  const n = normalize(p);
  return EXCLUDE_PREFIXES.some(
    (prefix) => n === prefix || n.startsWith(prefix + "/")
  );
};

const navbar = loadYaml("./navbar.yml");

const railroadFencePlugin = () => ({
  name: "railroad-fence",
  extendsMarkdown: (md) => {
    // сохраняем оригинальный fence-рендерер
    const origFence = md.renderer.rules.fence;

    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const html = origFence
        ? origFence(tokens, idx, options, env, slf)
        : slf.renderToken(tokens, idx, options);

      const info = tokens[idx].info || "";

      // ищем {#my-id} в info-строке, НЕ трогая {2,7-9}
      // допускаем любые дополнительные атрибуты внутри одних {} — лишь бы был #id
      const m = info.match(/\{[^}]*#([A-Za-z][\w:.-]*)[^}]*\}/);
      const id = m ? m[1] : null;
      if (!id) return html;

      // аккуратно вставляем id в первый <pre ...>, если его там ещё нет
      return html.replace(/<pre(?![^>]*\bid=)/, (openTag) => {
        return openTag.replace("<pre", `<pre id="${id}"`);
      });
    };

    const orig = md.renderer.rules.fence?.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const info = (token.info || "").trim();
      const [lang] = info.split(/\s+/);

      // только ```railroad
      if (lang !== "railroad") {
        return orig
          ? orig(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      }

      const b64 = Buffer.from(token.content, "utf8").toString("base64");
      // Никаких <pre><code> — просто проп b64
      return `<ClientOnly><RailroadDiagram b64="${b64}"/></ClientOnly>`;
    };
  },
});

export default defineUserConfig({
  plugins: [
    {
      name: "auth-pages",
      async onInitialized(app) {
        const authSfc = path.resolve(
          app.dir.source(),
          ".vuepress/pages/AuthPage.vue"
        );
        const accountSfc = path.resolve(
          app.dir.source(),
          ".vuepress/pages/AccountPage.vue"
        );

        app.pages.push(
          await createPage(app, {
            path: "/auth/",
            frontmatter: {
              layout: "Layout",
              title: "Авторизация",
              sidebar: false,
            },
            content: `<ClientOnly><AuthPage/></ClientOnly>
<script setup>
import AuthPage from '${authSfc.replace(/\\/g, "\\\\")}'
</script>`,
          }),
          await createPage(app, {
            path: "/account/",
            frontmatter: {
              layout: "Layout",
              title: "Личный кабинет",
              sidebar: false,
            },
            content: `<ClientOnly><AccountPage/></ClientOnly>
<script setup>
import AccountPage from '${accountSfc.replace(/\\/g, "\\\\")}'
</script>`,
          })
        );
      },
    },
    blogPlugin(),
    markdownContainerPlugin({
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
        const dep = attrs["depends-on"]
          ? ` depends-on="${attrs["depends-on"]}"`
          : "";
        const template = attrs.template ? ` template="${attrs.template}"` : "";
        const engine = attrs.engine ? ` engine="${attrs.engine}"` : "";

        // ВАЖНО: <codapi-snippet> должен идти ПОСЛЕ <pre><code>, чтобы «прицепиться» к нему
        return `<codapi-snippet sandbox="${sandbox}" editor="${editor}"${id}${dep}${engine}${template}></codapi-snippet>\n`;
      },
    }),
    railroadFencePlugin(),
    markdownImagePlugin({
      // Enable figure
      figure: true,
      // Enable image lazyload
      lazyload: true,
      // Enable image mark
      mark: true,
      // Enable image size
      size: true,
      // Enable Obsidian Syntax for image size
      obsidianSize: true,
    }),
    searchPlugin({
      isSearchable: (page) =>
        page.frontmatter?.search !== false && !isExcluded(page.path),
      maxSuggestions: 6,
    }),
    markdownIncludePlugin({
      useComment: true,
      deep: false,
    }),
    prismjsPlugin({
      themes: { light: "one-light", dark: "one-dark" },
      collapsedLines: false,
      notationDiff: true,
      notationFocus: true,
      notationHighlight: true,
      notationErrorLevel: true,
      notationWordHighlight: true,
      preloadLanguages: [
        "html",
        "css",
        "javascript",
        "typescript",
        "bash",
        "json",
        "diff",
        "vue",
      ],
    }),
    markdownPreviewPlugin(),
    markdownExtPlugin({
      gfm: true,
      component: true,
      vPre: true,
    }),
    markdownChartPlugin({
      // Enable Chart.js
      chartjs: false,
      // Enable ECharts
      echarts: false,
      // Enable Flowchart.js
      flowchart: false,
      // Enable Markmap
      markmap: false,
      // Enable Mermaid
      mermaid: true,
      // Enable PlantUML
      plantuml: true,
    }),
    markdownMathPlugin({
      type: "katex",
      copy: true,
      mhchem: true,
      katexOptions: {
        throwOnError: false,
      },
    }),
  ],

  bundler: viteBundler({
    vuePluginOptions: {
      template: {
        compilerOptions: {
          // говорим Vue: <codapi-snippet> — кастомный элемент
          isCustomElement: (tag) => tag === "codapi-snippet",
        },
      },
    },
    viteOptions: {
      publicDir: "public",
      define: {
        __APP_VERSION__: JSON.stringify(APP_VERSION),
        __VSHP_EML_VERSION__: JSON.stringify(VSHP_EML_VERSION),
      },
      build: {
        chunkSizeWarningLimit: 800,
      },
    },
  }),

  theme: defaultTheme({
    docsRepo: "https://github.com/vshp-online/it.vshp.online",
    logo: "/images/logo.svg",
    hostname: "https://it.vshp.online",
    colorMode: "light",
    colorModeSwitch: true,
    editLink: false,
    contributors: false,
    themePlugins: {
      prismjs: false,
    },
    navbar,
  }),
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/images/logo.svg",
      },
    ],
  ],

  alias: {
    // заменяем постраничную навигацию
    "@theme/VPPageNav.vue": path.resolve(
      __dirname,
      "./components/AutoSiblingNav.vue"
    ),
    // заменяем дефолтный футер главной
    "@theme/VPHomeFooter.vue": path.resolve(
      __dirname,
      "./components/SiteFooter.vue"
    ),
  },

  public: `./public`,

  base: "/",
  lang: "ru-RU",
  title: "Кафедра ИТ",

  pagePatterns: [
    "**/*.md",
    "!README.md",
    "!.vuepress",
    "!public",
    "!node_modules",
    "!VSHP-EMLicense/README.md",
  ],
});
