export function resolveApiConfig(value, isDevelopment = false) {
  const configured = value?.trim();
  if (!configured) {
    return {
      baseURL: isDevelopment ? 'http://localhost:5000/api' : '/api',
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
