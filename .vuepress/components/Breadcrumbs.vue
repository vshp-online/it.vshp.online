<script setup>
import { computed } from "vue";
import { usePageData, useRoutes } from "@vuepress/client";

const page = usePageData();
const routesRef = useRoutes();

// Константы для truncate
const TRUNCATE_LENGTH = 24;

// Нормализация пути страницы (аналогично AutoSiblingNav.vue)
const normalizePath = (path) => {
  if (!path) return "/";
  let normalized = String(path).replace(/index\.html$/i, "").replace(/\/+$/, "/") + "";
  return normalized === "" ? "/" : normalized;
};

// Поиск маршрута по пути (аналогично AutoSiblingNav.vue)
const findRouteByPath = (path) => {
  const p = normalizePath(path);
  const r = routesRef.value || {};
  if (Array.isArray(r)) return r.find((x) => normalizePath(x.path) === p);
  return r[p] || Object.values(r).find((x) => normalizePath(x.path) === p);
};

// Функция для обрезки текста с добавлением "..."
const truncateText = (text, maxLength = TRUNCATE_LENGTH) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Очистка заголовка от префиксов
const cleanTitle = (title) => {
  if (!title) return "";

  // Убираем префиксы вроде "ОП.08 - 01 - ", "ИТ.03 - 01 - " и т.п.
  return title.replace(/^[A-ZА-Я0-9.]{2,}\s*-\s*\d+\s*-\s*/, '').trim();
};

// Получение заголовка страницы из маршрута
const getPageTitle = (path) => {
  const route = findRouteByPath(path);
  // Получаем заголовок как в AutoSiblingNav.vue
  const title = (route?.meta && (route.meta.title || route.meta.frontmatter?.title)) ||
                route?.title ||
                "";
  return cleanTitle(title);
};

// Генерация хлебных крошек
const breadcrumbs = computed(() => {
  const currentPath = normalizePath(page.value.path);

  // Для главной страницы не показываем хлебные крошки
  if (currentPath === "/") {
    return [];
  }

  // Разбиваем путь на сегменты
  const segments = currentPath.split("/").filter(Boolean);
  const breadcrumbs = [];

  // Добавляем главную страницу
  breadcrumbs.push({
    title: truncateText(getPageTitle("/")),
    fullTitle: getPageTitle("/"),
    path: "/"
  });

  // Генерируем промежуточные крошки
  let path = "";
  for (let i = 0; i < segments.length; i++) {
    path += "/" + segments[i];

    // Для последнего элемента не делаем ссылку и используем оригинальный путь страницы
    if (i === segments.length - 1) {
      breadcrumbs.push({
        title: truncateText(getPageTitle(page.value.path)),
        fullTitle: getPageTitle(page.value.path),
        path: null // Последний элемент без ссылки
      });
    } else {
      // Для промежуточных путей используем путь с добавлением /index.html
      const searchPath = path + "/index.html";
      // Проверяем, существует ли маршрут с index.html и есть ли у него заголовок
      const pageTitle = getPageTitle(searchPath);
      // Если заголовок найден, добавляем крошку
      if (pageTitle) {
        breadcrumbs.push({
          title: truncateText(pageTitle),
          fullTitle: pageTitle,
          path: path + "/"
        });
      }
    }
  }

  return breadcrumbs;
});

// Проверка, нужно ли отображать хлебные крошки
const showBreadcrumbs = computed(() => {
  // Если в frontmatter явно указано breadcrumbs: false, не показываем
  if (page.value.frontmatter?.breadcrumbs === false) {
    return false;
  }

  // Для главной страницы не показываем
  const currentPath = normalizePath(page.value.path);
  if (currentPath === "/") {
    return false;
  }

  // По умолчанию показываем
  return true;
});
</script>

<template>
  <nav v-if="showBreadcrumbs" class="breadcrumbs" aria-label="Навигационная цепочка">
    <ol class="breadcrumb-list">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
        :class="{ current: !crumb.path }"
      >
        <router-link
          v-if="crumb.path"
          :to="crumb.path"
          :title="crumb.fullTitle"
        >
          <img v-if="index === 0 && crumb.path === '/'" src="/images/icons/home-icon.svg" width="20" height="20" alt="Главная" />
          <span v-else>{{ crumb.title }}</span>
        </router-link>
        <span
          v-else
          :title="crumb.fullTitle"
        >
          <img v-if="index === 0 && !crumb.path" src="/images/icons/home-icon.svg" width="20" height="20" alt="Главная" />
          <span v-else>{{ crumb.title }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss">
.breadcrumbs {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 1rem 2rem 0.5rem;
  font-size: 0.9rem;

  .breadcrumb-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;

    &:not(:last-child)::after {
      content: " / ";
      margin: 0 0.5rem;
      color: var(--vp-c-text-mute);
    }

    a {
      color: var(--vp-c-brand);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    &.current {
      color: var(--vp-c-text-mute);
    }
  }

  // Центрирование иконки главной страницы
  .breadcrumb-item img {
    vertical-align: text-bottom;
  }
}

</style>
