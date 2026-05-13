/*=========================================================
001 SEDAM CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener("DOMContentLoaded",async ()=>{

document.getElementById('dataInicio').value='2025-01-01'
document.getElementById('dataFim').value='2028-01-01'

document.body.classList.add("login-bg")

localStorage.removeItem('uid')

let userLocal=localStorage.getItem('user')

if(userLocal){

try{

let perfil=JSON.parse(userLocal)

if(perfil&&perfil.username){

window.userP=perfil
userP=perfil

document.body.classList.remove('login-bg')

document.getElementById('login-screen')
.classList.add('hidden')

document.getElementById('dashboard')
.classList.remove('hidden')

document.getElementById('user-info').innerHTML=
(perfil.nome_completo||'-')+
' • '+
(perfil.cargo||'-')+
' • '+
(perfil.origem||'-')

await carregarDados()

setTimeout(()=>{

switchTab('dashboard')

if(typeof renderDashboard==='function'){
renderDashboard()
}

},500)

return

}

}catch(e){

console.log(e)

localStorage.removeItem('user')

}

}

switchTab('dashboard')

})

/*=========================================================
002 SEDAM CORE FUNCTION LOGIN
=========================================================*/
window.login=async function(){

let usuario=document.getElementById('u').value.trim().toLowerCase()
let senha=document.getElementById('p').value.trim()

if(!usuario||!senha){
alert('Informe usuário e senha')
return
}

let perfil=null

let {data:p1,error:e1}=await client
.from('perfistce')
.select('*')
.eq('username',usuario)
.eq('senha',senha)
.limit(1)

if(e1){
console.log(e1)
}

if(p1&&p1.length){

perfil=p1[0]
perfil.origem='TCERO'

}else{

let {data:p2,error:e2}=await client
.from('perfis')
.select('*')
.eq('username',usuario)
.limit(1)

if(e2){
console.log(e2)
}

if(p2&&p2.length){

perfil=p2[0]
perfil.origem='SEDAM'

if(
perfil.senha&&
String(perfil.senha)!==String(senha)
){
alert('Senha inválida')
return
}

}

}

if(!perfil){
alert('Usuário não encontrado')
return
}

window.userP=perfil
userP=perfil

localStorage.setItem(
'user',
JSON.stringify(perfil)
)

document.body.classList.remove('login-bg')

document.getElementById('login-screen')
.classList.add('hidden')

document.getElementById('dashboard')
.classList.remove('hidden')

document.getElementById('user-info').innerHTML=
(perfil.nome_completo||'-')+
' • '+
(perfil.cargo||'-')+
' • '+
(perfil.origem||'-')

let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
let tabUsuarios=document.getElementById('tab-usuarios')

if(tabPerfis){
tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'
}

if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}

if(tabUsuarios){
tabUsuarios.classList.add('hidden')
tabUsuarios.style.display='none'
}

let usernameAtual=(perfil.username||'').toLowerCase()

let adminsTCERO=[
'manoel',
'vagner',
'gleidi'
]

/*=========================================================
SEDAM
=========================================================*/
if(
perfil.origem==='SEDAM'&&
Number(perfil.nivel_acesso)===1
){

if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='inline-flex'
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}

if(tabUsuarios){
tabUsuarios.classList.remove('hidden')
tabUsuarios.style.display='inline-flex'
}

}

/*=========================================================
TCERO ADMIN
=========================================================*/
if(
perfil.origem==='TCERO'&&
adminsTCERO.includes(usernameAtual)
){

if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='inline-flex'
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}

if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-flex'
}

if(tabUsuarios){
tabUsuarios.classList.remove('hidden')
tabUsuarios.style.display='inline-flex'
}

}

/*=========================================================
TCERO NIVEL 4
=========================================================*/
if(
perfil.origem==='TCERO'&&
Number(perfil.nivel_acesso)===4
){

if(tabPerfis){
tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'
}

if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}

if(tabUsuarios){
tabUsuarios.classList.add('hidden')
tabUsuarios.style.display='none'
}

}

await carregarPerfis()

await carregarTCERO()

await carregarDados()

