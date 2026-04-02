/**
 * Araç Tiplerini Standartlaştırma Scripti
 * Benzer kayıtları birleştirir ve standart formata çevirir
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ryvczrubujzlanvqiqlk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbnZvYXRpcmZjenBrbGFhbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjgxNDgxMiwiZXhwIjoyMDcyMzkwODEyfQ.2YJmKcpk1kHbAOc-H9s37NbUY74QJuqIYB1Z2ssusa4';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Standartlaştırma kuralları
const STANDARDIZATION_RULES = {
    // Küçük harfli versiyonlar -> Büyük harfli standart versiyonlar
    'aga6000': 'AGA6000',
    'aga2100': 'AGA2100',
    'aga3000': 'AGA3000',
    'kdm35': 'KDM 35',
    'kdm 35': 'KDM 35',
    'kdm70': 'KDM 70',
    'kdm 70': 'KDM 70',
    'kdm80': 'KDM 80',
    'kdm 80': 'KDM 80',
    'hsck': 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)',
    'hsc': 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)',
    'hsc k': 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)',
};

// Normalize fonksiyonu (karşılaştırma için)
function normalizeVehicleType(type) {
    if (!type) return '';
    return type.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Standartlaştırma fonksiyonu
function standardizeVehicleType(type) {
    if (!type) return type;
    
    const normalized = normalizeVehicleType(type);
    
    // Önce tam eşleşme kontrolü
    if (STANDARDIZATION_RULES[normalized]) {
        return STANDARDIZATION_RULES[normalized];
    }
    
    // Kısmi eşleşme kontrolü
    for (const [key, value] of Object.entries(STANDARDIZATION_RULES)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    // Özel durumlar
    if (normalized.includes('aga') && normalized.includes('6000')) {
        return 'AGA6000';
    }
    if (normalized.includes('aga') && normalized.includes('2100')) {
        return 'AGA2100';
    }
    if (normalized.includes('aga') && normalized.includes('3000')) {
        return 'AGA3000';
    }
    if (normalized.includes('kdm') && (normalized.includes('35') || normalized === 'kdm35')) {
        return 'KDM 35';
    }
    if (normalized.includes('kdm') && (normalized.includes('70') || normalized === 'kdm70')) {
        return 'KDM 70';
    }
    if (normalized.includes('kdm') && (normalized.includes('80') || normalized === 'kdm80')) {
        return 'KDM 80';
    }
    if (normalized.includes('hsck') || normalized.includes('hsc')) {
        return 'HSCK (Hidrolik Sıkıştırmalı Çöp Kamyonu)';
    }
    
    return type; // Değişiklik yoksa orijinalini döndür
}

async function standardizeVehicleTypes() {
    console.log('🚀 Araç Tiplerini Standartlaştırma Başlatılıyor...\n');

    try {
        // 1. Products tablosundaki araç tiplerini al
        const { data: vehicleCategory } = await supabase
            .from('product_categories')
            .select('id')
            .eq('category_code', 'VEHICLE_TYPES')
            .single();

        if (!vehicleCategory) {
            throw new Error('VEHICLE_TYPES kategorisi bulunamadı!');
        }

        const { data: vehicleProducts, error: productsError } = await supabase
            .from('products')
            .select('id, product_code, product_name')
            .eq('category_id', vehicleCategory.id);

        if (productsError) throw productsError;

        console.log(`📋 ${vehicleProducts.length} araç tipi bulundu\n`);

        // 2. Benzersiz araç tiplerini grupla
        const vehicleTypeMap = new Map();
        vehicleProducts.forEach(product => {
            const standardized = standardizeVehicleType(product.product_name || product.product_code);
            const normalized = normalizeVehicleType(standardized);
            
            if (!vehicleTypeMap.has(normalized)) {
                vehicleTypeMap.set(normalized, {
                    standard: standardized,
                    products: []
                });
            }
            vehicleTypeMap.get(normalized).products.push(product);
        });

        console.log(`📊 ${vehicleTypeMap.size} benzersiz standart araç tipi oluşturuldu\n`);

        // 3. Güncelleme planını oluştur
        const updates = [];
        const deletions = [];

        for (const [normalized, group] of vehicleTypeMap.entries()) {
            if (group.products.length === 1) {
                const product = group.products[0];
                const currentName = product.product_name || product.product_code;
                const standardized = standardizeVehicleType(currentName);
                
                if (currentName !== standardized) {
                    updates.push({
                        id: product.id,
                        old: currentName,
                        new: standardized
                    });
                }
            } else {
                // Birden fazla ürün var, birleştir
                const standardized = group.standard;
                const mainProduct = group.products[0]; // İlkini ana olarak kullan
                const others = group.products.slice(1);

                // Ana ürünü güncelle
                const currentName = mainProduct.product_name || mainProduct.product_code;
                if (currentName !== standardized) {
                    updates.push({
                        id: mainProduct.id,
                        old: currentName,
                        new: standardized
                    });
                }

                // Diğerlerini silinecekler listesine ekle
                others.forEach(product => {
                    deletions.push({
                        id: product.id,
                        name: product.product_name || product.product_code
                    });
                });
            }
        }

        console.log(`📝 ${updates.length} ürün güncellenecek`);
        console.log(`🗑️  ${deletions.length} ürün silinecek (duplicate)\n`);

        // 4. Veritabanındaki tüm vehicle_type referanslarını bul ve güncelle
        console.log('🔄 Veritabanı referansları güncelleniyor...\n');

        const tablesToUpdate = [
            { table: 'quality_costs', column: 'vehicle_type' },
            { table: 'deviations', column: 'vehicle_type' },
            { table: 'quality_inspections', column: 'vehicle_type' },
            { table: 'kaizen_entries', column: 'vehicle_type' }
        ];

        let totalUpdated = 0;

        for (const { table, column } of tablesToUpdate) {
            try {
                // Önce tablonun var olup olmadığını kontrol et
                const { data: sampleData, error: checkError } = await supabase
                    .from(table)
                    .select(column)
                    .limit(1);

                if (checkError && checkError.code === '42P01') {
                    console.log(`   ⏭️  ${table} tablosu bulunamadı, atlanıyor`);
                    continue;
                }

                // Tüm benzersiz vehicle_type değerlerini al
                const { data: records, error: fetchError } = await supabase
                    .from(table)
                    .select(`id, ${column}`)
                    .not(column, 'is', null);

                if (fetchError) {
                    console.log(`   ⚠️  ${table} tablosundan veri çekilemedi: ${fetchError.message}`);
                    continue;
                }

                if (!records || records.length === 0) {
                    console.log(`   ℹ️  ${table} tablosunda güncellenecek kayıt yok`);
                    continue;
                }

                // Her kayıt için standartlaştırma yap
                let tableUpdated = 0;
                for (const record of records) {
                    const oldValue = record[column];
                    if (!oldValue) continue;

                    const standardized = standardizeVehicleType(oldValue);
                    if (oldValue !== standardized) {
                        const { error: updateError } = await supabase
                            .from(table)
                            .update({ [column]: standardized })
                            .eq('id', record.id);

                        if (updateError) {
                            console.error(`   ❌ ${table} - ID ${record.id} güncellenemedi: ${updateError.message}`);
                        } else {
                            tableUpdated++;
                        }
                    }
                }

                if (tableUpdated > 0) {
                    console.log(`   ✅ ${table}: ${tableUpdated} kayıt güncellendi`);
                    totalUpdated += tableUpdated;
                } else {
                    console.log(`   ℹ️  ${table}: Güncellenecek kayıt yok`);
                }
            } catch (err) {
                console.error(`   ❌ ${table} işlenirken hata: ${err.message}`);
            }
        }

        // 5. Products tablosunu güncelle
        console.log('\n🔄 Products tablosu güncelleniyor...\n');
        let productsUpdated = 0;
        let productsDeleted = 0;

        for (const update of updates) {
            const { error } = await supabase
                .from('products')
                .update({
                    product_code: update.new,
                    product_name: update.new
                })
                .eq('id', update.id);

            if (error) {
                console.error(`   ❌ ${update.old} -> ${update.new} güncellenemedi: ${error.message}`);
            } else {
                console.log(`   ✅ ${update.old} -> ${update.new}`);
                productsUpdated++;
            }
        }

        // 6. Duplicate ürünleri sil
        console.log('\n🗑️  Duplicate ürünler siliniyor...\n');
        for (const deletion of deletions) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', deletion.id);

            if (error) {
                console.error(`   ❌ ${deletion.name} silinemedi: ${error.message}`);
            } else {
                console.log(`   ✅ ${deletion.name} silindi`);
                productsDeleted++;
            }
        }

        // 7. Özet
        console.log('\n================================================');
        console.log('✅ Standartlaştırma tamamlandı!');
        console.log(`   📦 Products: ${productsUpdated} güncellendi, ${productsDeleted} silindi`);
        console.log(`   🔄 Veritabanı referansları: ${totalUpdated} kayıt güncellendi`);
        console.log('\n🎉 Tüm araç tipleri standartlaştırıldı!');
        console.log('');

    } catch (error) {
        console.error('\n❌ Standartlaştırma hatası:', error.message);
        console.error(error);
        process.exit(1);
    }
}

standardizeVehicleTypes();

