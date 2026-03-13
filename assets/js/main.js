/**
 * main.js
 * Ponto de entrada da aplicação.
 * Detecta a página atual e inicializa o módulo correspondente.
 */

import { initHome } from './pages/home.js';
import { initCadastrarPage } from './pages/cadastrar.js';
import { initConfiguracoesPage } from './pages/configuracoes.js';
import { initConsultarPage } from './pages/consultar.js';

const PAGE_INITIALIZERS = {
  'index.html': initHome,
  'cadastrar.html': initCadastrarPage,
  'consultar.html': initConsultarPage,
  'configuracoes.html': initConfiguracoesPage,
  '': initHome, // raiz (/)
};

function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

function bootstrap() {
  const page = getCurrentPage();
  const init = PAGE_INITIALIZERS[page];

  if (typeof init === 'function') {
    init();
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
