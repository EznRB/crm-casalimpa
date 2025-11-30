import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY
    if (!key) return NextResponse.json({ error: 'Whisper indisponível' }, { status: 501 })
    const fd = await request.formData()
    const file = fd.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })
    const form = new FormData()
    form.append('model', 'whisper-1')
    form.append('file', file)
    form.append('language', 'pt')
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err?.error?.message || 'Falha na transcrição' }, { status: 400 })
    }
    const data = await res.json()
    return NextResponse.json({ text: data?.text || '' })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro de transcrição' }, { status: 400 })
  }
}

