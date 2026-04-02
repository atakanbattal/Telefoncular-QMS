-- org_all: NULL organization_id ile get_user_org_id() NULL eşleşmesi (= yerine IS NOT DISTINCT FROM)
-- Aksi halde authenticated kullanıcılar INSERT/UPDATE yapamaz (RLS violation).

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'audit_findings',
    'audits',
    'cost_settings',
    'customer_complaints',
    'customers',
    'deviations',
    'documents',
    'equipments',
    'external_documents',
    'fixtures',
    'incoming_control_plans',
    'incoming_inspections',
    'inkr_reports',
    'kaizen_entries',
    'kpis',
    'material_costs',
    'non_conformities',
    'nonconformity_records',
    'personnel',
    'process_control_plans',
    'product_categories',
    'products',
    'quality_costs',
    'quality_inspections',
    'quarantine_records',
    'sheet_metal_items',
    'stock_risk_controls',
    'supplier_non_conformities',
    'suppliers',
    'task_projects',
    'tasks',
    'trainings',
    'wps_procedures'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS org_all ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY org_all ON public.%I FOR ALL TO authenticated USING (organization_id IS NOT DISTINCT FROM get_user_org_id()) WITH CHECK (organization_id IS NOT DISTINCT FROM get_user_org_id())',
      t
    );
  END LOOP;
END $$;
