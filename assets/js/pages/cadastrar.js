/**
 * cadastrar.js
 * Fluxo de cadastro de recursos.
 */

import { bindRouteLinks } from '../core/router.js';
import {
  createResource,
  formatIdentifierDate,
  generateIdentifier,
  getCategories,
} from '../services/resource-service.js';

export function initCadastrarPage() {
  const form = document.querySelector('[data-resource-form]');
  if (!form) return;

  const elements = {
    form,
    categorySelect: document.querySelector('[data-category-select]'),
    acquisitionDateInput: document.querySelector('[name="acquisitionDate"]'),
    feedback: document.querySelector('[data-form-feedback]'),
    previewValue: document.querySelector('[data-identifier-preview]'),
    previewMeta: document.querySelector('[data-identifier-meta]'),
    emptyWarning: document.querySelector('[data-category-warning]'),
    submitButton: document.querySelector('[data-submit-resource]'),
  };

  bindRouteLinks();
  renderCategories(elements);
  bindEvents(elements);
  updateIdentifierPreview(elements);
}

function bindEvents(elements) {
  elements.categorySelect?.addEventListener('change', () => updateIdentifierPreview(elements));
  elements.acquisitionDateInput?.addEventListener('change', () => updateIdentifierPreview(elements));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitResource(elements);
  });
}

function renderCategories(elements) {
  const categories = getCategories();
  const hasCategories = categories.length > 0;

  elements.categorySelect.innerHTML = hasCategories
    ? '<option value="">Selecione uma categoria</option>'
    : '<option value="">Nenhuma categoria configurada</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.name} (${category.code})`;
    elements.categorySelect.append(option);
  });

  elements.categorySelect.disabled = !hasCategories;
  elements.submitButton.disabled = !hasCategories;
  elements.emptyWarning.hidden = hasCategories;

  if (!hasCategories) {
    showFeedback(elements.feedback, 'Configure pelo menos uma categoria para liberar o cadastro.', 'info');
  }
}

function updateIdentifierPreview(elements, lastIdentifier = null) {
  if (lastIdentifier) {
    elements.previewValue.textContent = lastIdentifier;
    elements.previewMeta.textContent = 'Identificador gerado no último salvamento.';
    return;
  }

  const categories = getCategories();
  const selectedCategory = categories.find((category) => category.id === elements.categorySelect.value);
  const categoryCode = selectedCategory?.code || 'CAT';
  const acquisitionDate = elements.acquisitionDateInput?.value;

  if (!acquisitionDate) {
    elements.previewValue.textContent = `${categoryCode}-DDMMAA-01`;
    elements.previewMeta.textContent = selectedCategory
      ? 'Selecione a data de aquisição para calcular a prévia final.'
      : 'Selecione categoria e data de aquisição para calcular a sequência.';
    return;
  }

  const identifierDate = formatIdentifierDate(acquisitionDate);
  const identifier = generateIdentifier(categoryCode, identifierDate).value;

  elements.previewValue.textContent = identifier;
  elements.previewMeta.textContent = selectedCategory
    ? 'Prévia com base na categoria e na data de aquisição informada.'
    : 'A sequência é atualizada quando categoria e data são informadas.';
}

function submitResource(elements) {
  const formData = new FormData(elements.form);

  try {
    const resource = createResource({
      categoryId: formData.get('categoryId'),
      name: formData.get('name'),
      acquisitionDate: formData.get('acquisitionDate'),
      status: formData.get('status'),
    });

    showFeedback(
      elements.feedback,
      `Recurso salvo com sucesso. Identificador gerado: ${resource.identifier}`,
      'success',
    );

    elements.form.reset();
    const activeStatus = elements.form.querySelector('[value="ativo"]');
    if (activeStatus) activeStatus.checked = true;
    updateIdentifierPreview(elements, resource.identifier);
  } catch (error) {
    showFeedback(elements.feedback, error.message, 'error');
    updateIdentifierPreview(elements);
  }
}

function showFeedback(element, message, type) {
  element.hidden = false;
  element.className = `notice notice--${type}`;
  element.textContent = message;
}
