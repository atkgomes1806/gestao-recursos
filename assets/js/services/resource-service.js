/**
 * resource-service.js
 * Regras de negócio para categorias e recursos.
 */

import {
  appendResource,
  getResources,
  getSettings,
  saveSettings,
} from '../core/storage.js';

function slugId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function stripAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCategoryCode(value) {
  return stripAccents(String(value || ''))
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
}

export function normalizeCategoryName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function getCategories() {
  return getSettings().categories;
}

export function saveCategory({ id, name, code }) {
  const normalizedName = normalizeCategoryName(name);
  const normalizedCode = normalizeCategoryCode(code);

  if (!normalizedName) {
    throw new Error('Informe o nome da categoria.');
  }

  if (normalizedCode.length < 2) {
    throw new Error('A sigla da categoria deve ter pelo menos 2 letras.');
  }

  const settings = getSettings();
  const categories = settings.categories || [];
  const duplicatedCode = categories.find((category) => category.code === normalizedCode && category.id !== id);

  if (duplicatedCode) {
    throw new Error('Já existe uma categoria com essa sigla.');
  }

  const duplicatedName = categories.find(
    (category) => category.name.toLowerCase() === normalizedName.toLowerCase() && category.id !== id,
  );

  if (duplicatedName) {
    throw new Error('Já existe uma categoria com esse nome.');
  }

  const nextCategory = {
    id: id || slugId(),
    name: normalizedName,
    code: normalizedCode,
  };

  const nextCategories = id
    ? categories.map((category) => (category.id === id ? nextCategory : category))
    : [...categories, nextCategory];

  saveSettings({ ...settings, categories: nextCategories });
  return nextCategory;
}

export function deleteCategory(categoryId) {
  const settings = getSettings();
  const nextCategories = (settings.categories || []).filter((category) => category.id !== categoryId);
  saveSettings({ ...settings, categories: nextCategories });
}

export function formatIdentifierDate(dateInput) {
  if (!dateInput) {
    throw new Error('Informe a data de aquisição.');
  }

  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}${month}${year.slice(-2)}`;
    }
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Data de aquisição inválida.');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

export function generateIdentifier(categoryCode, identifierDate) {
  const resources = getResources();
  const currentSequence = resources.filter(
    (resource) => resource.categoryCode === categoryCode && resource.identifierDate === identifierDate,
  ).length + 1;

  return {
    sequence: currentSequence,
    value: `${categoryCode}-${identifierDate}-${String(currentSequence).padStart(2, '0')}`,
  };
}

export function createResource({ categoryId, name, acquisitionDate, status }) {
  const categories = getCategories();
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error('Selecione uma categoria válida nas configurações.');
  }

  const normalizedName = String(name || '').trim().replace(/\s+/g, ' ');
  if (!normalizedName) {
    throw new Error('Informe o nome do recurso.');
  }

  if (!acquisitionDate) {
    throw new Error('Informe a data de aquisição.');
  }

  if (!['ativo', 'descartado'].includes(status)) {
    throw new Error('Selecione um status válido.');
  }

  const identifierDate = formatIdentifierDate(acquisitionDate);
  const identifier = generateIdentifier(category.code, identifierDate);

  const resource = {
    id: slugId(),
    identifier: identifier.value,
    sequence: identifier.sequence,
    categoryId: category.id,
    categoryName: category.name,
    categoryCode: category.code,
    name: normalizedName,
    acquisitionDate,
    status,
    identifierDate,
    createdAt: new Date().toISOString(),
  };

  appendResource(resource);
  return resource;
}
