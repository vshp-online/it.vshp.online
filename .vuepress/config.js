// https://vuepress.vuejs.org/reference/config.html
import { defineUserConfig } from "vuepress";

// https://vuepress.vuejs.org/reference/bundler/vite.html
import { viteBundler } from "@vuepress/bundler-vite";

// https://ecosystem.vuejs.press/themes/default/
import { defaultTheme } from "@vuepress/theme-default";

// https://ecosystem.vuejs.press/plugins/markdown/markdown-chart/
import { markdownChartPlugin } from '@vuepress/plugin-markdown-chart';

// https://ecosystem.vuejs.press/plugins/markdown/markdown-math.html
import { markdownMathPlugin } from '@vuepress/plugin-markdown-math';

export default defineUserConfig({
  plugins: [
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
      type: 'katex',
      copy: true,
      mhchem: true,
      katexOptions: {
        throwOnError: false,
      }
    }),
  ],

  bundler: viteBundler(),
  theme: defaultTheme({
    repo: "https://github.com/vshp-online/it.vshp.online",
    logo: "/images/logo.svg",
    hostname: "https://it.vshp.online",
    editLink: false,
    navbar: [
      {
        text: "Главная",
        link: "/",
      },
      {
        text: "Учебные материалы",
        link: "/study",
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
