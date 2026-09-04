# Pengembangan Tema

Tema mineproj adalah paket npm yang mengontrol tampilan dan nuansa situs Anda.

## Kontrak Tema

Tema adalah objek dengan properti berikut:

| Properti | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `name` | `string` | ✅ | Nama tema unik |
| `layouts` | `Record<string, Component>` | ✅ | Layout untuk setiap tipe rute |
| `components` | `Record<string, Component>` | Opsional | Komponen yang dapat digunakan kembali |
| `slots` | `string[]` | Opsional | Titik penyisipan bernama |
| `configSchema` | `ZodSchema` | Opsional | Skema untuk themeConfig |
| `locales` | `Record<string, Record<string, string>>` | Opsional | Kamus terjemahan UI |
| `styles` | `string[]` | Opsional | String CSS yang disisipkan ke setiap halaman head |
| `headScripts` | `string[]` | Opsional | Skrip inline yang disuntikkan ke halaman head |
| `islands` | `Record<string, Component>` | Opsional | Komponen interaktif yang dihidrasi di klien |
| `extends` | `Theme \| string` | Opsional | Tema induk untuk diwarisi |

## Contoh

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

## Menggunakan tema lokal

Buat `.mineproj/theme/index.mts`:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

Kemudian atur `theme: '.mineproj/theme'` di konfigurasi Anda.

## Layout

Tujuh jenis layout yang wajib:

| Layout | Rute | Tujuan |
|---|---|---|
| `home` | `/` | Halaman arahan dengan hero, proyek unggulan, grid |
| `list` | `/projects/` | Grid proyek yang dapat difilter |
| `detail` | `/projects/<slug>/` | Detail proyek dengan sidebar |
| `tag` | `/tags/<name>/` | Proyek yang difilter berdasarkan tag |
| `collection` | `/collections/<slug>/` | Koleksi yang dikurasi |
| `about` | `/about/` | Profil penulis |
| `notFound` | `404.html` | Halaman 404 kustom |

## Islands

Komponen interaktif ditandai sebagai islands:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Daftarkan di tema:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## Pengujian Kontrak

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] jika valid
```

## Publikasi

1. Beri nama paket Anda `mineproj-theme-*` atau `@scope/mineproj-theme-*`
2. Tambahkan `"keywords": ["mineproj-theme"]` ke package.json
3. Jalankan `runThemeContract` untuk memvalidasi
4. Publikasikan ke npm