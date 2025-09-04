import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  bundler: viteBundler(),
  theme: defaultTheme({
    repo: 'https://github.com/vshp-online/it.vshp.online',
    logo: '/images/logo.svg',
    hostname: 'https://it.vshp.online',
    editLink: false,
    navbar: [
      {
        text: 'Главная',
        link: '/',
      },
    ],
  }),

  base: '/',
  lang: 'ru-RU',
  title: 'Сайт кафедры ИТ',

  pagePatterns: [
    '**/*.md',
    '!README.md',
    '!.vuepress',
    '!node_modules'
  ],
})
