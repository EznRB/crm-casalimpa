import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    const quoteId = params.id

    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (id, name, phone, email, address),
        services (id, name, base_price, duration_minutes),
        quote_items (* ),
        quote_images (* )
      `)
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
    }

    const { data: company } = await supabase.from('company').select('*').single()

    const html = generateQuoteHTML(quote, company)

    let browser: any
    try {
      const puppeteer = (await import('puppeteer')).default
      browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    } catch {
      try {
        const chromium: any = await import('@sparticuz/chromium')
        const puppeteerCore = (await import('puppeteer-core')).default
        browser = await puppeteerCore.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true })
      } catch (e) {
        return NextResponse.json({ error: 'Ambiente não suporta geração de PDF' }, { status: 500 })
      }
    }

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' } })
    await browser.close()

    const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' })
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="orcamento-${quote.id}.pdf"`,
        'Content-Length': pdf.length.toString(),
      },
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}

function generateQuoteHTML(quote: any, company: any) {
  const customer = quote.customers
  const service = quote.services
  const items = quote.quote_items || []
  const images = quote.quote_images || []
  const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.total || 0), 0)
  const total = Number(quote.total || subtotal - Number(quote.discount || 0) + Number(quote.taxes || 0))

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Orçamento ${quote.id}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .band { background: #10b981; height: 72px; display: flex; align-items: center; justify-content: center; }
        .logo { height: 56px; margin-top: -28px; border-radius: 8px; background: #fff; padding: 8px; display: inline-block; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .company-block { text-align: center; margin-top: 6px; }
        .company-block h1 { margin: 6px 0 2px 0; font-size: 16px; font-weight: 600; }
        .company-block p { margin: 2px 0; font-size: 12px; color: #374151; }
        .title { text-align: center; font-size: 22px; font-weight: 700; margin: 16px 0; }
        .client-meta { color: #4b5563; margin: 8px 0 16px 0; }
        .section h3 { margin: 16px 0 8px 0; font-size: 18px; color: #111827; }
        .section p { margin: 6px 0; line-height: 1.6; }
        ul { margin: 6px 0; padding-left: 20px; }
        li { margin: 4px 0; }
        .gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
        .gallery img { width: 100%; height: 80px; object-fit: cover; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
        th { background: #f9fafb; color: #374151; }
        .totals { display: flex; justify-content: flex-end; margin-top: 12px; }
        .totals table { width: 320px; }
        .totals .total-row { font-weight: bold; border-top: 2px solid #e5e7eb; }
        .badges { display: flex; gap: 8px; margin: 8px 0; }
        .badge { border: 1px solid #111827; border-radius: 16px; padding: 4px 10px; font-size: 12px; }
        .sign-row { display: flex; justify-content: space-between; margin-top: 28px; }
        .sign-line { border-top: 1px solid #111827; width: 45%; text-align: center; padding-top: 6px; font-size: 12px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="band"></div>
      <div class="container">
        <div class="company-block">
          ${company?.logo_url ? `<img class="logo" src="${company.logo_url}" />` : ''}
          <h1>${company?.name || 'Casa Limpa especialista em limpeza'}</h1>
          <p>${company?.cnpj || ''}</p>
          <p>${company?.address?.street || ''}, ${company?.address?.city || ''} - ${company?.address?.state || ''}</p>
          <p>${company?.phone || ''}</p>
        </div>
        <div class="title">${quote.title || 'Orçamento'}</div>
        ${quote.client_label || quote.client_subtitle ? `<div class="client-meta">${[quote.client_label, quote.client_subtitle].filter(Boolean).join('<br/>')}</div>` : ''}

        <div class="section">
          <h3>Relatório Inicial</h3>
          ${quote.initial_report ? `<p>${quote.initial_report}</p>` : '<p>—</p>'}
        </div>

        <div class="section">
          <h3>Descrição das atividades</h3>
          ${Array.isArray(quote.activities) && quote.activities.length ? `<ul>${quote.activities.map((a: any) => `<li>${a}</li>`).join('')}</ul>` : '<p>—</p>'}
        </div>
        ${images.length ? `<div class="section"><h3>Imagens</h3><div class="gallery">${images.map((img: any) => `<img src="${img.url}" />`).join('')}</div></div>` : ''}
        <div class="section"><h3>Preços</h3>

        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Unidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it: any) => `
              <tr>
                <td>${it.description}</td>
                <td>${it.quantity}</td>
                <td>${it.unit || 'un'}</td>
                <td>R$ ${Number(it.unit_price || 0).toFixed(2)}</td>
                <td>R$ ${Number(it.total || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td>R$ ${subtotal.toFixed(2)}</td></tr>
            <tr><td>Desconto:</td><td>R$ ${Number(quote.discount || 0).toFixed(2)}</td></tr>
            <tr><td>Taxas:</td><td>R$ ${Number(quote.taxes || 0).toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total:</td><td>R$ ${total.toFixed(2)}</td></tr>
          </table>
        </div>
        </div>
        <div class="section"><h3>Métodos de pagamento</h3>
          ${Array.isArray(quote.payment_methods) && quote.payment_methods.length ? `<div class="badges">${quote.payment_methods.map((pm: any) => `<span class="badge">${pm}</span>`).join('')}</div>` : '<p>—</p>'}
        </div>
        <div class="section"><h3>Condições de contrato</h3>
          ${quote.contract_terms ? `<p>${quote.contract_terms}</p>` : '<p>—</p>'}
        </div>
        <div class="sign-row">
          <div class="sign-line">${company?.name || 'Casa Limpa'}</div>
          <div class="sign-line">${quote.client_label || customer?.name || 'Cliente'}</div>
        </div>

        ${quote.notes ? `<div class="notes"><h3>OBSERVAÇÕES</h3><p>${quote.notes}</p></div>` : ''}
        ${quote.rich_content?.html ? `<div class="notes">${quote.rich_content.html}</div>` : ''}

        <div class="footer">
          <p>Obrigado pela preferência!</p>
          <p>Criado em ${new Date(quote.created_at || Date.now()).toLocaleDateString('pt-BR')}.</p>
          ${quote.sign_url ? `<p><a href="${quote.sign_url}">assinar documento online</a></p>` : ''}
        </div>
      </div>
    </body>
  </html>
  `
}
