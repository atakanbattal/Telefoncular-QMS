/**
 * Mevcut Ürünleri Products Tablosuna Aktarma Scripti
 * Veritabanındaki tüm araç tipleri ve parça kodlarını products tablosuna ekler
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Mevcut araç tipleri (sabitlerden)
const STATIC_VEHICLE_TYPES = [
    "FTH-240", 
    "Çelik-2000", 
    "AGA2100", 
    "AGA3000", 
    "AGA6000", 
    "Kompost Makinesi", 
    "Çay Toplama Makinesi", 
    "KDM 35", 
    "KDM 70", 
    "KDM 80", 
    "Rusya Motor Odası", 
    "Ural", 
    "HSCK", 
    "HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)",
    "Traktör Kabin", 
    "Genel Hurda",
    "Diğer"
];

async function migrateExistingProducts() {
    console.log('🚀 Mevcut Ürünleri Products Tablosuna Aktarma Başlatılıyor...\n');

    try {
        // 1. Kategorileri al
        const { data: categories, error: catError } = await supabase
            .from('product_categories')
            .select('*')
            .eq('is_active', true);

        if (catError) throw catError;

        const vehicleCategory = categories.find(c => c.category_code === 'VEHICLE_TYPES');
        const partsCategory = categories.find(c => c.category_code === 'PARTS');

        if (!vehicleCategory) {
            throw new Error('VEHICLE_TYPES kategorisi bulunamadı!');
        }
        if (!partsCategory) {
            throw new Error('PARTS kategorisi bulunamadı!');
        }

        console.log('✅ Kategoriler yüklendi\n');

        // 2. Veritabanından benzersiz araç tiplerini çek
        console.log('📊 Veritabanından mevcut veriler çekiliyor...\n');

        const [qualityCostsRes, deviationsRes, vehiclesRes] = await Promise.all([
            supabase.from('quality_costs').select('vehicle_type').not('vehicle_type', 'is', null),
            supabase.from('deviations').select('vehicle_type').not('vehicle_type', 'is', null),
            supabase.from('quality_inspections').select('vehicle_type').not('vehicle_type', 'is', null)
        ]);

        // Benzersiz araç tiplerini topla
        const vehicleTypesSet = new Set();
        
        // Statik araç tiplerini ekle
        STATIC_VEHICLE_TYPES.forEach(vt => vehicleTypesSet.add(vt.trim()));

        // Veritabanından gelen araç tiplerini ekle
        [qualityCostsRes.data, deviationsRes.data, vehiclesRes.data].forEach(dataArray => {
            if (dataArray) {
                dataArray.forEach(item => {
                    if (item.vehicle_type && item.vehicle_type.trim()) {
                        vehicleTypesSet.add(item.vehicle_type.trim());
                    }
                });
            }
        });

        const uniqueVehicleTypes = Array.from(vehicleTypesSet).filter(vt => vt.length > 0);
        console.log(`📋 ${uniqueVehicleTypes.length} benzersiz araç tipi bulundu:\n   ${uniqueVehicleTypes.join(', ')}\n`);

        // 3. Parça kodlarını çek
        const [partCodesRes1, partCodesRes2] = await Promise.all([
            supabase.from('quality_costs').select('part_code').not('part_code', 'is', null),
            supabase.from('deviations').select('part_code').not('part_code', 'is', null)
        ]);

        const partCodesSet = new Set();
        [partCodesRes1.data, partCodesRes2.data].forEach(dataArray => {
            if (dataArray) {
                dataArray.forEach(item => {
                    if (item.part_code && item.part_code.trim()) {
                        partCodesSet.add(item.part_code.trim());
                    }
                });
            }
        });

        const uniquePartCodes = Array.from(partCodesSet).filter(pc => pc.length > 0);
        console.log(`📋 ${uniquePartCodes.length} benzersiz parça kodu bulundu\n`);

        // 4. Mevcut products'ı kontrol et
        const { data: existingProducts } = await supabase
            .from('products')
            .select('product_code');

        const existingCodes = new Set((existingProducts || []).map(p => p.product_code));

        // 5. Araç tiplerini ekle
        console.log('🔄 Araç tipleri ekleniyor...\n');
        let vehicleAdded = 0;
        let vehicleSkipped = 0;

        for (const vehicleType of uniqueVehicleTypes) {
            if (existingCodes.has(vehicleType)) {
                vehicleSkipped++;
                continue;
            }

            const { error } = await supabase.from('products').insert({
                product_code: vehicleType,
                product_name: vehicleType,
                category_id: vehicleCategory.id,
                is_active: true
            });

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    vehicleSkipped++;
                } else {
                    console.error(`❌ ${vehicleType} eklenirken hata:`, error.message);
                }
            } else {
                vehicleAdded++;
                console.log(`   ✅ ${vehicleType} eklendi`);
            }
        }

        console.log(`\n📊 Araç Tipleri Özeti:`);
        console.log(`   ✅ Eklenen: ${vehicleAdded}`);
        console.log(`   ⏭️  Atlanan: ${vehicleSkipped}\n`);

        // 6. Parça kodlarını ekle
        console.log('🔄 Parça kodları ekleniyor...\n');
        let partAdded = 0;
        let partSkipped = 0;

        for (const partCode of uniquePartCodes) {
            if (existingCodes.has(partCode)) {
                partSkipped++;
                continue;
            }

            const { error } = await supabase.from('products').insert({
                product_code: partCode,
                product_name: partCode,
                category_id: partsCategory.id,
                part_number: partCode,
                is_active: true
            });

            if (error) {
                if (error.code === '23505') {
                    partSkipped++;
                } else {
                    console.error(`❌ ${partCode} eklenirken hata:`, error.message);
                }
            } else {
                partAdded++;
                if (partAdded <= 10) {
                    console.log(`   ✅ ${partCode} eklendi`);
                }
            }
        }

        if (partAdded > 10) {
            console.log(`   ... ve ${partAdded - 10} parça kodu daha eklendi`);
        }

        console.log(`\n📊 Parça Kodları Özeti:`);
        console.log(`   ✅ Eklenen: ${partAdded}`);
        console.log(`   ⏭️  Atlanan: ${partSkipped}\n`);

        // 7. Özet
        console.log('================================================');
        console.log('✅ Migration tamamlandı!');
        console.log(`   📦 Toplam ${vehicleAdded + partAdded} yeni ürün eklendi`);
        console.log(`   🚗 Araç Tipleri: ${vehicleAdded} yeni`);
        console.log(`   🔧 Parça Kodları: ${partAdded} yeni`);
        console.log('\n🎉 Tüm mevcut ürünler products tablosuna aktarıldı!');
        console.log('');

    } catch (error) {
        console.error('\n❌ Migration hatası:', error.message);
        console.error(error);
        process.exit(1);
    }
}

migrateExistingProducts();