setTimeout(async ()=>{

await carregarDados()

switchTab('dashboard')

if(typeof renderDashboard==='function'){
renderDashboard()
}

if(typeof renderResumo==='function'){
renderResumo()
}

if(typeof renderTable==='function'){
renderTable()
}

if(typeof renderConcluidos==='function'){
renderConcluidos()
}

if(typeof initPainelGrafico==='function'){
initPainelGrafico()
}

},700)

}

/*=========================================================
003 SEDAM CORE FUNCTION SWITCHTAB
=========================================================*/
function switchTab(t){

let adminsTCERO=[
'manoel',
'vagner',
'gleidi'
]

let usuarioAtual=(window.userP?.username||'').toLowerCase()

let isUsuarioSEDAM=
window.userP&&
String(window.userP.origem||'').toUpperCase()==='SEDAM'

let isTCERONivel4=
window.userP&&
window.userP.origem==='TCERO'&&
Number(window.userP.nivel_acesso)===4&&
!adminsTCERO.includes(usuarioAtual)

let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
let tabUsuarios=document.getElementById('tab-usuarios')

if(isTCERONivel4){

if(tabPerfis){
tabPerfis.remove()
}

if(tabTCERO){
tabTCERO.remove()
}

if(tabUsuarios){
tabUsuarios.remove()
}

}

if(isUsuarioSEDAM){

if(tabTCERO){
tabTCERO.remove()
}

let viewTCERO=document.getElementById('view-tcero')

if(viewTCERO){
viewTCERO.remove()
}

let acessoTCERO=document.getElementById('acesso-tcero')

if(acessoTCERO){
acessoTCERO.remove()
}

}

localStorage.setItem('activeTab',t)

let boxModoResumo=document.getElementById('boxModoResumo')

if(boxModoResumo){

if(t==='resumo'){
boxModoResumo.style.display='flex'
}else{
boxModoResumo.style.display='none'
}

}

document.querySelectorAll('.tab-content,.tab-view').forEach(v=>{
v.classList.remove('active')
v.classList.add('hidden')
v.style.display='none'
v.style.visibility='hidden'
v.style.opacity='0'
})

document.querySelectorAll('.tab-btn').forEach(b=>{
b.classList.remove('tab-active')
})

let view=document.getElementById('view-'+t)

if(view){
view.classList.remove('hidden')
view.classList.add('active')
view.style.display='block'
view.style.visibility='visible'
view.style.opacity='1'
}

let tab=document.getElementById('tab-'+t)

if(tab){
tab.classList.add('tab-active')
}

if(t==='dashboard'){

setTimeout(()=>{

if(typeof renderDashboard==='function'){
renderDashboard()
}

if(window.dashLinha&&typeof window.dashLinha.resize==='function'){
window.dashLinha.resize()
}

if(window.dashPizza&&typeof window.dashPizza.resize==='function'){
window.dashPizza.resize()
}

if(window.dashBarras&&typeof window.dashBarras.resize==='function'){
window.dashBarras.resize()
}

document.querySelectorAll('#view-dashboard canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
c.style.width='100%'
c.style.maxWidth='100%'
c.style.height='220px'
c.style.maxHeight='220px'
})

},350)

}

if(t==='analise'){

setTimeout(()=>{

initPainelGrafico()

if(window.graficoResumo&&typeof window.graficoResumo.resize==='function'){
window.graficoResumo.resize()
}

if(window.graficoMonitoramento&&typeof window.graficoMonitoramento.resize==='function'){
window.graficoMonitoramento.resize()
}

if(window.graficoGeral&&typeof window.graficoGeral.resize==='function'){
window.graficoGeral.resize()
}

document.querySelectorAll('#view-analise canvas,#view-graficos canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
c.style.width='100%'
c.style.maxWidth='100%'
c.style.height='320px'
c.style.maxHeight='320px'
})

},350)

}

if(t==='perfis'){

setTimeout(()=>{
carregarPerfis()
},200)

}

if(t==='usuarios'){

setTimeout(()=>{
carregarUsuarios()
},200)

}

if(t==='tcero'){

setTimeout(()=>{
carregarTCERO()
},200)

}

