<template>
  <div class="blog-index">
    <!-- Индикатор загрузки -->
    <div v-if="loading" class="blog-loading">
      <p>Загрузка постов...</p>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="blog-error">
      <p>Ошибка при загрузке постов: {{ error }}</p>
    </div>

    <!-- Селектор тегов -->
    <div v-else-if="allTags.length > 0" class="blog-tags-filter">
      <button
        class="tag-filter-btn"
        :class="{ active: selectedTag === null }"
        @click="selectedTag = null"
      >
        <Pill :text="'Все посты'" :type="selectedTag === null ? 'danger' : undefined" />
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-filter-btn"
        :class="{ active: selectedTag === tag }"
        @click="selectedTag = tag"
      >
        <Pill :text="tag" :type="selectedTag === tag ? 'danger' : undefined" />
      </button>
    </div>

    <!-- Список постов / пустое состояние -->
    <template v-if="!loading && !error">
      <div v-if="filteredPosts.length > 0" class="blog-posts">
        <article
          v-for="post in displayedPosts"
          :key="post.path"
          class="blog-post-card"
        >
          <header class="blog-post-header">
            <h2 class="blog-post-title">
              <RouterLink :to="post.path">{{ post.title }}</RouterLink>
            </h2>
            <time :datetime="post.date" class="blog-post-date">
              {{ formatDate(post.date) }}
            </time>
          </header>

          <div v-if="post.excerpt" class="blog-post-excerpt">
            {{ post.excerpt }}
          </div>

          <footer v-if="post.tags && post.tags.length > 0" class="blog-post-tags">
            <Pill
              v-for="tag in post.tags"
              :key="tag"
              :text="tag"
              type="danger"
              class="blog-post-tag"
            />
          </footer>
        </article>
      </div>

      <div v-else class="blog-empty">
        <p>Записи не найдены</p>
      </div>
    </template>

    <!-- Кнопка "Загрузить еще" -->
    <div v-if="!loading && !error && hasMorePosts" class="blog-load-more">
      <button class="load-more-btn" @click="loadMore">
        Загрузить еще
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import Pill from "../components/Pill.vue";

// Константа для количества постов на странице
const POSTS_PER_PAGE = 10;

// Реактивные данные
const posts = ref([]);
const selectedTag = ref(null);
const displayedCount = ref(POSTS_PER_PAGE);
const loading = ref(true);
const error = ref(null);

// Вычисляемые свойства
const allTags = computed(() => {
  const tagsSet = new Set();
  posts.value.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet).sort();
});

const filteredPosts = computed(() => {
  if (!selectedTag.value) {
    return posts.value;
  }
  return posts.value.filter(
    (post) => post.tags && post.tags.includes(selectedTag.value)
  );
});

const displayedPosts = computed(() => {
  return filteredPosts.value.slice(0, displayedCount.value);
});

const hasMorePosts = computed(() => {
  return displayedPosts.value.length < filteredPosts.value.length;
});

// Методы
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  };
  return new Intl.DateTimeFormat("ru-RU", options).format(date);
}

function loadMore() {
  displayedCount.value += POSTS_PER_PAGE;
}

async function loadPosts() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch("/data/blog-posts.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Преобразуем даты обратно в объекты Date
    posts.value = data.map((post) => ({
      ...post,
      date: new Date(post.date),
    }));
  } catch (err) {
    console.error("Ошибка при загрузке постов:", err);
    error.value = err.message || "Неизвестная ошибка";
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

// Сбрасываем счетчик при изменении фильтра
watch(selectedTag, () => {
  displayedCount.value = POSTS_PER_PAGE;
});

// Загружаем посты при монтировании компонента
onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.blog-index {
  max-width: 100%;
}

.blog-tags-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--c-border);
}

.tag-filter-btn {
  font-size: inherit;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.tag-filter-btn:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}

.tag-filter-btn:active {
  transform: translateY(0);
}

.blog-posts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  max-width: var(--content-width, 740px);
  margin-inline: auto;
}

@media (min-width: 768px) {
  .blog-posts {
    grid-template-columns: 1fr 1fr;
    column-gap: 0.5rem;
  }
}

.blog-post-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider, var(--c-border));
  border-radius: 0.25rem;
  padding: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: var(--c-bg);
}

.blog-post-card:hover {
  border-color: var(--c-brand);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.blog-post-header {
  margin-bottom: 0.75rem;
}

.blog-post-title {
  margin: 0 0 0.5rem 0;
  padding: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 600;
}

.blog-post-title a {
  color: var(--c-text);
  text-decoration: none;
  transition: color 0.2s;
}

.blog-post-title a:hover {
  color: var(--c-brand);
}

.blog-post-date {
  display: block;
  font-size: 0.9rem;
  color: var(--c-text-light);
  margin-top: 0.25rem;
}

.blog-post-excerpt {
  color: var(--vp-c-text-2, var(--c-text-light));
  line-height: 1.6;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  flex-grow: 1;
}

.blog-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider, var(--c-border));
}

.blog-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--c-text-light);
}

.blog-loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--c-text-light);
}

.blog-error {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--c-text-darker, #dc2626);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
}

.blog-load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--c-border);
}

.load-more-btn {
  background: var(--vp-c-accent);
  color: var(--vp-c-accent-text);
  border: 1px solid var(--vp-c-accent);
  border-radius: 0.375rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: var(--vp-c-accent-text);
  color: var(--vp-c-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.load-more-btn:active {
  transform: translateY(0);
}

</style>

