# Model Data

mineproj menggunakan model data sederhana berbasis file. Semua konten disimpan sebagai file JSON + Markdown di direktori `data/`.

## Proyek

Setiap proyek berada di `data/projects/<slug>/index.json`:

```json
{
  "slug": "my-project",
  "name": "My Project",
  "tagline": "Deskripsi singkat dan menarik",
  "summary": "Ringkasan lebih panjang untuk kartu, SEO, dan feed (disarankan 160+ karakter)",
  "description": "Deskripsi Markdown inline opsional (alternatif untuk bodyFile)",
  "bodyFile": "body.md",
  "cover": "cover.png",
  "icon": "icon.svg",
  "category": "web",
  "tags": ["web", "tool"],
  "status": "released",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z",
  "releasedAt": "2026-02-01T00:00:00.000Z",
  "license": "MIT",
  "role": "Pencipta & Pengembang",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" },
    { "url": "https://my-project.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/my-project", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["Fitur pertama", "Fitur kedua"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Tampilan utama" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "Panduan Pengguna", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/my-project/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Deskripsi SEO kustom",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "Apa ini?", "a": "Sebuah proyek." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Rilis awal" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "My Project (English)",
      "tagline": "English tagline",
      "summary": "English summary",
      "description": "English description"
    }
  }
}
```

## Profil

`data/profile.json`:

```json
{
  "name": "Nama Anda",
  "avatar": "avatar.png",
  "bio": "Bio singkat",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "Kota, Negara",
  "social": {
    "github": "username-github-anda",
    "twitter": "@username-anda"
  }
}
```

## Tag

`data/tags.json` (opsional):

```json
{
  "web": { "label": "Web", "description": "Proyek web" },
  "cli": { "label": "CLI", "description": "Alat baris perintah" }
}
```

## Koleksi

Proyek dapat diorganisasikan ke dalam koleksi. Sebuah koleksi didefinisikan dengan mengelompokkan proyek yang memiliki tag yang sama. Rute `tags/galley/` secara otomatis menampilkan semua proyek dengan tag tertentu.

## Override i18n

Untuk setiap lokal selain default, buat `index.<locale>.json`:

```json
{
  "name": "Nama yang Diterjemahkan",
  "tagline": "Tagline yang diterjemahkan",
  "bodyFile": "body.en.md"
}
```

Atau, definisikan override inline di field `i18n` dari `index.json` utama.