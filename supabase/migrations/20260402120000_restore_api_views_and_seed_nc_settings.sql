-- Eksik API görünümleri + uygunsuzluk ayarları varsayılan satırı (PostgREST / istemci uyumu)

-- Üretim departmanları: maliyet birimleri (cost_settings) ile uyumlu görünüm
CREATE OR REPLACE VIEW public.production_departments AS
SELECT id, unit_name AS name, created_at
FROM public.cost_settings;

GRANT SELECT ON public.production_departments TO anon, authenticated;

-- Karantina listesi API görünümü (tedarikçi + NC özet)
DROP VIEW IF EXISTS public.quarantine_records_api;
CREATE VIEW public.quarantine_records_api AS
SELECT
  qr.id,
  qr.lot_no,
  qr.part_code,
  qr.part_name,
  qr.quantity,
  qr.initial_quantity,
  qr.unit,
  qr.description,
  qr.quarantine_date,
  qr.status,
  qr.decision,
  qr.decision_date,
  qr.deviation_approval_url,
  qr.created_at,
  qr.updated_at,
  qr.user_id,
  qr.requesting_person_name,
  qr.source_department,
  qr.requesting_department,
  qr.supplier_id,
  qr.attachments,
  s.name AS supplier_name,
  nc.id AS non_conformity_id,
  nc.nc_number,
  nc.type AS non_conformity_type
FROM public.quarantine_records qr
LEFT JOIN public.suppliers s ON s.id = qr.supplier_id
LEFT JOIN public.non_conformities nc ON qr.id = nc.source_quarantine_id;

GRANT SELECT ON public.quarantine_records_api TO anon, authenticated;

-- Girdi muayene: tedarikçi adı ile tek satır (liste / rapor)
CREATE OR REPLACE VIEW public.incoming_inspections_with_supplier AS
SELECT ii.*, s.name AS supplier_name
FROM public.incoming_inspections ii
LEFT JOIN public.suppliers s ON s.id = ii.supplier_id;

GRANT SELECT ON public.incoming_inspections_with_supplier TO anon, authenticated;

-- Varsayılan uygunsuzluk eşik ayarı (single() / 406 önlemi)
INSERT INTO public.nonconformity_settings (
  df_threshold,
  eight_d_threshold,
  threshold_period_days,
  df_quantity_threshold,
  eight_d_quantity_threshold,
  auto_suggest
)
SELECT 3, 5, 30, 10, 20, true
WHERE NOT EXISTS (SELECT 1 FROM public.nonconformity_settings LIMIT 1);
