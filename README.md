# Gestão de Recursos

Aplicação web front-end (HTML, CSS e JavaScript puro) para gestão de recursos com foco em:
- cadastro de categorias e siglas
- cadastro de recursos com identificador automático
- persistência local no navegador via localStorage

## Status Atual do Projeto

Status geral: parcialmente implementado e funcional para o fluxo principal de configuração e cadastro.

Implementado:
- Home com navegação para os módulos
- Configurações de categorias (criar e excluir)
- Cadastro de recursos com validações e geração de identificador
- Consulta de recursos com busca dinâmica, filtros e seleção
- Impressão de etiquetas (2,5 x 6,5 cm) com código do recurso
- Exportação dos recursos selecionados em CSV e XLSX
- Persistência de dados em localStorage
- Interface responsiva para desktop e mobile

Pendente:
- Edição de categoria
- Edição e exclusão de recursos cadastrados
- Ordenação avançada de recursos
- Backend/API e sincronização em banco de dados
- Testes automatizados

## Funcionalidades Implementadas

### 1. Home
Arquivo principal: index.html

O que faz:
- Exibe saudação dinâmica por horário (Bom dia, Boa tarde, Boa noite)
- Exibe botões de navegação para:
  - Cadastrar recurso
  - Consultar recursos
  - Configurações
- Aplica animação de saída antes da navegação na página inicial

Módulo JS relacionado:
- assets/js/pages/home.js

Funções principais:
- initHome()
- getTimeGreeting() em assets/js/utils/helpers.js
- bindRouteLinks() em assets/js/core/router.js

### 2. Configurações de Categorias
Página: pages/configuracoes.html

O que faz:
- Permite cadastrar categoria com nome e sigla
- Normaliza sigla para letras maiúsculas (2 a 6 caracteres)
- Impede duplicidade de nome e de sigla
- Lista categorias existentes
- Permite excluir categoria
- Mostra feedback visual de sucesso/erro

Módulos JS relacionados:
- assets/js/pages/configuracoes.js
- assets/js/services/resource-service.js
- assets/js/core/storage.js

Funções principais:
- initConfiguracoesPage()
- saveCategory({ id, name, code })
- deleteCategory(categoryId)
- getCategories()

### 3. Cadastro de Recurso
Página: pages/cadastrar.html

O que faz:
- Carrega categorias já configuradas
- Bloqueia cadastro quando não existem categorias
- Permite informar:
  - categoria
  - data de aquisição
  - nome do recurso
  - status (ativo ou descartado)
- Gera identificador automático no padrão:
  - SIGLA-DDMMAA-XX
- Exibe prévia dinâmica do identificador
- Salva recurso no localStorage

Regras de geração de identificador:
- SIGLA: baseada na categoria configurada
- DDMMAA: derivada da data de aquisição
- XX: sequência incremental por combinação categoria + data

Módulos JS relacionados:
- assets/js/pages/cadastrar.js
- assets/js/services/resource-service.js
- assets/js/core/storage.js

Funções principais:
- initCadastrarPage()
- createResource({ categoryId, name, acquisitionDate, status })
- formatIdentifierDate(dateInput)
- generateIdentifier(categoryCode, identifierDate)

### 4. Persistência Local
Módulo: assets/js/core/storage.js

Chaves de armazenamento:
- estoque-recursos:settings
- estoque-recursos:resources

O que faz:
- Leitura e escrita JSON com tratamento de erro
- Armazenamento de categorias em settings.categories
- Armazenamento de recursos em resources

Funções principais:
- getSettings(), saveSettings(settings)
- getResources(), saveResources(resources)
- appendResource(resource)

### 5. Consulta de Recursos
Página: pages/consultar.html

O que faz:
- Lista os recursos cadastrados em cards
- Permite busca dinâmica por:
  - identificador
  - nome
  - categoria/sigla
  - status
