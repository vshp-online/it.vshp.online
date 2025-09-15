import{c as B}from"./chunk-4KE642ED-DRV5k_pK.js";import{p as Q}from"./treemap-KMMF4GRG-DK74C3S3-Clb7iZsq.js";import{m as r,G as V,U as X,H as Y,N as q,j as I,$ as J,p as w,u as K,L as Z,a6 as _,aP as ee,aQ as F,aR as te,R as ae,P as ie,aS as le,k as re}from"./mermaid.esm.min-3vBJ1Ic8.js";import"./chunk-5ZJXQJOJ-zsAS_eNz.js";import"./app-CL_X1pR5.js";var se=re.pie,v={sections:new Map,showData:!1},u=v.sections,y=v.showData,oe=structuredClone(se),ne=r(()=>structuredClone(oe),"getConfig"),pe=r(()=>{u=new Map,y=v.showData,ie()},"clear"),de=r(({label:e,value:a})=>{if(a<0)throw new Error(`"${e}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,a),w.debug(`added new section: ${e}, with value: ${a}`))},"addSection"),ce=r(()=>u,"getSections"),ue=r(e=>{y=e},"setShowData"),ge=r(()=>y,"getShowData"),M={getConfig:ne,clear:pe,setDiagramTitle:J,getDiagramTitle:I,setAccTitle:q,getAccTitle:Y,setAccDescription:X,getAccDescription:V,addSection:de,getSections:ce,setShowData:ue,getShowData:ge},he=r((e,a)=>{B(e,a),a.setShowData(e.showData),e.sections.map(a.addSection)},"populateDb"),me={parse:r(async e=>{let a=await Q("pie",e);w.debug(a),he(a,M)},"parse")},fe=r(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),$e=fe,xe=r(e=>{let a=[...e.values()].reduce((l,s)=>l+s,0),D=[...e.entries()].map(([l,s])=>({label:l,value:s})).filter(l=>l.value/a*100>=1).sort((l,s)=>s.value-l.value);return le().value(l=>l.value)(D)},"createPieArcs"),Se=r((e,a,D,l)=>{w.debug(`rendering pie chart
`+e);let s=l.db,T=K(),b=Z(s.getConfig(),T.pie),C=40,o=18,d=4,p=450,g=p,h=_(a),n=h.append("g");n.attr("transform","translate("+g/2+","+p/2+")");let{themeVariables:i}=T,[k]=ee(i.pieOuterStrokeWidth);k??=2;let A=b.textPosition,c=Math.min(g,p)/2-C,L=F().innerRadius(0).outerRadius(c),W=F().innerRadius(c*A).outerRadius(c*A);n.append("circle").attr("cx",0).attr("cy",0).attr("r",c+k/2).attr("class","pieOuterCircle");let m=s.getSections(),E=xe(m),G=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12],f=0;m.forEach(t=>{f+=t});let R=E.filter(t=>(t.data.value/f*100).toFixed(0)!=="0"),$=te(G);n.selectAll("mySlices").data(R).enter().append("path").attr("d",L).attr("fill",t=>$(t.data.label)).attr("class","pieCircle"),n.selectAll("mySlices").data(R).enter().append("text").text(t=>(t.data.value/f*100).toFixed(0)+"%").attr("transform",t=>"translate("+W.centroid(t)+")").style("text-anchor","middle").attr("class","slice"),n.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");let P=[...m.entries()].map(([t,S])=>({label:t,value:S})),x=n.selectAll(".legend").data(P).enter().append("g").attr("class","legend").attr("transform",(t,S)=>{let z=o+d,N=z*P.length/2,U=12*o,j=S*z-N;return"translate("+U+","+j+")"});x.append("rect").attr("width",o).attr("height",o).style("fill",t=>$(t.label)).style("stroke",t=>$(t.label)),x.append("text").attr("x",o+d).attr("y",o-d).text(t=>s.getShowData()?`${t.label} [${t.value}]`:t.label);let H=Math.max(...x.selectAll("text").nodes().map(t=>t?.getBoundingClientRect().width??0)),O=g+C+o+d+H;h.attr("viewBox",`0 0 ${O} ${p}`),ae(h,p,O,b.useMaxWidth)},"draw"),we={draw:Se},Ce={parser:me,db:M,renderer:we,styles:$e};export{Ce as diagram};
