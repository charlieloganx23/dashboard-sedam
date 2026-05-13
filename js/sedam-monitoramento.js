/*=========================================================
001 MONITORAMENTO FUNCTION RENDERRESUMO
=========================================================*/
function renderResumo(){
let dados=window.allData||[]
if(!dados||!dados.length){
let el=document.getElementById('cards-container')
if(el)el.innerHTML=''
return
}
let mapa={}
let base=[...dados]
if(filtroDataInicio||filtroDataFim){
base=base.filter(i=>{
let d=parseDataLocal(i.data_inicio)||parseDataLocal(i.prazo_texto)
if(!d)return false
if(filtroDataInicio&&d<parseDataLocal(filtroDataInicio))return false
if(filtroDataFim&&d>parseDataLocal(filtroDataFim))return false
return true
})
}
if(ocultarConcluidos){
base=base.filter(i=>getTotal(i)<100)
}
base.forEach(i=>{
let key=(modoResumo==='item')?String(i.item||''):String(i.subitem||'')
if(!key)return
if(!mapa[key])mapa[key]=[]
mapa[key].push(i)
})
let keys=Object.keys(mapa)
.filter(k=>k)
.sort((a,b)=>{
function ordem(v){
let p=String(v).split('.')
return{
n1:parseInt(p[0]||0),
n2:parseInt(p[1]||0)
}
}
let pa=ordem(a)
let pb=ordem(b)
if(pa.n1!==pb.n1)return pa.n1-pb.n1
return pa.n2-pb.n2
})
let html=''
let container=document.getElementById('cards-container')
if(container)container.innerHTML=''
keys.forEach(k=>{
let lista=mapa[k]||[]
if(!lista.length)return
let media=Math.round(lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1))
let cor=media<=30?'bg-status-red':media>=100?'bg-status-green':'bg-status-yellow'
let itemBase=lista[0]||{}
let descricao=''
if(modoResumo==='item'){
let registroDescricao=(window.allData||[])
.find(x=>
String(x.item||'')===String(k)&&
x.descricaoitem&&
x.descricaoitem.trim()
)
descricao=registroDescricao?.descricaoitem||''
}else{
descricao=
lista.find(x=>x.descricao&&x.descricao.trim())?.descricao||
''
}
let itemClick=k
let itemNumero=String(itemBase.item||'-')
let subitemNumero=String(itemBase.subitem||'-')
html+=`
<div class="flex flex-col">
<div class="card-micro ${cor}" onclick="abrirDetalhesResumo('${itemClick}')" style="padding:12px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
<div style="font-size:18px;font-weight:900;color:#000000;line-height:1;">
ITEM ${itemNumero}
</div>
${modoResumo==='subitem'?`
<div style="font-size:11px;font-weight:900;color:#0f172a;line-height:1;margin-top:4px;">
SUBITEM ${subitemNumero}
</div>
`:''}
${descricao?`
<div style="font-size:11px;font-weight:700;color:#000000;margin-top:8px;text-align:center;line-height:1.3;max-width:100%;">
${descricao}
</div>
`:''}
<div class="percent-big" style="margin-top:10px;">
${media}%
</div>
</div>
</div>
`
})
let el=document.getElementById('cards-container')
if(el)el.innerHTML=html
}
/*=========================================================
002 MONITORAMENTO FUNCTION ABRIRITEM
=========================================================*/
function abrirItem(item){
filtroItemAtivo=item
switchTab('mensal')
renderTable()
document.getElementById('btn-voltar').style.display='block'
}
/*=========================================================
003 MONITORAMENTO FUNCTION RENDERTABLE
=========================================================*/
function renderTable(){
let lista=[...(window.allData||[])].sort(compareSubitem)
lista=lista.filter(i=>{
if(filtroItemAtivo){
if(getItemKey(i)!==filtroItemAtivo)return false
}
let dataBase=parseDataLocal(i.data_inicio)||parseDataLocal(i.prazo_texto)
if(filtroDataInicio||filtroDataFim){
if(!dataBase)return false
if(filtroDataInicio&&dataBase<parseDataLocal(filtroDataInicio))return false
if(filtroDataFim&&dataBase>parseDataLocal(filtroDataFim))return false
}
if(ocultarConcluidos&&getTotal(i)>=100)return false
return true
})
let totalRegistros=lista.length
let tbody=document.getElementById('table-body')
if(!tbody)return
tbody.innerHTML=lista.map(i=>{
let dataFormatada=i.data_inicio?formatarDataBR(i.data_inicio):(i.prazo_texto||'-')
let jan=Number(i.jan||0)
let fev=Number(i.fev||0)
let mar=Number(i.mar||0)
let abr=Number(i.abr||0)
let mai=Number(i.mai||0)
let total=getTotal(i)
let bg=total<=30?'bg-red-900/20':total>=100?'bg-emerald-900/20':'bg-yellow-900/20'
let podeEditar=userP&&(Number(userP.nivel_acesso)===1||Number(userP.nivel_acesso)===2||String(i.responsavel_id)===String(userP.id))
let responsavelTexto=i.responsavel||'-'
let listaPerfis=[...(window.perfis||[]),...(window.perfisSedam||[])]
let perfilResponsavel=listaPerfis.find(p=>String(p.id)===String(i.responsavel_id))
if(perfilResponsavel){
responsavelTexto=perfilResponsavel.nome_completo
}else{
responsavelTexto=i.responsavel||i.responsavel_manual||'Não informado'
}
return `<tr class="border-b border-white/5 tr-hover ${bg}"><td class="p-2 font-black text-blue-400">${i.subitem}</td><td class="p-2 td-desc">${i.descricao||'-'}</td><td class="p-2 td-desc text-[10px] text-slate-700">${i.produto||'-'}</td><td class="text-xs p-1">${userP&&Number(userP.nivel_acesso)===1?`<select onchange="salvarResponsavel('${i.id}',this.value)" class="bg-slate-100 text-slate-900 font-semibold text-xs p-1 rounded w-full"><option value="">${responsavelTexto||'-'}</option>${listaPerfis.map(p=>`<option title="${p.nome_completo}" value="${p.id}" ${String(p.id)===String(i.responsavel_id)?'selected':''}>${p.nome_completo}</option>`).join('')}</select>`:`<span class="text-slate-800 font-semibold">${responsavelTexto}</span>`}</td><td class="text-xs">${i.setor||'-'}</td><td class="td-data">${dataFormatada}</td><td class="td-mes opacity-40">${jan}%</td><td class="td-mes opacity-40">${fev}%</td><td class="td-mes opacity-40">${mar}%</td><td class="td-mes-strong text-blue-400">${abr}%</td><td>${podeEditar?`<input type="number" min="0" max="100" step="1" class="input-mes" value="${mai}" ${podeEditarMes('mai')?'':'disabled'} onchange="salvar(this.value,'${i.id}','mai')">`:`<span class="td-mes-strong text-yellow-400">${mai}%</span>`}</td><td class="td-total text-emerald-400">${total.toFixed(2)}%</td></tr>`
}).join('')
let itensTotal=new Set((window.allData||[]).map(x=>getItemKey(x))).size
let pdfHTML=''
if(userP&&(Number(userP.nivel_acesso)<=2||userP.permissao_pdf===true)){
if(document.getElementById('view-resumo')&&!document.getElementById('view-resumo').classList.contains('hidden')){
pdfHTML=`<button onclick="gerarPDFResumo()" class="btn-pdf">PDF RESUMO</button>`
}
if(document.getElementById('view-mensal')&&!document.getElementById('view-mensal').classList.contains('hidden')){
pdfHTML=`<button onclick="gerarPDFMonitoramento()" class="btn-pdf">PDF MONITORAMENTO</button>`
}
if(document.getElementById('view-analise')&&!document.getElementById('view-analise').classList.contains('hidden')){
pdfHTML=`<button onclick="gerarPDFGraficos()" class="btn-pdf">PDF GRÁFICOS</button>`
}
if(document.getElementById('view-concluidos')&&!document.getElementById('view-concluidos').classList.contains('hidden')){
pdfHTML=`<button onclick="gerarPDFCumpridos()" class="btn-pdf">PDF 100%</button>`
}
}
let pdfContainer=document.getElementById('pdf-container')
if(pdfContainer){
pdfContainer.innerHTML=`<div class="flex gap-2 items-center flex-wrap">${pdfHTML}<div class="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-xl border border-slate-300 shadow-sm"><span class="text-sm font-black text-blue-900">${itensTotal}</span><span class="text-[10px] font-black text-slate-700 uppercase">Itens</span></div><div class="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-xl border border-slate-300 shadow-sm"><span class="text-sm font-black text-emerald-700">${totalRegistros}</span><span class="text-[10px] font-black text-slate-700 uppercase">Subitens</span></div></div>`
}
}
/*=========================================================
004 MONITORAMENTO FUNCTION RENDERCONCLUIDOS
=========================================================*/
function renderConcluidos(){

let dados=[...(window.allData||[])]
.filter(i=>getTotal(i)>=100)
.sort(compareSubitem)

let box=document.getElementById('concluidos-container')
let listaEl=document.getElementById('concluidos-list')

if(!box||!listaEl)return

box.innerHTML=''
listaEl.innerHTML=''

let total=document.createElement('div')

total.className='rounded-2xl shadow-2xl flex items-center justify-center p-3'
total.style.background='linear-gradient(135deg,#bbf7d0,#86efac,#dcfce7)'
total.style.minHeight='120px'

total.innerHTML=`
<div class="text-center w-full">
<div style="font-size:9px;font-weight:900;color:#166534;line-height:1;">
TOTAL GERAL
</div>
<div style="font-size:34px;font-weight:900;color:#166534;line-height:1;">
${dados.length}
</div>
<div style="font-size:11px;font-weight:900;color:#166534;line-height:1.1;">
SUBITENS 100%
</div>
</div>
`

box.appendChild(total)

dados.forEach(i=>{

let card=document.createElement('div')

card.className='card-micro shadow-lg'
card.style.background='linear-gradient(135deg,#1e3a8a,#0f172a)'
card.style.color='#ffffff'

card.innerHTML=`
<div class="text-center w-full">
<div style="font-size:12px;font-weight:900;color:#ffffff;">
SUBITEM
</div>
<div style="font-size:28px;font-weight:900;color:#ffffff;">
${i.subitem}
</div>
<div style="font-size:13px;font-weight:900;color:#bfdbfe;">
ITEM ${i.item||'-'}
</div>
</div>
`

box.appendChild(card)

let div=document.createElement('div')

div.className='border-b border-slate-300 pb-1 mb-1'

div.innerHTML=`
<div style="font-size:15px;font-weight:900;color:#000000;line-height:1;">
${i.subitem}
</div>
<div style="font-size:11px;line-height:1.05;color:#000000;font-weight:700;margin-top:1px;">
${i.descricao||'-'}
</div>
<div style="font-size:10px;line-height:1;color:#0f172a;font-weight:900;margin-top:1px;">
PRODUTO: ${i.produto||'-'}
</div>
<div style="font-size:10px;line-height:1;color:#1e3a8a;font-weight:900;margin-top:1px;">
RESPONSÁVEL: ${i.responsavel||'-'}
</div>
`

listaEl.appendChild(div)

})

}
/*=========================================================
005 MONITORAMENTO FUNCTION SALVAR
=========================================================*/
async function salvar(valor,id,campo){
let v=parseFloat(String(valor).replace(',','.'))
if(isNaN(v))v=0
if(v<0||v>100){
alert("Informe 0 a 100")
return
}
let podeEditar=(userP&&(
Number(userP.nivel_acesso)===1||
(
[2,3,4].includes(Number(userP.nivel_acesso))&&
podeEditarMes(campo)
)
))
if(
Number(userP.nivel_acesso)!==1&&
!podeEditarMes(campo)
){
alert('Somente o mês atual pode ser alterado')
return
}
if(!podeEditar){
alert("Sem permissão")
return
}
let {error}=await client.from('deliberacoes').update({[campo]:v}).eq('id',id)
if(error){
console.error(error)
alert("Erro ao salvar")
return
}
carregarDados()
}
