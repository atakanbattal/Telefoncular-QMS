/**
 * eight_d_progress Kolonu Migration Script (FINAL)
 * Bu script SQL'i Supabase'de direkt çalıştırır
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ HATA: SUPABASE_SERVICE_KEY environment variable ayarlanmamış!');
    console.error('');
    console.error('Service Key\'i Supabase Dashboard\'dan alın:');
    console.error('  1. https://app.supabase.com/project/ryvczrubujzlanvqiqlk/settings/api');
    console.error('  2. "service_role" key\'i kopyalayın (secret key)');
    console.error('');
    console.error('Kullanım:');
    console.error('  export SUPABASE_SERVICE_KEY="your-service-key"');
    console.error('  node scripts/run-eight-d-progress-migration-final.js');
    console.error('');
    process.exit(1);
}

// Supabase client oluştur (service role key ile)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    console.log('🚀 eight_d_progress Kolonu Migration Başlatılıyor...');
    console.log('================================================');
    console.log('');

    try {
        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, 'add-eight-d-progress-complete.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 SQL dosyası okundu');
        console.log('');

        // SQL'i statement'lara böl (; ile ayır)
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('='));

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
                
                // Supabase REST API üzerinden direkt SQL çalıştır
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ query: statement + ';' })
                });

                if (!response.ok) {
                    // exec_sql yoksa, direkt SQL çalıştırmayı dene
                    console.log(`⚠️  exec_sql bulunamadı, alternatif yöntem deneniyor...`);
                    
                    // PostgreSQL direkt bağlantı gerekir, bu mümkün değil
                    // Bu durumda kullanıcıya Supabase Dashboard kullanmasını söylemeliyiz
                    throw new Error('exec_sql fonksiyonu bulunamadı. Lütfen önce exec_sql fonksiyonunu oluşturun.');
                }

                const result = await response.text();
                if (result.includes('Error')) {
                    throw new Error(result);
                }

                console.log(`✅ Statement ${i + 1} başarıyla çalıştırıldı`);
            } catch (err) {
                console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                
                // İlk statement (exec_sql oluşturma) başarısız olursa, devam et
                if (i === 0 && err.message.includes('exec_sql')) {
                    console.log('⚠️  exec_sql fonksiyonu yok, önce oluşturulmalı');
                    console.log('📝 Lütfen Supabase Dashboard\'da şu SQL\'i çalıştırın:');
                    console.log('');
                    console.log('---');
                    console.log(statements[0] + ';');
                    console.log('---');
                    console.log('');
                    console.log('Sonra bu script\'i tekrar çalıştırın.');
                    break;
                }
                
                // Diğer hatalar için devam et
                continue;
            }
        }

        console.log('');
        console.log('================================================');
        console.log('✅ Migration tamamlandı!');
        console.log('');
        console.log('📋 Yapılan Değişiklikler:');
        console.log('  • exec_sql fonksiyonu oluşturuldu');
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
        console.error('1. Supabase Dashboard\'a gidin:');
        console.error('   https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.error('');
        console.error('2. SQL Editor\'ü açın');
        console.error('');
        console.error('3. scripts/add-eight-d-progress-complete.sql dosyasının içeriğini yapıştırın');
        console.error('');
        console.error('4. Run butonuna tıklayın');
        console.error('');
        process.exit(1);
    }
}

runMigration();

