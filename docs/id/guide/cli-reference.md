# Referensi CLI

CLI `mineproj` menyediakan semua perintah untuk membangun, mengembangkan, dan mengelola situs Anda.

## Penggunaan

```bash
mineproj <command> [options]
```

## Perintah

### `dev`

Memulai server pengembangan.

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

Membangun situs statis.

```bash
mineproj build [--outDir <dir>]
```

### `preview`

Pratinjau situs yang telah dibangun.

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

Memvalidasi file konfigurasi dan data.

```bash
mineproj check [--i18n]
```

### `new <slug>`

Membuat kerangka proyek baru.

```bash
mineproj new my-project
```

### `audit`

Memberi skor situs yang dibangun pada SEO, AI, a11y, dan kinerja.

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

Mendiagnosis lingkungan, konfigurasi, dan status proyek.

```bash
mineproj doctor
```

### `info`

Menampilkan diagnostik konfigurasi, tema, dan plugin yang telah diselesaikan.

```bash
mineproj info
```

### `theme:eject`

Menyalin tema saat ini ke `.mineproj/theme/` untuk kustomisasi.

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

Membuat kerangka lokal baru.

```bash
mineproj i18n:init en
```

### `i18n:extract`

Mengekstrak kunci yang belum diterjemahkan per lokal.

```bash
mineproj i18n:extract
```

### `editor:export`

Mengekspor draf editor sebagai patch JSON.

```bash
mineproj editor:export
```

### `migrate`

Migrasi versi skema dan pencadangan.

```bash
mineproj migrate
```

## Opsi Global

| Opsi | Deskripsi |
|------|-----------|
| `--root <dir>` | Direktori root situs |
| `--config <path>` | Jalur file konfigurasi eksplisit |
| `--outDir <dir>` | Menimpa direktori keluaran |
| `--port <n>` | Port server dev/pratinjau |
| `--host <host>` | Host server dev/pratinjau |
| `--open` | Buka peramban setelah memulai |
| `--editor` | Aktifkan editor visual (hanya dev) |
| `--fail-under <n>` | Skor audit minimum (default 85) |
| `-h, --help` | Tampilkan bantuan |
| `-v, --version` | Tampilkan versi |