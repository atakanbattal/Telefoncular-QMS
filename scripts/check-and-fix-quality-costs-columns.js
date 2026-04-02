/**
 * Quality Costs Tablosu Kolonlarını Kontrol Et ve Düzelt
 * Bu script kolonların var olup olmadığını kontrol eder ve yoksa ekler
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndFixColumns() {
    console.log('🔍 Quality Costs Tablosu Kontrol Ediliyor...');
    console.log('================================================');
    console.log('');

    try {
        // Önce tabloyu kontrol et
        const { data: testData, error: testError } = await supabase
            .from('quality_costs')
            .select('id')
            .limit(1);

        if (testError) {
            console.error('❌ quality_costs tablosuna erişilemiyor:', testError.message);
            return;
        }

        console.log('✅ quality_costs tablosuna erişim başarılı');
        console.log('');

        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, 'add-produced-vehicle-cost-integration.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 SQL dosyası okundu');
        console.log('');

        // SQL statement'larını ayır
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📋 ${statements.length} SQL statement bulundu`);
        console.log('');

        // Her statement'ı çalıştır
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (!statement || statement.length < 10) {
                continue;
            }

            try {
                console.log(`⏳ Statement ${i + 1}/${statements.length} çalıştırılıyor...`);
                
                // exec_sql RPC fonksiyonunu kullan
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement + ';'
                });

                if (error) {
                    // Eğer kolon zaten varsa hata verme (IF NOT EXISTS sayesinde)
                    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                        console.log(`⚠️  Statement ${i + 1} - Kolon zaten mevcut (normal)`);
                    } else {
                        throw error;
                    }
                } else {
                    console.log(`✅ Statement ${i + 1} başarıyla çalıştırıldı`);
                }
                console.log('');
            } catch (err) {
                // IF NOT EXISTS sayesinde kolon zaten varsa hata vermez
                if (err.message.includes('already exists') || err.message.includes('duplicate') || err.message.includes('IF NOT EXISTS')) {
                    console.log(`⚠️  Statement ${i + 1} - Kolon zaten mevcut (normal)`);
                } else {
                    console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                }
                console.log('');
            }
        }

        // Schema cache'i yenilemek için bir test sorgusu yap
        console.log('🔄 Schema cache yenileniyor...');
        try {
            const { data: refreshData, error: refreshError } = await supabase
                .from('quality_costs')
                .select('source_type, source_record_id, quality_control_duration')
                .limit(1);

            if (refreshError) {
                console.error('⚠️  Schema cache yenileme hatası:', refreshError.message);
                console.log('');
                console.log('💡 Lütfen sayfayı yenileyin ve tekrar deneyin');
            } else {
                console.log('✅ Schema cache başarıyla yenilendi');
                console.log('');
                console.log('📋 Kolonlar başarıyla kontrol edildi:');
                console.log('   • source_type');
                console.log('   • source_record_id');
                console.log('   • quality_control_duration');
            }
        } catch (refreshErr) {
            console.error('⚠️  Schema kontrol hatası:', refreshErr.message);
        }

        console.log('');
        console.log('================================================');
        console.log('✅ Kontrol tamamlandı!');
        console.log('');
        console.log('💡 Eğer hata devam ederse:');
        console.log('   1. Tarayıcıyı tamamen kapatıp açın');
        console.log('   2. Hard refresh yapın (Ctrl+Shift+R veya Cmd+Shift+R)');
        console.log('   3. Supabase Dashboard\'da SQL Editor\'ü açıp şu sorguyu çalıştırın:');
        console.log('      SELECT column_name FROM information_schema.columns');
        console.log('      WHERE table_name = \'quality_costs\';');
        console.log('');

    } catch (error) {
        console.error('❌ Kontrol hatası:', error.message);
        console.error('');
        console.error('💡 SQL\'i manuel olarak çalıştırın:');
        console.error('   https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.error('');
    }
}

checkAndFixColumns();

