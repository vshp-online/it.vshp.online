import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Извлекает дату из имени файла в формате YYYY-MM-DD-HH-MM
 * @param {string} filename - Имя файла (например, "2025-11-08-00-27.md")
 * @returns {Date|null} - Объект Date или null если формат неверный
 */
export function parseDateFromFilename(filename) {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})\.md$/);
  if (!match) return null;

  const [, year, month, day, hours, minutes] = match;
  // Имя файла содержит московское время (UTC+3)
  // Создаем дату, интерпретируя значения как локальное время
  // Для корректного хранения создаем UTC дату, предполагая что входные данные в MSK
  // Формат: YYYY-MM-DD-HH-MM, где время уже в московском (MSK = UTC+3)
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  return date;
}

/**
 * Извлекает заголовок из markdown файла
 * Сначала пытается взять из frontmatter.title, затем ищет первый H1
 * @param {string} content - Содержимое markdown файла (без frontmatter)
 * @param {object} frontmatter - Frontmatter объект
 * @returns {string} - Заголовок поста
 */
export function extractTitle(content, frontmatter) {
  // Проверяем frontmatter.title
  if (frontmatter.title) {
    return frontmatter.title;
  }

  // Ищем первый H1 в markdown
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fallback: используем имя файла или "Без названия"
  return "Без названия";
}

/**
 * Извлекает краткое описание (excerpt) из содержимого
 * @param {string} content - Содержимое markdown файла
 * @param {number} maxLength - Максимальная длина excerpt (по умолчанию 150)
 * @returns {string} - Краткое описание
 */
export function extractExcerpt(content, maxLength = 150) {
  // Удаляем заголовки, код блоки и ссылки для получения чистого текста
  let text = content
    .replace(/^#+\s+.+$/gm, "") // Удаляем заголовки
    .replace(/```[\s\S]*?```/g, "") // Удаляем код блоки
    .replace(/`[^`]+`/g, "") // Удаляем инлайн код
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Заменяем ссылки на текст
    .replace(/\*\*([^\*]+)\*\*/g, "$1") // Удаляем жирный текст
    .replace(/\*([^\*]+)\*/g, "$1") // Удаляем курсив
    .trim();

  // Берем первые символы
  if (text.length <= maxLength) {
    return text;
  }

  // Обрезаем по последнему слову
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

/**
 * Парсит пост блога из файла
 * @param {string} filePath - Путь к файлу поста
 * @param {string} blogDir - Базовая директория блога
 * @returns {object|null} - Объект с данными поста или null при ошибке
 */
export function parseBlogPost(filePath, blogDir) {
  try {
    const filename = path.basename(filePath);
    const relativePath = path.relative(blogDir, filePath);

    // Пропускаем index.md
    if (filename === "index.md") {
      return null;
    }

    // Читаем файл
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContent);

    // Извлекаем дату из имени файла
    const date = parseDateFromFilename(filename);
    if (!date) {
      console.warn(`Не удалось извлечь дату из имени файла: ${filename}`);
      return null;
    }

    // Извлекаем заголовок
    const title = extractTitle(content, frontmatter);

    // Получаем теги из frontmatter
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];

    // Извлекаем excerpt
    const excerpt = extractExcerpt(content);

    // Формируем путь для VuePress (без расширения .md, с /blog/ префиксом)
    // VuePress создает страницы из .md файлов как /blog/filename
    const postPath = `/blog/${relativePath.replace(/\.md$/, "")}`;

    return {
      path: postPath,
      filePath: filePath,
      title,
      date,
      tags,
      excerpt,
      filename,
    };
  } catch (error) {
    console.error(`Ошибка при парсинге поста ${filePath}:`, error);
    return null;
  }
}

/**
 * Сканирует директорию блога и возвращает все посты
 * @param {string} blogDir - Путь к директории блога
 * @returns {Array} - Массив объектов постов, отсортированный по дате (новые сначала)
 */
export function scanBlogPosts(blogDir) {
  const posts = [];

  if (!fs.existsSync(blogDir)) {
    console.warn(`Директория блога не найдена: ${blogDir}`);
    return posts;
  }

  // Читаем все файлы в директории
  const files = fs.readdirSync(blogDir);

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const stat = fs.statSync(filePath);

    // Пропускаем директории и файлы, не являющиеся .md
    if (!stat.isFile() || !file.endsWith(".md")) {
      continue;
    }

    const post = parseBlogPost(filePath, blogDir);
    if (post) {
      posts.push(post);
    }
  }

  // Сортируем по дате (новые сначала)
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}

