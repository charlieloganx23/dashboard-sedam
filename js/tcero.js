/*=========================================================
001 TCERO FUNCTION EDITARTCERO
=========================================================*/
function editarTCERO(id){
let p=(window.perfisTCERO||[]).find(x=>String(x.id)===String(id))
if(!p){
alert('Perfil não encontrado')
return
}
window.editTCEROId=p.id
let nome=document.getElementById('tc_nome')
let user=document.getElementById('tc_user')
let senha=document.getElementById('tc_senha')
let cargo=document.getElementById('tc_cargo')
let nivel=document.getElementById('tc_nivel')
let pdf=document.getElementById('tc_pdf')
if(nome)nome.value=p.nome_completo||''
if(user)user.value=p.username||''
if(senha)senha.value=p.senha||''
if(cargo)cargo.value=p.cargo||''
if(nivel)nivel.value=p.nivel_acesso||4
if(pdf)pdf.value=p.permissao_pdf?'true':'false'
let btn=document.getElementById('btnSalvarTCERO')
if(btn){
btn.innerText='ATUALIZAR'
btn.classList.remove('bg-blue-600')
btn.classList.add('bg-amber-600')
}
window.scrollTo({top:0,behavior:'smooth'})
}
/*=========================================================
002 TCERO FUNCTION NOVOTCERO
=========================================================*/
window.novoTCERO=function(){
window.editTCEROId=null
let nome=document.getElementById('tc_nome')
let user=document.getElementById('tc_user')
let senha=document.getElementById('tc_senha')
let cargo=document.getElementById('tc_cargo')
let nivel=document.getElementById('tc_nivel')
let pdf=document.getElementById('tc_pdf')
if(nome)nome.value=''
if(user)user.value=''
if(senha)senha.value=''
if(cargo)cargo.value=''
if(nivel)nivel.value='4'
if(pdf)pdf.value='false'

window.scrollTo({top:0,behavior:'smooth'})
}
/*=========================================================
003 TCERO FUNCTION SALVARLINHATCERO
=========================================================*/
window.salvarLinhaTCERO=async function(id){
let nome=document.getElementById('nome_'+id)?.value||''
let username=document.getElementById('user_'+id)?.value||''
let cargo=document.getElementById('cargo_'+id)?.value||''
let nivel=document.getElementById('nivel_'+id)?.value||1
let {error}=await client.from('perfistce').update({nome_completo:nome,username:username,cargo:cargo,nivel_acesso:Number(nivel)}).eq('id',id)
if(error){
console.error(error)
alert('Erro ao salvar')
return
}
await carregarTCERO()
}
/*=========================================================
004 TCERO FUNCTION SALVARPERFILTCERO
=========================================================*/
async function salvarPerfilTCERO(){
let nome=document.getElementById('tc_nome').value.trim()
let user=document.getElementById('tc_user').value.trim().toLowerCase()
let senha=document.getElementById('tc_senha').value.trim()
let cargo=document.getElementById('tc_cargo').value.trim()
let permissao_pdf=document.getElementById('tc_pdf').value==='true'
let nivel=Number(document.getElementById('tc_nivel').value||4)
if(!nome||!user){
alert('Preencha nome e usuário')
return
}
let payload={nome_completo:nome,username:user,senha:senha,cargo:cargo,nivel_acesso:nivel,permissao_pdf:permissao_pdf}
let res=null
if(window.editTCEROId){
res=await client.from('perfistce').update(payload).eq('id',window.editTCEROId)
}else{
res=await client.from('perfistce').insert(payload)
}
if(res.error){
console.error(res.error)
alert('Erro ao salvar')
return
}
window.editTCEROId=null
document.getElementById('tc_nome').value=''
document.getElementById('tc_user').value=''
document.getElementById('tc_senha').value=''
document.getElementById('tc_cargo').value=''
document.getElementById('tc_pdf').value='false'
document.getElementById('tc_nivel').value='4'
let btn=document.getElementById('btnSalvarTCERO')
if(btn){
btn.innerText='INSERIR'
btn.classList.remove('bg-amber-600')
btn.classList.add('bg-blue-700')
}
await carregarTCERO()
alert('Registro salvo com sucesso')
}
/*=========================================================
005 TCERO FUNCTION EXCLUIRTCERO
=========================================================*/
async function excluirTCERO(id){

if(!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())){
alert('Sem permissão')
return
}

