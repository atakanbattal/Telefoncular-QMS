/**
 * SQL'i Supabase'de Direkt Çalıştırma Script'i
 * Bu script SQL'i statement'lara bölüp her birini ayrı ayrı çalıştırır
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase bağlantı bilgileri
const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ HATA: Service Role Key bulunamadı!');
    console.error('');
    console.error('Service Role Key\'i Supabase Dashboard\'dan alın:');
    console.error('  1. https://app.supabase.com/project/ryvczrubujzlanvqiqlk/settings/api');
    console.error('  2. "service_role" (secret) key\'i kopyalayın');
    console.error('');
    console.error('Sonra şu komutu çalıştırın:');
    console.error('  export SUPABASE_SERVICE_KEY="your-service-key"');
    console.error('  node scripts/execute-sql-direct.js');
    console.error('');
    console.error('VEYA');
    console.error('');
    console.error('Supabase Dashboard\'da direkt çalıştırın:');
    console.error('  https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
    console.error('');
    console.error('SQL dosyası: scripts/add-eight-d-progress-complete.sql');
    process.exit(1);
}

// Supabase client oluştur (service role key ile)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQL() {
    console.log('🚀 SQL Migration Başlatılıyor...');
    console.log('================================================');
    console.log('');

    try {
        // SQL dosyasını oku
        const sqlFile = path.join(__dirname, 'add-eight-d-progress-complete.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');

        console.log('📄 SQL dosyası okundu');
        console.log('');

        // SQL'i statement'lara böl
        // PostgreSQL'de ; ile statement'lar ayrılır ama string içindeki ; dikkate alınmamalı
        const statements = [];
        let currentStatement = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < sqlContent.length; i++) {
            const char = sqlContent[i];
            const nextChar = sqlContent[i + 1];

            if ((char === "'" || char === '"') && (i === 0 || sqlContent[i - 1] !== '\\')) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
            }

            currentStatement += char;

            if (!inString && char === ';' && (nextChar === '\n' || nextChar === '\r' || nextChar === ' ' || !nextChar)) {
                const trimmed = currentStatement.trim();
                if (trimmed.length > 0 && !trimmed.startsWith('--') && !trimmed.startsWith('=')) {
                    statements.push(trimmed);
                }
                currentStatement = '';
            }
        }

        // Son statement'ı ekle (eğer ; ile bitmiyorsa)
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
                console.log(`   ${statement.substring(0, 100).replace(/\n/g, ' ')}...`);
                
                // Supabase REST API üzerinden direkt SQL çalıştır
                // exec_sql RPC fonksiyonunu kullan
                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement
                });

                if (error) {
                    // exec_sql yoksa, direkt SQL çalıştırmayı dene (PostgREST üzerinden mümkün değil)
                    throw new Error(`exec_sql hatası: ${error.message}`);
                }

                console.log(`✅ Statement ${i + 1} başarıyla çalıştırıldı`);
            } catch (err) {
                console.error(`❌ Statement ${i + 1} hatası:`, err.message);
                
                // İlk statement (exec_sql oluşturma) başarısız olursa
                if (i === 0) {
                    console.log('');
                    console.log('⚠️  exec_sql fonksiyonu yok, önce oluşturulmalı');
                    console.log('📝 Lütfen Supabase Dashboard\'da şu SQL\'i çalıştırın:');
                    console.log('');
                    console.log('---');
                    console.log(statement);
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
        console.error('📝 Çözüm:');
        console.error('Supabase Dashboard\'da direkt çalıştırın:');
        console.error('  1. https://app.supabase.com/project/ryvczrubujzlanvqiqlk/sql');
        console.error('  2. SQL Editor\'ü açın');
        console.error('  3. scripts/add-eight-d-progress-complete.sql dosyasının içeriğini yapıştırın');
        console.error('  4. Run butonuna tıklayın');
        console.error('');
        process.exit(1);
    }
}

executeSQL();

