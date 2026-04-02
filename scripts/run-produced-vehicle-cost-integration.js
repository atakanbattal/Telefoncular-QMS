/**
 * Produced Vehicle Cost Integration Migration Script
 * Bu script Supabase'e bağlanarak SQL migration'ı otomatik çalıştırır
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase bağlantı bilgileri
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Hata: SUPABASE_SERVICE_ROLE_KEY veya VITE_SUPABASE_SERVICE_KEY çevre değişkeni ayarlanmalı');
    console.error('');
    console.error('Kullanım:');
    console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-service-key"');
    console.error('  node scripts/run-produced-vehicle-cost-integration.js');
    console.error('');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false
    }
});

async function executeSQLStatement(statement) {
    try {
        // exec_sql RPC fonksiyonunu kullan
        const { data, error } = await supabase.rpc('exec_sql', {
            query: statement
        });

        if (error) {
            // exec_sql yoksa, alternatif yöntem dene
            throw error;
        }

        return data;
    } catch (err) {
        // Alternatif: Supabase REST API üzerinden direkt SQL çalıştır
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: statement })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (fetchErr) {
            throw new Error(`SQL çalıştırılamadı: ${fetchErr.message}`);
        }
    }
}

async function runMigration() {
    console.log('🚀 Produced Vehicle Cost Integration Migration Başlatılıyor...');
    console.log('================================================');
    console.log('');

    try {
        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, 'add-produced-vehicle-cost-integration.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 SQL dosyası okundu:', sqlFile);
        console.log('');

        // SQL'i statement'lara böl
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📋 ${statements.length} SQL statement bulundu`);
        console.log('');

        let successCount = 0;
        let errorCount = 0;

        // Her statement'ı çalıştır
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (!statement || statement.length < 10) {
                continue;
            }

            try {
                console.log(`⏳ Statement ${i + 1}/${statements.length} çalıştırılıyor...`);
                const preview = statement.substring(0, 80).replace(/\n/g, ' ').trim();
                console.log(`   ${preview}...`);
                
                const result = await executeSQLStatement(statement + ';');
                
                if (result && typeof result === 'string' && result.includes('Error')) {
                    throw new Error(result);
                }

                successCount++;
                console.log(`✅ Statement ${i + 1} başarıyla çalıştırıldı`);
                console.log('');
            } catch (err) {
                errorCount++;
                console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                
                // exec_sql fonksiyonu yoksa, kullanıcıya bilgi ver
                if (err.message.includes('exec_sql') || err.message.includes('function') || err.message.includes('does not exist')) {
                    console.log('');
                    console.log('⚠️  exec_sql RPC fonksiyonu bulunamadı');
                    console.log('📝 Alternatif: SQL dosyasını Supabase Dashboard\'da çalıştırın:');
                    console.log('   https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
                    console.log('');
                    console.log('SQL içeriği:');
                    console.log('================================================');
                    console.log(sqlContent);
                    console.log('================================================');
                    break;
                }
                
                console.log('');
            }
        }

        console.log('');
        console.log('================================================');
        if (errorCount === 0) {
            console.log('✅ Migration tamamlandı!');
        } else {
            console.log(`⚠️  Migration tamamlandı (${successCount} başarılı, ${errorCount} hata)`);
        }
        console.log('');
        console.log('📋 Yapılan Değişiklikler:');
        console.log('  • quality_costs tablosuna source_type kolonu eklendi');
        console.log('  • quality_costs tablosuna source_record_id kolonu eklendi');
        console.log('  • quality_costs tablosuna quality_control_duration kolonu eklendi');
        console.log('  • İndeksler oluşturuldu');
        console.log('  • Mevcut kayıtlar güncellendi');
        console.log('');

    } catch (error) {
        console.error('❌ Migration hatası:', error.message);
        console.error('');
        console.error('💡 Çözüm:');
        console.error('  1. Supabase Dashboard\'a gidin:');
        console.error('     https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.error('');
        console.error('  2. SQL Editor\'ü açın');
        console.error('');
        console.error('  3. scripts/add-produced-vehicle-cost-integration.sql dosyasındaki SQL\'i çalıştırın');
        console.error('');
        process.exit(1);
    }
}

runMigration();

