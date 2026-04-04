/** Uygulama kısa adı — sekme başlığı ve marka metinleri */
export const APP_BRAND = 'Telefoncular QMS';

/** PDF / yazdır üst başlık (DF raporu, araç raporu vb.) */
export const PDF_COMPANY_HEADLINE = 'TELEFONCULAR';

/** PDF üst alt satır (logo yanı başlık altı) */
export const PDF_COMPANY_TAGLINE = 'Kalite Yönetim Sistemi';

/** Meta kutusu "Sistem:" satırı */
export const PDF_SYSTEM_FULL_NAME = 'Telefoncular Kalite Yönetim Sistemi';

export const PDF_LOGO_ALT = 'Telefoncular';

/** Wordmark — sidebar, giriş, PDF vb. Sekme ikonu: `public/favicon.png` + `favicon.ico` (gerçek dosya; SPA HTML’e düşmemeli). */
export const PUBLIC_BRAND_LOGO = '/logo-wordmark.png';

/**
 * public/ altında sırayla yüklenir; ilk bulunan kullanılır.
 */
export const PDF_LOGO_FILES = ['logo-wordmark.png', 'telefoncular-logo.png', 'logo.png'];

/** Eğitim sertifikası üst kurum satırı */
export const PDF_CERTIFICATE_ORG_LINE = 'TELEFONCULAR';

/**
 * Tarayıcı sekmesi: "Modül Adı | Telefoncular QMS"
 * @param {string} moduleName
 */
export function moduleTitle(moduleName) {
  const n = moduleName != null ? String(moduleName).trim() : '';
  if (!n) return APP_BRAND;
  return `${n} | ${APP_BRAND}`;
}