setTimeout(()=>{

if(typeof renderTable==='function'){
renderTable()
}

},100)

}
/*=========================================================
004 SEDAM CORE FUNCTION CARREGARDADOS
=========================================================*/
async function carregarDados(){

if(!window.userP){
console.log('userP não carregado')
return
}

let query=client
.from('deliberacoes')
.select('*')

let {data,error}=await query

if(error){
console.log(error)
window.allData=[]
window.dados=[]
window.dadosFiltrados=[]
window.lista=[]
renderDashboard()
return
}

window.allData=(data||[]).map(i=>{

let total=Number(
i.total_cumprimento||
i.percentual||
i.percentual_execucao||
0
)

if(total<=0){

let meses=[
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0)
]

total=Math.max(...meses,0)

}

return{
...i,
item:i.item||String(i.subitem||'').split('.')[0]||'0',
subitem:i.subitem||'0.0',
jan:Number(i.jan||0),
fev:Number(i.fev||0),
mar:Number(i.mar||0),
abr:Number(i.abr||0),
mai:Number(i.mai||0),
total_cumprimento:total
}

})

window.dados=[...window.allData]
window.dadosFiltrados=[...window.allData]
window.lista=[...window.allData]
window.listaDados=[...window.allData]
window.resumoData=[...window.allData]

console.log('TOTAL FINAL ALLDATA:',window.allData.length)

let totalItens=[
...new Set(
window.allData.map(i=>
String(i.item||'0')
)
)
].length

let totalSubitens=window.allData.length

let media=Math.round(
window.allData.reduce((acc,c)=>{
return acc+Number(c.total_cumprimento||0)
},0)/(window.allData.length||1)
)

let topoItens=document.getElementById('topTotalItens')
let topoSubitens=document.getElementById('topTotalSubitens')
let totalGeral=document.getElementById('total-geral')

if(topoItens){
topoItens.innerText=totalItens
}

if(topoSubitens){
topoSubitens.innerText=totalSubitens
}

if(totalGeral){
totalGeral.innerText=media+'%'
}

if(typeof renderDashboard==='function'){
renderDashboard()
}

setTimeout(()=>{

if(typeof renderResumo==='function'){
renderResumo()
}

if(typeof renderTable==='function'){
renderTable()
}

if(typeof initPainelGrafico==='function'){
initPainelGrafico()
}

if(typeof renderConcluidos==='function'){
renderConcluidos()
}

if(typeof renderDashboard==='function'){
renderDashboard()
}

},200)

}

function renderResumoItens(){

let box=document.getElementById('cards-container')

if(!box)return

let mapa={}

;(window.allData||[]).forEach(i=>{

let item=String(i.item||'0')

if(!mapa[item]){
mapa[item]={
item:item,
descricao:descItens[item]||'SEM DESCRIÇÃO',
total:0,
qtd:0
}
}

mapa[item].total+=Number(getTotal(i)||0)
mapa[item].qtd++

})

let lista=Object.values(mapa).map(i=>({
...i,
media:Math.round(i.total/(i.qtd||1))
}))

lista=lista.sort((a,b)=>Number(a.item)-Number(b.item))

box.innerHTML=lista.map(i=>{

let cor='bg-status-red'

if(i.media>=100){
cor='bg-status-green'
}else if(i.media>=31){
cor='bg-status-yellow'
}

return`
<div class="card-micro ${cor} rounded-xl p-2 shadow cursor-pointer">
<div class="text-[10px] font-black text-center">ITEM ${i.item}</div>
<div class="text-[9px] text-center leading-tight mt-1">${i.descricao}</div>
<div class="percent-big text-center mt-2">${i.media}%</div>
</div>
`

}).join('')

}

