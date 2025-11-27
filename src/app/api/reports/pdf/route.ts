import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getAuthUser } from '@/lib/supabaseServer';
import { logger } from '@/lib/logger';
import { allow } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    const start = Date.now()
    const ctx = { requestId: request.headers.get('x-request-id') || undefined, path: request.nextUrl.pathname, method: request.method }
    logger.info('api_request_start', ctx)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || (request as any).ip || null
    if (!allow(ip, 'reports-pdf', 10, 60_000)) {
      logger.warn('rate_limited', { ...ctx })
      return NextResponse.json({ error: 'Muitas solicitações' }, { status: 429 });
    }
    const { user } = await getAuthUser(request);
    if (!user) {
      logger.warn('not_authenticated', ctx)
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const { title, dateRange, headers, data }: { title: string; dateRange: string; headers: string[]; data: any[] } = await request.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .company-info {
            margin-bottom: 20px;
          }
          .company-info h2 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
          }
          .company-info p {
            margin: 5px 0;
            color: #6b7280;
          }
          .report-title {
            font-size: 28px;
            color: #1f2937;
            margin: 20px 0;
            font-weight: bold;
          }
          .date-range {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: 600;
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid #d1d5db;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .total {
            font-weight: bold;
            background-color: #f3f4f6;
          }
          .status-pending {
            color: #d97706;
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .status-confirmed {
            color: #059669;
            background-color: #d1fae5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .status-completed {
            color: #3b82f6;
            background-color: #dbeafe;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .status-cancelled {
            color: #dc2626;
            background-color: #fee2e2;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .status-paid {
            color: #059669;
            background-color: #d1fae5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .status-pending-payment {
            color: #d97706;
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h2>Casa Limpa - Serviços de Limpeza</h2>
            <p>Relatório Gerencial</p>
            <p>Telefone: (11) 99999-9999 | Email: contato@casalimpa.com.br</p>
          </div>
          <h1 class="report-title">${title}</h1>
          <p class="date-range">Período: ${dateRange}</p>
          <p class="date-range">Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <table>
          <thead>
            <tr>
              ${headers.map((header: string) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row: any, index: number) => `
              <tr>
                ${Object.values(row).map((value: any, i) => {
                  // Handle status badges
                  if (headers[i].toLowerCase().includes('status')) {
                    const statusClass = value === 'pending' ? 'status-pending' :
                                      value === 'confirmed' ? 'status-confirmed' :
                                      value === 'completed' ? 'status-completed' :
                                      value === 'cancelled' ? 'status-cancelled' :
                                      value === 'paid' ? 'status-paid' :
                                      value === 'pending_payment' ? 'status-pending-payment' : '';
                    
                    const statusText = value === 'pending' ? 'Pendente' :
                                     value === 'confirmed' ? 'Confirmado' :
                                     value === 'completed' ? 'Concluído' :
                                     value === 'cancelled' ? 'Cancelado' :
                                     value === 'paid' ? 'Pago' :
                                     value === 'pending_payment' ? 'Aguardando Pagamento' : value;
                    
                    return `<td><span class="${statusClass}">${statusText}</span></td>`;
                  }
                  
                  // Handle currency values
                  if (typeof value === 'string' && value.startsWith('R$ ')) {
                    return `<td><strong>${value}</strong></td>`;
                  }
                  
                  // Handle dates
                  if (value && (value.includes('/') || value.includes('-'))) {
                    return `<td>${value}</td>`;
                  }
                  
                  return `<td>${value || ''}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Casa Limpa - Sistema de Gestão Comercial</p>
          <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    const safeTitle = (title || 'relatorio').toString().toLowerCase().replace(/[^a-z0-9-_]+/g, '-');
    const blob = new Blob([new Uint8Array(pdf)], { type: 'application/pdf' })
    const res = new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`
      }
    });
    logger.info('api_request_end', { ...ctx, status: res.status, duration_ms: Date.now() - start })
    return res;

  } catch (error) {
    logger.error('report_pdf_failed', { err: (error as any)?.message || String(error) });
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}
