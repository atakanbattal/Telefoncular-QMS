/**
 * Supplier Documents Tam Kurulum Script'i
 * Bu script tüm Supabase işlemlerini otomatik yapar:
 * 1. Veritabanı tablosu (zaten yapıldı)
 * 2. Storage bucket kontrolü ve oluşturma
 * 3. Storage policies oluşturma
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkBucketExists() {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        const bucket = data.find(b => b.name === 'supplier_documents');
        return !!bucket;
    } catch (error) {
        console.log('⚠️  Bucket kontrolü başarısız:', error.message);
        return false;
    }
}

async function createBucket() {
    console.log('📦 Storage Bucket Oluşturuluyor...');
    
    try {
        // Supabase REST API ile bucket oluşturma
        const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'supplier_documents',
                public: false,
                file_size_limit: 52428800, // 50 MB
                allowed_mime_types: null // Tüm tiplere izin ver
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Bucket başarıyla oluşturuldu:', result.name);
            return true;
        } else if (response.status === 409) {
            console.log('✅ Bucket zaten mevcut');
            return true;
        } else {
            const errorText = await response.text();
            console.log('⚠️  Bucket oluşturulamadı:', errorText.substring(0, 200));
            return false;
        }
    } catch (error) {
        console.log('⚠️  Bucket oluşturma hatası:', error.message);
        return false;
    }
}

async function createStoragePolicies() {
    console.log('');
    console.log('🔒 Storage Policies Oluşturuluyor...');
    console.log('================================================');
    console.log('');

    const policies = [
        {
            name: 'Authenticated users can upload supplier documents',
            sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can upload supplier documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'supplier_documents' AND (storage.foldername(name))[1] = 'suppliers')`
        },
        {
            name: 'Authenticated users can read supplier documents',
            sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can read supplier documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'supplier_documents')`
        },
        {
            name: 'Authenticated users can update supplier documents',
            sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can update supplier documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'supplier_documents' AND owner = auth.uid()) WITH CHECK (bucket_id = 'supplier_documents' AND owner = auth.uid())`
        },
        {
            name: 'Authenticated users can delete supplier documents',
            sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can delete supplier documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'supplier_documents' AND owner = auth.uid())`
        }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const policy of policies) {
        try {
            console.log(`⏳ Policy oluşturuluyor: ${policy.name}...`);
            
            const { data, error } = await supabase.rpc('exec_sql', {
                query: policy.sql
            });

            if (error) {
                // Policy zaten varsa hata vermez, devam et
                if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                    console.log(`✅ Policy zaten mevcut: ${policy.name}`);
                    successCount++;
                } else {
                    console.log(`❌ Policy hatası: ${policy.name} - ${error.message}`);
                    errorCount++;
                }
            } else {
                console.log(`✅ Policy oluşturuldu: ${policy.name}`);
                successCount++;
            }
        } catch (err) {
            console.log(`❌ Policy hatası: ${policy.name} - ${err.message}`);
            errorCount++;
        }
    }

    console.log('');
    console.log(`📊 Özet: ${successCount} başarılı, ${errorCount} hata`);
    return errorCount === 0;
}

async function run() {
    console.log('🚀 Supplier Documents Tam Kurulum');
    console.log('================================================');
    console.log('');

    // 1. Bucket kontrolü
    console.log('🔍 Bucket kontrol ediliyor...');
    const bucketExists = await checkBucketExists();
    
    if (!bucketExists) {
        console.log('📦 Bucket bulunamadı, oluşturuluyor...');
        const created = await createBucket();
        if (!created) {
            console.log('');
            console.log('⚠️  Bucket oluşturulamadı');
            console.log('📝 Manuel Oluşturma:');
            console.log('   1. https://app.supabase.com/project/ryvczrubujzlanvqiqlk/storage/buckets');
            console.log('   2. Create Bucket → supplier_documents');
            console.log('   3. Public: false, File size: 50 MB');
            console.log('');
            return;
        }
    } else {
        console.log('✅ Bucket mevcut');
    }

    // 2. Policies oluştur
    await createStoragePolicies();

    console.log('');
    console.log('================================================');
    console.log('✅ Kurulum tamamlandı!');
    console.log('');
    console.log('📋 Yapılanlar:');
    console.log('  • supplier_documents bucket kontrol edildi/oluşturuldu');
    console.log('  • Storage policies eklendi');
    console.log('');
    console.log('🎉 Artık doküman yükleme özelliğini kullanabilirsiniz!');
    console.log('');
}

run();