/*=========================================================
005 SEDAM CORE FUNCTION CARREGARUSUARIOS
=========================================================*/
async function carregarUsuarios(){
if(!userP)return
let {data,error}=await client.from('perfis').select('id,nome_completo,username,nivel_acesso').order('nome_completo')
if(error){
console.error(error)
return
}
let lista=data||[]
let adminMaster=Number(userP.nivel_acesso)===1||['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())
if(!adminMaster){
lista=lista.filter(u=>String(u.id)===String(userP.id))
}
let html=`<div class="w-full"><div class="grid grid-cols-2 text-xs font-black text-black border-b border-slate-700 pb-2 mb-2"><div>Nome completo</div><div class="text-right">Login</div></div>${lista.map(u=>`<div class="grid grid-cols-2 items-center border-b border-slate-300 py-2"><div class="text-black font-semibold">${u.nome_completo||'-'}</div><div class="text-right font-black text-blue-900">${u.username||'-'}</div></div>`).join('')}</div>`
document.getElementById('listaUsuarios').innerHTML=html
}
/*=========================================================
006 SEDAM CORE FUNCTION CARREGARPERFIS
=========================================================*/
async function carregarPerfis(){
if(!userP)return
let isAdminSedam=Number(userP.nivel_acesso)===1
let isTCERO=(userP.origem||'')==='TCERO'
if(isTCERO&&!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())){
return
}
let query=client.from('perfis').select('*').order('nome_completo')
if(!isAdminSedam){
document.getElementById('listaPerfis').innerHTML=''
return
}
let {data,error}=await query
if(error){
console.error(error)
return
}
window.perfis=data||[]
let html=`
<div class="flex justify-end items-center gap-3 mb-4">

${isAdminSedam?`
<button id="btnNovoPerfilSedam" onclick="novoPerfilSedam()" class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]">
INSERIR
</button>
`:''}

${isAdminSedam?`
<button id="btnEditarPerfilSedam" onclick="ativarEdicaoPerfisSedam()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]">
EDITAR
</button>
`:''}

${isAdminSedam?`
<button id="btnSalvarPerfilSedam" onclick="salvarEdicaoPerfisSedam()" class="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]" hidden>
SALVAR
</button>
`:''}

</div>

<div id="boxCadastroPerfilSedam" class="hidden bg-white/80 backdrop-blur-sm rounded-3xl p-5 mb-5 shadow-[0_8px_30px_rgba(0,0,0,.08)]">

<div class="grid grid-cols-1 md:grid-cols-6 gap-3">

<input id="novo_nome_sedam" placeholder="Nome Completo" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_user_sedam" placeholder="Usuário" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_senha_sedam" placeholder="Senha" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_cargo_sedam" placeholder="Cargo" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<select id="novo_nivel_sedam" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">
<option value="1">Nível 1</option>
<option value="2">Nível 2</option>
<option value="3">Nível 3</option>
<option value="4" selected>Nível 4</option>
</select>

<button onclick="salvarNovoPerfilSedam()" class="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 py-3 font-black shadow-xl">
INSERIR
</button>

</div>

</div>

<div class="overflow-x-auto w-full rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,.06)]">

<table class="w-full min-w-[920px] border-separate border-spacing-y-1">

<thead>

<tr class="text-[9px] uppercase font-black text-slate-700">

<th class="text-left px-4 py-3">Nome</th>
<th class="text-left px-4 py-3">Usuário</th>
<th class="text-left px-4 py-3">Senha</th>
<th class="text-left px-4 py-3">Cargo</th>
<th class="text-left px-4 py-3">Setor</th>
<th class="text-center px-4 py-3">Nível</th>
<th class="text-center px-4 py-3">Ações</th>

</tr>

</thead>

<tbody>

${window.perfis.map(p=>`

<tr class="linha-perfil-sedam bg-white/92 hover:bg-amber-50 transition shadow-[0_4px_18px_rgba(0,0,0,0.05)]" data-id="${p.id}">

