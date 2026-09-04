# API संदर्भ

mineproj एक पूरी तरह से स्थिर REST-जैसी API `dist/api/v1/` के अंतर्गत जनरेट करता है।

## एंडपॉइंट

| एंडपॉइंट | प्रकार | विवरण |
|---|---|---|
| `/api/v1/projects.json` | ProjectList | पूर्ण परियोजना सूची |
| `/api/v1/projects/<slug>.json` | Project | एकल परियोजना विवरण |
| `/api/v1/tags.json` | TagList | सभी टैग गणनाओं के साथ |
| `/api/v1/stats.json` | Stats | एकत्रित आँकड़े |
| `/api/v1/manifest.json` | Manifest | स्व-वर्णन एंडपॉइंट सूची |

## क्लाइंट SDK

```ts
import { createApiClient } from '@mineproj/client';
const api = createApiClient({ baseUrl: 'https://example.com' });
const projects = await api.getProjects();
```