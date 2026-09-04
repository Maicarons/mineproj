# ডেটা মডেল

mineproj একটি সরল, ফাইল-ভিত্তিক ডেটা মডেল ব্যবহার করে। সমস্ত বিষয়বস্তু `data/` ডিরেক্টরিতে JSON + Markdown ফাইল হিসেবে সংরক্ষিত হয়।

## প্রকল্প

প্রতিটি প্রকল্প `data/projects/<slug>/index.json`-এ অবস্থিত:

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

## প্রোফাইল

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

## ট্যাগ

`data/tags.json` (ঐচ্ছিক):

```json
{
  "web": { "label": "Web", "description": "Web projects" },
  "cli": { "label": "CLI", "description": "Command-line tools" }
}
```

## কালেকশন

প্রকল্পগুলোকে কালেকশনে সংগঠিত করা যেতে পারে। একটি কালেকশন একই ট্যাগযুক্ত প্রকল্পগুলোকে গ্রুপ করে সংজ্ঞায়িত করা হয়। `tags/galley/` রুটটি স্বয়ংক্রিয়ভাবে একটি নির্দিষ্ট ট্যাগের সব প্রকল্প তালিকাভুক্ত করে।

## i18n ওভাররাইড

প্রতিটি অতিরিক্ত লোকেলের জন্য, `index.<locale>.json` তৈরি করুন:

```json
{
  "name": "Translated Name",
  "tagline": "Translated tagline",
  "bodyFile": "body.en.md"
}
```

অথবা মূল `index.json`-এর `i18n` ফিল্ডে ইনলাইন ওভাররাইড সংজ্ঞায়িত করুন।