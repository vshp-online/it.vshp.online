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

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8")
);

const APP_VERSION = pkg.version ?? "dev";
const VSHP_EML_VERSION = pkg.config.vshpLicenseRef ?? "";

export default defineUserConfig({
  plugins: [
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
    navbar: [
      {
        text: "Направления подготовки",
        link: "/study",
      },
      {
        text: "Учебные материалы",
        link: "/disciplines/",
        activeMatch: "^/disciplines/",
      },
      {
        text: "О кафедре",
        link: "/about",
      },
    ],
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
  title: "Сайт кафедры ИТ",

  pagePatterns: [
    "**/*.md",
    "!README.md",
    "!.vuepress",
    "!public",
    "!node_modules",
    "!VSHP-EMLicense/README.md",
  ],
});
