# থিম আইল্যান্ডস

আইল্যান্ডস হল ইন্টারেক্টিভ React কম্পোনেন্ট যা সার্ভারে প্রি-রেন্ডার করা হয় এবং ক্লায়েন্টে হাইড্রেটেড হয়। এই আর্কিটেকচার আপনাকে প্রতিটি পৃষ্ঠায় একটি সম্পূর্ণ JavaScript বান্ডেল না পাঠিয়েই সমৃদ্ধ ইন্টারঅ্যাকটিভিটি দেয়।

## আইল্যান্ডস কীভাবে কাজ করে

1. **বিল্ড টাইম**: থিম আইল্যান্ডগুলোকে সিরিয়ালাইজড প্রপস সহ HTML হিসেবে রেন্ডার করে
2. **বান্ডেল টাইম**: একটি পৃথক Vite প্রক্রিয়া শুধুমাত্র আইল্যান্ড কোডকে `@mp/islands.js`-এ বান্ডেল করে
3. **রানটাইম**: ক্লায়েন্ট `@mp/islands.js` লোড করে এবং তার `data-mp-island` অ্যাট্রিবিউটের মাধ্যমে প্রতিটি আইল্যান্ড হাইড্রেট করে

## আইল্যান্ড ডিক্লেয়ার করা

আপনার থিম সংজ্ঞায়:

```ts
export default defineTheme({
  name: '@mineproj/my-theme',
  islands: ['theme-toggle', 'search-palette', 'library-explorer'],
});
```

## আইল্যান্ড কম্পোনেন্ট

আইল্যান্ড কম্পোনেন্ট থিমের আইল্যান্ড রেজিস্ট্রিতে নিবন্ধিত হয়:

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

## সার্ভার রেন্ডারিং

SSR-এর সময়, আইল্যান্ডগুলো এইভাবে রেন্ডার করা হয়:

```html
<div data-mp-island="theme-toggle" data-mp-props='{"initial":"light"}'>
  <!-- Server-rendered HTML -->
  <button>Toggle theme</button>
</div>
```

## ক্লায়েন্ট হাইড্রেশন

আইল্যান্ড রানটাইম (`@mineproj/client`) সব `[data-mp-island]` এলিমেন্ট খুঁজে বের করে এবং সেগুলো হাইড্রেট করে:

```ts
import { mountIslands } from '@mineproj/client';
mountIslands(islandRegistry);
```

## শর্তসাপেক্ষ লোডিং

আইল্যান্ডগুলো শুধুমাত্র সেই পৃষ্ঠাগুলিতে লোড হয় যেগুলো সেগুলো ব্যবহার করে। পাইপলাইন চেক করে কোন আইল্যান্ড প্রতিটি পৃষ্ঠায় উপস্থিত আছে এবং প্রয়োজন হলেই বান্ডেল অন্তর্ভুক্ত করে।

## নো-JS ফলব্যাক

যেসব পৃষ্ঠায় কোনো আইল্যান্ড নেই সেগুলো আইল্যান্ড বান্ডেল মোটেই লোড করে না। এর মানে স্ট্যাটিক কন্টেন্ট পৃষ্ঠাগুলিতে শূন্য JavaScript থাকে।