/**
 * consultar.js
 * Listagem, busca dinâmica e filtros do inventário de recursos.
 */

import { bindRouteLinks } from '../core/router.js';
import {
    getCategories,
    getResourceMetrics,
    listResources,
} from '../services/resource-service.js';

export function initConsultarPage() {
    const form = document.querySelector('[data-filter-form]');
    if (!form) return;

    const elements = {
        form,
        searchInput: document.querySelector('[data-search-input]'),
        categoryFilter: document.querySelector('[data-category-filter]'),
        statusFilter: document.querySelector('[data-status-filter]'),
        clearFiltersButton: document.querySelector('[data-clear-filters]'),
        resultSummary: document.querySelector('[data-result-summary]'),
        list: document.querySelector('[data-resource-list]'),
        emptyState: document.querySelector('[data-empty-state]'),
        totalCount: document.querySelector('[data-total-count]'),
        activeCount: document.querySelector('[data-active-count]'),
        discardedCount: document.querySelector('[data-discarded-count]'),
        selectFilteredButton: document.querySelector('[data-select-filtered]'),
        clearSelectionButton: document.querySelector('[data-clear-selection]'),
        printLabelsButton: document.querySelector('[data-print-labels]'),
        exportFormat: document.querySelector('[data-export-format]'),
        exportSelectedButton: document.querySelector('[data-export-selected]'),
        selectionSummary: document.querySelector('[data-selection-summary]'),
    };

    const state = {
        selectedIds: new Set(),
        filteredResources: [],
    };

    bindRouteLinks();
    renderCategoryOptions(elements);
    renderMetrics(elements);
    bindEvents(elements, state);
    renderResourceList(elements, state);
}

function bindEvents(elements, state) {
    elements.searchInput.addEventListener('input', () => renderResourceList(elements, state));
    elements.categoryFilter.addEventListener('change', () => renderResourceList(elements, state));
    elements.statusFilter.addEventListener('change', () => renderResourceList(elements, state));

    elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        renderResourceList(elements, state);
    });

    elements.clearFiltersButton.addEventListener('click', () => {
        elements.form.reset();
        renderResourceList(elements, state);
    });

    elements.list.addEventListener('change', (event) => {
        const checkbox = event.target.closest('[data-select-resource]');
        if (!checkbox) return;

        if (checkbox.checked) {
            state.selectedIds.add(checkbox.value);
        } else {
            state.selectedIds.delete(checkbox.value);
        }

        updateSelectionStatus(elements, state);
    });

    elements.selectFilteredButton.addEventListener('click', () => {
        state.filteredResources.forEach((resource) => {
            state.selectedIds.add(resource.id);
        });

        renderResourceList(elements, state);
    });

    elements.clearSelectionButton.addEventListener('click', () => {
        state.selectedIds.clear();
        renderResourceList(elements, state);
    });

    elements.printLabelsButton.addEventListener('click', () => {
        printSelectedLabels(state);
    });

    elements.exportSelectedButton.addEventListener('click', async () => {
        await exportSelectedResources(elements, state);
    });
}

