# Primeiros Passos

Bem-vindo ao mineproj! Este guia vai ajudar você a criar seu primeiro site de portfólio de projetos.

## Pré-requisitos

- **Node.js** 22 ou superior
- **pnpm** 10 (instale via `npm install -g pnpm`)

## Criar um Novo Site

A maneira mais rápida de começar é com a ferramenta de scaffolding:

```bash
npx create-mineproj meu-portfolio
cd meu-portfolio
pnpm dev
```

Abra `http://localhost:5173` no seu navegador para ver o site.

## Estrutura do Projeto

```
meu-portfolio/
├─ mineproj.config.ts      # Configuração do site
├─ data/
│  ├─ projects/             # Dados dos projetos (JSON + Markdown)
│  │  └─ meu-projeto/
│  │     ├─ index.json      # Metadados do projeto
│  │     └─ body.md         # Conteúdo do corpo do projeto
│  ├─ profile.json          # Seu perfil
│  └─ tags.json             # Definições de tags
├─ public/                  # Ativos estáticos (imagens, PDFs, etc.)
└─ dist/                    # Saída da build (gerada)
```

## Adicionar um Projeto

Crie um novo diretório em `data/projects/`:

```bash
mineproj new meu-projeto
```

Isso cria `data/projects/meu-projeto/index.json` e `data/projects/meu-projeto/body.md`. Edite o arquivo JSON para definir os metadados do projeto.

## Build para Produção

```bash
pnpm build
```

A saída vai para `dist/`. Visualize localmente:

```bash
pnpm preview
```

## Próximos Passos

- [Guia de Configuração](./configuration) — referência completa de configuração
- [Modelo de Dados](./data-model) — entenda o esquema do projeto
- [Desenvolvimento de Temas](./theme-development) — personalize a aparência
- [Desenvolvimento de Plugins](./plugin-development) — estenda funcionalidades
- [Implantação](./deploying) — implante seu site em produção