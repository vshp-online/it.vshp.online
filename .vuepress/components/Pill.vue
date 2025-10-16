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
  color: #047857;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
}
.info {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.35);
}
.warning {
  color: #92400e;
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
}
.danger {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
}
</style>
