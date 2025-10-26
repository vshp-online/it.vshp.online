import{_ as c,c as m,b as e,d as l,w as s,r as i,o as p,e as n}from"./app-Cku2TPGJ.js";const d={},b={class:"line"};function C(g,a){const t=i("RailroadDiagram"),r=i("ClientOnly"),o=i("VPPreview");return p(),m("div",null,[a[1]||(a[1]=e("h1",{id:"railroad-диаграммы",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#railroad-диаграммы"},[e("span",null,"Railroad-диаграммы")])],-1)),a[2]||(a[2]=e("p",null,[e("a",{href:"https://github.com/tabatkins/railroad-diagrams",target:"_blank",rel:"noopener noreferrer"},"https://github.com/tabatkins/railroad-diagrams")],-1)),l(o,{title:"Посмотреть код"},{content:s(()=>[e("span",b,[l(r,null,{default:s(()=>[l(t,{b64:"RGlhZ3JhbSgKICBTZXF1ZW5jZSgKICAgIFRlcm1pbmFsKCJTRUxFQ1QiKSwKICAgIE9wdGlvbmFsKENob2ljZSgwLCBUZXJtaW5hbCgiQUxMIiksIFRlcm1pbmFsKCJESVNUSU5DVCIpKSksCiAgICBDaG9pY2UoMCwKICAgICAgVGVybWluYWwoIioiKSwKICAgICAgT25lT3JNb3JlKE5vblRlcm1pbmFsKCJzZWxlY3RfaXRlbSIpLCBUZXJtaW5hbCgiLCIpKQogICAgKSwKICAgIE9wdGlvbmFsKAogICAgICBTZXF1ZW5jZSgKICAgICAgICBUZXJtaW5hbCgiRlJPTSIpLAogICAgICAgIE9uZU9yTW9yZShOb25UZXJtaW5hbCgidGFibGVfcmVmIiksIFRlcm1pbmFsKCIsIikpCiAgICAgICkKICAgICksCiAgICBPcHRpb25hbChTZXF1ZW5jZShUZXJtaW5hbCgiV0hFUkUiKSwgTm9uVGVybWluYWwoImNvbmRpdGlvbiIpKSksCiAgICBPcHRpb25hbCgKICAgICAgU2VxdWVuY2UoCiAgICAgICAgVGVybWluYWwoIkdST1VQIEJZIiksCiAgICAgICAgT25lT3JNb3JlKE5vblRlcm1pbmFsKCJleHByIiksIFRlcm1pbmFsKCIsIikpCiAgICAgICkKICAgICksCiAgICBPcHRpb25hbChTZXF1ZW5jZShUZXJtaW5hbCgiSEFWSU5HIiksIE5vblRlcm1pbmFsKCJjb25kaXRpb24iKSkpLAogICAgT3B0aW9uYWwoCiAgICAgIFNlcXVlbmNlKAogICAgICAgIFRlcm1pbmFsKCJPUkRFUiBCWSIpLAogICAgICAgIE9uZU9yTW9yZShOb25UZXJtaW5hbCgib3JkZXJfaXRlbSIpLCBUZXJtaW5hbCgiLCIpKQogICAgICApCiAgICApLAogICAgT3B0aW9uYWwoU2VxdWVuY2UoVGVybWluYWwoIkxJTUlUIiksIE5vblRlcm1pbmFsKCJjb3VudCIpKSksCiAgICBPcHRpb25hbChTZXF1ZW5jZShUZXJtaW5hbCgiT0ZGU0VUIiksIE5vblRlcm1pbmFsKCJzdGFydCIpKSkKICApCikK"})]),_:1})])]),code:s(()=>[...a[0]||(a[0]=[e("div",{class:"language-text line-numbers-mode","data-highlighter":"prismjs","data-ext":"text"},[e("pre",null,[e("code",{class:"language-text"},[e("span",{class:"line"},"```railroad"),n(`
`),e("span",{class:"line"},"Diagram("),n(`
`),e("span",{class:"line"},"  Sequence("),n(`
`),e("span",{class:"line"},'    Terminal("SELECT"),'),n(`
`),e("span",{class:"line"},'    Optional(Choice(0, Terminal("ALL"), Terminal("DISTINCT"))),'),n(`
`),e("span",{class:"line"},"    Choice(0,"),n(`
`),e("span",{class:"line"},'      Terminal("*"),'),n(`
`),e("span",{class:"line"},'      OneOrMore(NonTerminal("select_item"), Terminal(","))'),n(`
`),e("span",{class:"line"},"    ),"),n(`
`),e("span",{class:"line"},"    Optional("),n(`
`),e("span",{class:"line"},"      Sequence("),n(`
`),e("span",{class:"line"},'        Terminal("FROM"),'),n(`
`),e("span",{class:"line"},'        OneOrMore(NonTerminal("table_ref"), Terminal(","))'),n(`
`),e("span",{class:"line"},"      )"),n(`
`),e("span",{class:"line"},"    ),"),n(`
`),e("span",{class:"line"},'    Optional(Sequence(Terminal("WHERE"), NonTerminal("condition"))),'),n(`
`),e("span",{class:"line"},"    Optional("),n(`
`),e("span",{class:"line"},"      Sequence("),n(`
`),e("span",{class:"line"},'        Terminal("GROUP BY"),'),n(`
`),e("span",{class:"line"},'        OneOrMore(NonTerminal("expr"), Terminal(","))'),n(`
`),e("span",{class:"line"},"      )"),n(`
`),e("span",{class:"line"},"    ),"),n(`
`),e("span",{class:"line"},'    Optional(Sequence(Terminal("HAVING"), NonTerminal("condition"))),'),n(`
`),e("span",{class:"line"},"    Optional("),n(`
`),e("span",{class:"line"},"      Sequence("),n(`
`),e("span",{class:"line"},'        Terminal("ORDER BY"),'),n(`
`),e("span",{class:"line"},'        OneOrMore(NonTerminal("order_item"), Terminal(","))'),n(`
`),e("span",{class:"line"},"      )"),n(`
`),e("span",{class:"line"},"    ),"),n(`
`),e("span",{class:"line"},'    Optional(Sequence(Terminal("LIMIT"), NonTerminal("count"))),'),n(`
`),e("span",{class:"line"},'    Optional(Sequence(Terminal("OFFSET"), NonTerminal("start")))'),n(`
`),e("span",{class:"line"},"  )"),n(`
`),e("span",{class:"line"},")"),n(`
`),e("span",{class:"line"},"```"),n(`
`),e("span",{class:"line"})])]),e("div",{class:"line-numbers","aria-hidden":"true",style:{"counter-reset":"line-number 0"}},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1)])]),_:1})])}const u=c(d,[["render",C]]),h=JSON.parse('{"path":"/test/railroad.html","title":"Railroad-диаграммы","lang":"ru-RU","frontmatter":{"description":"Railroad-диаграммы https://github.com/tabatkins/railroad-diagrams","head":[["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Railroad-диаграммы\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2025-09-28T13:48:44.000Z\\",\\"author\\":[]}"],["meta",{"property":"og:url","content":"https://it.vshp.online/test/railroad.html"}],["meta",{"property":"og:site_name","content":"Кафедра ИТ"}],["meta",{"property":"og:title","content":"Railroad-диаграммы"}],["meta",{"property":"og:description","content":"Railroad-диаграммы https://github.com/tabatkins/railroad-diagrams"}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"ru-RU"}],["meta",{"property":"og:updated_time","content":"2025-09-28T13:48:44.000Z"}],["meta",{"property":"article:modified_time","content":"2025-09-28T13:48:44.000Z"}]]},"git":{"updatedTime":1759067324000,"contributors":[{"name":"PAVEL TKACHEV","username":"","email":"phoenixweiss@ya.ru","commits":1}],"changelog":[{"hash":"0176f754c314bc7aae65d0c6dfdfe3c7a23260c4","time":1759067324000,"email":"phoenixweiss@ya.ru","author":"PAVEL TKACHEV","message":"Update test.http, <a href=\\"http://test.md\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">test.md</a>, _table.html, and 13 more files"}]},"autoDesc":true,"filePathRelative":"test/railroad.md"}');export{u as comp,h as data};
