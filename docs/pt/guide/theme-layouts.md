# Layouts e Slots de Temas

## Layouts

O mineproj requer 7 layouts principais. Cada layout é um componente React que recebe `LayoutProps`.

### Layout Home

A página inicial. Exibe projetos em destaque, projetos recentes e informações do perfil.

### Layout List

Mostra uma grade de projetos filtrada/ordenada. Usada pela rota `/projects/`.

### Layout Detail

A página individual do projeto em `/projects/<slug>/`. Mostra detalhes completos do projeto, conteúdo do corpo, capturas de tela, vídeos, PDFs e demonstrações interativas.

### Layout Tag

Lista projetos filtrados por uma tag em `/tags/<tag>/`.

### Layout Collection

Lista projetos em uma coleção. Funciona de forma semelhante ao layout de tag.

### Layout About

A página sobre em `/about/`. Mostra informações do perfil.

### Layout Not Found

A página 404. Exibida quando uma rota não corresponde.

## Slots

Slots são pontos de extensibilidade onde plugins podem injetar componentes:

```ts
// Em um plugin
export default definePlugin({
  name: 'meu-plugin',
  hooks: {
    setup: (ctx) => {
      ctx.registerSlot('header', MeuComponenteHeader);
    },
  },
});
```

Slots embutidos normalmente incluem: `header`, `footer`, `sidebar`, `editor-shell`.

## Comportamento de Fallback

Se um tema não fornecer um layout, o mineproj usa o layout do tema padrão e emite um aviso. Isso garante que o site sempre possa ser construído, mesmo com um tema incompleto.

## Registro de Componentes

O registro de componentes resolve componentes nesta ordem:
1. Componentes do tema
2. Componentes de plugins
3. Sobrescritas do usuário (o último vence)

Sobrescritas de componentes desconhecidos disparam um aviso.