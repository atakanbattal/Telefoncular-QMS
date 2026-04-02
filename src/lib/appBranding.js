/** Uygulama kısa adı — sekme başlığı ve marka metinleri */
export const APP_BRAND = 'Telefoncular QMS';

/**
 * Tarayıcı sekmesi: "Modül Adı | Telefoncular QMS"
 * @param {string} moduleName
 */
export function moduleTitle(moduleName) {
  const n = moduleName != null ? String(moduleName).trim() : '';
  if (!n) return APP_BRAND;
  return `${n} | ${APP_BRAND}`;
}
