type Entry = { count: number; resetAt: number }
const g = globalThis as any
g.__rl = g.__rl || new Map<string, Entry>()

export function allow(ip: string | null, key: string, limit: number, windowMs: number) {
  const id = `${ip || 'unknown'}:${key}`
  const now = Date.now()
  const e = g.__rl.get(id) as Entry | undefined
  if (!e || e.resetAt < now) {
    g.__rl.set(id, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (e.count < limit) {
    e.count += 1
    return true
  }
  return false
}