<td class="px-2 py-1 rounded-l-2xl">
<input id="nome_sedam_${p.id}" value="${p.nome_completo||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[10px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="user_sedam_${p.id}" value="${p.username||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="senha_sedam_${p.id}" value="${p.senha||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none text-red-700">
</td>

<td class="px-2 py-1">
<input id="cargo_sedam_${p.id}" value="${p.cargo||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="setor_sedam_${p.id}" value="${p.setor||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1 text-center">
<select id="nivel_sedam_${p.id}" disabled class="campo-editavel-sedam opacity-70 bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-[9px] font-black border-none outline-none">
<option value="1" ${Number(p.nivel_acesso)===1?'selected':''}>Nível 1</option>
<option value="2" ${Number(p.nivel_acesso)===2?'selected':''}>Nível 2</option>
<option value="3" ${Number(p.nivel_acesso)===3?'selected':''}>Nível 3</option>
<option value="4" ${Number(p.nivel_acesso)===4?'selected':''}>Nível 4</option>
</select>
</td>

<td class="px-2 py-1 text-center rounded-r-2xl">
${isAdminSedam?`
<button onclick="excluirPerfil('${p.id}')" class="btn-excluir-sedam hidden bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow">
EXCLUIR
</button>
`:''}
</td>

</tr>

`).join('')}

</tbody>

</table>

</div>
`
document.getElementById('listaPerfis').innerHTML=html
}
/*=========================================================
006A SEDAM FUNCTION NOVOPERFILSEDAM
=========================================================*/
function novoPerfilSedam(){
let box=document.getElementById('boxCadastroPerfilSedam')
if(box){
box.classList.remove('hidden')
}
}

/*=========================================================
006B SEDAM FUNCTION ATIVAREDICAOPERFISSEDAM
=========================================================*/
function ativarEdicaoPerfisSedam(){
window.modoEdicaoPerfisSedam=true
document.querySelectorAll('.campo-editavel-sedam').forEach(c=>{
c.disabled=false
c.classList.remove('opacity-70')
})
document.querySelectorAll('.btn-excluir-sedam').forEach(b=>{
b.classList.remove('hidden')
})
let btnSalvar=document.getElementById('btnSalvarPerfilSedam')
if(btnSalvar){
btnSalvar.hidden=false
}
}

/*=========================================================
006C SEDAM FUNCTION SALVAREDICAOPERFISSEDAM
=========================================================*/
async function salvarEdicaoPerfisSedam(){
let linhas=[...document.querySelectorAll('.linha-perfil-sedam')]
for(let l of linhas){
let id=l.dataset.id
let nome=document.getElementById('nome_sedam_'+id)?.value||''
let username=document.getElementById('user_sedam_'+id)?.value||''
let senha=document.getElementById('senha_sedam_'+id)?.value||''
let cargo=document.getElementById('cargo_sedam_'+id)?.value||''
let setor=document.getElementById('setor_sedam_'+id)?.value||''
let nivel=document.getElementById('nivel_sedam_'+id)?.value||4

let payload={
nome_completo:nome,
username:username,
cargo:cargo,
setor:setor,
nivel_acesso:Number(nivel)
}

if(String(senha||'').trim()!==''){
payload.senha=senha
}

let {error}=await client.from('perfis').update(payload).eq('id',id)

if(error){
console.error(error)
alert('Erro ao salvar')
return
}
}

document.querySelectorAll('.btn-excluir-sedam').forEach(b=>{
b.classList.add('hidden')
})

window.modoEdicaoPerfisSedam=false

let btnEditar=document.getElementById('btnEditarPerfisSedam')
let btnSalvar=document.getElementById('btnSalvarPerfisSedam')

if(btnEditar)btnEditar.hidden=false
if(btnSalvar)btnSalvar.hidden=true

alert('Perfis SEDAM salvos com sucesso')

await carregarPerfis()
}
/*=========================================================
006D SEDAM FUNCTION SALVARNOVOPERFILSEDAM
=========================================================*/
async function salvarNovoPerfilSedam(){
let nome=document.getElementById('novo_nome_sedam').value.trim()
let usuario=document.getElementById('novo_user_sedam').value.trim().toLowerCase()
let senha=document.getElementById('novo_senha_sedam').value.trim()
let cargo=document.getElementById('novo_cargo_sedam').value.trim()
let nivel=document.getElementById('novo_nivel_sedam').value
if(!nome||!usuario||!senha){
alert('Preencha nome, usuário e senha')
return
}
let {error}=await client.from('perfis').insert([{
nome_completo:nome,
username:usuario,
senha:senha,
cargo:cargo,
nivel_acesso:Number(nivel)
}])
if(error){
console.error(error)
alert('Erro ao inserir perfil')
return
}
alert('Perfil inserido com sucesso')
await carregarPerfis()
}

/*=========================================================
007 DASHBOARD
=========================================================*/
let dashLinha=null
let dashPizza=null
let dashBarras=null

function getTotal(i){

let ordem=[
'dez',
'nov',
'out',
'set',
'ago',
'jul',
'jun',
'mai',
'abr',
'mar',
'fev',
'jan'
]

for(let k of ordem){

let v=Number(i[k]||0)

if(v>0){
return v
}

}

return 0

}


function renderDashboard(){
console.log('RENDER DASHBOARD')
let lista=window.allData||[]
console.log('LISTA DASHBOARD:',lista)

if(!lista.length){

let a=document.getElementById('dashboardMediaGeral')
let b=document.getElementById('dashboardTotalItens')
let c=document.getElementById('dashboardTotalSubitens')
let d=document.getElementById('dashboardCumpridos')
let e=document.getElementById('dashboardCriticos')
let f=document.getElementById('dashboardAndamento')

if(a)a.innerText='0%'
if(b)b.innerText='0'
if(c)c.innerText='0'
if(d)d.innerText='0'
if(e)e.innerText='0'
if(f)f.innerText='0'

return
}

let totalSubitens=lista.length

let totalItens=[...new Set(
lista.map(i=>String(i.item||'0'))
)].length

let media=Math.round(
lista.reduce((acc,c)=>{
return acc+Number(getTotal(c)||0)
},0)/(lista.length||1)
)

let concluidos=lista.filter(i=>Number(getTotal(i))>=100).length

let andamento=lista.filter(i=>{
let t=Number(getTotal(i))
return t>0&&t<100
}).length

let criticos=lista.filter(i=>{
let t=Number(getTotal(i))
return t<30
}).length

document.getElementById('dashboardMediaGeral').innerText=media+'%'
document.getElementById('dashboardTotalItens').innerText=totalItens
document.getElementById('dashboardTotalSubitens').innerText=totalSubitens
document.getElementById('dashboardCumpridos').innerText=concluidos
document.getElementById('dashboardCriticos').innerText=criticos
document.getElementById('dashboardAndamento').innerText=andamento

let topo=document.getElementById('total-geral')

if(topo){
topo.innerText=media+'%'
}

let meses=['JAN','FEV','MAR','ABR','MAI']

let mediasMeses=[
Math.round(lista.reduce((a,c)=>a+Number(c.jan||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.fev&&c.fev>0)?c.fev:(c.jan||0)),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.mar&&c.mar>0)?c.mar:((c.fev&&c.fev>0)?c.fev:(c.jan||0))),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.abr&&c.abr>0)?c.abr:((c.mar&&c.mar>0)?c.mar:((c.fev&&c.fev>0)?c.fev:(c.jan||0)))),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(getTotal(c)||0),0)/(lista.length||1))
]

