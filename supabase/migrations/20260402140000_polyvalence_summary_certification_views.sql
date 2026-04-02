-- Polivalans: özet ve sertifika uyarı görünümleri (PolyvalenceModule REST)
-- Kaynak: scripts/create-polyvalence-views.sql

CREATE OR REPLACE VIEW public.polyvalence_summary AS
SELECT
    p.id AS personnel_id,
    p.full_name,
    p.department,
    p.job_title,
    COUNT(ps.id) AS total_skills,
    COUNT(CASE WHEN ps.current_level >= 3 THEN 1 END) AS proficient_skills,
    CASE
        WHEN COUNT(ps.id) > 0 THEN
            ROUND((COUNT(CASE WHEN ps.current_level >= 3 THEN 1 END)::NUMERIC / COUNT(ps.id)::NUMERIC) * 100, 1)
        ELSE 0
    END AS polyvalence_score,
    COUNT(CASE WHEN ps.training_required = true THEN 1 END) AS training_needs,
    MAX(ps.last_training_date) AS last_training_date,
    MAX(ps.last_assessment_date) AS last_assessment_date
FROM public.personnel p
LEFT JOIN public.personnel_skills ps ON p.id = ps.personnel_id
GROUP BY p.id, p.full_name, p.department, p.job_title
ORDER BY polyvalence_score DESC;

GRANT SELECT ON public.polyvalence_summary TO anon, authenticated;

CREATE OR REPLACE VIEW public.certification_expiry_alerts AS
SELECT
    ps.id,
    ps.personnel_id,
    p.full_name AS personnel_name,
    ps.skill_id,
    s.name AS skill_name,
    s.code AS skill_code,
    ps.certification_expiry_date,
    ps.is_certified,
    CASE
        WHEN ps.certification_expiry_date IS NULL THEN NULL
        ELSE ps.certification_expiry_date - CURRENT_DATE
    END AS days_remaining,
    CASE
        WHEN ps.certification_expiry_date IS NULL THEN 'Sertifika Yok'
        WHEN ps.certification_expiry_date < CURRENT_DATE THEN 'Süresi Dolmuş'
        WHEN ps.certification_expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Kritik (30 gün içinde)'
        WHEN ps.certification_expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'Uyarı (90 gün içinde)'
        ELSE 'Geçerli'
    END AS status
FROM public.personnel_skills ps
INNER JOIN public.personnel p ON ps.personnel_id = p.id
INNER JOIN public.skills s ON ps.skill_id = s.id
WHERE s.requires_certification = true
  AND ps.is_certified = true
ORDER BY ps.certification_expiry_date ASC NULLS LAST;

GRANT SELECT ON public.certification_expiry_alerts TO anon, authenticated;
