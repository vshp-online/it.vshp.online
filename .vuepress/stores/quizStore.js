import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

const STORAGE_KEY = "vshp-quiz-sessions";
const MAX_SESSIONS = 30;

export const useQuizStore = defineStore("quiz-sessions", () => {
  const sessions = useStorage(STORAGE_KEY, {});

  const getSession = (key) => {
    if (!key) return null;
    return sessions.value[key] || null;
  };

  const saveSession = (key, payload) => {
    if (!key) return;
    sessions.value[key] = {
      ...payload,
      savedAt: Date.now(),
    };
    pruneSessions();
  };

  const clearSession = (key) => {
    if (!key) return;
    if (sessions.value[key]) {
      delete sessions.value[key];
    }
  };

  const pruneSessions = (limit = MAX_SESSIONS) => {
    const keys = Object.keys(sessions.value || {});
    if (keys.length <= limit) return;
    const sorted = keys
      .map((key) => ({ key, savedAt: sessions.value[key]?.savedAt || 0 }))
      .sort((a, b) => a.savedAt - b.savedAt);
    for (let i = 0; i < sorted.length - limit; i += 1) {
      delete sessions.value[sorted[i].key];
    }
  };

  return {
    sessions,
    getSession,
    saveSession,
    clearSession,
    pruneSessions,
  };
});
