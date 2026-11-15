export function resolveApiConfig(value, isDevelopment = false) {
  const configured = value?.trim();
  if (!configured) {
    return isDevelopment
      ? { baseURL: 'http://localhost:5000/api', isConfigured: true }
      : { baseURL: '/api', isConfigured: false };
  }

  try {
    const url = new URL(configured);
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username || url.password || url.search || url.hash ||
      url.hostname === 'dashboard.render.com' ||
      (!isDevelopment && (isLocal || url.protocol !== 'https:'))
    ) {
      return { baseURL: '/api', isConfigured: false };
    }
    const base = configured.replace(/\/+$/, '');
    return { baseURL: url.pathname === '/' ? `${base}/api` : base, isConfigured: true };
  } catch {
    return { baseURL: '/api', isConfigured: false };
  }
}
