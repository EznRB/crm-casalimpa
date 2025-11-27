"use strict";(()=>{var e={};e.id=3083,e.ids=[3083],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8018:e=>{e.exports=require("puppeteer")},1107:e=>{e.exports=require("puppeteer-core")},9491:e=>{e.exports=require("assert")},2361:e=>{e.exports=require("events")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},612:e=>{e.exports=require("node:os")},9411:e=>{e.exports=require("node:path")},3020:e=>{e.exports=require("node:url")},5628:e=>{e.exports=require("node:zlib")},2037:e=>{e.exports=require("os")},1017:e=>{e.exports=require("path")},2781:e=>{e.exports=require("stream")},6224:e=>{e.exports=require("tty")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},3735:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>x,patchFetch:()=>b,requestAsyncStorage:()=>m,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>f});var r={};o.r(r),o.d(r,{GET:()=>c});var a=o(9303),n=o(8716),i=o(670),s=o(7070),d=o(748),p=o(3895),l=o(7214);async function c(e,{params:t}){try{let r;let a=Date.now(),n={requestId:e.headers.get("x-request-id")||void 0,path:e.nextUrl.pathname,method:e.method};p.k.info("api_request_start",n);let i=e.headers.get("x-forwarded-for")?.split(",")[0]||e.ip||null;if(!(0,l.c)(i,"invoice-pdf",10,6e4))return p.k.warn("rate_limited",{...n}),s.NextResponse.json({error:"Muitas solicita\xe7\xf5es"},{status:429});let{supabase:c,user:u}=await (0,d.n)(e);if(!u)return p.k.warn("not_authenticated",n),s.NextResponse.json({error:"N\xe3o autenticado"},{status:401});let m=t.id,{data:f,error:g}=await c.from("invoices").select(`
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
      `).eq("id",m).single();if(g||!f)return p.k.warn("invoice_not_found",{...n}),s.NextResponse.json({error:"Fatura n\xe3o encontrada"},{status:404});let{data:x}=await c.from("company").select("*").single(),b=function(e,t){let o=e.appointments,r=o.customers,a=o.services;return`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fatura ${e.invoice_number}</title>
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
            <h1>${t?.name||"Casa Limpa"}</h1>
            <p>${t?.address?.street||"Rua Exemplo, 123"}, ${t?.address?.city||"Cidade"} - ${t?.address?.state||"UF"}</p>
            <p>CEP: ${t?.address?.zipcode||"00000-000"}</p>
            <p>CNPJ: ${t?.cnpj||"00.000.000/0000-00"}</p>
            <p>Telefone: ${t?.phone||"(00) 0000-0000"}</p>
            <p>Email: ${t?.email||"contato@casalimpa.com.br"}</p>
          </div>
          <div class="invoice-info">
            <div class="invoice-number">Fatura #${e.invoice_number}</div>
            <h2>FATURA</h2>
            <p><strong>Data de Emiss\xe3o:</strong> ${new Date(e.issue_date).toLocaleDateString("pt-BR")}</p>
            <p><strong>Data de Vencimento:</strong> ${new Date(e.due_date).toLocaleDateString("pt-BR")}</p>
            <p><strong>Status:</strong> 
              <span class="status status-${e.status}">
                ${"pending"===e.status?"Pendente":"paid"===e.status?"Pago":"overdue"===e.status?"Vencido":"Cancelado"}
              </span>
            </p>
          </div>
        </div>

        <div class="client-info">
          <h3>DADOS DO CLIENTE</h3>
          <p><strong>Nome:</strong> ${r.name}</p>
          <p><strong>Telefone:</strong> ${r.phone}</p>
          <p><strong>Email:</strong> ${r.email||"N\xe3o informado"}</p>
          ${r.address?`
            <p><strong>Endere\xe7o:</strong> ${r.address.street||""}, ${r.address.number||"S/N"} - ${r.address.neighborhood||""}</p>
            <p><strong>Cidade:</strong> ${r.address.city||""} - ${r.address.state||""}, CEP: ${r.address.zipcode||""}</p>
          `:""}
        </div>

        <div class="service-details">
          <h3>DETALHES DO SERVI\xc7O</h3>
          <table class="service-table">
            <thead>
              <tr>
                <th>Servi\xe7o</th>
                <th>Data</th>
                <th>Hor\xe1rio</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${a.name}</td>
                <td>${new Date(o.appointment_date).toLocaleDateString("pt-BR")}</td>
                <td>${o.appointment_time}</td>
                <td>R$ ${Number(o.price).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td>R$ ${e.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Taxa (${(e.tax/e.subtotal*100).toFixed(1)}%):</td>
              <td>R$ ${e.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td>R$ ${e.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        ${t?.bank_info?`
          <div class="payment-info">
            <h3>INFORMA\xc7\xd5ES PARA PAGAMENTO</h3>
            <p><strong>Banco:</strong> ${t.bank_info.bank_name||""}</p>
            <p><strong>Ag\xeancia:</strong> ${t.bank_info.agency||""}</p>
            <p><strong>Conta:</strong> ${t.bank_info.account||""}</p>
            <p><strong>PIX:</strong> ${t.bank_info.pix_key||""}</p>
          </div>
        `:""}

        ${e.notes?`
          <div class="notes">
            <h3>OBSERVA\xc7\xd5ES</h3>
            <p>${e.notes}</p>
          </div>
        `:""}

        <div class="footer">
          <p>Obrigado pela prefer\xeancia!</p>
          <p>Para d\xfavidas ou mais informa\xe7\xf5es, entre em contato conosco.</p>
        </div>
      </div>
    </body>
    </html>
  `}(f,x);try{let e=(await Promise.resolve().then(o.t.bind(o,8018,23))).default;r=await e.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox"]})}catch{try{let e=await o.e(6837).then(o.t.bind(o,6837,23)),t=(await Promise.resolve().then(o.t.bind(o,1107,23))).default;r=await t.launch({args:e.args,executablePath:await e.executablePath(),headless:!0})}catch(e){return s.NextResponse.json({error:"Ambiente n\xe3o suporta gera\xe7\xe3o de PDF"},{status:500})}}let h=await r.newPage();await h.setContent(b,{waitUntil:"networkidle0"});let v=await h.pdf({format:"A4",printBackground:!0,margin:{top:"20mm",right:"20mm",bottom:"20mm",left:"20mm"}});await r.close();let w=new Blob([new Uint8Array(v)],{type:"application/pdf"}),$=new s.NextResponse(w,{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="fatura-${f.invoice_number}.pdf"`,"Content-Length":v.length.toString()}});return p.k.info("api_request_end",{...n,status:$.status,duration_ms:Date.now()-a}),$}catch(e){return p.k.error("invoice_pdf_failed",{err:e?.message||String(e)}),s.NextResponse.json({error:"Erro ao gerar PDF"},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/invoices/[id]/pdf/route",pathname:"/api/invoices/[id]/pdf",filename:"route",bundlePath:"app/api/invoices/[id]/pdf/route"},resolvedPagePath:"C:\\Users\\Enzo Marcelo\\Desktop\\testes SOLO TRAE\\crm casa limpa\\src\\app\\api\\invoices\\[id]\\pdf\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:f,serverHooks:g}=u,x="/api/invoices/[id]/pdf/route";function b(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:f})}},3895:(e,t,o)=>{o.d(t,{k:()=>d});let r={debug:10,info:20,warn:30,error:40},a=process.env.SERVICE_NAME||"crm-casa-limpa",n=process.env.LOG_LEVEL||"info",i="pretty"===process.env.LOG_FORMAT;function s(e,t,o){if(r[e]<r[n])return;let s={ts:new Date().toISOString(),level:e,env:"production",service:a,msg:t,...o||{}};if(i){let t=`[${s.ts}] ${e.toUpperCase()} ${s.msg} ${JSON.stringify(o||{})}`;"error"===e?console.error(t):"warn"===e?console.warn(t):console.log(t)}else{let t=JSON.stringify(s);"error"===e?console.error(t):"warn"===e?console.warn(t):console.log(t)}}let d={debug:(e,t)=>s("debug",e,t),info:(e,t)=>s("info",e,t),warn:(e,t)=>s("warn",e,t),error:(e,t)=>s("error",e,t)}},7214:(e,t,o)=>{o.d(t,{c:()=>a});let r=globalThis;function a(e,t,o,a){let n=`${e||"unknown"}:${t}`,i=Date.now(),s=r.__rl.get(n);return!s||s.resetAt<i?(r.__rl.set(n,{count:1,resetAt:i+a}),!0):s.count<o&&(s.count+=1,!0)}r.__rl=r.__rl||new Map},748:(e,t,o)=>{o.d(t,{n:()=>a});var r=o(2305);async function a(e){let t=(0,r.createServerClient)("https://hyygforlvwbbdzpctnid.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eWdmb3JsdndiYmR6cGN0bmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjY1NjksImV4cCI6MjA3ODg0MjU2OX0.1ih4fZRYRzg1oqZxAYonDPi5wO2-DHvb7anjcSPWeqs",{cookies:{getAll:()=>e.cookies.getAll(),setAll(t){t.forEach(({name:t,value:o})=>e.cookies.set(t,o))}}}),{data:{user:o}}=await t.auth.getUser();return{supabase:t,user:o}}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[8948,5972,2305],()=>o(3735));module.exports=r})();