# Pengembangan Plugin

Plugin mineproj memperluas pipeline build dengan hooks dan komponen.

## Kontrak Plugin

Plugin adalah objek dengan:

| Properti | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `name` | `string` | ✅ | Nama plugin unik |
| `hooks` | `Record<string, Function>` | Opsional | Handler hook siklus hidup |
| `vite` | `VitePlugin[]` | Opsional | Plugin Vite untuk disuntikkan |
| `components` | `Record<string, Component>` | Opsional | Komponen untuk didaftarkan |
| `optionsSchema` | `ZodSchema` | Opsional | Skema untuk opsi plugin |
| `setup` | `Function` | Opsional | Hook waktu instalasi |

## Contoh

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Build selesai!');
    },
  },
});
```

## Hook Siklus Hidup

| Hook | Tipe | Signature | Dipanggil Ketika |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | Setelah konfigurasi dimuat |
| `data:loaded` | seq | `(_, ctx) => void` | Setelah dataset dimuat |
| `data:validated` | seq | `(_, ctx) => void` | Setelah validasi data |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | Setelah rute dikumpulkan |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | Sebelum emisi API |
| `render:before` | waterfall | `(html, ctx) => html` | Sebelum setiap render halaman |
| `emit` | seq | `(_, ctx) => void` | Setelah semua file ditulis |
| `build:done` | seq | `(_, ctx) => void` | Setelah build selesai |

## Plugin dengan Opsi

```ts
import { z } from 'zod';
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: '@mineproj/plugin-analytics',
  optionsSchema: z.object({
    provider: z.enum(['umami', 'plausible', 'ga']),
    id: z.string(),
  }),
  hooks: {
    'render:before': (html, ctx) => {
      // Menyuntikkan cuplikan analytics sebelum </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## Menggunakan Plugin

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## Pengujian Kontrak

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] jika valid
```

## Publikasi

1. Beri nama paket Anda `mineproj-plugin-*` atau `@mineproj/plugin-*`
2. Tambahkan `"keywords": ["mineproj-plugin"]` ke package.json
3. Jalankan `runPluginContract` untuk memvalidasi
4. Publikasikan ke npm