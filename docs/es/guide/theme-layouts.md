# Diseños y Slots de Temas

## Diseños

mineproj requiere 7 diseños principales. Cada diseño es un componente React que recibe `LayoutProps`.

### Diseño de Inicio

La página de inicio. Muestra proyectos destacados, proyectos recientes e información del perfil.

### Diseño de Lista

Muestra una cuadrícula de proyectos filtrada/ordenada. Se usa en la ruta `/projects/`.

### Diseño de Detalle

La página individual del proyecto en `/projects/<slug>/`. Muestra los detalles completos del proyecto, contenido del cuerpo, capturas de pantalla, videos, PDFs y demos reproducibles.

### Diseño de Etiqueta

Lista proyectos filtrados por una etiqueta en `/tags/<tag>/`.

### Diseño de Colección

Lista proyectos en una colección. Funciona de manera similar al diseño de etiqueta.

### Diseño Acerca de

La página "Acerca de" en `/about/`. Muestra información del perfil.

### Diseño No Encontrado

La página 404. Se muestra cuando una ruta no coincide.

## Slots

Los slots son puntos de extensibilidad donde los plugins pueden inyectar componentes:

```ts
// En un plugin
export default definePlugin({
  name: 'my-plugin',
  hooks: {
    setup: (ctx) => {
      ctx.registerSlot('header', MyHeaderComponent);
    },
  },
});
```

Los slots integrados típicamente incluyen: `header`, `footer`, `sidebar`, `editor-shell`.

## Comportamiento de Respaldo

Si un tema no proporciona un diseño, mineproj recurre al diseño del tema predeterminado y emite una advertencia. Esto asegura que el sitio siempre se compile, incluso con un tema incompleto.

## Registro de Componentes

El registro de componentes resuelve los componentes en este orden:
1. Componentes del tema
2. Componentes del plugin
3. Sobrescrituras del usuario (el último gana)

Las sobrescrituras de componentes desconocidos generan una advertencia.