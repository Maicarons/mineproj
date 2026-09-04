# कॉन्फ़िगरेशन

mineproj को आपके प्रोजेक्ट रूट में `mineproj.config.ts` के माध्यम से कॉन्फ़िगर किया जाता है।

## साइट कॉन्फ़िगरेशन

```ts
import { defineConfig } from 'mineproj';

export default defineConfig({
  site: {
    title: 'मेरा पोर्टफोलियो',
    description: 'मेरे काम की एक प्रस्तुति',
    url: 'https://example.com',
    defaultLocale: 'hi',
    locales: ['hi', 'en'],
    fallbackLocale: 'en',
  },
});
```

## थीम कॉन्फ़िगरेशन

```ts
export default defineConfig({
  theme: 'classic',
  themeConfig: {
    accent: '#2563EB',
    palette: 'neutral',
    colorMode: 'system',
  },
});
```

## प्लगइन कॉन्फ़िगरेशन

```ts
export default defineConfig({
  plugins: [
    '@mineproj/plugin-seo',
    ['@mineproj/plugin-sitemap', { siteUrl: 'https://example.com' }],
  ],
});
```