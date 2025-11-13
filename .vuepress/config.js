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

// https://ecosystem.vuejs.press/plugins/markdown/markdown-image.html
import { markdownImagePlugin } from "@vuepress/plugin-markdown-image";

// Импортируем плагины
import { blogPlugin } from "./plugins/blogPlugin.js";
import { railroadFencePlugin } from "./plugins/railroadFencePlugin.js";
import { markdownContainersPlugin } from "./plugins/markdownContainersPlugin.js";
import { siteSearchPlugin } from "./plugins/siteSearchPlugin.js";
import { loadYaml } from "./utils/yaml.js";
import { APP_VERSION, VSHP_EML_VERSION } from "./utils/pkgMeta.js";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const navbar = loadYaml(__dirname, "./navbar.yml");

export default defineUserConfig({
  plugins: [
    blogPlugin(),
    ...markdownContainersPlugin(),
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
    siteSearchPlugin({
      exclude: ["/", "/test/", "/account/"],
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
    sidebar: {
      "/blog/": false,
      "/department/": false,
      "/auth/": false,
      "/account/": false,
      "/": "heading",
    },
  }),
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/images/logo.svg",
      },
    ],
    [
      "script",
      {
        src: "https://yastatic.net/share2/share.js",
        async: true,
      },
    ],
  ],

  alias: {
    // заменяем постраничную навигацию
    "@theme/VPPageNav.vue": path.resolve(
      __dirname,
      "./components/AutoSiblingNav.vue"
    ),
    // используем кастомный лейаут главной страницы
    "@theme/VPHome.vue": path.resolve(__dirname, "./pages/HomePage.vue"),
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
