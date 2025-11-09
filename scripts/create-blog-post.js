#!/usr/bin/env node

import fs from "fs";
import path from "path";

// Получаем заголовок из аргументов командной строки
const title = process.argv[2];
const featuredFlag = (process.argv[3] || "").toLowerCase();
const featured = featuredFlag === "true";

if (!title) {
  console.error("Пожалуйста, укажите заголовок для поста в блоге");
  console.error(
    'Использование: node create-blog-post.js "Заголовок поста" [featured=true|false]'
  );
  process.exit(1);
}

// Получаем текущую дату в московском времени (UTC+3)
const now = new Date();
const moscowTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Добавляем 3 часа для московского времени

// Форматируем дату как YYYY-MM-DD-HH-MM
const year = moscowTime.getUTCFullYear();
const month = String(moscowTime.getUTCMonth() + 1).padStart(2, '0');
const day = String(moscowTime.getUTCDate()).padStart(2, '0');
const hours = String(moscowTime.getUTCHours()).padStart(2, '0');
const minutes = String(moscowTime.getUTCMinutes()).padStart(2, '0');

const filename = `${year}-${month}-${day}-${hours}-${minutes}.md`;
const blogDir = path.join("blog");
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const filepath = path.join(blogDir, filename);

// Создаем содержимое с минимальным frontmatter
const content = `---
tags: []
featured: ${featured}
---

# ${title}

Начните писать текст
`;

// Записываем файл
fs.writeFileSync(filepath, content);

console.log(
  `Пост в блоге создан: ${filepath} (featured: ${featured ? "true" : "false"})`
);