- Permite filtrar por categoria e status
- Permite seleção individual ou em lote (selecionar filtrados)
- Permite limpar seleção
- Permite exportar selecionados em:
  - CSV (.csv)
  - XLSX (.xlsx)
- Permite imprimir etiquetas dos selecionados no formato 2,5 x 6,5 cm contendo apenas o código
- Exibe resumo de seleção e contador de resultados
- Exibe painel recolhível de métricas (total, ativos e descartados)

Módulos JS/CSS relacionados:
- assets/js/pages/consultar.js
- assets/js/services/resource-service.js
- assets/css/pages/consultar.css

Funções principais:
- initConsultarPage()
- listResources(filters)
- getResourceMetrics()

## Arquitetura Atual

Arquitetura adotada: front-end estático multipágina com JavaScript modular (ES Modules), separando responsabilidades por camadas.

### Camadas

1. Apresentação (UI)
- HTML por página em index.html e pages/
- CSS organizado em:
  - base (tokens, reset, tipografia)
  - layout (fundo, estrutura da página)
  - components (botões, card, formulário, avisos)
  - pages (estilos específicos por tela)

2. Controle de Página
- assets/js/main.js detecta a página atual e chama o inicializador correspondente
- assets/js/pages/*.js contém a lógica de interação de cada tela

3. Domínio / Regras de Negócio
- assets/js/services/resource-service.js centraliza regras de categoria e recurso:
  - normalização
  - validações
  - geração de identificador

4. Infraestrutura Local
- assets/js/core/storage.js abstrai acesso ao localStorage
- assets/js/core/router.js abstrai navegação entre páginas por data-route

5. Utilitários
- assets/js/utils/helpers.js com funções auxiliares reutilizáveis (saudação, animação, etc.)

## Fluxo de Dados

1. Usuário interage com formulário da página
2. Controlador da página (assets/js/pages/*.js) valida e chama o service
3. Service aplica regras de negócio e chama o storage
4. Storage persiste no localStorage
5. UI recebe retorno e atualiza feedback/preview/listas

## Estrutura de Pastas

gestao-recursos/
- index.html
- README.md
- assets/
  - css/
    - main.css
    - base/
      - reset.css
      - typography.css
      - variables.css
    - components/
      - buttons.css
      - card.css
      - forms.css
      - notice.css
    - layout/
      - background.css
      - page-shell.css
    - pages/
      - cadastrar.css
      - consultar.css
      - configuracoes.css
      - home.css
  - js/
    - main.js
    - core/
      - router.js
      - storage.js
    - pages/
      - cadastrar.js
      - consultar.js
      - configuracoes.js
      - home.js
    - services/
      - resource-service.js
    - utils/
      - helpers.js
- pages/
  - cadastrar.html
  - configuracoes.html
  - consultar.html

## Como Executar Localmente

Por ser um projeto estático, você pode executar de duas formas:

1. Abrir o arquivo index.html diretamente no navegador
2. Rodar um servidor local simples (recomendado para comportamento consistente de módulos ES)

Exemplo com VS Code Live Server:
- Abrir a pasta do projeto
- Iniciar extensão Live Server no index.html

## Decisões Técnicas Relevantes

- Sem framework: simplicidade e baixo acoplamento
- ES Modules: organização por responsabilidade
- localStorage: persistência local sem backend
- CSS modular por domínio (base, layout, components, pages)
- Roteamento simples por redirecionamento entre arquivos HTML
- Exportação XLSX via import dinâmico de SheetJS (CDN)

## Próximos Passos Recomendados

1. Adicionar ordenação por data, nome e identificador na consulta
2. Implementar edição/exclusão de recursos na própria listagem
3. Criar regra de proteção para exclusão de categoria em uso por recursos
4. Incluir importação de dados (JSON/CSV)
5. Adicionar testes unitários para resource-service, storage e filtros da consulta
6. Evoluir para backend/API se necessário para uso multiusuário
