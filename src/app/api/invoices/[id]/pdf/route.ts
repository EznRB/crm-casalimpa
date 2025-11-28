import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'
import { logger } from '@/lib/logger'
import { allow } from '@/lib/ratelimit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const start = Date.now()
    const ctx = { requestId: request.headers.get('x-request-id') || undefined, path: request.nextUrl.pathname, method: request.method }
    logger.info('api_request_start', ctx)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || null
    if (!allow(ip, 'invoice-pdf', 10, 60_000)) {
      logger.warn('rate_limited', { ...ctx })
      return NextResponse.json({ error: 'Muitas solicitações' }, { status: 429 })
    }
    const { supabase, user } = await getAuthUser(request)
    if (!user) {
      logger.warn('not_authenticated', ctx)
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    const invoiceId = params.id

    // Fetch invoice data with related information
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        appointments (
          id,
          appointment_date,
          appointment_time,
          price,
          notes,
          customers (id, name, phone, email, address),
          services (id, name, base_price, duration_minutes)
        )
      `)
      .eq('id', invoiceId)
      .eq('owner_user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      logger.warn('invoice_not_found', { ...ctx })
      return NextResponse.json(
        { error: 'Fatura não encontrada' },
        { status: 404 }
      )
    }

    // Fetch company information
    const { data: company } = await supabase
      .from('company')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    // Generate HTML for the invoice
    const html = generateInvoiceHTML(invoice, company)

    // Generate PDF (adaptive: puppeteer or puppeteer-core + chromium)
    let browser: any
    try {
      const puppeteer = (await import('puppeteer')).default
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    } catch {
      try {
        const chromium: any = await import('@sparticuz/chromium')
        const puppeteerCore = (await import('puppeteer-core')).default
        browser = await puppeteerCore.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true
        })
      } catch (e) {
        return NextResponse.json(
          { error: 'Ambiente não suporta geração de PDF' },
          { status: 500 }
        )
      }
    }
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })

    await browser.close()

    // Return PDF
    const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' })
    const res = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="fatura-${invoice.invoice_number}.pdf"`,
        'Content-Length': pdf.length.toString()
      }
    })
    logger.info('api_request_end', { ...ctx, status: res.status, duration_ms: Date.now() - start })
    return res

  } catch (error) {
    logger.error('invoice_pdf_failed', { err: (error as any)?.message || String(error) })
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any, company: any) {
  const appointment = invoice.appointments
  const customer = appointment.customers
  const service = appointment.services

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fatura ${invoice.invoice_number}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .company-info h1 {
          color: #1f2937;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .company-info p {
          margin: 2px 0;
          color: #6b7280;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-info h2 {
          color: #1f2937;
          font-size: 20px;
          margin: 0 0 10px 0;
        }
        .invoice-info p {
          margin: 2px 0;
          color: #6b7280;
        }
        .invoice-number {
          font-size: 18px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .client-info {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .client-info h3 {
          color: #1f2937;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .client-info p {
          margin: 4px 0;
          color: #6b7280;
        }
        .service-details {
          margin-bottom: 30px;
        }
        .service-details h3 {
          color: #1f2937;
          margin: 0 0 15px 0;
          font-size: 16px;
        }
        .service-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .service-table th,
        .service-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .service-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .totals-table {
          width: 300px;
        }
        .totals-table td {
          padding: 8px 12px;
          text-align: right;
        }
        .totals-table .total-row {
          font-weight: bold;
          font-size: 16px;
          color: #1f2937;
          border-top: 2px solid #e5e7eb;
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-overdue {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .status-cancelled {
          background-color: #f3f4f6;
          color: #374151;
        }
        .notes {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .notes h3 {
          color: #1f2937;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .notes p {
          margin: 0;
          color: #6b7280;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        .payment-info {
          background-color: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .payment-info h3 {
          color: #1e40af;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .payment-info p {
          margin: 4px 0;
          color: #1e40af;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${company?.name || 'Casa Limpa'}</h1>
            <p>${company?.address?.street || 'Rua Exemplo, 123'}, ${company?.address?.city || 'Cidade'} - ${company?.address?.state || 'UF'}</p>
            <p>CEP: ${company?.address?.zipcode || '00000-000'}</p>
            <p>CNPJ: ${company?.cnpj || '00.000.000/0000-00'}</p>
            <p>Telefone: ${company?.phone || '(00) 0000-0000'}</p>
            <p>Email: ${company?.email || 'contato@casalimpa.com.br'}</p>
          </div>
          <div class="invoice-info">
            <div class="invoice-number">Fatura #${invoice.invoice_number}</div>
            <h2>FATURA</h2>
            <p><strong>Data de Emissão:</strong> ${new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Data de Vencimento:</strong> ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}</p>
            <p><strong>Status:</strong> 
              <span class="status status-${invoice.status}">
                ${invoice.status === 'pending' ? 'Pendente' : 
                  invoice.status === 'paid' ? 'Pago' : 
                  invoice.status === 'overdue' ? 'Vencido' : 'Cancelado'}
              </span>
            </p>
          </div>
        </div>

        <div class="client-info">
          <h3>DADOS DO CLIENTE</h3>
          <p><strong>Nome:</strong> ${customer.name}</p>
          <p><strong>Telefone:</strong> ${customer.phone}</p>
          <p><strong>Email:</strong> ${customer.email || 'Não informado'}</p>
          ${customer.address ? `
            <p><strong>Endereço:</strong> ${customer.address.street || ''}, ${customer.address.number || 'S/N'} - ${customer.address.neighborhood || ''}</p>
            <p><strong>Cidade:</strong> ${customer.address.city || ''} - ${customer.address.state || ''}, CEP: ${customer.address.zipcode || ''}</p>
          ` : ''}
        </div>

        <div class="service-details">
          <h3>DETALHES DO SERVIÇO</h3>
          <table class="service-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${service.name}</td>
                <td>${new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</td>
                <td>${appointment.appointment_time}</td>
                <td>R$ ${Number(appointment.price).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td>R$ ${invoice.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Taxa (${(invoice.tax / invoice.subtotal * 100).toFixed(1)}%):</td>
              <td>R$ ${invoice.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td>R$ ${invoice.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        ${company?.bank_info ? `
          <div class="payment-info">
            <h3>INFORMAÇÕES PARA PAGAMENTO</h3>
            <p><strong>Banco:</strong> ${company.bank_info.bank_name || ''}</p>
            <p><strong>Agência:</strong> ${company.bank_info.agency || ''}</p>
            <p><strong>Conta:</strong> ${company.bank_info.account || ''}</p>
            <p><strong>PIX:</strong> ${company.bank_info.pix_key || ''}</p>
          </div>
        ` : ''}

        ${invoice.notes ? `
          <div class="notes">
            <h3>OBSERVAÇÕES</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Obrigado pela preferência!</p>
          <p>Para dúvidas ou mais informações, entre em contato conosco.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
