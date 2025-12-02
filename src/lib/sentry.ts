let sentryReady = false

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) return
  if (sentryReady) return
  Promise.resolve().then(async () => {
    try {
      const S = await import('@sentry/nextjs')
      S.init({ dsn, tracesSampleRate: 0.1, environment: process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV, release: process.env.NEXT_PUBLIC_SENTRY_RELEASE })
      sentryReady = true
    } catch {}
  })
}

export async function captureError(type: string, message?: string, context?: any) {
  try {
    if (sentryReady) {
      const S = await import('@sentry/nextjs')
      S.captureMessage(`${type}: ${message || ''}`, { level: 'error', extra: context || {} })
    }
  } catch {}
  try {
    await fetch('/api/admin/errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, message: message || null, context: context || {} }) })
  } catch {}
}

export async function captureMetric(name: string, data?: any) {
  try {
    if (sentryReady) {
      const S = await import('@sentry/nextjs')
      S.addBreadcrumb({ category: 'metric', message: name, data })
    }
  } catch {}
  try {
    await fetch('/api/admin/errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: name, message: null, context: data || {} }) })
  } catch {}
}

