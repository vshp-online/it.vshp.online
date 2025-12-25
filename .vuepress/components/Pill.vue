<template>
  <span class="pill" :class="type">{{ text }}</span>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  type?: "tip" | "info" | "warning" | "danger";
}>();
</script>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.85em;
  border-radius: 9999px;
  padding: 0.15em 0.65em;
  line-height: 1.3;
  border: 1px solid transparent;
  white-space: nowrap;
}
/* Палитра по типам */
.tip {
  color: var(--pill-tip-text);
  background: var(--pill-tip-bg);
  border-color: var(--pill-tip-border);
}
.info {
  color: var(--pill-info-text);
  background: var(--pill-info-bg);
  border-color: var(--pill-info-border);
}
.warning {
  color: var(--pill-warning-text);
  background: var(--pill-warning-bg);
  border-color: var(--pill-warning-border);
}
.danger {
  color: var(--pill-danger-text);
  background: var(--pill-danger-bg);
  border-color: var(--pill-danger-border);
}
</style>
