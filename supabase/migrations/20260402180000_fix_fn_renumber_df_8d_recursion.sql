-- fn_renumber_df_8d: AFTER INSERT/UPDATE içinde non_conformities üzerinde toplu UPDATE yapıyor.
-- Bu UPDATE'ler aynı AFTER UPDATE tetikleyicisini tekrar çalıştırıp stack depth limit (54001) hatasına yol açıyordu.
-- Çözüm: Yalnızca en dış tetikleyici çağrısında (pg_trigger_depth() = 1) yeniden numaralandırma yap.

CREATE OR REPLACE FUNCTION public.fn_renumber_df_8d()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_type TEXT;
  v_yil INT;
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_type := OLD.type;
    v_yil := EXTRACT(YEAR FROM COALESCE(OLD.opening_date::timestamp, OLD.df_opened_at, OLD.created_at))::int;
  ELSE
    v_type := NEW.type;
    v_yil := EXTRACT(YEAR FROM COALESCE(NEW.opening_date::timestamp, NEW.df_opened_at, NEW.created_at))::int;
  END IF;

  IF v_type NOT IN ('DF', '8D') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.non_conformities
  SET nc_number = 'TMP-' || id::text
  WHERE type = v_type
    AND EXTRACT(YEAR FROM COALESCE(opening_date::timestamp, df_opened_at, created_at))::int = v_yil
    AND nc_number NOT LIKE 'TMP-%'
    AND nc_number NOT LIKE '%-D%';

  WITH ranked AS (
    SELECT
      id,
      CASE WHEN opening_date IS NOT NULL OR df_opened_at IS NOT NULL THEN 0 ELSE 1 END AS grp,
      COALESCE(opening_date::timestamp, df_opened_at, created_at) AS siralama_tarihi,
      created_at
    FROM public.non_conformities
    WHERE type = v_type
      AND EXTRACT(YEAR FROM COALESCE(opening_date::timestamp, df_opened_at, created_at))::int = v_yil
      AND nc_number NOT LIKE '%-D%'
  ),
  numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY grp ASC, siralama_tarihi ASC, created_at ASC) AS yeni_sira
    FROM ranked
  )
  UPDATE public.non_conformities nc
  SET nc_number = v_type || '-' || v_yil || '-' || LPAD(n.yeni_sira::text, 3, '0')
  FROM numbered n
  WHERE nc.id = n.id;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

COMMENT ON FUNCTION public.fn_renumber_df_8d() IS 'DF/8D nc_number yıl bazlı yeniden sıralama. İç içe tetikleyici çağrılarında pg_trigger_depth ile atlanır (54001 önleme).';
