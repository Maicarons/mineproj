# CLI রেফারেন্স

`mineproj` CLI আপনার সাইট বিল্ডিং, ডেভেলপমেন্ট এবং ম্যানেজমেন্টের জন্য সমস্ত কমান্ড সরবরাহ করে।

## ব্যবহার

```bash
mineproj <command> [options]
```

## কমান্ড

### `dev`

ডেভেলপমেন্ট সার্ভার শুরু করুন।

```bash
mineproj dev [--port <n>] [--host <host>] [--open] [--editor]
```

### `build`

স্ট্যাটিক সাইট বিল্ড করুন।

```bash
mineproj build [--outDir <dir>]
```

### `preview`

বিল্ড করা সাইট প্রিভিউ করুন।

```bash
mineproj preview [--port <n>] [--host <host>]
```

### `check`

কনফিগ এবং ডেটা ফাইল ভ্যালিডেট করুন।

```bash
mineproj check [--i18n]
```

### `new <slug>`

একটি নতুন প্রকল্প স্কেলিটন তৈরি করুন।

```bash
mineproj new my-project
```

### `audit`

SEO, AI, a11y এবং পারফরম্যান্সের জন্য বিল্ড করা সাইট স্কোর করুন।

```bash
mineproj audit [--fail-under <n>]
```

### `doctor`

এনভায়রনমেন্ট, কনফিগ এবং প্রকল্পের অবস্থা নির্ণয় করুন।

```bash
mineproj doctor
```

### `info`

রেজলভ করা কনফিগ, থিম এবং প্লাগিন ডায়াগনস্টিক দেখান।

```bash
mineproj info
```

### `theme:eject`

কাস্টমাইজেশনের জন্য বর্তমান থিম `.mineproj/theme/`-এ কপি করুন।

```bash
mineproj theme:eject
```

### `i18n:init <locale>`

একটি নতুন লোকেল স্ক্যাফোল্ড করুন।

```bash
mineproj i18n:init en
```

### `i18n:extract`

প্রতি লোকেলে অনূদিত নয় এমন কী এক্সট্র্যাক্ট করুন।

```bash
mineproj i18n:extract
```

### `editor:export`

এডিটর ড্রাফ্ট JSON প্যাচ হিসেবে এক্সপোর্ট করুন।

```bash
mineproj editor:export
```

### `migrate`

স্কিমা সংস্করণ মাইগ্রেশন এবং ব্যাকআপ।

```bash
mineproj migrate
```

## গ্লোবাল অপশন

| অপশন | বর্ণনা |
|--------|-------------|
| `--root <dir>` | সাইট রুট ডিরেক্টরি |
| `--config <path>` | স্পষ্ট কনফিগ ফাইল পাথ |
| `--outDir <dir>` | আউটপুট ডিরেক্টরি ওভাররাইড |
| `--port <n>` | ডেভ/প্রিভিউ সার্ভার পোর্ট |
| `--host <host>` | ডেভ/প্রিভিউ সার্ভার হোস্ট |
| `--open` | শুরু করার পর ব্রাউজার খুলুন |
| `--editor` | ভিজুয়াল এডিটর সক্ষম করুন (শুধুমাত্র ডেভ) |
| `--fail-under <n>` | ন্যূনতম অডিট স্কোর (ডিফল্ট 85) |
| `-h, --help` | সাহায্য দেখান |
| `-v, --version` | সংস্করণ দেখান |