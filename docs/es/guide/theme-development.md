# Desarrollo de Temas

Los temas de mineproj son paquetes npm que controlan la apariencia de tu sitio.

## Contrato del Tema

Un tema es un objeto con las siguientes propiedades:

| Propiedad | Tipo | Requerido | Descripción |
|---|---|---|---|
| `name` | `string` | ✅ | Nombre único del tema |
| `layouts` | `Record<string, Component>` | ✅ | Diseños para cada tipo de ruta |
| `components` | `Record<string, Component>` | Opcional | Componentes reutilizables |
| `slots` | `string[]` | Opcional | Puntos de inserción nombrados |
| `configSchema` | `ZodSchema` | Opcional | Esquema para themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Opcional | Diccionarios de traducción de la interfaz de usuario |
| `styles` | `string[]` | Opcional | Cadenas CSS insertadas en cada cabecera de página |
| `headScripts` | `string[]` | Opcional | Scripts en línea inyectados en la cabecera de la página |
| `islands` | `Record<string, Component>` | Opcional | Componentes interactivos hidratados en el cliente |
| `extends` | `Theme \| string` | Opcional | Tema padre del que heredar |

## Ejemplo

```ts
import { defineTheme } from '@mineproj/core';

const theme = defineTheme({
  name: 'my-theme',
  layouts: {
    home: ({ data, config }) => (
      <main>
        <h1>{config.title}</h1>
        <ul>
          {data.projects.map(p => <li key={p.slug}>{p.name}</li>)}
        </ul>
      </main>
    ),
  },
  styles: [`:root { --mp-color-accent: #ff5500; }`],
});

export default theme;
```

## Usar un Tema Local

Crea `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Luego establece `theme: '.mineproj/theme'` en tu configuración.

## Diseños

Los siete tipos de diseño requeridos:

| Diseño | Ruta | Propósito |
|---|---|---|
| `home` | `/` | Página de inicio con héroe, proyectos destacados, cuadrícula |
| `list` | `/projects/` | Cuadrícula de proyectos filtrable |
| `detail` | `/projects/<slug>/` | Detalle del proyecto con barra lateral |
| `tag` | `/tags/<name>/` | Proyectos filtrados por etiqueta |
| `collection` | `/collections/<slug>/` | Colección curada |
| `about` | `/about/` | Perfil del autor |
| `notFound` | `404.html` | Página 404 personalizada |

## Islas

Los componentes interactivos se marcan como islas:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Regístrate en el tema:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## Pruebas de Contrato

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] si es válido
```

## Publicación

1. Nombra tu paquete `mineproj-theme-*` o `@scope/mineproj-theme-*`
2. Añade `"keywords": ["mineproj-theme"]` a package.json
3. Ejecuta `runThemeContract` para validar
4. Publica en npm