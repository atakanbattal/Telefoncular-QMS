/**
 * QDMS Migration Script
 * Bu script profesyonel QDMS sistemini Supabase'de kurar
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase bağlantı bilgileri
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ HATA: SUPABASE_SERVICE_KEY environment variable ayarlanmamış!');
    console.error('');
    console.error('Kullanım:');
    console.error('  SUPABASE_SERVICE_KEY="your-service-key" node scripts/run-qdms-migration.js');
    console.error('');
    console.error('Service Key\'i Supabase Dashboard\'dan alabilirsiniz:');
    console.error('  Settings → API → service_role key');
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
    console.log('🚀 QDMS Migration Başlatılıyor...');
    console.log('=====================================\n');

    try {
        // SQL dosyasını oku
        const sqlFile = join(__dirname, 'create-professional-qdms-system.sql');
        console.log(`📄 SQL dosyası okunuyor: ${sqlFile}`);
        
        const sqlContent = readFileSync(sqlFile, 'utf-8');
        
        // SQL'i parçalara böl (PostgreSQL'de bazı komutlar tek seferde çalışmayabilir)
        const sqlStatements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📊 ${sqlStatements.length} SQL statement bulundu\n`);

        // Her statement'ı çalıştır
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sqlStatements.length; i++) {
            const statement = sqlStatements[i];
            
            // Boş veya sadece yorum içeren statement'ları atla
            if (!statement || statement.length < 10) {
                continue;
            }

            try {
                // RPC fonksiyonu kullanarak SQL çalıştır
                // Not: Supabase REST API üzerinden direkt SQL çalıştırmak için
                // exec_sql gibi bir RPC fonksiyonu olması gerekir
                // Alternatif olarak, her statement'ı ayrı ayrı çalıştırabiliriz
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement + ';'
                });

                if (error) {
                    // exec_sql RPC fonksiyonu yoksa, alternatif yöntem dene
                    console.log(`⚠️  Statement ${i + 1}/${sqlStatements.length} - RPC yöntemi başarısız, alternatif yöntem deneniyor...`);
                    
                    // Supabase REST API'yi direkt kullan
                    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query: statement + ';' })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
                    }
                }

                successCount++;
                if ((i + 1) % 10 === 0) {
                    console.log(`✅ ${i + 1}/${sqlStatements.length} statement işlendi...`);
                }
            } catch (err) {
                errorCount++;
                console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                // Kritik olmayan hataları atla (örn: IF NOT EXISTS zaten varsa)
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    console.log(`   ⚠️  Zaten mevcut, atlanıyor...`);
                    successCount++;
                    errorCount--;
                }
            }
        }

        console.log('\n=====================================');
        console.log(`✅ Migration tamamlandı!`);
        console.log(`   Başarılı: ${successCount}`);
        console.log(`   Hatalı: ${errorCount}`);
        console.log('\n🎉 QDMS sistemi hazır!');
        console.log('   Şimdi uygulamayı yenileyin ve Document modülünü kullanabilirsiniz.');

    } catch (error) {
        console.error('\n❌ Migration hatası:', error);
        console.error('\n💡 Alternatif: SQL dosyasını Supabase Dashboard\'da manuel çalıştırın:');
        console.error('   1. https://app.supabase.com → SQL Editor');
        console.error('   2. scripts/create-professional-qdms-system.sql dosyasını açın');
        console.error('   3. İçeriği kopyalayıp SQL Editor\'e yapıştırın');
        console.error('   4. Run butonuna tıklayın');
        process.exit(1);
    }
}

runMigration();

