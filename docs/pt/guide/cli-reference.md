# Referência da CLI

A CLI do `mineproj` fornece todos os comandos para construir, desenvolver e gerenciar seu site.

## Uso

```bash
mineproj <comando> [opcoes]
```

## Comandos

### `dev`

Inicia o servidor de desenvolvimento.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

Constrói o site estático.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

Visualiza o site construído.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

Valida arquivos de configuração e dados.

```bash
mineproj check [--i18n]
```

### `new <slug>`

Cria um novo esqueleto de projeto.

```bash
mineproj new meu-projeto
```

### `audit`

Pontua o site construído em SEO, IA, acessibilidade e desempenho.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

Diagnostica o ambiente, configuração e estado do projeto.

```bash
mineproj doctor
```

### `info`

Mostra diagnóstico da configuração resolvida, tema e plugins.

```bash
mineproj info
```

### `theme:eject`

Copia o tema atual para `.mineproj/theme/` para personalização.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

Cria estrutura para uma nova localidade.

```bash
mineproj i18n:init en
```

### `i18n:extract`

Extrai chaves não traduzidas por localidade.

```bash
mineproj i18n:extract
```

### `editor:export`

Exporta rascunhos do editor como patches JSON.

```bash
mineproj editor:export
```

### `migrate`

Migração e backup de versão de esquema.

```bash
mineproj migrate
```

## Opções Globais

| Opção | Descrição |
|-------|-----------|
| `--root <dir>` | Diretório raiz do site |
| `--config <path>` | Caminho explícito do arquivo de configuração |
| `--outDir <dir>` | Substituir diretório de saída |
| `--port <n>` | Porta do servidor de dev/preview |
| `--host <host>` | Host do servidor de dev/preview |
| `--open` | Abrir navegador após iniciar |
| `--editor` | Habilitar editor visual (apenas dev) |
| `--fail-under <n>` | Pontuação mínima de auditoria (padrão 85) |
| `-h, --help` | Mostrar ajuda |
| `-v, --version` | Mostrar versão |