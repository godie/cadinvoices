import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => Math.random().toString(36).substring(2, 15),
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});