if(dashLinha){
dashLinha.destroy()
}

dashLinha=new Chart(
document.getElementById('graficoDashboardLinha'),
{
type:'line',
data:{
labels:meses,
datasets:[{
label:'Percentual Médio (%)',
data:mediasMeses,
borderColor:'#22c55e',
backgroundColor:'rgba(34,197,94,.12)',
pointBackgroundColor:'#22c55e',
pointRadius:5,
pointHoverRadius:7,
borderWidth:3,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
color:'#111827',
align:'top',
anchor:'end',
font:{
weight:'900',
size:11
},
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)

if(dashPizza){
dashPizza.destroy()
}
/*=========================================================
007 DASHBOARD GRAFICO PIZZA
=========================================================*/
dashPizza=new Chart(
document.getElementById('graficoDashboardPizza'),
{
type:'doughnut',
data:{
labels:[
'100% Cumpridos',
'Em Andamento',
'Abaixo de 30%'
],
datasets:[{
data:[
concluidos,
andamento,
criticos
],
backgroundColor:[
'#22c55e',
'#eab308',
'#ef4444'
],
borderWidth:2,
borderColor:'#ffffff'
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:'58%',
plugins:{
legend:{
position:'bottom',
labels:{
color:'#000000',
font:{
size:window.innerWidth<768?10:13,
weight:'900'
},
padding:16,
boxWidth:14
}
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw
}
},
datalabels:{
color:'#000000',
font:{
weight:'900',
size:window.innerWidth<768?6:8
},
formatter:(v,ctx)=>{
let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0)
let perc=Math.round((v*100)/total)
return perc+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)
/*=========================================================
008 DASHBOARD MAPA ITENS
=========================================================*/
let mapaItens={}
lista.forEach(i=>{
let item=String(
i.item||
getItemKey(i)||
'0'
)
if(!mapaItens[item]){
mapaItens[item]=[]
}
mapaItens[item].push(
Number(getTotal(i)||0)
)
})
/*=========================================================
009 DASHBOARD LABELS E VALORES
=========================================================*/
let labels=Object.keys(mapaItens).sort((a,b)=>{
let pa=a.split('.').map(Number)
let pb=b.split('.').map(Number)
if(pa[0]!==pb[0])return pa[0]-pb[0]
return (pa[1]||0)-(pb[1]||0)
})
let valores=labels.map(l=>{
let arr=mapaItens[l]
return Math.round(
arr.reduce((a,b)=>a+b,0)/(arr.length||1)
)
})
/*=========================================================
010 DASHBOARD CORES BARRAS
=========================================================*/
let cores=valores.map(v=>{
if(v>=70)return '#22c55e'
if(v>=31)return '#eab308'
return '#ef4444'
})
/*=========================================================
011 DASHBOARD DESTROI GRAFICO ANTERIOR
=========================================================*/
if(dashBarras){
dashBarras.destroy()
}
dashBarras=new Chart(
document.getElementById('graficoDashboardItens'),
{
type:'bar',
data:{
labels:labels.map(i=>'Item '+i),
datasets:[{
label:'Percentual Médio',
data:valores,
backgroundColor:cores,
borderRadius:8,
borderSkipped:false,
maxBarThickness:28
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
color:'#111827',
anchor:'end',
align:'top',
font:{
size:window.innerWidth<768?5:7,
weight:'900'
},
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)
console.log({
media,
totalItens,
totalSubitens,
concluidos,
andamento,
criticos
})
}
/*=========================================================
999 SEDAM CORE FUNCTION ABRIRDETALHESRESUMO
=========================================================*/
function abrirDetalhesResumo(chave){

let modal=document.getElementById('modalResumo')
let conteudo=document.getElementById('conteudoResumo')

if(!modal||!conteudo){
console.log('Modal resumo não encontrado')
return
}

let lista=(window.allData||[]).filter(i=>{

let sub=String(i.subitem||'').trim()
let item=String(i.item||'').trim()
let ident=String(i.identificador||'').trim()

return(
sub===String(chave).trim()||
item===String(chave).trim()||
ident===String(chave).trim()
)

})

if(!lista.length){

alert('Nenhum dado encontrado')

return

}

conteudo.innerHTML=''

lista.sort(compareSubitem)

lista.forEach(i=>{

let total=getTotal(i)

let cor=total<=30
?'#dc2626'
:total>=100
?'#16a34a'
:'#eab308'

conteudo.innerHTML+=`
<div class="bg-white rounded-2xl p-4 mb-3 border border-slate-300 shadow">
<div class="flex justify-between items-start gap-3 mb-2">
<div>
<div class="text-xs font-black text-blue-900">
SUBITEM ${i.subitem||'-'}
</div>
<div class="text-sm font-black text-black">
${i.descricao||'-'}
</div>
</div>
<div style="background:${cor};" class="px-3 py-2 rounded-xl text-white font-black text-sm">
${total}%
</div>
</div>

<div class="grid grid-cols-5 gap-2 mt-3">

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">JAN</div>
<div class="font-black">${Number(i.jan||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">FEV</div>
<div class="font-black">${Number(i.fev||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">MAR</div>
<div class="font-black">${Number(i.mar||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">ABR</div>
<div class="font-black">${Number(i.abr||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">MAI</div>
<div class="font-black">${Number(i.mai||0)}%</div>
</div>

</div>

<div class="mt-3 text-[11px] font-bold text-slate-700">
RESPONSÁVEL: ${i.responsavel||'-'}
</div>

<div class="text-[11px] font-bold text-slate-700 mt-1">
PRODUTO: ${i.produto||'-'}
</div>

</div>
`

})

modal.classList.remove('hidden')
modal.style.display='flex'

}

/*=========================================================
998 SEDAM CORE FUNCTION FECHARMODALRESUMO
=========================================================*/
function fecharModalResumo(){

let modal=document.getElementById('modalResumo')

if(modal){
modal.classList.add('hidden')
modal.style.display='none'
}

}
