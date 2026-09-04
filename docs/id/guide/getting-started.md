# Memulai

Selamat datang di mineproj! Panduan ini akan membantu Anda membuat situs portofolio proyek pertama Anda.

## Prasyarat

- **Node.js** 22 atau lebih baru
- **pnpm** 10 (instal melalui `npm install -g pnpm`)

## Membuat Situs Baru

Cara tercepat untuk memulai adalah dengan alat pembuatan kerangka (scaffolding):

```bash
npx create-mineproj my-portfolio
cd my-portfolio
pnpm dev
```

Buka `http://localhost:5173` di peramban Anda untuk melihat situs Anda.

## Struktur Proyek

```
my-portfolio/
├─ mineproj.config.ts      # Konfigurasi situs
├─ data/
│  ├─ projects/             # Data proyek (JSON + Markdown)
│  │  └─ my-project/
│  │     ├─ index.json      # Metadata proyek
│  │     └─ body.md         # Konten tubuh proyek
│  ├─ profile.json          # Profil Anda
│  └─ tags.json             # Definisi tag
├─ public/                  # Aset statis (gambar, PDF, dll.)
└─ dist/                    # Hasil build (dihasilkan)
```

## Menambahkan Proyek

Buat direktori baru di bawah `data/projects/`:

```bash
mineproj new my-project
```

Ini akan membuat `data/projects/my-project/index.json` dan `data/projects/my-project/body.md`. Edit file JSON untuk mengatur metadata proyek.

## Membangun untuk Produksi

```bash
pnpm build
```

Keluaran akan masuk ke `dist/`. Pratinjau secara lokal:

```bash
pnpm preview
```

## Langkah Berikutnya

- [Panduan Konfigurasi](./configuration) — referensi konfigurasi lengkap
- [Model Data](./data-model) — memahami skema proyek
- [Pengembangan Tema](./theme-development) — kustomisasi tampilan dan nuansa
- [Pengembangan Plugin](./plugin-development) — memperluas fungsionalitas
- [Penyebaran](./deploying) — menyebarkan situs ke produksi