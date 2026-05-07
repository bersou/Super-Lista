# Super Lista

Uma aplicação web moderna para gerenciamento de listas de compras, desenvolvida com React, Vite e Tailwind CSS.

## Funcionalidades

- **Adicionar itens** - Nome, preço, quantidade e categoria
- **Editar itens** - Clique no ícone de编辑ar para modificar
- **Marcar como comprado** - Controle visual do progresso
- **Análise de gastos** - Gráfico por categoria com breakdown
- **Recibo para WhatsApp** - Gere e compartilhe o recibo da compra
- **Persistência local** - Dados salvos no localStorage

## Categorias Disponíveis

Hortifruti, Laticínios, Açougue, Limpeza, Higiene, Bebidas, Mercearia, Outros

## Tecnologias

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)](https://eslint.org/)

## Como Executar

```bash
cd "Super Compras"
yarn dev
```

O servidor estará disponível em `http://localhost:5173/`

## Scripts Disponíveis

- `yarn dev` - Inicia o servidor de desenvolvimento
- `yarn build` - Builda a aplicação para produção
- `yarn lint` - Executa o ESLint
- `yarn preview` - Pré-visualização do build de produção

## Estrutura do Projeto

```
Super Compras/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── yarn.lock
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── assets/
        ├── vite.svg
        ├── react.svg
        └── hero.png
```

## Dependências

### Produção
- `react` ^19.2.5
- `react-dom` ^19.2.5
- `lucide-react` ^0.468.0

### Desenvolvimento
- `vite` ^8.0.10
- `@vitejs/plugin-react` ^6.0.1
- `tailwindcss` ^3.4.17
- `postcss` ^8.4.49
- `autoprefixer` ^10.4.20
- `eslint` ^10.2.1
- `@eslint/js` ^10.0.1
- `eslint-plugin-react-hooks` ^7.1.1
- `eslint-plugin-react-refresh` ^0.5.2
- `globals` ^17.5.0

## License

MIT