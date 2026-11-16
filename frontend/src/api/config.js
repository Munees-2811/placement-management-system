export const DEFAULT_PRODUCTION_API_URL =
  'https://placement-management-system-kc5t.onrender.com/api';

export function resolveApiConfig(value, isDevelopment = false) {
  const configured = value?.trim();
  if (!configured) {
    return {
      baseURL: isDevelopment ? 'http://localhost:5000/api' : DEFAULT_PRODUCTION_API_URL,
      isConfigured: true,
    };
  }

  try {
    const url = new URL(configured);
    const base = configured.replace(/\/+$/, '');
    return {
      baseURL: url.pathname === '/' ? `${base}/api` : base,
      isConfigured: true,
    };
  } catch {
    return {
      baseURL: configured.replace(/\/+$/, ''),
      isConfigured: true,
    };
  }
}
