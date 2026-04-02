# 🚀 Kademe Kalite Yönetim Sistemi - Complete Setup & Deployment Guide

## 📋 İçindekiler
1. [Supabase Proje Yapısı](#supabase-proje-yapısı)
2. [Local Development Setup](#local-development-setup)
3. [Database Management](#database-management)
4. [Supabase'den Bu Bilgisayara Veri Taşıma](#supabasedan-bu-bilgisayara-veri-taşıma)
5. [Deployment Seçenekleri](#deployment-seçenekleri)
6. [Production Monitoring](#production-monitoring)

---

## 🔗 Supabase Proje Yapısı

### Mevcut Supabase Hesabı
- **URL:** `https://ryvczrubujzlanvqiqlk.supabase.co`
- **Project ID:** `ryvczrubujzlanvqiqlk`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ`

### Ana Tablolar
```
Database Şeması:
├── users (Supabase Auth)
│   ├── profiles (Kullanıcı profilleri)
│   └── personnel (Personel yönetimi)
├── quality_management
│   ├── quality_costs (Kalitesizlik maliyeti)
│   ├── non_conformities (DÖF/8D)
│   ├── audit_findings (Denetim bulguları)
│   └── riskRecords (Risk yönetimi)
├── supplier_management
│   ├── suppliers
│   ├── supplier_non_conformities
│   ├── supplier_audits
│   └── supplier_scores
├── equipment_management
│   ├── equipments
│   ├── equipment_calibrations
│   └── equipment_assignments
├── document_management
│   ├── documents
│   └── document_revisions
├── production_management
│   ├── quality_inspections
│   └── production_departments
├── wps_management
│   ├── wps_procedures
│   ├── wps_materials
│   └── wps_filler_materials
└── audit_logs
    └── audit_log_entries
```

---

## 🛠️ Local Development Setup

### 1. Environment Variables Ayarla

**`.env.local` oluştur:**
```bash
# Supabase
VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ

# Application
VITE_APP_NAME=Kademe Kalite Yönetim Sistemi
VITE_APP_URL=http://localhost:3000
NODE_ENV=development

# Logging
VITE_LOG_LEVEL=debug
```

### 2. Development Server Başlat
```bash
npm install
npm run dev
```

Açılacak URL: `http://localhost:3000`

---

## 💾 Database Management

### Supabase'den Backup Al
```bash
# Supabase CLI kurulumu (eğer kurulu değilse)
brew install supabase/tap/supabase

# Login
supabase login

# Backup al
supabase db pull

# Bu komutu çalıştırdığında:
# 1. Database schema (`supabase/migrations/` altında)
# 2. Seed data (opsiyonel)
# İndirilecektir
```

### Database Dump Al (SQL)
```bash
# PostgreSQL ile bağlantı stringi
pg_dump --host=db.ryvczrubujzlanvqiqlk.supabase.co \
        --port=5432 \
        --username=postgres \
        --password \
        --database=postgres \
        > backup_$(date +%Y%m%d_%H%M%S).sql

# Parola sorulacak (Supabase database password)
```

---

## 📊 Supabase'den Bu Bilgisayara Veri Taşıma

### Seçenek 1: Supabase CLI ile (Önerilen)

```bash
# 1. Projeye gir
cd "/Users/atakanbattal/Downloads/Kademe Code"

# 2. Supabase CLI kur (ilk kez)
npm install --save-dev supabase@latest

# 3. Supabase'e login
npx supabase login

# 4. Remote database'i pull et
npx supabase db pull

# 5. Local migration'ları uygula
npx supabase migration up
```

### Seçenek 2: SQL Backup ile

```bash
# 1. Supabase'den SQL export al
# Dashboard → Backups → Download

# 2. Local PostgreSQL'ye restore et
psql -U postgres < backup.sql

# 3. Bağlantı stringini güncelle
# env dosyasında database URL'ini güncelle
```

### Seçenek 3: Node Script ile (Tüm Tablolar)

**`scripts/migrate-from-supabase.js` oluştur:**

---

## 🚀 Deployment Seçenekleri

### Seçenek 1: Netlify (En Hızlı) ✅

**Avantajlar:**
- Otomatik HTTPS
- Environment variables kolay yönetimi
- GitHub integration
- Ücretsiz SSL

**Kurulum:**
```bash
# 1. Netlify CLI kur (opsiyonel)
npm i -g netlify-cli

# 2. GitHub repo'ya push et
git remote add origin <github-repo>
git push -u origin main

# 3. Netlify Dashboard'da import et
# https://app.netlify.com → Add new site → Import from GitHub

# 4. Build settings:
# Build command: npm run build
# Publish directory: dist

# 5. Environment variables ekle
# Site settings → Environment variables
VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co
VITE_SUPABASE_ANON_KEY=<key>
VITE_APP_URL=https://kademekalite.online
```

### Seçenek 2: Docker (Self-Hosted)

**`Dockerfile` oluştur:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**`.dockerignore` oluştur:**
```
node_modules
dist
.env
.env.local
.git
```

**Deploy:**
```bash
docker build -t kademe-kalite .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=<url> \
  -e VITE_SUPABASE_ANON_KEY=<key> \
  kademe-kalite
```

---

## 🔐 Supabase Security Best Practices

### 1. Row Level Security (RLS)

```sql
-- Her tablo için RLS aktif et
ALTER TABLE quality_costs ENABLE ROW LEVEL SECURITY;

-- Policy oluştur (Örnek)
CREATE POLICY "Users can read own quality costs"
ON quality_costs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quality costs"
ON quality_costs FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2. API Keys Yönetimi

- **Anon Key:** Frontend'de kullan (Okuma işlemleri)
- **Service Key:** Backend'de kullan (Tüm işlemler)
- **İnsan Tarafından Okunabilir Key:** Hiçbir yerde paylaşma

### 3. Environment Variables Proteksiyonu

```bash
# ASLA public olarak gitme
# .env.local dosyası .gitignore'a ekle
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

---

## 📈 Production Monitoring

### 1. Supabase Monitoring

```bash
# Dashboard'dan monitoring
# https://app.supabase.com/project/ryvczrubujzlanvqiqlk/monitoring

# Kontrol edilecek metrikler:
# - Database size
# - API call rate
# - Auth sessions
# - Real-time connections
```

### 2. Application Monitoring

**Sentry kurulumu (hata takibi):**
```bash
npm install @sentry/react @sentry/tracing
```

**src/main.jsx'de initialize et:**
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Replay(),
  ],
});
```

### 3. Log Monitoring

```bash
# Netlify logs
netlify logs

# Netlify logs
netlify functions:log
```

---

## ✅ Deployment Checklist

- [ ] Supabase CLI kurulu ve login yapılı
- [ ] Environment variables (.env.local) ayarlanmış
- [ ] Database migrations çalıştırılmış
- [ ] Local development test edilmiş
- [ ] Production build başarılı (`npm run build`)
- [ ] GitHub repo'ya push yapılmış
- [ ] Deployment platform seçilmiş (Netlify/Docker)
- [ ] Domain DNS ayarlanmış (kademekalite.online)
- [ ] SSL sertifikası aktif
- [ ] Supabase RLS policies konfigüre edilmiş
- [ ] Environment variables production'da eklenmiş
- [ ] Monitoring tools kurulmuş
- [ ] Backup stratejisi oluşturulmuş

---

## 🆘 Troubleshooting

### "Cannot find module 'supabase'"
```bash
npm install @supabase/supabase-js
```

### Database bağlantı hatası
```bash
# Connection string kontrol et
VITE_SUPABASE_URL=https://ryvczrubujzlanvqiqlk.supabase.co

# Credentials kontrol et
# Supabase Dashboard → Settings → API
```

### Build hatası
```bash
npm run build -- --force
```

### Port 3000 zaten kullanımda
```bash
npm run dev -- --port 3001
```

---

## 📞 Destek Kaynakları

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.io
- **GitHub Issues:** https://github.com/supabase/supabase/issues

---

**Son güncelleme:** 2024
**Versiyon:** 1.0
