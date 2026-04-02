/**
 * eight_d_progress Kolonu Migration Script (Direkt Çalıştırma)
 * Bu script non_conformities tablosuna eight_d_progress kolonunu ekler
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase bağlantı bilgileri (hardcoded - customSupabaseClient.js'ten alındı)
const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmN6cnVidWp6bGFudnFpcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY0NDksImV4cCI6MjA5MDcyMjQ0OX0.v1-_uY9ISae_8p4juXzGro4FhxdDwCVD8Hos6HwbrHQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
    console.log('🚀 eight_d_progress Kolonu Migration Başlatılıyor...');
    console.log('================================================');
    console.log('');

    try {
        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, 'add-eight-d-progress-column.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 SQL dosyası okundu');
        console.log('');

        // Tüm SQL'i tek seferde çalıştır
        try {
            console.log('⏳ Migration çalıştırılıyor...');
            
            // exec_sql RPC fonksiyonunu kullan
            const { data, error } = await supabase.rpc('exec_sql', {
                query: sqlContent
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Migration başarıyla çalıştırıldı');
        } catch (err) {
            console.error('❌ Migration hatası:', err.message);
            throw err;
        }

        console.log('');
        console.log('================================================');
        console.log('✅ Migration tamamlandı!');
        console.log('');
        console.log('📋 Yapılan Değişiklikler:');
        console.log('  • non_conformities tablosuna eight_d_progress JSONB kolonu eklendi');
        console.log('  • Index oluşturuldu (performans için)');
        console.log('  • Mevcut kayıtlar için varsayılan değer güncellendi');
        console.log('');
        console.log('🎉 Artık 8D modülünü sorunsuz kullanabilirsiniz!');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('================================================');
        console.error('❌ Migration başarısız!');
        console.error('================================================');
        console.error('');
        console.error('Hata:', error.message);
        console.error('');
        console.error('📝 Alternatif Yöntem:');
        console.error('1. Supabase Dashboard\'a gidin: https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.error('2. SQL Editor\'ü açın');
        console.error('3. scripts/add-eight-d-progress-column.sql dosyasının içeriğini yapıştırın');
        console.error('4. Run butonuna tıklayın');
        console.error('');
        process.exit(1);
    }
}

runMigration();

