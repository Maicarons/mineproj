# थीम डेवलपमेंट

mineproj थीम npm पैकेज हैं जो आपकी साइट के लुक और फील को नियंत्रित करते हैं।

## थीम अनुबंध

एक थीम एक ऑब्जेक्ट है जिसमें निम्नलिखित गुण होते हैं:

| गुण | प्रकार | आवश्यक | विवरण |
|---|---|---|---|
| `name` | `string` | ✅ | अद्वितीय थीम नाम |
| `layouts` | `Record<string, Component>` | ✅ | प्रत्येक रूट प्रकार के लिए लेआउट |
| `components` | `Record<string, Component>` | वैकल्पिक | पुन: प्रयोज्य घटक |
| `slots` | `string[]` | वैकल्पिक | नामांकित सम्मिलन बिंदु |
| `configSchema` | `ZodSchema` | वैकल्पिक | themeConfig के लिए स्कीमा |
| `locales` | `Record<string, Record<string, string>>` | वैकल्पिक | UI अनुवाद शब्दकोश |
| `styles` | `string[]` | वैकल्पिक | CSS स्ट्रिंग्स प्रत्येक पृष्ठ के head में इनलाइन की जाती हैं |
| `headScripts` | `string[]` | वैकल्पिक | पृष्ठ head में इंजेक्ट की जाने वाली इनलाइन स्क्रिप्ट्स |
| `islands` | `Record<string, Component>` | वैकल्पिक | क्लाइंट पर हाइड्रेटेड इंटरैक्टिव घटक |
| `extends` | `Theme \| string` | वैकल्पिक | मूल थीम जिससे इनहेरिट करना है |

## उदाहरण

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

## अनुबंध परीक्षण

```ts
import { runThemeContract } from '@mineproj/test-utils';
const result = runThemeContract(myTheme, { requireAllLayouts: true });
console.log(result.errors);
```

## प्रकाशन

1. अपने पैकेज का नाम `mineproj-theme-*` या `@scope/mineproj-theme-*` रखें
2. package.json में `"keywords": ["mineproj-theme"]` जोड़ें
3. मान्य करने के लिए `runThemeContract` चलाएँ
4. npm पर प्रकाशित करें