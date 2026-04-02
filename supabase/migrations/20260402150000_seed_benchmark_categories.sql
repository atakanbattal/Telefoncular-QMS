-- Varsayılan benchmark kategorileri (boş tabloya tek seferlik)
INSERT INTO public.benchmark_categories (name, description, color, icon, order_index, is_active)
SELECT v.name, v.description, v.color, v.icon, v.order_index, true
FROM (
  VALUES
    ('Ürün Karşılaştırma', 'Ürün özellikleri ve performans kıyaslamaları', '#3B82F6', 'Package', 1),
    ('Süreç Karşılaştırma', 'İş süreçleri ve metodoloji kıyaslamaları', '#10B981', 'Workflow', 2),
    ('Teknoloji Karşılaştırma', 'Teknoloji ve yazılım çözümleri kıyaslamaları', '#F59E0B', 'Cpu', 3),
    ('Tedarikçi Karşılaştırma', 'Tedarikçi kalite ve maliyet kıyaslamaları', '#8B5CF6', 'Truck', 4),
    ('Ekipman Karşılaştırma', 'Makine ve ekipman yatırım kıyaslamaları', '#EF4444', 'Settings', 5),
    ('Malzeme Karşılaştırma', 'Hammadde ve malzeme alternatif kıyaslamaları', '#06B6D4', 'Box', 6)
) AS v(name, description, color, icon, order_index)
WHERE NOT EXISTS (SELECT 1 FROM public.benchmark_categories LIMIT 1);
