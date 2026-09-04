# প্লাগিন লাইফসাইকেল হুক

এই পৃষ্ঠাটি প্রতিটি লাইফসাইকেল হুক বিস্তারিতভাবে বর্ণনা করে।

## `config:resolved` (waterfall)

কনফিগারেশন সম্পূর্ণরূপে রেজলভ হওয়ার পর কল করা হয়। কনফিগ অবজেক্ট গ্রহণ করে এবং এটি পরিবর্তন করতে পারে।

```ts
'config:resolved': async (config) => {
  config.site.title += ' (modified)';
  return config;
}
```

## `data:loaded` (seq)

সমস্ত ডেটা লোড হওয়ার পর কল করা হয়। কিছুই গ্রহণ করে না কিন্তু কনটেক্সটে সম্পূর্ণ ডেটাসেট থাকে।

```ts
'data:loaded': async (_, ctx) => {
  const { dataset } = ctx;
  console.log(`Loaded ${dataset.projects.length} projects`);
}
```

## `data:validated` (seq)

ডেটা ভ্যালিডেশনের পর কল করা হয়। কাস্টম ভ্যালিডেশন লজিকের জন্য এটি ব্যবহার করুন।

```ts
'data:validated': async (_, ctx) => {
  // Custom validation
}
```

## `assets:process` (seq)

অ্যাসেট প্রসেসিংয়ের আগে কল করা হয়। অ্যাসেট পরিবর্তন বা কপি করতে এটি ব্যবহার করুন।

```ts
'assets:process': async (_, ctx) => {
  // Process assets
}
```

## `routes:collect` (waterfall)

রুট সংগ্রহের সময় কল করা হয়। রুট যোগ, অপসারণ বা পরিবর্তন করতে পারে।

```ts
'routes:collect': async (routes) => {
  routes.push({
    path: '/custom/',
    layout: 'detail',
    title: 'Custom Page',
  });
  return routes;
}
```

## `api:endpoints` (waterfall)

API এন্ডপয়েন্ট জেনারেশনের আগে কল করা হয়। কাস্টম এন্ডপয়েন্ট যোগ করতে পারে।

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

প্রতিটি পৃষ্ঠা রেন্ডার হওয়ার আগে কল করা হয়। HTML স্ট্রিং গ্রহণ করে এবং এটি পরিবর্তন করতে পারে। এটি `<head>`-এ বিষয়বস্তু ইনজেক্ট করার প্রাথমিক হুক।

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

ইমিট ফেজের সময় কল করা হয়। আউটপুট ডিরেক্টরিতে অতিরিক্ত ফাইল লিখতে এটি ব্যবহার করুন।

```ts
'emit': async (_, ctx) => {
  await ctx.emit('custom/data.json', JSON.stringify({ key: 'value' }));
}
```

## `build:done` (seq)

বিল্ড সম্পূর্ণ হওয়ার পর কল করা হয়। ক্লিনআপ, নোটিফিকেশন বা রিপোর্টিংয়ের জন্য এটি ব্যবহার করুন।

```ts
'build:done': async () => {
  console.log('Build finished!');
}
```