#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Tüm tabloları backup al
const TABLES = [
  'profiles',
  'personnel',
  'quality_costs',
  'non_conformities',
  'audit_findings',
  'suppliers',
  'supplier_non_conformities',
  'supplier_audits',
  'equipments',
  'equipment_calibrations',
  'documents',
  'quality_inspections',
  'wps_procedures',
  'audit_log_entries',
  'kaizen_entries',
  'tasks',
  'training_participants'
];

async function backupDatabase() {
  console.log('🔄 Database backup başlıyor...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  // Backup klasörünü oluştur
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
  const backup = {};
  
  try {
    // Her tablo için veri al
    for (const table of TABLES) {
      console.log(`  📊 ${table} backing up...`);
      
      try {
        const { data, error } = await supabase.from(table).select('*');
        
        if (error) {
          console.warn(`  ⚠️  ${table} hatası: ${error.message}`);
          backup[table] = null;
        } else {
          backup[table] = data || [];
          console.log(`  ✓ ${table}: ${data?.length || 0} kayıt`);
        }
      } catch (err) {
        console.warn(`  ❌ ${table} hata: ${err.message}`);
        backup[table] = null;
      }
    }
    
    // Backup dosyasını kaydet
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`\n✅ Backup tamamlandı!`);
    console.log(`📁 Dosya: ${backupFile}`);
    console.log(`📦 Boyut: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Backup hatası:', error.message);
    process.exit(1);
  }
}

backupDatabase();
