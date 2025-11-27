type Level = 'debug' | 'info' | 'warn' | 'error'
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }
const ENV = process.env.NODE_ENV || 'development'
const NAME = process.env.SERVICE_NAME || 'crm-casa-limpa'
const LEVEL = (process.env.LOG_LEVEL as Level) || (ENV === 'production' ? 'info' : 'debug')
const PRETTY = process.env.LOG_FORMAT === 'pretty'

function emit(level: Level, msg: string, extra?: Record<string, any>) {
  if (ORDER[level] < ORDER[LEVEL]) return
  const base = { ts: new Date().toISOString(), level, env: ENV, service: NAME, msg, ...(extra || {}) }
  if (PRETTY) {
    const line = `[${base.ts}] ${level.toUpperCase()} ${base.msg} ${JSON.stringify(extra || {})}`
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  } else {
    const line = JSON.stringify(base)
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  }
}

export const logger = {
  debug: (msg: string, extra?: Record<string, any>) => emit('debug', msg, extra),
  info: (msg: string, extra?: Record<string, any>) => emit('info', msg, extra),
  warn: (msg: string, extra?: Record<string, any>) => emit('warn', msg, extra),
  error: (msg: string, extra?: Record<string, any>) => emit('error', msg, extra),
}

export type LogCtx = { requestId?: string; userId?: string; path?: string; method?: string; status?: number; duration_ms?: number }

