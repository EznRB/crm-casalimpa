const HF_MODEL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'

export async function callHF(prompt: string) {
  const token = process.env.HF_ACCESS_TOKEN
  if (!token) return null
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 15000)
  const res = await fetch(HF_MODEL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512, temperature: 0.7, top_p: 0.9 } }),
    signal: controller.signal,
  })
  clearTimeout(t)
  if (!res.ok) return null
  const data = await res.json()
  if (Array.isArray(data) && data[0]?.generated_text) return String(data[0].generated_text)
  if (typeof data === 'string') return data
  return JSON.stringify(data)
}
