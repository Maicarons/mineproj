# نموذج البيانات

يستخدم mineproj نموذج بيانات بسيط قائم على الملفات. يتم تخزين جميع المحتويات كملفات JSON + Markdown في دليل `data/`.

## المشروع

كل مشروع موجود في `data/projects/<slug>/index.json`:

```json
{
  "slug": "my-project",
  "name": "My Project",
  "tagline": "A short, punchy description",
  "summary": "A longer summary for cards, SEO, and feeds (160+ chars recommended)",
  "description": "Optional inline Markdown description (alternative to bodyFile)",
  "bodyFile": "body.md",
  "cover": "cover.png",
  "icon": "icon.svg",
  "category": "web",
  "tags": ["web", "tool"],
  "status": "released",
  "createdAt": "2026-01-15T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z",
  "releasedAt": "2026-02-01T00:00:00.000Z",
  "license": "MIT",
  "role": "Creator & Developer",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" },
    { "url": "https://my-project.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/my-project", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["First feature", "Second feature"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Main view" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "User Manual", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/my-project/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Custom SEO description",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "What is this?", "a": "A project." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Initial release" }
  ],
  "featured": true,
  "weight": 10,
  "hidden": false,
  "accentColor": "#ff6600",
  "i18n": {
    "en": {
      "name": "My Project (English)",
      "tagline": "English tagline",
      "summary": "English summary",
      "description": "English description"
    }
  }
}
```

## الملف الشخصي

`data/profile.json`:

```json
{
  "name": "Your Name",
  "avatar": "avatar.png",
  "bio": "A short bio",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "City, Country",
  "social": {
    "github": "your-github-handle",
    "twitter": "@your-handle"
  }
}
```

## الوسوم

`data/tags.json` (اختياري):

```json
{
  "web": { "label": "Web", "description": "Web projects" },
  "cli": { "label": "CLI", "description": "Command-line tools" }
}
```

## المجموعات

يمكن تنظيم المشاريع في مجموعات. يتم تعريف المجموعة عن طريق تجميع المشاريع التي تحمل نفس الوسم. يقوم مسار `tags/galley/` تلقائيًا بإدراج جميع المشاريع التي تحمل وسمًا معينًا.

## تجاوزات i18n

لكل لغة غير اللغة الافتراضية، أنشئ ملف `index.<locale>.json`:

```json
{
  "name": "Translated Name",
  "tagline": "Translated tagline",
  "bodyFile": "body.en.md"
}
```

أو قم بتعريف تجاوزات مضمنة في حقل `i18n` في ملف `index.json` الرئيسي.