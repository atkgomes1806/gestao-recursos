/**
 * router.js
 * Roteamento simples baseado em href — sem dependências externas.
 */

/** Mapa de rotas: nome → arquivo */
const ROUTES = {
  home: 'index.html',
  cadastrar: 'cadastrar.html',
  consultar: 'consultar.html',
  configuracoes: 'configuracoes.html',
};

function resolveRoutePath(routeName) {
  const fileName = ROUTES[routeName];

  if (!fileName) {
    return null;
  }

  const isInsidePagesFolder = window.location.pathname.includes('/pages/');

  if (routeName === 'home') {
    return isInsidePagesFolder ? '../index.html' : './index.html';
  }

  return isInsidePagesFolder ? `./${fileName}` : `./pages/${fileName}`;
}

/**
 * Navega para a rota informada.
 * Recebe uma função de saída opcional para animar antes de redirecionar.
 *
 * @param {string}   routeName - Chave do mapa ROUTES.
 * @param {Function} [onExit]  - Callback de animação; deve chamar seu próprio setTimeout.
 */
export function navigate(routeName, onExit) {
  const path = resolveRoutePath(routeName);

  if (!path) {
    console.warn(`[Router] Rota desconhecida: "${routeName}"`);
    return;
  }

  if (typeof onExit === 'function') {
    onExit(() => {
      window.location.href = path;
    });
  } else {
    window.location.href = path;
  }
}

/**
 * Registra um clique em todos os elementos com [data-route].
 * Uso no HTML: <button data-route="cadastrar">...</button>
 *
 * @param {Function} [onExit] - Função de animação de saída.
 */
export function bindRouteLinks(onExit) {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      navigate(el.dataset.route, onExit);
    });
  });
}
