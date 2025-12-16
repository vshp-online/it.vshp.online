const createMemoryStorage = () => {
  const memory = new Map();
  return {
    getItem(key) {
      return memory.has(String(key)) ? memory.get(String(key)) ?? null : null;
    },
    setItem(key, value) {
      memory.set(String(key), String(value));
    },
    removeItem(key) {
      memory.delete(String(key));
    },
    clear() {
      memory.clear();
    },
  };
};

if (typeof window === "undefined") {
  if (
    typeof globalThis.localStorage === "undefined" ||
    typeof globalThis.localStorage.getItem !== "function"
  ) {
    globalThis.localStorage = createMemoryStorage();
  }
  if (
    typeof globalThis.sessionStorage === "undefined" ||
    typeof globalThis.sessionStorage.getItem !== "function"
  ) {
    globalThis.sessionStorage = createMemoryStorage();
  }
}

export {};
