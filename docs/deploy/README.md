# Deploying a mineproj Site

mineproj builds a fully static site, so it can be deployed to virtually any static hosting provider. Below are step-by-step guides for the most common platforms.

## Table of Contents

- [GitHub Pages](#github-pages)
- [Cloudflare Pages](#cloudflare-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Nginx](#nginx)

---

## GitHub Pages

### Prerequisites
- A GitHub repository with your mineproj project
- GitHub Pages enabled in your repository settings

### Setup

1. **Build the site:**
   ```bash
   pnpm build
   ```

2. **Deploy via GitHub Actions** (recommended):

   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       permissions:
         contents: read
         pages: write
         id-token: write
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
         - uses: pnpm/action-setup@v3
           with:
             version: 10
         - run: pnpm install
         - run: pnpm build
         - uses: actions/configure-pages@v4
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

3. **Configure your site URL** in `mineproj.config.ts`:
   ```ts
   site: {
     title: 'My Site',
     url: 'https://<username>.github.io/<repo>/',
   }
   ```

4. **Push to `main`** — the action will build and deploy automatically.

---

## Cloudflare Pages

### Prerequisites
- A Cloudflare account
- Your project connected via Git

### Setup

1. **In the Cloudflare Dashboard:**
   - Go to **Workers & Pages > Create > Pages > Connect to Git**
   - Select your repository

2. **Build settings:**
   - **Framework preset:** None
   - **Build command:** `pnpm build`
   - **Build output:** `dist`
   - **Root directory:** (leave blank)

3. **Environment variables:**
   - `NODE_VERSION`: `22`

4. **Configure your site URL** in `mineproj.config.ts`:
   ```ts
   site: {
     title: 'My Site',
     url: 'https://<project>.pages.dev/',
   }
   ```

5. **Deploy:** Cloudflare will build and deploy on every push.

---

## Netlify

### Prerequisites
- A Netlify account
- Your project connected via Git

### Setup

1. **In the Netlify Dashboard:**
   - Go to **Add new site > Import an existing project**
   - Connect your Git repository

2. **Build settings:**
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist`
   - **Node version:** 22

3. **Environment variables:**
   - `NODE_OPTIONS`: (leave empty)

4. **Configure your site URL** in `mineproj.config.ts`:
   ```ts
   site: {
     title: 'My Site',
     url: 'https://<site>.netlify.app/',
   }
   ```

5. **Deploy:** Netlify will build and deploy automatically.

### Redirects

Create a `_redirects` file in your `public/` directory:
```
/*    /index.html   200
```

---

## Vercel

### Prerequisites
- A Vercel account
- Your project connected via Git

### Setup

1. **In the Vercel Dashboard:**
   - Go to **Add New > Project**
   - Import your Git repository

2. **Build settings:**
   - **Framework preset:** Other
   - **Build command:** `pnpm build`
   - **Output directory:** `dist`
   - **Install command:** `pnpm install`

3. **Configure your site URL** in `mineproj.config.ts`:
   ```ts
   site: {
     title: 'My Site',
     url: 'https://<project>.vercel.app/',
   }
   ```

4. **Deploy:** Vercel will build and deploy on every push.

---

## Nginx

### Prerequisites
- A server with Nginx installed
- Your built site (`dist/` directory)

### Setup

1. **Build the site:**
   ```bash
   pnpm build
   ```

2. **Copy the `dist/` directory to your server:**
   ```bash
   scp -r dist/ user@server:/var/www/mysite/
   ```

3. **Nginx configuration:**

   Create `/etc/nginx/sites-available/mysite`:
   ```nginx
   server {
       listen 80;
       server_name example.com;
       root /var/www/mysite;
       index index.html;

       # Gzip
       gzip on;
       gzip_types text/plain text/css application/json application/javascript image/svg+xml;

       # Static assets with cache
       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # HTML pages - no cache
       location / {
           try_files $uri $uri/ =404;
           add_header Cache-Control "no-cache";
       }

       # Security headers
       add_header X-Frame-Options "DENY";
       add_header X-Content-Type-Options "nosniff";
       add_header Referrer-Policy "strict-origin-when-cross-origin";
   }
   ```

4. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Post-Deployment Checklist

- [ ] Site loads and is fully navigable
- [ ] All project pages display correctly
- [ ] Search and filtering work
- [ ] i18n language switching works (if configured)
- [ ] `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] `robots.txt` is accessible
- [ ] `llms.txt` is accessible
- [ ] OG images render correctly in social previews
- [ ] Lighthouse audit score ≥ 85
- [ ] Custom domain is configured (if applicable)