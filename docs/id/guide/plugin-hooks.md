# Hook Siklus Hidup Plugin

Halaman ini mendokumentasikan setiap hook siklus hidup secara detail.

## `config:resolved` (waterfall)

Dipanggil setelah konfigurasi sepenuhnya diselesaikan. Menerima objek konfigurasi dan dapat memodifikasinya.

```ts
'config:resolved': async (config) => {
  config.site.title += ' (dimodifikasi)';
  return config;
}
```

## `data:loaded` (seq)

Dipanggil setelah semua data dimuat. Tidak menerima apa pun tetapi konteks memiliki dataset lengkap.

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Memuat ${dataset.projects.length} proyek`);
}
```

## `data:validated` (seq)

Dipanggil setelah validasi data. Gunakan ini untuk logika validasi kustom.

```ts
'data:validated': async (_, ctx) => {
  // Validasi kustom
}
```

## `assets:process` (seq)

Dipanggil sebelum pemrosesan aset. Gunakan ini untuk memodifikasi atau menyalin aset.

```ts
'assets:process': async (_, ctx) => {
  // Proses aset
}
```

## `routes:collect` (waterfall)

Dipanggil selama pengumpulan rute. Dapat menambah, menghapus, atau memodifikasi rute.

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Halaman Kustom',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

Dipanggil sebelum pembuatan endpoint API. Dapat menambahkan endpoint kustom.

```ts
'api:endpoints': async (endpoints) => {
  endpoints.push({
    path: 'custom.json',
    generate: async (ctx) => ({ data: 'custom' }),
  });
  return endpoints;
}
```

## `render:before` (waterfall)

Dipanggil sebelum setiap halaman di-render. Menerima string HTML dan dapat memodifikasinya. Ini adalah hook utama untuk menyuntikkan konten ke dalam `<head>`.

```ts
'render:before': async (html, ctx) => {
  const { route } = ctx;
  return html.replace(
    '</head>',
    `<meta name="custom" content="${route.slug}">\n</head>`
  );
}
```

## `emit` (seq)

Dipanggil selama fase emisi. Gunakan ini untuk menulis file tambahan ke direktori keluaran.

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

Dipanggil setelah build selesai. Gunakan ini untuk pembersihan, notifikasi, atau pelaporan.

```ts
'build:done': async () => {
  console.log('Build selesai!');
}
```