# प्लगइन डेवलपमेंट

mineproj प्लगइन्स हुक और घटकों के साथ बिल्ड पाइपलाइन को विस्तारित करते हैं।

## प्लगइन अनुबंध

एक प्लगइन एक ऑब्जेक्ट है जिसमें निम्नलिखित होते हैं:

| गुण | प्रकार | आवश्यक | विवरण |
|---|---|---|---|
| `name` | `string` | ✅ | अद्वितीय प्लगइन नाम |
| `hooks` | `Record<string, Function>` | वैकल्पिक | लाइफसाइकिल हुक हैंडलर |
| `vite` | `VitePlugin[]` | वैकल्पिक | इंजेक्ट करने के लिए Vite प्लगइन्स |
| `components` | `Record<string, Component>` | वैकल्पिक | रजिस्टर करने के लिए घटक |
| `optionsSchema` | `ZodSchema` | वैकल्पिक | प्लगइन विकल्पों के लिए स्कीमा |
| `setup` | `Function` | वैकल्पिक | इंस्टॉल-टाइम हुक |

## उदाहरण

```ts
import { definePlugin } from '@mineproj/core';

export default definePlugin({
  name: 'mineproj-plugin-hello',
  hooks: {
    'build:done': () => {
      console.log('बिल्ड पूर्ण!');
    },
  },
});
```

## विकल्पों के साथ प्लगइन

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
      return html.replace('</head>', `${snippet}\n</head>`);
    },
  },
});
```

## अनुबंध परीक्षण

```ts
import { runPluginContract } from '@mineproj/test-utils';
const result = runPluginContract(myPlugin);
console.log(result.errors);
```

## प्रकाशन

1. अपने पैकेज का नाम `mineproj-plugin-*` या `@mineproj/plugin-*` रखें
2. package.json में `"keywords": ["mineproj-plugin"]` जोड़ें
3. मान्य करने के लिए `runPluginContract` चलाएँ
4. npm पर प्रकाशित करें