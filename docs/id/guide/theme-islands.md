# Islands Tema

Islands adalah komponen React interaktif yang di-render sebelumnya di server dan dihidrasi di klien. Arsitektur ini memberi Anda interaktivitas yang kaya tanpa mengirimkan bundel JavaScript lengkap ke setiap halaman.

## Bagaimana Islands Bekerja

1. **Waktu build**: Tema me-render islands sebagai HTML dengan props yang diserialisasi
2. **Waktu bundel**: Proses Vite terpisah membundel hanya kode island ke dalam `@mp/islands.js`
3. **Waktu proses**: Klien memuat `@mp/islands.js` dan menghidrasi setiap island melalui atribut `data-mp-island`

## Mendeklarasikan Islands

Dalam definisi tema Anda:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## Komponen Island

Komponen island didaftarkan di registry island tema:

```tsx
// src/islands.tsx
import { ThemeToggle } from './components/ThemeToggle';
import { SearchPalette } from './components/SearchPalette';
import { LibraryExplorer } from './components/LibraryExplorer';

export default {
  'theme-toggle': ThemeToggle,
  'search-palette': SearchPalette,
  'library-explorer': LibraryExplorer,
};
```

## Render Server

Selama SSR, islands di-render sebagai:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- HTML yang di-render server -->
  <button>Toggle theme</button>
</div>
```

## Hidrasi Klien

Runtime islands (`@mineproj/client`) menemukan semua elemen `[data-mp-island]` dan menghidrasinya:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## Pemuatan Bersyarat

Islands hanya dimuat di halaman yang menggunakannya. Pipeline memeriksa islands mana yang ada di setiap halaman dan hanya menyertakan bundel saat diperlukan.

## Fallback Tanpa-JS

Halaman tanpa islands tidak memuat bundel island sama sekali. Ini berarti halaman konten statis memiliki nol JavaScript.