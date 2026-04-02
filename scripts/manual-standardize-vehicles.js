/**
 * Manuel Araç Tipi Standartlaştırma Scripti
 * Belirtilen kurallara göre products ve veritabanı referanslarını günceller
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Standartlaştırma kuralları
const STANDARDIZATION_RULES = [
    { from: 'HSCK', to: 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)' },
    { from: 'Hsck', to: 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)' },
    { from: 'hsck', to: 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)' },
    { from: 'Aga6000', to: 'AGA6000' },
    { from: 'aga6000', to: 'AGA6000' },
    { from: 'Aga2100', to: 'AGA2100' },
    { from: 'aga2100', to: 'AGA2100' },
    { from: 'Aga3000', to: 'AGA3000' },
    { from: 'aga3000', to: 'AGA3000' },
    { from: 'Kdm35', to: 'KDM 35' },
    { from: 'kdm35', to: 'KDM 35' },
    { from: 'Kdm 35', to: 'KDM 35' },
    { from: 'kdm 35', to: 'KDM 35' },
    { from: 'Kdm70', to: 'KDM 70' },
    { from: 'kdm70', to: 'KDM 70' },
    { from: 'Kdm 70', to: 'KDM 70' },
    { from: 'kdm 70', to: 'KDM 70' },
    { from: 'Kdm80', to: 'KDM 80' },
    { from: 'kdm80', to: 'KDM 80' },
    { from: 'Kdm 80', to: 'KDM 80' },
    { from: 'kdm 80', to: 'KDM 80' },
];

async function manualStandardize() {
    console.log('🚀 Manuel Araç Tipi Standartlaştırma Başlatılıyor...\n');

    try {
        // 1. Araç tipleri kategorisini al
        const { data: vehicleCategory } = await supabase
            .from('product_categories')
            .select('id')
            .eq('category_code', 'VEHICLE_TYPES')
            .single();

        if (!vehicleCategory) {
            throw new Error('VEHICLE_TYPES kategorisi bulunamadı!');
        }

        // 2. Products tablosunu güncelle
        console.log('📦 Products tablosu güncelleniyor...\n');
        let productsUpdated = 0;

        for (const rule of STANDARDIZATION_RULES) {
            // product_code veya product_name'i kontrol et
            const { data: products, error: fetchError } = await supabase
                .from('products')
                .select('id, product_code, product_name')
                .eq('category_id', vehicleCategory.id)
                .or(`product_code.eq.${rule.from},product_name.eq.${rule.from}`);

            if (fetchError) {
                console.error(`   ⚠️  ${rule.from} aranırken hata: ${fetchError.message}`);
                continue;
            }

            if (!products || products.length === 0) {
                continue;
            }

            // Eğer hedef zaten varsa, mevcut kayıtları sil
            const { data: existingTarget } = await supabase
                .from('products')
                .select('id')
                .eq('category_id', vehicleCategory.id)
                .or(`product_code.eq.${rule.to},product_name.eq.${rule.to}`)
                .limit(1);

            const targetExists = existingTarget && existingTarget.length > 0;

            for (const product of products) {
                if (targetExists && products.length > 1) {
                    // Hedef zaten varsa ve birden fazla kayıt varsa, bu kaydı sil
                    const { error: deleteError } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', product.id);

                    if (!deleteError) {
                        console.log(`   🗑️  ${rule.from} silindi (${rule.to} zaten mevcut)`);
                    }
                } else {
                    // Güncelle
                    const { error: updateError } = await supabase
                        .from('products')
                        .update({
                            product_code: rule.to,
                            product_name: rule.to
                        })
                        .eq('id', product.id);

                    if (updateError) {
                        console.error(`   ❌ ${rule.from} -> ${rule.to} güncellenemedi: ${updateError.message}`);
                    } else {
                        console.log(`   ✅ ${rule.from} -> ${rule.to}`);
                        productsUpdated++;
                    }
                }
            }
        }

        // 3. Veritabanı referanslarını güncelle
        console.log('\n🔄 Veritabanı referansları güncelleniyor...\n');

        const tablesToUpdate = [
            { table: 'quality_costs', column: 'vehicle_type' },
            { table: 'deviations', column: 'vehicle_type' },
            { table: 'quality_inspections', column: 'vehicle_type' },
            { table: 'kaizen_entries', column: 'vehicle_type' }
        ];

        let totalUpdated = 0;

        for (const { table, column } of tablesToUpdate) {
            try {
                let allRecords = [];
                let offset = 0;
                const limit = 1000;

                while (true) {
                    const { data: records, error: fetchError } = await supabase
                        .from(table)
                        .select(`id, ${column}`)
                        .not(column, 'is', null)
                        .range(offset, offset + limit - 1);

                    if (fetchError) {
                        if (fetchError.code === '42P01') {
                            console.log(`   ⏭️  ${table} tablosu bulunamadı, atlanıyor`);
                        }
                        break;
                    }

                    if (!records || records.length === 0) break;
                    allRecords = allRecords.concat(records);
                    if (records.length < limit) break;
                    offset += limit;
                }

                if (allRecords.length === 0) {
                    continue;
                }

                let tableUpdated = 0;
                for (const record of allRecords) {
                    const oldValue = record[column];
                    if (!oldValue) continue;

                    // Standartlaştırma kuralını bul
                    const rule = STANDARDIZATION_RULES.find(r => 
                        oldValue.trim() === r.from || 
                        oldValue.trim().toLowerCase() === r.from.toLowerCase()
                    );

                    if (rule && oldValue !== rule.to) {
                        const { error: updateError } = await supabase
                            .from(table)
                            .update({ [column]: rule.to })
                            .eq('id', record.id);

                        if (!updateError) {
                            tableUpdated++;
                        }
                    }
                }

                if (tableUpdated > 0) {
                    console.log(`   ✅ ${table}: ${tableUpdated} kayıt güncellendi`);
                    totalUpdated += tableUpdated;
                }
            } catch (err) {
                // Tablo yoksa sessizce geç
            }
        }

        // 4. Özet
        console.log('\n================================================');
        console.log('✅ Standartlaştırma tamamlandı!');
        console.log(`   📦 Products: ${productsUpdated} kayıt güncellendi`);
        console.log(`   🔄 Veritabanı referansları: ${totalUpdated} kayıt güncellendi`);
        console.log('\n🎉 Tüm araç tipleri standartlaştırıldı!');
        console.log('');

    } catch (error) {
        console.error('\n❌ Standartlaştırma hatası:', error.message);
        console.error(error);
        process.exit(1);
    }
}

manualStandardize();

