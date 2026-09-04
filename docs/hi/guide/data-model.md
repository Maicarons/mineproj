# डेटा मॉडल

mineproj एक सरल, फ़ाइल-आधारित डेटा मॉडल का उपयोग करता है। सभी सामग्री `data/` निर्देशिका में JSON + Markdown फ़ाइलों के रूप में संग्रहीत की जाती है।

## परियोजना

प्रत्येक परियोजना `data/projects/<slug>/index.json` में रहती है:

```json
{
  "slug": "my-project",
  "name": "मेरी परियोजना",
  "tagline": "एक छोटा, प्रभावशाली विवरण",
  "summary": "कार्ड, SEO और फ़ीड के लिए एक लंबा सारांश",
  "tags": ["web", "tool"],
  "status": "released",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" }
  ]
}
```

## प्रोफ़ाइल

`data/profile.json`:

```json
{
  "name": "आपका नाम",
  "bio": "एक छोटी जीवनी",
  "url": "https://example.com"
}
```