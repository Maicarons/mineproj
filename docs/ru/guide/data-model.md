# Модель данных

mineproj использует простую, файловую модель данных. Весь контент хранится в виде файлов JSON + Markdown в директории `data/`.

## Проект

Каждый проект находится в `data/projects/<slug>/index.json`:

```json
{
  "slug": "my-project",
  "name": "My Project",
  "tagline": "Краткое, ёмкое описание",
  "summary": "Более длинное описание для карточек, SEO и лент (рекомендуется от 160 символов)",
  "description": "Необязательное встроенное Markdown-описание (альтернатива bodyFile)",
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
  "role": "Создатель и разработчик",
  "links": [
    { "url": "https://github.com/me/my-project", "type": "repo" },
    { "url": "https://my-project.example.com", "type": "homepage" },
    { "url": "https://npmjs.com/package/my-project", "type": "npm" }
  ],
  "techStack": ["TypeScript", "React", "Node.js"],
  "platforms": ["web", "linux", "macos", "windows"],
  "languages": ["en", "zh-CN"],
  "highlights": ["Первая возможность", "Вторая возможность"],
  "screenshots": [
    { "src": "screenshot-1.png", "alt": "Главный вид" }
  ],
  "videos": [
    { "src": "demo.mp4", "type": "video/mp4", "poster": "poster.png" }
  ],
  "docs": [
    { "file": "manual.pdf", "title": "Руководство пользователя", "type": "pdf" }
  ],
  "playable": {
    "type": "iframe",
    "entry": "/demos/my-project/",
    "sandbox": "allow-scripts allow-forms"
  },
  "seo": {
    "description": "Пользовательское SEO-описание",
    "ogImage": "og-custom.png",
    "noindex": false
  },
  "faq": [
    { "q": "Что это?", "a": "Проект." }
  ],
  "changelog": [
    { "version": "1.0.0", "date": "2026-02-01", "notes": "Первый выпуск" }
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

## Профиль

`data/profile.json`:

```json
{
  "name": "Ваше имя",
  "avatar": "avatar.png",
  "bio": "Краткая биография",
  "url": "https://example.com",
  "email": "hello@example.com",
  "location": "Город, Страна",
  "social": {
    "github": "ваш-логин-github",
    "twitter": "@ваш-логин"
  }
}
```

## Теги

`data/tags.json` (необязательно):

```json
{
  "web": { "label": "Веб", "description": "Веб-проекты" },
  "cli": { "label": "CLI", "description": "Инструменты командной строки" }
}
```

## Коллекции

Проекты можно организовывать в коллекции. Коллекция определяется путём группировки проектов с одинаковым тегом. Маршрут `tags/galley/` автоматически выводит список всех проектов с заданным тегом.

## Переопределения i18n

Для каждой локали, отличной от локали по умолчанию, создайте `index.<locale>.json`:

```json
{
  "name": "Переведённое название",
  "tagline": "Переведённый слоган",
  "bodyFile": "body.en.md"
}
```

Или определите встроенные переопределения в поле `i18n` основного файла `index.json`.