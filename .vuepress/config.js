// https://vuepress.vuejs.org/reference/config.html
import { defineUserConfig } from "vuepress";

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

import YAML from "yaml";

function loadYaml(relPath, fallback = []) {
  const file = path.resolve(__dirname, relPath);
  const src = fs.readFileSync(file, "utf8");
  const data = YAML.parse(src);
  return Array.isArray(data) ? data : fallback;
}

import fs from "node:fs";
import path from "node:path";
import { Buffer } from 'node:buffer';
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")
);

const APP_VERSION = pkg.version ?? "dev";
const VSHP_EML_VERSION = pkg.config.vshpLicenseRef ?? "";

const EXCLUDE_FROM_SEARCH = ["/", "/test"];

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

const EXCLUDE_SET = new Set(EXCLUDE_FROM_SEARCH.map(normalize));

const navbar = loadYaml("./navbar.yml");

const railroadFencePlugin = () => ({
  name: 'railroad-fence',
  extendsMarkdown: (md) => {
    const orig = md.renderer.rules.fence?.bind(md.renderer.rules)
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx]
      const info = (token.info || '').trim()
      const [lang] = info.split(/\s+/)

      // только ```railroad
      if (lang !== 'railroad') {
        return orig ? orig(tokens, idx, options, env, self)
                    : self.renderToken(tokens, idx, options)
      }

      const b64 = Buffer.from(token.content, 'utf8').toString('base64')
      // Никаких <pre><code> — просто проп b64
      return `<ClientOnly><RailroadDiagram b64="${b64}"/></ClientOnly>`
    }
  }
})

export default defineUserConfig({
  plugins: [
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
        page.frontmatter?.search !== false &&
        !EXCLUDE_SET.has(normalize(page.path)),
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
      plantuml: false,
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
