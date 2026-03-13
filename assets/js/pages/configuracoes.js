/**
 * configuracoes.js
 * Gerenciamento das categorias usadas na identificação dos recursos.
 */

import { bindRouteLinks } from '../core/router.js';
import {
  deleteCategory,
  getCategories,
  saveCategory,
} from '../services/resource-service.js';

export function initConfiguracoesPage() {
  const form = document.querySelector('[data-category-form]');
  if (!form) return;

  const elements = {
    form,
    nameInput: document.querySelector('[data-category-name]'),
    codeInput: document.querySelector('[data-category-code]'),
    feedback: document.querySelector('[data-settings-feedback]'),
    list: document.querySelector('[data-category-list]'),
    emptyState: document.querySelector('[data-category-empty]'),
  };

  bindRouteLinks();
  bindEvents(elements);
  renderCategories(elements);
}

function bindEvents(elements) {
  elements.codeInput.addEventListener('input', () => {
    elements.codeInput.value = elements.codeInput.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  });

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    try {
      saveCategory({
        name: elements.nameInput.value,
        code: elements.codeInput.value,
      });

      elements.form.reset();
      showFeedback(elements.feedback, 'Categoria salva com sucesso.', 'success');
      renderCategories(elements);
    } catch (error) {
      showFeedback(elements.feedback, error.message, 'error');
    }
  });

  elements.list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-category]');
    if (!button) return;

    deleteCategory(button.dataset.deleteCategory);
    showFeedback(elements.feedback, 'Categoria removida com sucesso.', 'success');
    renderCategories(elements);
  });
}

function renderCategories(elements) {
  const categories = getCategories();
  elements.list.innerHTML = '';
  elements.emptyState.hidden = categories.length > 0;

  categories.forEach((category) => {
    const item = document.createElement('div');
    item.className = 'data-item';
    item.innerHTML = `
      <div>
        <div class="data-item__title">${category.name}</div>
        <div class="data-item__meta">Sigla usada no código: ${category.code}</div>
      </div>
      <div class="page-actions">
        <span class="badge">${category.code}</span>
        <button type="button" class="btn btn--danger btn--auto" data-delete-category="${category.id}">
          <span class="btn__label">Excluir</span>
        </button>
      </div>
    `;
    elements.list.append(item);
  });
}

function showFeedback(element, message, type) {
  element.hidden = false;
  element.className = `notice notice--${type}`;
  element.textContent = message;
}
