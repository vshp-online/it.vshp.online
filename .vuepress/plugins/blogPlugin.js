import { scanBlogPosts } from "../utils/blogParser.js";
import path from "node:path";
import fs from "node:fs";

// Константа для количества постов на странице
export const POSTS_PER_PAGE = 10;

/**
 * Плагин VuePress для обработки постов блога
 */
export const blogPlugin = () => {
  return {
    name: "blog-plugin",
    async onInitialized(app) {
      const blogDir = path.resolve(app.dir.source(), "blog");

      // Сканируем все посты
      const posts = scanBlogPosts(blogDir);

      // Преобразуем даты в ISO строки для JSON
      const postsData = posts.map((post) => ({
        ...post,
        date: post.date.toISOString(),
      }));

      // Сохраняем данные в JSON файл в директории public (source)
      // Это позволит загружать данные на клиенте
      // Используем process.cwd() для получения корневой директории проекта
      const projectRoot = process.cwd();
      const publicDir = path.resolve(projectRoot, "public");
      const dataDir = path.join(publicDir, "data");

      // Создаем директорию data если её нет
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dataFile = path.join(dataDir, "blog-posts.json");
      fs.writeFileSync(dataFile, JSON.stringify(postsData, null, 2), "utf8");

      console.log(`[blog-plugin] Найдено постов: ${posts.length}`);
      console.log(`[blog-plugin] Данные сохранены в: ${dataFile}`);

      // Создаем мапу постов по пути для быстрого доступа
      // Нормализуем пути для сравнения (убираем .html и завершающий слэш)
      const normalizePath = (p) => {
        if (!p) return "/";
        let s = String(p).replace(/[#?].*$/, "");
        s = s.replace(/(?:\/index)?\.html$/i, "");
        s = s.replace(/\/+$/, "");
        return s === "" ? "/" : s;
      };

      const postsMap = new Map();
      posts.forEach((post) => {
        // Сохраняем пост по нормализованному пути
        const normalizedPath = normalizePath(post.path);
        postsMap.set(normalizedPath, post);
        // Также сохраняем с .html на конце (на случай если VuePress использует такой формат)
        postsMap.set(normalizedPath + ".html", post);
      });

      // Отключаем сайдбар и добавляем метаданные для всех страниц блога
      // Проходим по всем страницам и устанавливаем sidebar: false для страниц в /blog/
      let blogPagesCount = 0;
      for (const page of app.pages) {
        const normalizedPagePath = normalizePath(page.path);

        // Проверяем, что страница находится в разделе блога (но не index.md)
        if (normalizedPagePath.startsWith("/blog/") && normalizedPagePath !== "/blog/") {
          // Устанавливаем sidebar: false в frontmatter
          if (!page.frontmatter) {
            page.frontmatter = {};
          }
          page.frontmatter.sidebar = false;

          // Находим соответствующий пост и добавляем метаданные
          const post = postsMap.get(normalizedPagePath) || postsMap.get(page.path);
          if (post) {
            // Добавляем дату и теги в frontmatter
            page.frontmatter.date = post.date.toISOString();
            page.frontmatter.tags = Array.isArray(post.tags) ? post.tags : [];
            console.log(`[blog-plugin] Добавлены метаданные для ${page.path}:`, {
              date: page.frontmatter.date,
              tags: page.frontmatter.tags,
            });
          } else {
            console.warn(`[blog-plugin] Пост не найден для пути: ${page.path} (нормализованный: ${normalizedPagePath})`);
          }

          blogPagesCount++;
        } else if (normalizedPagePath === "/blog") {
          // Для главной страницы блога тоже отключаем сайдбар
          if (!page.frontmatter) {
            page.frontmatter = {};
          }
          page.frontmatter.sidebar = false;
        }
      }

      console.log(`[blog-plugin] Сайдбар отключен для ${blogPagesCount} страниц блога`);
    },
  };
};
