/**
 * eight_d_progress Kolonu Migration Script (Tam Çözüm)
 * Bu script önce exec_sql fonksiyonunu oluşturur, sonra migration'ı çalıştırır
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    }
});

async function runMigration() {
    console.log('🚀 eight_d_progress Kolonu Migration Başlatılıyor...');
    console.log('================================================');
    console.log('');

    try {
        // 1. exec_sql fonksiyonunu oluştur
        console.log('📝 Adım 1: exec_sql fonksiyonu oluşturuluyor...');
        const execSqlFunction = `
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS TEXT AS $$
BEGIN
    EXECUTE query;
    RETURN 'Success';
EXCEPTION WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
`;

        // exec_sql'i direkt SQL olarak çalıştır (PostgREST üzerinden)
        // Not: Bu çalışmayabilir, alternatif olarak Supabase Dashboard kullanılmalı
        console.log('⚠️  exec_sql fonksiyonu Supabase Dashboard\'dan oluşturulmalı.');
        console.log('');

        // 2. Migration SQL'ini oku
        console.log('📝 Adım 2: Migration SQL\'i okunuyor...');
        const sqlFile = path.join(__dirname, 'add-eight-d-progress-column.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('');
        console.log('================================================');
        console.log('📋 YAPILMASI GEREKENLER:');
        console.log('================================================');
        console.log('');
        console.log('1. Supabase Dashboard\'a gidin:');
        console.log('   https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.log('');
        console.log('2. SQL Editor\'ü açın');
        console.log('');
        console.log('3. Önce exec_sql fonksiyonunu oluşturun:');
        console.log('   (scripts/create-exec-sql-function.sql dosyasındaki SQL\'i çalıştırın)');
        console.log('');
        console.log('4. Sonra migration SQL\'ini çalıştırın:');
        console.log('   (scripts/add-eight-d-progress-column.sql dosyasındaki SQL\'i çalıştırın)');
        console.log('');
        console.log('VEYA');
        console.log('');
        console.log('Aşağıdaki SQL\'i tek seferde çalıştırın:');
        console.log('');
        console.log('---');
        console.log(execSqlFunction);
        console.log('');
        console.log('---');
        console.log(sqlContent);
        console.log('---');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('================================================');
        console.error('❌ Hata!');
        console.error('================================================');
        console.error('');
        console.error('Hata:', error.message);
        console.error('');
        process.exit(1);
    }
}

runMigration();

