/*=========================================================
001 UTILS CONST GLOBAIS
=========================================================*/
const USUARIOS_OCULTOS=['neto','gleidi','vagner']
const NOTA_TECNICA_PDF=`As informações constantes neste painel, gráficos, indicadores e relatórios possuem caráter preliminar e meramente informativo, sendo baseadas nos dados declarados e apresentados até o presente momento pelos jurisdicionados envolvidos. Ressalta-se que tais informações ainda não passaram pela análise técnica de consistência documental, verificação de evidências, validação metodológica e conferência conclusiva pela equipe técnica de auditores designados. A validação oficial ocorrerá posteriormente, por meio da análise técnica dos relatórios de execução, documentos comprobatórios e demais evidências encaminhadas pelos órgãos e entidades responsáveis, culminando na emissão do respectivo Relatório de Monitoramento e demais manifestações técnicas oficiais do Tribunal de Contas.`
/*=========================================================
002 UTILS CLIENT SUPABASE
=========================================================*/
const client=supabase.createClient(window.S_URL,window.S_KEY)
/*=========================================================
003 UTILS VARIAVEIS GLOBAIS
=========================================================*/
let userP=null
let allData=[]
let chartMaster=null
let ocultarConcluidos=false
let filtroDataInicio='2025-01-01'
let filtroDataFim='2028-01-01'
let filtroItemAtivo=null
let modoResumo='subitem'
let editPerfilId=null
window.editTCEROId=null
window.modoEdicaoTCERO=false
/*=========================================================
004 UTILS DESCRICAO ITENS
=========================================================*/
const descItens={"1":"Planejamento Estratégico e Governança","2":"Análise e Revisão do Planejamento Estratégico","3":"Atualização e Consolidação do Plano Estratégico","4":"Governança e Monitoramento Estratégico","5":"Mapeamento e Melhoria de Processos","6":"Desenvolvimento e Estruturação de Sistemas","7":"Adequação Normativa e Legal","8":"Capacitação Técnica e Sensoriamento","9":"Desenvolvimento de Sistemas e Integração","10":"Integração e Expansão Tecnológica","12":"Transparência e Portal Público","15":"Revisão de Plano de Ação","24":"Cadastro de Unidades de Conservação","25":"Programas Ambientais e REDD+","30":"Articulação Institucional","31":"Organização e Gestão Operacional","33":"Monitoramento e Coleta de Dados","45":"Ações Integradas e Cooperação"}
/*=========================================================
005 UTILS PARSESUBITEMPARTS
=========================================================*/
function parseSubitemParts(s){
let [i,rest]=String(s||'0.0').split('.')
let n1=parseInt(i)||0
let n2=parseInt((rest||'0').replace(/[^\d].*$/,''))||0
let suf=(rest||'').replace(/^\d+/,'')||''
return{n1,n2,suf}
}
/*=========================================================
006 UTILS COMPARESUBITEM
=========================================================*/
function compareSubitem(a,b){
let pa=parseSubitemParts(a.subitem)
let pb=parseSubitemParts(b.subitem)
if(pa.n1!==pb.n1)return pa.n1-pb.n1
if(pa.n2!==pb.n2)return pa.n2-pb.n2
return pa.suf.localeCompare(pb.suf)
}
/*=========================================================
007 UTILS GETITEMKEY
=========================================================*/
function getItemKey(i){
return(i.item&&i.item!==''?i.item:(String(i.subitem||'0.0').split('.')[0]))
}
/*=========================================================
008 UTILS GETTOTAL
=========================================================*/
function getTotal(i){
return Math.max(Number(i.jan||0),Number(i.fev||0),Number(i.mar||0),Number(i.abr||0),Number(i.mai||0),Number(i.jun||0),Number(i.jul||0),Number(i.ago||0),Number(i.set||0),Number(i.out||0),Number(i.nov||0),Number(i.dez||0))
}
/*=========================================================
009 UTILS FORMATARDATABR
=========================================================*/
function formatarDataBR(dataStr){
if(!dataStr)return'-'
let p=dataStr.split('-')
if(p.length!==3)return dataStr
return p[2]+'/'+p[1]+'/'+p[0]
}
/*=========================================================
010 UTILS PARSEDATALOCAL
=========================================================*/
function parseDataLocal(dataStr){
if(!dataStr)return null
let p=dataStr.split('-')
if(p.length!==3)return null
return new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12,0,0)
}
/*=========================================================
011 UTILS GETMESATUALINDEX
=========================================================*/
function getMesAtualIndex(){
return new Date().getMonth()
}
/*=========================================================
012 UTILS MESFROMDATA
=========================================================*/
function mesFromData(data){
return['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][new Date(data).getMonth()]
}
/*=========================================================
013 UTILS TRUNCARTEXTO
=========================================================*/
function truncarTexto(t,l=60){
if(!t)return'-'
if(t.length<=l)return t
let c=t.substring(0,l)
let u=c.lastIndexOf(' ')
if(u>0)c=c.substring(0,u)
return c+'...'
}
/*=========================================================
014 UTILS GERARCSV
=========================================================*/
function gerarCSV(d,n){
if(!d||!d.length)return
let c=Object.keys(d[0])
let csv=c.join(";")+"\n"
d.forEach(l=>{
csv+=c.map(k=>`"${(l[k]??'').toString().replace(/"/g,'""')}"`).join(";")+"\n"
})
let b=new Blob([csv],{type:"text/csv"})
let a=document.createElement("a")
a.href=URL.createObjectURL(b)
a.download=n+"_"+Date.now()+".csv"
a.click()
}
/*=========================================================
015 UTILS GERARJSON
=========================================================*/
function gerarJSON(o){
let b=new Blob([JSON.stringify(o,null,2)],{type:"application/json"})
let a=document.createElement("a")
a.href=URL.createObjectURL(b)
a.download="backup_"+Date.now()+".json"
a.click()
}
/*=========================================================
016 UTILS LIMPARFILTRODATA
=========================================================*/
function limparFiltroData(){
document.getElementById('dataInicio').value='2025-01-01'
document.getElementById('dataFim').value='2028-01-01'
filtroDataInicio='2025-01-01'
filtroDataFim='2028-01-01'
renderTable()
renderResumo()
}
/*=========================================================
017 UTILS APLICARFILTRODATA
=========================================================*/
function aplicarFiltroData(){
filtroDataInicio=document.getElementById('dataInicio').value||null
filtroDataFim=document.getElementById('dataFim').value||null
renderTable()
renderResumo()
}
/*=========================================================
018 UTILS TOGGLEOCULTARCONCLUIDOS
=========================================================*/
function toggleOcultarConcluidos(){
ocultarConcluidos=!ocultarConcluidos
let b=document.getElementById('btn-ocultar')
if(b)b.innerText=ocultarConcluidos?'MOSTRAR 100%':'OCULTAR 100%'
renderTable()
renderResumo()
}
/*=========================================================
019 UTILS FECHARDRILL
=========================================================*/
function fecharDrill(){
filtroItemAtivo=null
renderResumo()
document.getElementById('btn-voltar').style.display='none'
}
/*=========================================================
020 UTILS LOGOUT
=========================================================*/
function logout(){
localStorage.clear()
location.reload()
}
/*=========================================================
021 PODE EDITAR MÊS
=========================================================*/
function podeEditarMes(mes){

if(!window.userP)return false

let nivel=Number(window.userP.nivel_acesso||4)

if(nivel===1)return true

let meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

let atual=new Date().getMonth()

let liberado=meses[atual]

return mes===liberado

}
