# Layout Tema & Slot

## Layout

mineproj membutuhkan 7 layout inti. Setiap layout adalah komponen React yang menerima `LayoutProps`.

### Layout Home

Halaman beranda. Menampilkan proyek unggulan, proyek terbaru, dan info profil.

### Layout List

Menampilkan grid proyek yang difilter/diurutkan. Digunakan oleh rute `/projects/`.

### Layout Detail

Halaman proyek individual di `/projects/<slug>/`. Menampilkan detail proyek lengkap, konten tubuh, tangkapan layar, video, PDF, dan demo yang dapat dimainkan.

### Layout Tag

Menampilkan proyek yang difilter berdasarkan tag di `/tags/<tag>/`.

### Layout Collection

Menampilkan proyek dalam sebuah koleksi. Bekerja mirip dengan layout tag.

### Layout About

Halaman tentang di `/about/`. Menampilkan informasi profil.

### Layout Not Found

Halaman 404. Ditampilkan ketika rute tidak ditemukan.

## Slot

Slot adalah titik ekstensibilitas di mana plugin dapat menyuntikkan komponen:

```ts
// Di dalam plugin
export default definePlugin({
  name: 'my-plugin',
  hooks: {
    setup: (ctx) => {
      ctx.registerSlot('header', MyHeaderComponent);
    },
  },
});
```

Slot bawaan biasanya meliputi: `header`, `footer`, `sidebar`, `editor-shell`.

## Perilaku Fallback

Jika tema tidak menyediakan layout, mineproj akan kembali ke layout tema default dan mengeluarkan peringatan. Ini memastikan situs selalu dapat dibangun, bahkan dengan tema yang tidak lengkap.

## Registry Komponen

Registry komponen menyelesaikan komponen dalam urutan berikut:
1. Komponen tema
2. Komponen plugin
3. Override pengguna (yang terakhir menang)

Override komponen yang tidak dikenal akan memicu peringatan.