function renderCategoryOptions(elements) {
    const categories = getCategories();

    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (${category.code})`;
        elements.categoryFilter.append(option);
    });
}

function renderMetrics(elements) {
    const metrics = getResourceMetrics();
    elements.totalCount.textContent = String(metrics.total);
    elements.activeCount.textContent = String(metrics.active);
    elements.discardedCount.textContent = String(metrics.discarded);
}

function renderResourceList(elements, state) {
    const filters = {
        query: elements.searchInput.value,
        categoryId: elements.categoryFilter.value,
        status: elements.statusFilter.value,
    };

    const resources = listResources(filters);
    state.filteredResources = resources;
    const totalResources = getResourceMetrics().total;

    elements.list.innerHTML = '';
    elements.emptyState.hidden = resources.length > 0;

    if (resources.length === 0) {
        elements.resultSummary.textContent = totalResources === 0
            ? 'Nenhum recurso cadastrado até o momento. Cadastre um recurso para começar a consulta.'
            : 'Nenhum recurso corresponde aos filtros aplicados.';
        updateSelectionStatus(elements, state);
        return;
    }

    const summaryLabel = resources.length === 1 ? '1 recurso encontrado' : `${resources.length} recursos encontrados`;
    elements.resultSummary.textContent = `${summaryLabel}${buildFilterSuffix(filters)}.`;

    resources.forEach((resource) => {
        elements.list.append(createResourceCard(resource, state.selectedIds.has(resource.id)));
    });

    updateSelectionStatus(elements, state);
}

function createResourceCard(resource, isSelected) {
    const article = document.createElement('article');
    article.className = 'resource-card';

    const acquisitionDate = formatDisplayDate(resource.acquisitionDate);
    const createdAt = formatDisplayDate(resource.createdAt);
    const statusLabel = resource.status === 'ativo' ? 'Ativo' : 'Descartado';

    article.innerHTML = `
    <div class="resource-card__top">
      <div>
        <div class="resource-card__identifier">${resource.identifier}</div>
        <h3 class="resource-card__title">${resource.name}</h3>
      </div>
            <div>
                <span class="badge resource-card__status resource-card__status--${resource.status}">${statusLabel}</span>
                <label class="resource-card__check">
                    <input type="checkbox" data-select-resource value="${resource.id}" ${isSelected ? 'checked' : ''} />
                    Selecionar
                </label>
            </div>
    </div>

    <div class="resource-card__meta-grid">
      <div class="resource-card__meta-item">
        <span class="resource-card__meta-label">Categoria</span>
        <strong>${resource.categoryName} (${resource.categoryCode})</strong>
      </div>
      <div class="resource-card__meta-item">
        <span class="resource-card__meta-label">Aquisição</span>
        <strong>${acquisitionDate}</strong>
      </div>
      <div class="resource-card__meta-item">
        <span class="resource-card__meta-label">Sequência</span>
        <strong>${String(resource.sequence).padStart(2, '0')}</strong>
      </div>
      <div class="resource-card__meta-item">
        <span class="resource-card__meta-label">Cadastrado em</span>
        <strong>${createdAt}</strong>
      </div>
    </div>
  `;

    return article;
}

function buildFilterSuffix(filters) {
    const parts = [];

    if (filters.query.trim()) {
        parts.push(`para a busca "${filters.query.trim()}"`);
    }

    if (filters.categoryId) {
        const selectedOption = document.querySelector(`[data-category-filter] option[value="${filters.categoryId}"]`);
        if (selectedOption) {
            parts.push(`na categoria ${selectedOption.textContent}`);
        }
    }

    if (filters.status) {
        parts.push(`com status ${filters.status}`);
    }

    return parts.length > 0 ? ` ${parts.join(' e ')}` : '';
}

function formatDisplayDate(value) {
    if (!value) {
        return 'Não informado';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('pt-BR');
}

function updateSelectionStatus(elements, state) {
    const selectedCount = state.selectedIds.size;
    elements.printLabelsButton.disabled = selectedCount === 0;
    elements.exportSelectedButton.disabled = selectedCount === 0;

    if (selectedCount === 0) {
        elements.selectionSummary.textContent = 'Nenhum recurso selecionado para ações.';
        return;
    }

    const filteredSelectedCount = state.filteredResources.filter((resource) => state.selectedIds.has(resource.id)).length;
    const selectedLabel = selectedCount === 1 ? '1 recurso selecionado' : `${selectedCount} recursos selecionados`;
    const filteredLabel = filteredSelectedCount === 1
        ? '1 visível na lista atual'
        : `${filteredSelectedCount} visíveis na lista atual`;

    elements.selectionSummary.textContent = `${selectedLabel} (${filteredLabel}). Pronto para imprimir ou exportar.`;
}

function printSelectedLabels(state) {
    if (state.selectedIds.size === 0) {
        return;
    }

    const selectedResources = listResources({}).filter((resource) => state.selectedIds.has(resource.id));
    if (selectedResources.length === 0) {
        return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (!printWindow) {
        window.alert('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-up.');
        return;
    }

    const labels = selectedResources
        .map((resource) => `<div class="label">${escapeHtml(resource.identifier)}</div>`)
        .join('');

    printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8" />
                <title>Etiquetas de Recursos</title>
                <style>
                    @page {
                        margin: 0.6cm;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }

                    .sheet {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.2cm;
                    }

                    .label {
                        width: 6.5cm;
                        height: 2.5cm;
                        border: 1px solid #000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        font-weight: 700;
                        letter-spacing: 0.06em;
                    }
                </style>
            </head>
            <body>
                <div class="sheet">${labels}</div>
            </body>
            </html>
        `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function exportSelectedResources(elements, state) {
    const selectedResources = getSelectedResources(state);
    if (selectedResources.length === 0) {
        return;
    }

    const rows = selectedResources.map((resource) => ({
        Codigo: resource.identifier,
        Nome: resource.name,
        Categoria: resource.categoryName,
        Sigla: resource.categoryCode,
        Status: resource.status,
        Aquisicao: formatDisplayDate(resource.acquisitionDate),
        Sequencia: String(resource.sequence).padStart(2, '0'),
        CadastradoEm: formatDisplayDate(resource.createdAt),
    }));

    const format = elements.exportFormat.value;
    if (format === 'xlsx') {
        await exportAsXlsx(rows);
        return;
    }

    exportAsCsv(rows);
}

function getSelectedResources(state) {
    return listResources({}).filter((resource) => state.selectedIds.has(resource.id));
}

function exportAsCsv(rows) {
    const headers = Object.keys(rows[0]);
    const csvLines = [
        headers.join(';'),
        ...rows.map((row) => headers.map((header) => escapeCsvField(row[header])).join(';')),
    ];

    const csvContent = `\uFEFF${csvLines.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, buildExportFileName('csv'));
}

async function exportAsXlsx(rows) {
    try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recursos');

        const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob(
            [data],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        );

        downloadBlob(blob, buildExportFileName('xlsx'));
    } catch (error) {
        console.error('[Consultar] Falha ao exportar XLSX.', error);
        window.alert('Nao foi possivel exportar em XLSX neste navegador/rede. Tente CSV.');
    }
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function buildExportFileName(extension) {
    const now = new Date();
    const date = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('');

    const time = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    return `recursos-selecionados-${date}-${time}.${extension}`;
}

function escapeCsvField(value) {
    const stringValue = String(value ?? '');
    const sanitized = stringValue.replace(/"/g, '""');
    return `"${sanitized}"`;
}