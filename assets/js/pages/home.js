/**
 * home.js
 * Lógica específica da página inicial.
 */

import { getTimeGreeting, fadeOutAndRun } from '../utils/helpers.js';
import { bindRouteLinks }                 from '../core/router.js';

/**
 * Inicializa a página home:
 * - Aplica saudação dinâmica
 * - Registra navegação nos botões
 */
export function initHome() {
  setGreeting();
  registerNavigation();
}

function setGreeting() {
  const el = document.querySelector('[data-greeting]');
  if (el) el.textContent = getTimeGreeting();
}

function registerNavigation() {
  const card = document.querySelector('.card');
  const onExit = (callback) => fadeOutAndRun(card, callback);
  bindRouteLinks(onExit);
}