let p=(window.perfisTCERO||[]).find(
x=>String(x.id)===String(id)
)

if(!p){
alert('Perfil não encontrado')
return
}

let protegidos=[
'manoel',
'vagner',
'gleidi'
]

let usernamePerfil=(p.username||'').toLowerCase()

if(protegidos.includes(usernamePerfil)){
alert('Este perfil não pode ser excluído')
return
}

if(!confirm('Excluir perfil '+(p.nome_completo||'')+' ?')){
return
}

let {error}=await client
.from('perfistce')
.delete()
.eq('id',id)

if(error){
console.error(error)
alert('Erro ao excluir')
return
}

await carregarTCERO()

alert('Perfil excluído com sucesso')

}
/*=========================================================
006 TCERO FUNCTION ATIVAREDICAOTCERO
=========================================================*/
function ativarEdicaoTCERO(){
if(!['manoel','vagner','gleidi'].includes(((window.userP&&window.userP.username)||'').toLowerCase())){
alert('Sem permissão')
return
}
window.modoEdicaoTCERO=true
document.querySelectorAll('.campo-editavel-tcero').forEach(e=>{
e.disabled=false
e.classList.remove('opacity-70')
})
let btnEditar=document.getElementById('btnEditarTCERO')
let btnSalvar=document.getElementById('btnSalvarTCERO')
if(btnEditar){
btnEditar.classList.add('hidden')
}
if(btnSalvar){
btnSalvar.hidden=false
btnSalvar.style.display='inline-flex'
btnSalvar.style.visibility='visible'
btnSalvar.style.opacity='1'
btnSalvar.classList.remove('hidden')
}
document.querySelectorAll('.btn-excluir-tcero').forEach(b=>{
b.classList.remove('hidden')
})
}
/*=========================================================
007 TCERO FUNCTION SALVAREDICAOTCERO
=========================================================*/
async function salvarEdicaoTCERO(){
let linhas=[...document.querySelectorAll('.linha-tcero')]
for(let l of linhas){
let id=l.dataset.id
let nome=document.getElementById('nome_'+id)?.value||''
let username=document.getElementById('user_'+id)?.value||''
let cargo=document.getElementById('cargo_'+id)?.value||''
let senha=document.getElementById('senha_'+id)?.value||''
let nivel=document.getElementById('nivel_'+id)?.value||1
let permissao=document.getElementById('pdf_'+id)?.value==='SIM'
let {error}=await client.from('perfistce').update({
nome_completo:nome,
username:username,
cargo:cargo,
senha:senha,
nivel_acesso:Number(nivel),
permissao_pdf:permissao
}).eq('id',id)
if(error){
console.error(error)
alert('Erro ao salvar alterações')
return
}
}
window.modoEdicaoTCERO=false
await carregarTCERO()
document.querySelectorAll('.btn-excluir-tcero').forEach(b=>{
b.classList.add('hidden')
})
let btnSalvar=document.getElementById('btnSalvarTCERO')
if(btnSalvar){
btnSalvar.classList.add('hidden')
}
let btnEditar=document.getElementById('btnEditarTCERO')
if(btnEditar){
btnEditar.classList.remove('hidden')
}
alert('Alterações salvas com sucesso')
}
/*=========================================================
008 TCERO FUNCTION CARREGARTCERO
=========================================================*/
async function carregarTCERO(){
let lista=document.getElementById('listaTCERO')
if(!lista)return
lista.innerHTML='<div class="p-3 text-[11px] font-black">Carregando Perfis TCE-RO...</div>'
let {data,error}=await client.from('perfistce').select('*').order('nome_completo',{ascending:true})
if(error){
console.error(error)
lista.innerHTML='<div class="p-3 text-red-700 text-[11px] font-black">Erro ao carregar.</div>'
return
}
window.perfisTCERO=data||[]
let podeEditar=['manoel','vagner','gleidi'].includes(((window.userP&&window.userP.username)||'').toLowerCase())
let boxCadastro=document.getElementById('boxCadastroTCERO')
if(boxCadastro){
boxCadastro.style.display='flex'
if(!podeEditar){
boxCadastro.classList.add('opacity-50','pointer-events-none')
}else{
boxCadastro.classList.remove('opacity-50','pointer-events-none')
}
}
if(!data||!data.length){
lista.innerHTML='<div class="p-3 text-[11px] font-black">Nenhum perfil encontrado.</div>'
return
}
lista.innerHTML=`
<div class="flex justify-end items-center gap-2 mb-2">
${podeEditar?`
<button id="btnEditarTCERO" onclick="ativarEdicaoTCERO()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow flex items-center justify-center min-w-[82px]">
EDITAR
</button>
`:''}
${podeEditar?`
<button id="btnSalvarTCERO" onclick="salvarEdicaoTCERO()" class="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-[9px] font-black shadow flex items-center justify-center min-w-[82px]" hidden>
SALVAR
</button>
`:''}
</div>
<div class="overflow-x-auto w-full rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,.06)]">
<table class="w-full min-w-[780px] border-separate border-spacing-y-1 text-[10px]">
<thead>
<tr class="text-[9px] uppercase font-black text-slate-700 leading-none">
<th class="text-left px-2 py-1.5">Nome</th>
<th class="text-left px-2 py-1.5">Usuário</th>
<th class="text-left px-2 py-1.5">Cargo</th>
<th class="text-left px-2 py-1.5">Senha</th>
<th class="text-center px-2 py-1.5">Nível</th>
<th class="text-center px-2 py-1.5">PDF</th>
<th class="text-center px-2 py-1.5">Ações</th>
</tr>
</thead>
<tbody>
${data.map(p=>`
<tr class="linha-tcero bg-white/92 hover:bg-amber-50 transition shadow-[0_4px_18px_rgba(0,0,0,0.05)]" data-id="${p.id}">
<td class="px-2 py-1 rounded-l-xl">
<input id="nome_${p.id}" value="${p.nome_completo||''}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[10px] font-black outline-none border-none">
</td>
<td class="px-2 py-1">
<input id="user_${p.id}" value="${p.username||''}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-bold outline-none border-none text-blue-900">
</td>
<td class="px-2 py-1">
<input id="cargo_${p.id}" value="${p.cargo||''}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-semibold outline-none border-none">
</td>
<td class="px-2 py-1">
<input id="senha_${p.id}" value="${p.senha||''}" disabled class="campo-editavel-tcero opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none text-red-700">
</td>
<td class="px-2 py-1 text-center">
<select id="nivel_${p.id}" disabled class="campo-editavel-tcero opacity-70 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[8px] font-black border-none outline-none">
<option value="1" ${Number(p.nivel_acesso)===1?'selected':''}>Nível 1</option>
<option value="2" ${Number(p.nivel_acesso)===2?'selected':''}>Nível 2</option>
<option value="3" ${Number(p.nivel_acesso)===3?'selected':''}>Nível 3</option>
<option value="4" ${Number(p.nivel_acesso)===4?'selected':''}>Nível 4</option>
</select>
</td>
<td class="px-2 py-1 text-center">
<select id="pdf_${p.id}" ${Number(p.nivel_acesso)!==1?'disabled':''} class="campo-editavel-tcero opacity-70 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[8px] font-black border-none outline-none">
<option value="SIM" ${p.permissao_pdf?'selected':''}>COM PDF</option>
<option value="NAO" ${!p.permissao_pdf?'selected':''}>SEM PDF</option>
</select>
</td>
<td class="px-2 py-1 text-center rounded-r-xl">
${podeEditar&&Number(p.nivel_acesso)!==1?`
<button onclick="excluirTCERO('${p.id}')" class="btn-excluir-tcero hidden bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[8px] font-black shadow">
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
}




window.salvarNovoTCERO=async function(){

let nome=document.getElementById('tc_nome')?.value||''
let username=document.getElementById('tc_user')?.value||''
let senha=document.getElementById('tc_senha')?.value||''
let cargo=document.getElementById('tc_cargo')?.value||''
let nivel=document.getElementById('tc_nivel')?.value||4
let permissao=document.getElementById('tc_pdf')?.value==='true'

if(!nome||!username){
alert('Preencha nome e usuário')
return
}

let {error}=await client
.from('perfistce')
.insert({
nome_completo:nome,
username:username,
senha:senha,
cargo:cargo,
nivel_acesso:Number(nivel),
permissao_pdf:permissao
})

if(error){
console.error(error)
alert('Erro ao inserir')
return
}

alert('Usuário inserido com sucesso')

await carregarTCERO()

novoTCERO()

}
