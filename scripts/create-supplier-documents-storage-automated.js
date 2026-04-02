/**
 * Supplier Documents Storage Bucket Otomatik Oluşturma
 * Bu script storage bucket'ı ve policies'i otomatik oluşturur
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createStorageBucket() {
    console.log('🚀 Storage Bucket Oluşturuluyor...');
    console.log('================================================');
    console.log('');

    try {
        // Supabase Management API kullanarak bucket oluştur
        // Not: Bu işlem için Supabase Management API gerekir
        // Alternatif: Supabase Dashboard REST API'sini kullan
        
        const bucketData = {
            name: 'supplier_documents',
            public: false,
            file_size_limit: 52428800, // 50 MB in bytes
            allowed_mime_types: [
                'image/*',
                'video/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/*',
                'application/json'
            ]
        };

        // Supabase REST API üzerinden bucket oluşturma denemesi
        const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            method: 'POST',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bucketData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Storage bucket başarıyla oluşturuldu!');
            console.log('   Bucket:', result.name);
            return true;
        } else {
            const errorText = await response.text();
            console.log('⚠️  REST API ile bucket oluşturulamadı');
            console.log('   Hata:', errorText);
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

    try {
        const policies = [
            {
                name: 'Authenticated users can upload supplier documents',
                definition: `bucket_id = 'supplier_documents' AND (storage.foldername(name))[1] = 'suppliers'`,
                check: `bucket_id = 'supplier_documents' AND (storage.foldername(name))[1] = 'suppliers'`,
                command: 'INSERT'
            },
            {
                name: 'Authenticated users can read supplier documents',
                definition: `bucket_id = 'supplier_documents'`,
                check: null,
                command: 'SELECT'
            },
            {
                name: 'Authenticated users can update supplier documents',
                definition: `bucket_id = 'supplier_documents' AND owner = auth.uid()`,
                check: `bucket_id = 'supplier_documents' AND owner = auth.uid()`,
                command: 'UPDATE'
            },
            {
                name: 'Authenticated users can delete supplier documents',
                definition: `bucket_id = 'supplier_documents' AND owner = auth.uid()`,
                check: null,
                command: 'DELETE'
            }
        ];

        // Policies'i SQL olarak çalıştır
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
        
        for (const policy of policies) {
            try {
                let sql = `CREATE POLICY "${policy.name}" ON storage.objects FOR ${policy.command} TO authenticated`;
                
                if (policy.command === 'INSERT') {
                    sql += ` WITH CHECK (${policy.check})`;
                } else if (policy.command === 'SELECT') {
                    sql += ` USING (${policy.definition})`;
                } else if (policy.command === 'UPDATE') {
                    sql += ` USING (${policy.definition}) WITH CHECK (${policy.check})`;
                } else if (policy.command === 'DELETE') {
                    sql += ` USING (${policy.definition})`;
                }

                // exec_sql RPC fonksiyonunu kullan
                const { error } = await supabaseClient.rpc('exec_sql', {
                    query: sql
                });

                if (error) {
                    console.log(`⚠️  Policy oluşturulamadı: ${policy.name}`);
                    console.log(`   Hata: ${error.message}`);
                } else {
                    console.log(`✅ Policy oluşturuldu: ${policy.name}`);
                }
            } catch (err) {
                console.log(`❌ Policy hatası: ${policy.name} - ${err.message}`);
            }
        }

        return true;
    } catch (error) {
        console.log('❌ Policies oluşturma hatası:', error.message);
        return false;
    }
}

async function run() {
    console.log('🚀 Supplier Documents Storage Kurulumu');
    console.log('================================================');
    console.log('');

    // 1. Bucket oluştur
    const bucketCreated = await createStorageBucket();

    if (!bucketCreated) {
        console.log('');
        console.log('⚠️  Bucket REST API ile oluşturulamadı');
        console.log('📝 Manuel Oluşturma Talimatları:');
        console.log('   1. https://app.supabase.com/project/ryvczrubujzlanvqiqlk/storage/buckets');
        console.log('   2. Create Bucket → supplier_documents');
        console.log('   3. Public: false, File size: 50 MB');
        console.log('');
        console.log('Bucket oluşturulduktan sonra bu script\'i tekrar çalıştırın.');
        return;
    }

    // 2. Policies oluştur
    await createStoragePolicies();

    console.log('');
    console.log('================================================');
    console.log('✅ Storage kurulumu tamamlandı!');
    console.log('');
    console.log('📋 Yapılanlar:');
    console.log('  • supplier_documents bucket oluşturuldu');
    console.log('  • Storage policies eklendi');
    console.log('');
    console.log('🎉 Artık doküman yükleme özelliğini kullanabilirsiniz!');
    console.log('');
}

run();

