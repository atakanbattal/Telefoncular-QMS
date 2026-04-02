#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ';

const supabase = createClient(supabaseUrl, supabaseKey);

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function migrateData() {
  const rl = createInterface();
  
  console.log('\n🚀 Supabase Migration Tool');
  console.log('═'.repeat(50));
  
  try {
    // Seçenekler
    console.log('\n📋 Mevcut Seçenekler:');
    console.log('  1. Tüm verileri backup et (JSON)');
    console.log('  2. Backup dosyasından restore et');
    console.log('  3. Belirli tabloyu backup et');
    console.log('  4. İstatistikleri göster');
    
    const choice = await question(rl, '\n👉 Seçim yapınız (1-4): ');
    
    switch(choice) {
      case '1':
        await backupAllData();
        break;
      case '2':
        await restoreFromBackup();
        break;
      case '3':
        const tableName = await question(rl, 'Tablo adı: ');
        await backupSpecificTable(tableName);
        break;
      case '4':
        await showStatistics();
        break;
      default:
        console.log('❌ Geçersiz seçim');
    }
    
  } finally {
    rl.close();
  }
}

async function backupAllData() {
  console.log('\n🔄 Tüm veriler backup ediliyor...\n');
  
  const TABLES = [
    'profiles', 'personnel', 'quality_costs', 'non_conformities',
    'audit_findings', 'suppliers', 'supplier_non_conformities',
    'supplier_audits', 'equipments', 'equipment_calibrations',
    'documents', 'quality_inspections', 'wps_procedures',
    'audit_log_entries', 'kaizen_entries', 'tasks', 'training_participants'
  ];
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupFile = path.join(backupDir, `migration_${timestamp}.json`);
  const backup = {
    timestamp: new Date().toISOString(),
    supabaseUrl,
    tables: {}
  };
  
  let totalRecords = 0;
  
  for (const table of TABLES) {
    try {
      process.stdout.write(`  📊 ${table}...`);
      
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.log(` ⚠️  (Hata: ${error.message})`);
        backup.tables[table] = { records: 0, error: error.message };
      } else {
        const count = data?.length || 0;
        totalRecords += count;
        backup.tables[table] = {
          records: count,
          data: data || []
        };
        console.log(` ✓ (${count} kayıt)`);
      }
    } catch (err) {
      console.log(` ❌ (${err.message})`);
      backup.tables[table] = { records: 0, error: err.message };
    }
  }
  
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  
  console.log(`\n✅ Migration tamamlandı!`);
  console.log(`📁 Dosya: ${backupFile}`);
  console.log(`📦 Toplam Kayıt: ${totalRecords}`);
  console.log(`💾 Dosya Boyutu: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);
}

async function restoreFromBackup() {
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ Backup klasörü bulunamadı');
    return;
  }
  
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('❌ Backup dosyası bulunamadı');
    return;
  }
  
  console.log('\n📂 Mevcut Backup Dosyaları:');
  files.forEach((f, i) => {
    const size = (fs.statSync(path.join(backupDir, f)).size / 1024).toFixed(2);
    console.log(`  ${i + 1}. ${f} (${size} KB)`);
  });
  
  console.log('\nℹ️  Restore işlemi veri tabanında mevcut verileri değiştirecektir!');
  console.log('⚠️  Devam etmeden önce yedek almayı unutmayın.\n');
  
  const rl = createInterface();
  const confirm = await question(rl, '📝 Devam etmek istediğinizden emin misiniz? (evet/hayır): ');
  
  if (confirm.toLowerCase() !== 'evet') {
    console.log('❌ İşlem iptal edildi');
    rl.close();
    return;
  }
  
  rl.close();
}

async function backupSpecificTable(tableName) {
  console.log(`\n🔄 ${tableName} backup ediliyor...\n`);
  
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    
    if (error) {
      console.log(`❌ Hata: ${error.message}`);
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `${tableName}_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({
      table: tableName,
      timestamp: new Date().toISOString(),
      records: data?.length || 0,
      data: data || []
    }, null, 2));
    
    console.log(`✅ Backup tamamlandı!`);
    console.log(`📁 Dosya: ${backupFile}`);
    console.log(`📊 Kayıt Sayısı: ${data?.length || 0}`);
    
  } catch (err) {
    console.error(`❌ Hata: ${err.message}`);
  }
}

async function showStatistics() {
  console.log('\n📊 Supabase İstatistikleri\n');
  console.log('🔄 Tablolar sorgulanıyor...\n');
  
  const TABLES = [
    'profiles', 'personnel', 'quality_costs', 'non_conformities',
    'audit_findings', 'suppliers', 'supplier_non_conformities',
    'supplier_audits', 'equipments', 'equipment_calibrations',
    'documents', 'quality_inspections', 'wps_procedures',
    'audit_log_entries', 'kaizen_entries', 'tasks', 'training_participants'
  ];
  
  let totalRecords = 0;
  const stats = {};
  
  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (error) {
        stats[table] = 0;
      } else {
        const count = data?.length || 0;
        stats[table] = count;
        totalRecords += count;
      }
    } catch (err) {
      stats[table] = 0;
    }
  }
  
  console.log('📋 Tablo Kayıt Sayıları:');
  console.log('─'.repeat(40));
  
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([table, count]) => {
      console.log(`  ${table.padEnd(35)} : ${count} kayıt`);
    });
  
  console.log('─'.repeat(40));
  console.log(`  ${'TOPLAM'.padEnd(35)} : ${totalRecords} kayıt\n`);
}

migrateData().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
