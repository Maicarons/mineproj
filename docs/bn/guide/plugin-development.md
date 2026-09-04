# প্লাগিন ডেভেলপমেন্ট

mineproj প্লাগিনগুলি হুক এবং কম্পোনেন্টের মাধ্যমে বিল্ড পাইপলাইনকে বাড়িয়ে দেয়।

## প্লাগিন কন্ট্র্যাক্ট

একটি প্লাগিন হল একটি অবজেক্ট যার সাথে:

| প্রপার্টি | টাইপ | প্রয়োজনীয় | বর্ণনা |
|---|---|---|---|
| `name` | `string` | ✅ | অনন্য প্লাগিনের নাম |
| `hooks` | `Record<string, Function>` | ঐচ্ছিক | লাইফসাইকেল হুক হ্যান্ডলার |
| `vite` | `VitePlugin[]` | ঐচ্ছিক | ইনজেক্ট করার জন্য Vite প্লাগিন |
| `components` | `Record<string, Component>` | ঐচ্ছিক | রেজিস্টার করার জন্য কম্পোনেন্ট |
| `optionsSchema` | `ZodSchema` | ঐচ্ছিক | প্লাগিন অপশনের জন্য স্কিমা |
| `setup` | `Function` | ঐচ্ছিক | ইনস্টল-টাইম হুক |

## উদাহরণ

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('Build complete!');
    },
  },
});
```

## লাইফসাইকেল হুক

| হুক | টাইপ | সিগনেচার | কখন কল করা হয় |
|---|---|---|---|
| `config:resolved` | waterfall | `(config, ctx) => config` | কনফিগ লোড হওয়ার পর |
| `data:loaded` | seq | `(_, ctx) => void` | ডেটাসেট লোড হওয়ার পর |
| `data:validated` | seq | `(_, ctx) => void` | ডেটা ভ্যালিডেশনের পর |
| `routes:collect` | waterfall | `(routes, ctx) => routes` | রুট সংগ্রহ করার পর |
| `api:endpoints` | waterfall | `(endpoints, ctx) => endpoints` | API নির্গমনের আগে |
| `render:before` | waterfall | `(html, ctx) => html` | প্রতিটি পৃষ্ঠা রেন্ডারের আগে |
| `emit` | seq | `(_, ctx) => void` | সব ফাইল লেখার পর |
| `build:done` | seq | `(_, ctx) => void` | বিল্ড সম্পূর্ণ হওয়ার পর |

## অপশন সহ প্লাগিন

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
      // Inject analytics snippet before </head>
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## প্লাগিন ব্যবহার করা

```ts
// mineproj.config.ts
import { defineSeoPlugin } from '@mineproj/plugin-seo';

export default defineConfig({
  plugins: [
    defineSeoPlugin({ siteUrl: 'https://example.com', siteTitle: 'My Site' }),
  ],
});
```

## কন্ট্র্যাক্ট টেস্টিং

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors); // [] if valid
```

## প্রকাশনা

1. আপনার প্যাকেজের নাম `mineproj-plugin-*` বা `@mineproj/plugin-*` দিন
2. package.json-এ `"keywords": ["mineproj-plugin"]` যোগ করুন
3. বৈধতা যাচাই করতে `runPluginContract` চালান
4. npm-এ প্রকাশ করুন