<template>
  <div v-if="hasMeta" class="blog-post-meta">
    <Pill
      v-if="isFeatured"
      text="На главной"
      type="warning"
      class="blog-post-meta-featured"
    />
    <time v-if="date" :datetime="date" class="blog-post-meta-date">
      {{ formattedDate }}
    </time>
    <div v-if="tags && tags.length > 0" class="blog-post-meta-tags">
      <Pill
        v-for="(tag, index) in tags"
        :key="`tag-${index}-${tag}`"
        :text="tag"
        type="danger"
        class="blog-post-meta-tag"
      />
    </div>
  </div>
  <div class="blog-post-meta-share">
    <div class="blog-post-meta-share-label">Поделиться:</div>
    <div ref="shareElement" class="ya-share2"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { usePageData, useRoute } from "@vuepress/client";
import Pill from "./Pill.vue";

const page = usePageData();
const route = useRoute();
const shareElement = ref(null);

// Получаем дату и теги из frontmatter
const date = computed(() => {
  const fmDate = page.value.frontmatter?.date;
  return fmDate || null;
});

const tags = computed(() => {
  const fmTags = page.value.frontmatter?.tags;
  // Убеждаемся, что это массив
  if (Array.isArray(fmTags)) {
    return fmTags.filter((tag) => tag && typeof tag === "string");
  }
  return [];
});

const isFeatured = computed(() => Boolean(page.value.frontmatter?.featured));

const hasMeta = computed(() => {
  return (
    isFeatured.value || date.value || (tags.value && tags.value.length > 0)
  );
});

const formattedDate = computed(() => {
  if (!date.value) return "";
  try {
    const dateObj = new Date(date.value);
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    };
    return new Intl.DateTimeFormat("ru-RU", options).format(dateObj);
  } catch (e) {
    console.error("Ошибка форматирования даты:", e);
    return "";
  }
});

// Инициализация виджета Яндекс шаринга
function initYaShare() {
  // Проверяем, загружен ли скрипт Яндекс шаринга
  if (typeof Ya !== "undefined" && Ya.share2) {
    // Инициализируем виджет
    new Ya.share2(shareElement.value, {
      theme: {
        services: "vkontakte,telegram,whatsapp",
        lang: "ru",
        curtain: true,
        useLinks: true,
      },
      content: {
        url: window.location.href,
        title: page.value.title,
        description: page.value.frontmatter?.description || "",
      },
      hooks: {
        onready: function () {
          console.log("блок инициализирован");
        },

        onshare: function (name) {
          console.log("нажата кнопка: " + name);
        },
      },
    });
  } else {
    // Если скрипт еще не загружен, ждем немного и пробуем снова
    setTimeout(() => {
      if (typeof Ya !== "undefined" && Ya.share2) {
        initYaShare();
      }
    }, 100);
  }
}

// Отладка
onMounted(() => {
  console.log("BlogPostMeta - page frontmatter:", page.value.frontmatter);
  console.log("BlogPostMeta - date:", date.value);
  console.log("BlogPostMeta - tags:", tags.value);
  console.log("BlogPostMeta - hasMeta:", hasMeta.value);
  console.log("BlogPostMeta - formattedDate:", formattedDate.value);

  // Инициализируем виджет шаринга после монтирования
  nextTick(() => {
    initYaShare();
  });
});

// Следим за изменением маршрута и переинициализируем виджет
watch(
  () => route.path,
  () => {
    nextTick(() => {
      initYaShare();
    });
  }
);
</script>

<style lang="scss" scoped>
.blog-post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--vp-c-divider, var(--c-border));
  border-bottom: 1px solid var(--vp-c-divider, var(--c-border));
}

.blog-post-meta-featured {
  font-size: 0.85rem;
}

.blog-post-meta-date {
  font-size: 0.9rem;
  color: var(--vp-c-text-2, var(--c-text-light));
  white-space: nowrap;
}

.blog-post-meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.blog-post-meta-share {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider, var(--c-border));

  .blog-post-meta-share-label {
    font-size: 0.9rem;
    color: var(--vp-c-text-2, var(--c-text-light));
  }

  .ya-share2 {
    padding: 1rem 0;
  }
}
</style>
