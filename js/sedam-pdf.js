/*=========================================================
001 PDF FUNCTION GERARPDFBACKUP
=========================================================*/
function gerarPDFBackup(d){
const {jsPDF}=window.jspdf
let doc=new jsPDF()
doc.setFontSize(10)
doc.text("BACKUP DELIBERAÇÕES",10,10)
let rows=d.map(i=>[i.subitem,String(i.descricao||'-').substring(0,40),String(i.responsavel||'-'),Math.max(i.jan||0,i.fev||0,i.mar||0,i.abr||0,i.mai||0,i.jun||0,i.jul||0,i.ago||0,i.set||0,i.out||0,i.nov||0,i.dez||0)+'%'])
doc.autoTable({head:[['Subitem','Descrição','Responsável','%']],body:rows,startY:24,styles:{fontSize:6},margin:{top:20,bottom:38,left:5,right:5},didDrawPage:function(data){let pageHeight=doc.internal.pageSize.height;let pageWidth=doc.internal.pageSize.width;doc.setFillColor(255,255,255);doc.rect(0,pageHeight-34,pageWidth,34,'F');doc.setTextColor(90,90,90);doc.setFontSize(7);doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',6,pageHeight-26);doc.setFontSize(4);doc.text(NOTA_TECNICA_PDF,10,pageHeight-18,{maxWidth:pageWidth-55,align:'justify'})}})
let totalPages=doc.internal.getNumberOfPages()
for(let i=1;i<=totalPages;i++){
doc.setPage(i)
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFontSize(7)
doc.text('Página '+i+' de '+totalPages,pageWidth-10,pageHeight-6,{align:'right'})
}
doc.save("backup_deliberacoes.pdf")
}
/*=========================================================
002 PDF FUNCTION GERARPDFRESUMO
=========================================================*/
async function gerarPDFResumo(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
let lista=[...(window.allData||[])]

lista=lista.sort((a,b)=>{

function ordem(v){

let p=String(v||'').split('.')

return{
n1:parseInt(p[0]||0),
n2:parseInt(p[1]||0)
}

}

let pa=ordem(a.subitem)
let pb=ordem(b.subitem)

if(pa.n1!==pb.n1)return pa.n1-pb.n1

return pa.n2-pb.n2

})

doc.setFontSize(14)
doc.text('RESUMO EXECUTIVO - TAG SEDAM 2026',10,12)

let grupos={}

lista.forEach(i=>{

let itemPai=String(i.item||'').trim()

if(!grupos[itemPai]){
grupos[itemPai]=[]
}

grupos[itemPai].push(i)

})

let rows=[]

Object.keys(grupos)
.sort((a,b)=>{

let pa=parseFloat(a)||0
let pb=parseFloat(b)||0

return pa-pb

})
.forEach(item=>{

let regs=grupos[item]||[]

let media=Math.round(
regs.reduce((acc,c)=>acc+getTotal(c),0)/(regs.length||1)
)

let descricaoItem=
regs.find(x=>
x.descricaoitem&&
x.descricaoitem.trim()
)?.descricaoitem||'-'

rows.push([
'ITEM '+item,
descricaoItem,
'',
media+'%'
])

regs.forEach(i=>{

rows.push([
'   SUBITEM '+(i.subitem||'-'),
String(i.descricao||'-'),
String(i.produto||'-'),
getTotal(i)+'%'
])

})

})

doc.autoTable({
startY:24,
head:[['ITEM / SUBITEM','DESCRIÇÃO COMPLETA','PRODUTO ESTRATÉGICO','%']],
body:rows,
styles:{
fontSize:7,
overflow:'linebreak',
cellPadding:2,
lineColor:[220,220,220],
lineWidth:.2
},
alternateRowStyles:{
fillColor:[248,248,248]
},
columnStyles:{
0:{cellWidth:28},
1:{cellWidth:82},
2:{cellWidth:70},
3:{cellWidth:15,halign:'center'}
},
margin:{
top:20,
bottom:38,
left:5,
right:5
},
didParseCell:function(data){

let txt=String(data.cell.raw||'')

if(txt.startsWith('ITEM ')){

data.cell.styles.fillColor=[30,58,138]
data.cell.styles.textColor=[255,255,255]
data.cell.styles.fontStyle='bold'

}

},
didDrawPage:function(data){

let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width

doc.setFillColor(255,255,255)
doc.rect(0,pageHeight-34,pageWidth,34,'F')

doc.setTextColor(90,90,90)

doc.setFontSize(7)
doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',6,pageHeight-26)

doc.setFontSize(4)
doc.text(
NOTA_TECNICA_PDF,
10,
pageHeight-18,
{
maxWidth:pageWidth-55,
align:'justify'
}
)

}
})

let totalPages=doc.internal.getNumberOfPages()

for(let i=1;i<=totalPages;i++){

doc.setPage(i)

let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width

doc.setFontSize(7)

doc.text(
'Página '+i+' de '+totalPages,
pageWidth-10,
pageHeight-6,
{
align:'right'
}
)

}

doc.save('pdf_resumo_tag_sedam.pdf')

}
/*=========================================================
003 PDF FUNCTION GERARPDFMONITORAMENTO
=========================================================*/
async function gerarPDFMonitoramento(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
let lista=[...(window.allData||[])].sort(compareSubitem)
doc.setFontSize(14)
doc.text('MONITORAMENTO COMPLETO - TAG SEDAM 2026',10,12)
let rows=lista.map(i=>{let total=getTotal(i);return[i.subitem||'-',i.descricao||'-',String(i.produto||'-'),String(i.responsavel||'-'),(i.jan||0)+'%',(i.fev||0)+'%',(i.mar||0)+'%',(i.abr||0)+'%',(i.mai||0)+'%',total+'%']})
doc.autoTable({startY:24,head:[['Sub','Descrição Completa','Produtos','Responsável','JAN','FEV','MAR','ABR','MAI','TOTAL']],body:rows,theme:'grid',styles:{fontSize:6,overflow:'linebreak',cellPadding:2,valign:'middle'},headStyles:{fillColor:[180,150,110],textColor:[0,0,0],fontStyle:'bold'},columnStyles:{0:{cellWidth:14},1:{cellWidth:82},2:{cellWidth:72},3:{cellWidth:40},4:{cellWidth:10},5:{cellWidth:10},6:{cellWidth:10},7:{cellWidth:10},8:{cellWidth:10},9:{cellWidth:16}},margin:{top:20,bottom:38,left:5,right:5},didDrawPage:function(data){let pageHeight=doc.internal.pageSize.height;let pageWidth=doc.internal.pageSize.width;doc.setFillColor(255,255,255);doc.rect(0,pageHeight-34,pageWidth,34,'F');doc.setTextColor(90,90,90);doc.setFontSize(7);doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',6,pageHeight-26);doc.setFontSize(4);doc.text(NOTA_TECNICA_PDF,10,pageHeight-18,{maxWidth:pageWidth-55,align:'justify'})}})
let finalY=doc.lastAutoTable.finalY+10
doc.setFontSize(10)
let total100=lista.filter(i=>getTotal(i)>=100).length
let media=Math.round(lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1))
doc.text('O monitoramento consolidado demonstra '+lista.length+' subitens estratégicos acompanhados, sendo '+total100+' integralmente cumpridos (100%). A média geral consolidada do painel corresponde a '+media+'% de execução.',10,finalY,{maxWidth:260})
doc.save('pdf_monitoramento_tag_sedam.pdf')
}
/*=========================================================
004 PDF FUNCTION GERARPDFGRAFICOS
=========================================================*/
async function gerarPDFGraficos(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('p','mm','a4')
doc.setFontSize(14)
doc.setTextColor(0,0,0)
doc.text('ANÁLISE GRÁFICA - TAG SEDAM 2026',10,12)
let canvas=document.getElementById('chartMaster')
if(!canvas){
alert('Gráfico não encontrado')
return
}
let img=canvas.toDataURL('image/png',1.0)
doc.addImage(img,'PNG',10,30,190,90)
let info=window.graficoAtualInfo||{}

doc.setFontSize(11)

let texto=''

if(info.tipo==='subitem'){

texto=
'SUBITEM: '+(info.subitem||'-')+
' | ITEM: '+(info.item||'-')+
' | JAN: '+(info.jan||0)+'%'+
' | FEV: '+(info.fev||0)+'%'+
' | MAR: '+(info.mar||0)+'%'+
' | ABR: '+(info.abr||0)+'%'+
' | MAI: '+(info.mai||0)+'%'

}else{

texto=
'ANÁLISE CONSOLIDADA GERAL DO TAG SEDAM 2026'
}

doc.text(texto,10,128,{maxWidth:185})
doc.setFontSize(8)
doc.text(NOTA_TECNICA_PDF,10,140,{maxWidth:190})
let totalPages=doc.internal.getNumberOfPages()
for(let i=1;i<=totalPages;i++){
doc.setPage(i)
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFontSize(7)
doc.text('Página '+i+' de '+totalPages,pageWidth-10,pageHeight-6,{align:'right'})
}
doc.save('pdf_graficos_tag_sedam.pdf')
}
/*=========================================================
005 PDF FUNCTION GERARPDFCUMPRIDOS
=========================================================*/
async function gerarPDFCumpridos(){
const {jsPDF}=window.jspdf
let doc=new jsPDF('l','mm','a4')
let lista=allData.filter(i=>getTotal(i)>=100).sort(compareSubitem)
doc.setFontSize(16)
doc.text('SUBITENS 100% CUMPRIDOS - TAG SEDAM 2026',10,12)
doc.setFontSize(10)
doc.text('TOTAL DE SUBITENS COM 100% DE EXECUÇÃO: '+lista.length,10,19)
let rows=lista.map(i=>[i.subitem||'-',i.descricao||'-',String(i.produto||'-'),String(i.responsavel||'-')])
doc.autoTable({startY:24,head:[['Subitem','Descrição Completa','Produto','Responsável']],body:rows,theme:'striped',styles:{fontSize:5,overflow:'linebreak',cellPadding:1.2,valign:'top',textColor:[0,0,0]},headStyles:{fillColor:[37,99,235],textColor:[255,255,255],fontStyle:'bold',fontSize:6},alternateRowStyles:{fillColor:[245,245,245]},columnStyles:{0:{cellWidth:18},1:{cellWidth:118},2:{cellWidth:78},3:{cellWidth:48}},margin:{top:20,left:8,right:8,bottom:38},didDrawPage:function(data){let pageHeight=doc.internal.pageSize.height;let pageWidth=doc.internal.pageSize.width;doc.setFillColor(255,255,255);doc.rect(0,pageHeight-34,pageWidth,34,'F');doc.setTextColor(90,90,90);doc.setFontSize(7);doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',6,pageHeight-26);doc.setFontSize(4);doc.text(NOTA_TECNICA_PDF,10,pageHeight-18,{maxWidth:pageWidth-55,align:'justify'})}})
let totalPages=doc.internal.getNumberOfPages()
for(let i=1;i<=totalPages;i++){
doc.setPage(i)
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFontSize(7)
doc.text('Página '+i+' de '+totalPages,pageWidth-10,pageHeight-6,{align:'right'})
}
doc.save('pdf_100_cumpridos_tag_sedam.pdf')
}
