/**
 * helpers.js
 * Funções utilitárias puras — sem dependências externas.
 */

/**
 * Retorna uma saudação baseada no horário atual.
 * @returns {string} "Bom dia!", "Boa tarde!" ou "Boa noite!"
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia!';
  if (hour >= 12 && hour < 18) return 'Boa tarde!';
  return 'Boa noite!';
}

/**
 * Formata uma data para o padrão pt-BR.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date = new Date()) {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Aplica um efeito de saída no elemento e executa o callback ao fim.
 * @param {HTMLElement} el
 * @param {Function} callback
 */
export function fadeOutAndRun(el, callback) {
  el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  el.style.opacity    = '0';
  el.style.transform  = 'scale(0.97) translateY(-10px)';
  setTimeout(callback, 250);
}
