/**
 * storage.js
 * Persistência da aplicação via localStorage.
 */

const STORAGE_KEYS = {
  settings: 'estoque-recursos:settings',
  resources: 'estoque-recursos:resources',
};

const DEFAULT_SETTINGS = {
  categories: [],
};

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`[Storage] Falha ao ler a chave "${key}".`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSettings() {
  const settings = readJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    categories: Array.isArray(settings?.categories) ? settings.categories : [],
  };
}

export function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, {
    ...DEFAULT_SETTINGS,
    ...settings,
    categories: Array.isArray(settings?.categories) ? settings.categories : [],
  });
}

export function getResources() {
  return readJson(STORAGE_KEYS.resources, []);
}

export function saveResources(resources) {
  writeJson(STORAGE_KEYS.resources, Array.isArray(resources) ? resources : []);
}

export function appendResource(resource) {
  const resources = getResources();
  resources.push(resource);
  saveResources(resources);
  return resource;
}

export function getStorageKeys() {
  return { ...STORAGE_KEYS };
}
