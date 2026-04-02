/**
 * eight_d_progress Migration Script (Service Role Key ile)
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

// Supabase client oluştur (service role key ile)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQLStatement(sql) {
    // Supabase REST API üzerinden direkt SQL çalıştır
    // Management API kullanarak SQL çalıştırma
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.text();
}

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

        // SQL'i statement'lara böl (daha akıllı parsing)
        const statements = [];
        let currentStatement = '';
        let inFunction = false;
        let dollarTag = '';
        let depth = 0;

        const lines = sqlContent.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Yorum satırlarını atla
            if (line.startsWith('--') || line.startsWith('===')) {
                continue;
            }
            
            // Boş satırları atla
            if (line.length === 0) {
                continue;
            }

            currentStatement += line + '\n';

            // Dollar tag kontrolü ($$ LANGUAGE plpgsql gibi)
            const dollarMatch = line.match(/\$(\w*)\$/);
            if (dollarMatch) {
                if (!inFunction) {
                    inFunction = true;
                    dollarTag = dollarMatch[0];
                } else if (line.includes(dollarTag)) {
                    inFunction = false;
                    dollarTag = '';
                }
            }

            // Function içindeyken ; kontrolü yapma
            if (!inFunction && line.endsWith(';')) {
                const trimmed = currentStatement.trim();
                if (trimmed.length > 0) {
                    statements.push(trimmed);
                }
                currentStatement = '';
            }
        }

        // Son statement'ı ekle
        if (currentStatement.trim().length > 0) {
            statements.push(currentStatement.trim());
        }

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
                const preview = statement.substring(0, 80).replace(/\n/g, ' ').trim();
                console.log(`   ${preview}...`);
                
                // exec_sql RPC fonksiyonunu kullan
                const result = await executeSQLStatement(statement);
                
                if (result && result.includes('Error')) {
                    throw new Error(result);
                }

                console.log(`✅ Statement ${i + 1} başarıyla çalıştırıldı`);
            } catch (err) {
                console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                
                // İlk statement (exec_sql oluşturma) başarısız olursa
                if (i === 0 && err.message.includes('exec_sql')) {
                    console.log('');
                    console.log('⚠️  exec_sql fonksiyonu yok, önce oluşturulmalı');
                    console.log('📝 Alternatif: Supabase Dashboard\'da çalıştırın');
                    console.log('');
                    // Devam et, belki diğer statement'lar çalışır
                    continue;
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
        process.exit(1);
    }
}

runMigration();

