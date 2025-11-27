"use strict";(()=>{var e={};e.id=7727,e.ids=[7727],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8018:e=>{e.exports=require("puppeteer")},1107:e=>{e.exports=require("puppeteer-core")},9491:e=>{e.exports=require("assert")},2361:e=>{e.exports=require("events")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},612:e=>{e.exports=require("node:os")},9411:e=>{e.exports=require("node:path")},3020:e=>{e.exports=require("node:url")},5628:e=>{e.exports=require("node:zlib")},2037:e=>{e.exports=require("os")},1017:e=>{e.exports=require("path")},2781:e=>{e.exports=require("stream")},6224:e=>{e.exports=require("tty")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},801:(e,t,i)=>{i.r(t),i.d(t,{originalPathname:()=>x,patchFetch:()=>g,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>m});var a={};i.r(a),i.d(a,{GET:()=>p});var r=i(9303),o=i(8716),s=i(670),n=i(7070),d=i(748);async function p(e,{params:t}){try{let a;let{supabase:r,user:o}=await (0,d.n)(e);if(!o)return n.NextResponse.json({error:"N\xe3o autenticado"},{status:401});let s=t.id,{data:p,error:l}=await r.from("quotes").select(`
        *,
        customers (id, name, phone, email, address),
        services (id, name, base_price, duration_minutes),
        quote_items (* ),
        quote_images (* )
      `).eq("id",s).single();if(l||!p)return n.NextResponse.json({error:"Or\xe7amento n\xe3o encontrado"},{status:404});let{data:c}=await r.from("company").select("*").single(),m=function(e,t){let i=e.customers;e.services;let a=e.quote_items||[],r=e.quote_images||[],o=a.reduce((e,t)=>e+Number(t.total||0),0),s=Number(e.total||o-Number(e.discount||0)+Number(e.taxes||0));return`
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Or\xe7amento ${e.id}</title>
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
          ${t?.logo_url?`<img class="logo" src="${t.logo_url}" />`:""}
          <h1>${t?.name||"Casa Limpa especialista em limpeza"}</h1>
          <p>${t?.cnpj||""}</p>
          <p>${t?.address?.street||""}, ${t?.address?.city||""} - ${t?.address?.state||""}</p>
          <p>${t?.phone||""}</p>
        </div>
        <div class="title">${e.title||"Or\xe7amento"}</div>
        ${e.client_label||e.client_subtitle?`<div class="client-meta">${[e.client_label,e.client_subtitle].filter(Boolean).join("<br/>")}</div>`:""}

        <div class="section">
          <h3>Relat\xf3rio Inicial</h3>
          ${e.initial_report?`<p>${e.initial_report}</p>`:"<p>—</p>"}
        </div>

        <div class="section">
          <h3>Descri\xe7\xe3o das atividades</h3>
          ${Array.isArray(e.activities)&&e.activities.length?`<ul>${e.activities.map(e=>`<li>${e}</li>`).join("")}</ul>`:"<p>—</p>"}
        </div>
        ${r.length?`<div class="section"><h3>Imagens</h3><div class="gallery">${r.map(e=>`<img src="${e.url}" />`).join("")}</div></div>`:""}
        <div class="section"><h3>Pre\xe7os</h3>

        <table>
          <thead>
            <tr>
              <th>Descri\xe7\xe3o</th>
              <th>Qtd</th>
              <th>Unidade</th>
              <th>Valor Unit\xe1rio</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${a.map(e=>`
              <tr>
                <td>${e.description}</td>
                <td>${e.quantity}</td>
                <td>${e.unit||"un"}</td>
                <td>R$ ${Number(e.unit_price||0).toFixed(2)}</td>
                <td>R$ ${Number(e.total||0).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td>R$ ${o.toFixed(2)}</td></tr>
            <tr><td>Desconto:</td><td>R$ ${Number(e.discount||0).toFixed(2)}</td></tr>
            <tr><td>Taxas:</td><td>R$ ${Number(e.taxes||0).toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total:</td><td>R$ ${s.toFixed(2)}</td></tr>
          </table>
        </div>
        </div>
        <div class="section"><h3>M\xe9todos de pagamento</h3>
          ${Array.isArray(e.payment_methods)&&e.payment_methods.length?`<div class="badges">${e.payment_methods.map(e=>`<span class="badge">${e}</span>`).join("")}</div>`:"<p>—</p>"}
        </div>
        <div class="section"><h3>Condi\xe7\xf5es de contrato</h3>
          ${e.contract_terms?`<p>${e.contract_terms}</p>`:"<p>—</p>"}
        </div>
        <div class="sign-row">
          <div class="sign-line">${t?.name||"Casa Limpa"}</div>
          <div class="sign-line">${e.client_label||i?.name||"Cliente"}</div>
        </div>

        ${e.notes?`<div class="notes"><h3>OBSERVA\xc7\xd5ES</h3><p>${e.notes}</p></div>`:""}
        ${e.rich_content?.html?`<div class="notes">${e.rich_content.html}</div>`:""}

        <div class="footer">
          <p>Obrigado pela prefer\xeancia!</p>
          <p>Criado em ${new Date(e.created_at||Date.now()).toLocaleDateString("pt-BR")}.</p>
          ${e.sign_url?`<p><a href="${e.sign_url}">assinar documento online</a></p>`:""}
        </div>
      </div>
    </body>
  </html>
  `}(p,c);try{let e=(await Promise.resolve().then(i.t.bind(i,8018,23))).default;a=await e.launch({headless:!0,args:["--no-sandbox","--disable-setuid-sandbox"]})}catch{try{let e=await i.e(6837).then(i.t.bind(i,6837,23)),t=(await Promise.resolve().then(i.t.bind(i,1107,23))).default;a=await t.launch({args:e.args,executablePath:await e.executablePath(),headless:!0})}catch(e){return n.NextResponse.json({error:"Ambiente n\xe3o suporta gera\xe7\xe3o de PDF"},{status:500})}}let u=await a.newPage();await u.setContent(m,{waitUntil:"networkidle0"});let x=await u.pdf({format:"A4",printBackground:!0,margin:{top:"20mm",right:"20mm",bottom:"20mm",left:"20mm"}});await a.close();let g=new Blob([new Uint8Array(x)],{type:"application/pdf"});return new n.NextResponse(g,{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="orcamento-${p.id}.pdf"`,"Content-Length":x.length.toString()}})}catch(e){return console.error("Erro ao gerar PDF:",e),n.NextResponse.json({error:"Erro ao gerar PDF"},{status:500})}}let l=new r.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/orcamentos/[id]/pdf/route",pathname:"/api/orcamentos/[id]/pdf",filename:"route",bundlePath:"app/api/orcamentos/[id]/pdf/route"},resolvedPagePath:"C:\\Users\\Enzo Marcelo\\Desktop\\testes SOLO TRAE\\crm casa limpa\\src\\app\\api\\orcamentos\\[id]\\pdf\\route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:m,serverHooks:u}=l,x="/api/orcamentos/[id]/pdf/route";function g(){return(0,s.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:m})}},748:(e,t,i)=>{i.d(t,{n:()=>r});var a=i(2305);async function r(e){let t=(0,a.createServerClient)("https://hyygforlvwbbdzpctnid.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eWdmb3JsdndiYmR6cGN0bmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjY1NjksImV4cCI6MjA3ODg0MjU2OX0.1ih4fZRYRzg1oqZxAYonDPi5wO2-DHvb7anjcSPWeqs",{cookies:{getAll:()=>e.cookies.getAll(),setAll(t){t.forEach(({name:t,value:i})=>e.cookies.set(t,i))}}}),{data:{user:i}}=await t.auth.getUser();return{supabase:t,user:i}}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),a=t.X(0,[8948,5972,2305],()=>i(801));module.exports=a})();