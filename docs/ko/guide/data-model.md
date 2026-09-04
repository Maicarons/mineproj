# 데이터 모델

mineproj는 간단한 파일 기반 데이터 모델을 사용합니다. 모든 콘텐츠는 `data/` 디렉터리에 JSON + Markdown 파일로 저장됩니다.

## 프로젝트

각 프로젝트는 `data/projects/<slug>/index.json`에 위치합니다:

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

## 프로필

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

## 태그

`data/tags.json` (선택 사항):

```json
{
  "web": { "label": "Web", "description": "Web projects" },
  "cli": { "label": "CLI", "description": "Command-line tools" }
}
```

## 컬렉션

프로젝트는 컬렉션으로 구성할 수 있습니다. 컬렉션은 동일한 태그를 가진 프로젝트를 그룹화하여 정의됩니다. `tags/galley/` 경로는 지정된 태그가 있는 모든 프로젝트를 자동으로 나열합니다.

## i18n 재정의

기본 로케일 외의 각 로케일에 대해 `index.<locale>.json`을 생성하세요:

```json
{
  "name": "Translated Name",
  "tagline": "Translated tagline",
  "bodyFile": "body.en.md"
}
```

또는 기본 `index.json`의 `i18n` 필드에 인라인 재정의를 정의할 수 있습니다.
