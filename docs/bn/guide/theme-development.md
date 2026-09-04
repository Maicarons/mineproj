# থিম ডেভেলপমেন্ট

mineproj থিম হল npm প্যাকেজ যা আপনার সাইটের চেহারা এবং অনুভূতি নিয়ন্ত্রণ করে।

## থিম কন্ট্র্যাক্ট

একটি থিম হল একটি অবজেক্ট যার নিম্নলিখিত প্রপার্টি রয়েছে:

| প্রপার্টি | টাইপ | প্রয়োজনীয় | বর্ণনা |
|---|---|---|---|
| `name` | `string` | ✅ | অনন্য থিমের নাম |
| `layouts` | `Record<string, Component>` | ✅ | প্রতিটি রুট টাইপের জন্য লেআউট |
| `components` | `Record<string, Component>` | ঐচ্ছিক | পুনঃব্যবহারযোগ্য কম্পোনেন্ট |
| `slots` | `string[]` | ঐচ্ছিক | নামযুক্ত ইনসার্শন পয়েন্ট |
| `configSchema` | `ZodSchema` | ঐচ্ছিক | themeConfig-এর জন্য স্কিমা |
| `locales` | `Record<string, Record<string, string>>` | ঐচ্ছিক | UI অনুবাদ অভিধান |
| `styles` | `string[]` | ঐচ্ছিক | CSS স্ট্রিং যা প্রতিটি পৃষ্ঠার head-এ ইনলাইন করা হয় |
| `headScripts` | `string[]` | ঐচ্ছিক | ইনলাইন স্ক্রিপ্ট যা পৃষ্ঠার head-ে ইনজেক্ট করা হয় |
| `islands` | `Record<string, Component>` | ঐচ্ছিক | ইন্টারেক্টিভ কম্পোনেন্ট যা ক্লায়েন্টে হাইড্রেটেড হয় |
| `extends` | `Theme \| string` | ঐচ্ছিক | প্যারেন্ট থিম যা থেকে উত্তরাধিকার সূত্রে পাওয়া যায় |

## উদাহরণ

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

## লোকাল থিম ব্যবহার করা

`.mineproj/theme/index.mts` তৈরি করুন:

```ts
import { defineTheme } from '@mineproj/core';
export default defineTheme({ ... });
```

তারপর আপনার কনফিগে `theme: '.mineproj/theme'` সেট করুন।

## লেআউট

সাতটি প্রয়োজনীয় লেআউট টাইপ:

| লেআউট | রুট | উদ্দেশ্য |
|---|---|---|
| `home` | `/` | হিরো, ফিচার্ড প্রকল্প, গ্রিড সহ ল্যান্ডিং পৃষ্ঠা |
| `list` | `/projects/` | ফিল্টারযোগ্য প্রকল্প গ্রিড |
| `detail` | `/projects/<slug>/` | সাইডবার সহ প্রকল্পের বিস্তারিত |
| `tag` | `/tags/<name>/` | ট্যাগ অনুসারে ফিল্টার করা প্রকল্প |
| `collection` | `/collections/<slug>/` | কিউরেটেড কালেকশন |
| `about` | `/about/` | লেখকের প্রোফাইল |
| `notFound` | `404.html` | কাস্টম 404 পৃষ্ঠা |

## আইল্যান্ডস

ইন্টারেক্টিভ কম্পোনেন্টগুলো আইল্যান্ড হিসেবে চিহ্নিত করা হয়:

```tsx
export function MyCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

থিমে রেজিস্টার করুন:

```ts
const theme = defineTheme({
  name: 'my-theme',
  layouts: { ... },
  islands: { 'my-counter': MyCounter },
  islandsImport: 'my-theme/islands',
});
```

## কন্ট্র্যাক্ট টেস্টিং

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors); // [] if valid
```

## প্রকাশনা

1. আপনার প্যাকেজের নাম `mineproj-theme-*` বা `@scope/mineproj-theme-*` দিন
2. package.json-এ `"keywords": ["mineproj-theme"]` যোগ করুন
3. বৈধতা যাচাই করতে `runThemeContract` চালান
4. npm-এ প্রকাশ করুন