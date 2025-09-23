<script setup>
import "railroad-diagrams/railroad-diagrams.css";
import rr from "railroad-diagrams";
import { ref, onMounted } from "vue";

const props = defineProps({
  // либо передаём сразу текст (необязательно),
  code: { type: String, default: "" },
  // либо безопасно — base64
  b64: { type: String, default: "" },
});

const root = ref(null);

function decodeB64(b64) {
  // корректная декодировка UTF-8
  return decodeURIComponent(atob(b64));
}

function getRawCode() {
  if (props.b64) return decodeB64(props.b64).trim();
  if (props.code) return props.code.trim();
  // fallback: взять текст из слота (почти не понадобится)
  return (root.value?.textContent ?? "").trim();
}

onMounted(() => {
  const raw = getRawCode();
  if (!raw) return;

  // выполняем выражение в контексте rr (Diagram, Choice, Sequence, ...)
  const fn = new Function("rr", "with(rr){ return (" + raw + ") }");
  const diagram = fn(rr);

  root.value.innerHTML = "";
  if (diagram && typeof diagram.addTo === "function") {
    diagram.addTo(root.value);
  } else if (diagram && typeof diagram.format === "function") {
    root.value.appendChild(diagram.format());
  } else {
    root.value.textContent = "Railroad: wrong expression!";
  }
});
</script>

<template>
  <div ref="root" class="rr-container"><slot /></div>
</template>

<style scoped>
.rr-container {
  overflow-x: auto;
  padding: 0;
}
</style>
