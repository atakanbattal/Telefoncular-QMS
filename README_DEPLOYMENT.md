# 🚀 Kademe Kalite Yönetim Sistemi - Deployment Guide

## 📝 Quick Start

### Development Ortamında Başlat
```bash
# 1. Projeye gir
cd "/Users/atakanbattal/Downloads/Kademe Code"

# 2. Dependencies kur
npm install

# 3. Dev server başlat
npm run dev

# 4. Tarayıcıda açıl
http://localhost:3000
```

---

## 🔑 Environment Setup

### `.env.local` Dosyası Oluştur

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ

# Application Configuration
VITE_APP_NAME=Kademe Kalite Yönetim Sistemi
VITE_APP_URL=http://localhost:3000
NODE_ENV=development

# Logging
VITE_LOG_LEVEL=debug
```

> ⚠️ **Önemli:** `.env.local` dosyası ASLA Git'e commit edilmemelidir!

---

## 📊 Database Backup & Migration

### Supabase'den Veri Al

```bash
# Tüm tabloları backup et
npm run db:backup

# Veya interactive migration tool
npm run db:migrate
```

**Output örneği:**
```
🚀 Supabase Migration Tool
══════════════════════════════════════════════

📋 Mevcut Seçenekler:
  1. Tüm verileri backup et (JSON)
  2. Backup dosyasından restore et
  3. Belirli tabloyu backup et
  4. İstatistikleri göster

👉 Seçim yapınız (1-4): 1
```

---

## 🚀 Deployment Options

### Option 1: Netlify (Recommended) ⭐

**Avantajlar:**
- ✅ Otomatik HTTPS & CDN
- ✅ Environment variables UI
- ✅ Preview deployments
- ✅ Git integration
- ✅ Ücretsiz SSL

**Kurulum:**

1. **Netlify Hesabı Oluştur**
   - https://app.netlify.com/signup

2. **GitHub'a Push Et**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/kademe-kalite.git
   git push -u origin main
   ```

3. **Netlify Dashboard'da Import Et**
   - https://app.netlify.com → Add new site → Import from GitHub
   - GitHub repo seç
   - Import et

4. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18.x`

5. **Environment Variables Ekle**
   - Site settings → Environment variables
   ```
   VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-key>
   VITE_APP_URL=https://kademekalite.online
   ```

6. **Custom Domain Ekle**
   - Domain management → Add custom domain
   - `kademekalite.online` ekle
   - DNS kayıtlarını güncelle

**Netlify CLI ile Deploy:**
```bash
# CLI kur
npm i -g netlify-cli

# Deploy et
netlify deploy --prod

# Logs görmek için
netlify logs
```

---

### Option 2: Docker & Self-Hosted

**Gereklilik:**
- Docker installed
- Linux/Mac/Windows server

**Build & Run:**
```bash
# Build image
docker build -t kademe-kalite:latest .

# Run container
docker run -d \
  --name kademe-kalite \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=<key> \
  kademe-kalite:latest

# Container logs
docker logs -f kademe-kalite

# Stop container
docker stop kademe-kalite

# Remove container
docker rm kademe-kalite
```

**Docker Compose ile (Recommended):**

`docker-compose.yml` oluştur:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_SUPABASE_URL: https://ryvczrubujzlanvqiqlk.supabase.co
      VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      VITE_APP_URL: https://kademekalite.online
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run:
```bash
docker-compose up -d
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Repository'ye GitHub Actions workflow otomatik olarak kurulmuştur.

**Trigger Events:**
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Build & test only

**Gerekli Secrets (GitHub Settings → Secrets):**

```
# Netlify
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Docker Hub
DOCKER_USERNAME
DOCKER_PASSWORD

# Slack (optional)
SLACK_WEBHOOK
```

**Workflow Adımları:**
1. ✅ Code checkout
2. ✅ Dependencies install
3. ✅ Lint & format check
4. ✅ Build & test
5. ✅ Deploy to Netlify/Docker
6. ✅ Slack notification

---

## 📈 Production Monitoring

### Supabase Dashboard
```
https://app.supabase.com/project/ryvczrubujzlanvqiqlk
```

**Kontrol Edilecek Metrikler:**
- Database size & usage
- API call rate & latency
- Auth sessions
- Real-time connections
- Error rates

### Application Monitoring (Optional)

**Sentry Setup:**
```bash
npm install @sentry/react @sentry/tracing
```

`src/main.jsx`'de:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logs

**Netlify:**
```bash
netlify logs
```

**Netlify:**
```bash
netlify functions:log
```

**Docker:**
```bash
docker logs kademe-kalite -f
```

---

## 🔐 Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] Row Level Security (RLS) enabled in Supabase
- [ ] Sensitive data not logged
- [ ] API keys rotated regularly
- [ ] Backup strategy implemented
- [ ] Error monitoring enabled
- [ ] Security headers configured

---

## 📱 Domain Configuration

### DNS Setup (kademekalite.online)

**For Netlify:**
```
CNAME: cname.netlify-dns.com
```

**For Netlify:**
```
CNAME: random.netlify.com
```

**For Custom Server:**
```
A record: 1.2.3.4 (your server IP)
```

### SSL Certificate

- ✅ Netlify: Otomatik
- ✅ Netlify: Otomatik
- 🔧 Self-hosted: Let's Encrypt
  ```bash
  certbot certonly --standalone -d kademekalite.online
  ```

---

## 🆘 Troubleshooting

### Build Hatası

```bash
# Cache temizle
npm cache clean --force

# node_modules sil
rm -rf node_modules package-lock.json

# Yeniden kur
npm install

# Build
npm run build
```

### Supabase Connection Error

```bash
# Credentials kontrol et
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
     https://ryvczrubujzlanvqiqlk.supabase.co/rest/v1/
```

### Port Already in Use

```bash
# PID bul
lsof -i :3000

# Kill process
kill -9 <PID>

# Veya farklı port kullan
npm run dev -- --port 3001
```

### Environment Variables Not Loading

1. `.env.local` dosyasının adını kontrol et (exact match)
2. File encoding UTF-8 olmalı
3. Dev server'ı restart et
4. Browser cache temizle

---

## 📞 Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Netlify Docs:** https://netlify.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

---

## 📋 Deployment Checklist

### Before Deployment
- [ ] All code committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] Build test passed locally (`npm run build`)
- [ ] No console errors
- [ ] All environment variables documented

### Netlify Deployment
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Build settings correct
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Docker Deployment
- [ ] Docker image builds successfully
- [ ] Container runs and responds to health checks
- [ ] Port mapping correct
- [ ] Environment variables passed
- [ ] Logging configured

### Post-Deployment
- [ ] Application accessible at domain
- [ ] Login functionality working
- [ ] Database connections active
- [ ] Monitoring dashboard setup
- [ ] Backup strategy documented

---

## 🎯 Next Steps

1. **GitHub Repository Oluştur**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Deployment Platform Seç**
   - Netlify → Hızlı & kolay
   - Netlify → Kullanıcı dostu
   - Docker → Tam kontrol

3. **Domain Bağla**
   - DNS settings güncelle
   - SSL aktif et

4. **Monitoring Kur**
   - Error tracking
   - Performance monitoring
   - Backup schedule

---

**Son Güncelleme:** `October 2024`
**Versiyon:** `2.0`
**Status:** ✅ Production Ready
