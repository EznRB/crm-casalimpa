"use strict";(()=>{var e={};e.id=2055,e.ids=[2055],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8018:e=>{e.exports=require("puppeteer")},7444:(e,t,o)=>{o.r(t),o.d(t,{originalPathname:()=>h,patchFetch:()=>w,requestAsyncStorage:()=>m,routeModule:()=>g,serverHooks:()=>b,staticGenerationAsyncStorage:()=>x});var r={};o.r(r),o.d(r,{POST:()=>f});var a=o(9303),n=o(8716),i=o(670),s=o(7070),d=o(8018),p=o.n(d),l=o(748),c=o(3895),u=o(7214);async function f(e){try{let t=Date.now(),o={requestId:e.headers.get("x-request-id")||void 0,path:e.nextUrl.pathname,method:e.method};c.k.info("api_request_start",o);let r=e.headers.get("x-forwarded-for")?.split(",")[0]||e.ip||null;if(!(0,u.c)(r,"reports-pdf",10,6e4))return c.k.warn("rate_limited",{...o}),s.NextResponse.json({error:"Muitas solicita\xe7\xf5es"},{status:429});let{user:a}=await (0,l.n)(e);if(!a)return c.k.warn("not_authenticated",o),s.NextResponse.json({error:"N\xe3o autenticado"},{status:401});let{title:n,dateRange:i,headers:d,data:f}=await e.json(),g=await p().launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox"]}),m=await g.newPage(),x=`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${n}</title>
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
            <h2>Casa Limpa - Servi\xe7os de Limpeza</h2>
            <p>Relat\xf3rio Gerencial</p>
            <p>Telefone: (11) 99999-9999 | Email: contato@casalimpa.com.br</p>
          </div>
          <h1 class="report-title">${n}</h1>
          <p class="date-range">Per\xedodo: ${i}</p>
          <p class="date-range">Data de gera\xe7\xe3o: ${new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <table>
          <thead>
            <tr>
              ${d.map(e=>`<th>${e}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${f.map((e,t)=>`
              <tr>
                ${Object.values(e).map((e,t)=>d[t].toLowerCase().includes("status")?`<td><span class="${"pending"===e?"status-pending":"confirmed"===e?"status-confirmed":"completed"===e?"status-completed":"cancelled"===e?"status-cancelled":"paid"===e?"status-paid":"pending_payment"===e?"status-pending-payment":""}">${"pending"===e?"Pendente":"confirmed"===e?"Confirmado":"completed"===e?"Conclu\xeddo":"cancelled"===e?"Cancelado":"paid"===e?"Pago":"pending_payment"===e?"Aguardando Pagamento":e}</span></td>`:"string"==typeof e&&e.startsWith("R$ ")?`<td><strong>${e}</strong></td>`:e&&(e.includes("/")||e.includes("-"))?`<td>${e}</td>`:`<td>${e||""}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Casa Limpa - Sistema de Gest\xe3o Comercial</p>
          <p>\xa9 ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </body>
      </html>
    `;await m.setContent(x,{waitUntil:"networkidle0"});let b=await m.pdf({format:"A4",printBackground:!0,margin:{top:"20mm",right:"15mm",bottom:"20mm",left:"15mm"}});await g.close();let h=(n||"relatorio").toString().toLowerCase().replace(/[^a-z0-9-_]+/g,"-"),w=new Blob([new Uint8Array(b)],{type:"application/pdf"}),y=new s.NextResponse(w,{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="${h}.pdf"`}});return c.k.info("api_request_end",{...o,status:y.status,duration_ms:Date.now()-t}),y}catch(e){return c.k.error("report_pdf_failed",{err:e?.message||String(e)}),s.NextResponse.json({error:"Failed to generate PDF report"},{status:500})}}let g=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/reports/pdf/route",pathname:"/api/reports/pdf",filename:"route",bundlePath:"app/api/reports/pdf/route"},resolvedPagePath:"C:\\Users\\Enzo Marcelo\\Desktop\\testes SOLO TRAE\\crm casa limpa\\src\\app\\api\\reports\\pdf\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:x,serverHooks:b}=g,h="/api/reports/pdf/route";function w(){return(0,i.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:x})}},3895:(e,t,o)=>{o.d(t,{k:()=>d});let r={debug:10,info:20,warn:30,error:40},a=process.env.SERVICE_NAME||"crm-casa-limpa",n=process.env.LOG_LEVEL||"info",i="pretty"===process.env.LOG_FORMAT;function s(e,t,o){if(r[e]<r[n])return;let s={ts:new Date().toISOString(),level:e,env:"production",service:a,msg:t,...o||{}};if(i){let t=`[${s.ts}] ${e.toUpperCase()} ${s.msg} ${JSON.stringify(o||{})}`;"error"===e?console.error(t):"warn"===e?console.warn(t):console.log(t)}else{let t=JSON.stringify(s);"error"===e?console.error(t):"warn"===e?console.warn(t):console.log(t)}}let d={debug:(e,t)=>s("debug",e,t),info:(e,t)=>s("info",e,t),warn:(e,t)=>s("warn",e,t),error:(e,t)=>s("error",e,t)}},7214:(e,t,o)=>{o.d(t,{c:()=>a});let r=globalThis;function a(e,t,o,a){let n=`${e||"unknown"}:${t}`,i=Date.now(),s=r.__rl.get(n);return!s||s.resetAt<i?(r.__rl.set(n,{count:1,resetAt:i+a}),!0):s.count<o&&(s.count+=1,!0)}r.__rl=r.__rl||new Map},748:(e,t,o)=>{o.d(t,{n:()=>a});var r=o(2305);async function a(e){let t=(0,r.createServerClient)("https://hyygforlvwbbdzpctnid.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eWdmb3JsdndiYmR6cGN0bmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjY1NjksImV4cCI6MjA3ODg0MjU2OX0.1ih4fZRYRzg1oqZxAYonDPi5wO2-DHvb7anjcSPWeqs",{cookies:{getAll:()=>e.cookies.getAll(),setAll(t){t.forEach(({name:t,value:o})=>e.cookies.set(t,o))}}}),{data:{user:o}}=await t.auth.getUser();return{supabase:t,user:o}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[8948,5972,2305],()=>o(7444));module.exports=r})();