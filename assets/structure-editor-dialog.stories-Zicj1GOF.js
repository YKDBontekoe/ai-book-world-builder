import{j as e}from"./jsx-runtime-CS8oaROS.js";import{w,u as N,e as P}from"./index-Do1wm97G.js";import{B as p}from"./button-CuIN_lgO.js";import{r as u}from"./iframe-BUgYybIx.js";import{t as S}from"./index-CFr-Vr3N.js";import{D as F,a as L,b as q,c as O,d as V,e as K,f as A}from"./dialog-Cy3Vicif.js";import{S as H}from"./scroll-area-Bd8er3_i.js";import{T as U}from"./textarea-BzZaIVnl.js";import{T as J,a as g,b as f,c as y}from"./tooltip-BQGAVO3u.js";import"./action-middleware-VSFGcUfZ.js";import"./index-BOr5GEib.js";import{e as Z}from"./structure-BZ_D2xv-.js";import{c as k}from"./utils-CDN07tui.js";import{c as j}from"./createLucideIcon-D8Mz8-Hx.js";import{W as G}from"./wand-sparkles-ClvXDmlB.js";import{L as Q}from"./loader-circle-DE2YczWi.js";import"./index-ofGadqsS.js";import"./index-B_jtOnfb.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-CYovgLK3.js";import"./index-CMmrfcnC.js";import"./index-Dc_FVRD7.js";import"./index-CiTvknjW.js";import"./index-DDRFDx3H.js";import"./index-DV1zrhiH.js";import"./index-BR-rP9Mm.js";import"./index-DlAz-QAf.js";import"./index-rilbOk8Z.js";import"./index-CKorazvJ.js";import"./index-CRFMpDDa.js";import"./tslib.es6-C91NJfYC.js";import"./index-BcfSwBCB.js";import"./proxy-wMqvQmoM.js";import"./x-Cug0PNI4.js";import"./index-05UbYrZw.js";import"./index-BdQq_4o_.js";import"./index-mH-JSRXJ.js";import"./index-B9WxyUhT.js";import"./index-BMXTqule.js";import"./query-builder-Dj487Nsm.js";import"./db-C8J7cTJQ.js";import"./db-CbgHJYtI.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";const X=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M9 15h6",key:"cctwl0"}],["path",{d:"M12 18v-6",key:"17g6i2"}]],_=j("file-plus",X);const Y=[["path",{d:"M12 10v6",key:"1bos4e"}],["path",{d:"M9 13h6",key:"1uhe8q"}],["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]],M=j("folder-plus",Y);const ee=[["path",{d:"M10 8h.01",key:"1r9ogq"}],["path",{d:"M12 12h.01",key:"1mp3jc"}],["path",{d:"M14 8h.01",key:"1primd"}],["path",{d:"M16 12h.01",key:"1l6xoz"}],["path",{d:"M18 8h.01",key:"emo2bl"}],["path",{d:"M6 8h.01",key:"x9i8wu"}],["path",{d:"M7 16h10",key:"wp8him"}],["path",{d:"M8 12h.01",key:"czm47f"}],["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}]],te=j("keyboard",ee);const re=[["rect",{width:"18",height:"7",x:"3",y:"3",rx:"1",key:"f1a2em"}],["rect",{width:"9",height:"7",x:"3",y:"14",rx:"1",key:"jqznyg"}],["rect",{width:"5",height:"7",x:"16",y:"14",rx:"1",key:"q5h2i8"}]],ne=j("layout-template",re);function se(i){const l=i.split(`
`),s=[];let r=0,o=0;for(let c=0;c<l.length;c++){const t=l[c].trim();if(t)if(t.toLowerCase().startsWith("chapter")||/^\d+\./.test(t)||t.endsWith(":")&&!t.toLowerCase().includes("scene")){r++,o=0;let a=t.replace(/^chapter\s*\d*[:.]?\s*/i,"").replace(/^\d+\.\s*/,"").replace(/:$/,"");a||(a="Untitled Chapter"),s.length>0&&s.push(""),s.push(`Chapter ${r}: ${a}`)}else if(t.toLowerCase().startsWith("scene")||t.startsWith("-")||t.startsWith("*")){o++;let a=t.replace(/^[-*]\s*/,"").replace(/^scene\s*\d*[:.]?\s*/i,"");a||(a="Untitled Scene"),s.push(`  Scene ${o}: ${a}`)}else r>0?(o++,s.push(`  Scene ${o}: ${t}`)):(r++,s.push(`Chapter ${r}: ${t}`))}return s.join(`
`)}function ae(i){const l=i.split(`
`),s=[];let r=null;return l.forEach((o,c)=>{const t=o.trim();if(t)if(t.match(/^chapter/i))r={type:"chapter",title:t,children:[],lineIndex:c},s.push(r);else if(t.match(/^(-|scene)/i)){const a={type:"scene",title:t.replace(/^[-]\s*/,""),lineIndex:c};r?r.children?.push(a):s.push({...a,type:"unknown"})}else r?r.children?.push({type:"scene",title:t,lineIndex:c}):(s.push({type:"chapter",title:t,lineIndex:c}),r=s[s.length-1])}),s}function C({projectId:i,currentStructure:l,onSave:s,children:r}){const[o,c]=u.useState(!1),[t,a]=u.useState(l),[T,E]=u.useState(!1),[x,R]=u.useState(!1),d=u.useRef(null);u.useEffect(()=>{o&&a(l)},[l,o]);const B=async()=>{E(!0);const n=await Z({projectId:i,structureText:t});E(!1),n.success?(S.success("Structure updated successfully"),c(!1),s()):S.error(n.error||"Failed to update structure")},D=n=>{if(!d.current)return;const m=d.current.selectionStart,$=d.current.selectionEnd,z=t.substring(0,m)+n+t.substring($,t.length);a(z),setTimeout(()=>{d.current&&(d.current.focus(),d.current.selectionStart=m+n.length,d.current.selectionEnd=m+n.length)},0)},W=()=>{const n=se(t);a(n),S.success("Structure formatted!")},I=u.useMemo(()=>ae(t),[t]);return e.jsxs(F,{open:o,onOpenChange:c,children:[e.jsx(L,{asChild:!0,children:r}),e.jsxs(q,{className:k("flex flex-col transition-all duration-300 gap-0 p-0 overflow-hidden",x?"sm:max-w-[900px] h-[85vh]":"sm:max-w-[600px] h-[80vh]"),children:[e.jsx(O,{className:"px-6 py-4 border-b border-border/50 bg-muted/20",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx(V,{children:"Structure Editor"}),e.jsx(K,{className:"mt-1",children:"Power edit your book's outline using plain text."})]}),e.jsx("div",{className:"flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50",children:e.jsxs(J,{children:[e.jsxs(g,{children:[e.jsx(f,{asChild:!0,children:e.jsx(p,{variant:"ghost",size:"icon",className:"h-8 w-8 text-muted-foreground hover:text-foreground",onClick:()=>D(`

Chapter: `),"aria-label":"Insert Chapter",children:e.jsx(M,{className:"h-4 w-4"})})}),e.jsx(y,{children:"Insert Chapter"})]}),e.jsxs(g,{children:[e.jsx(f,{asChild:!0,children:e.jsx(p,{variant:"ghost",size:"icon",className:"h-8 w-8 text-muted-foreground hover:text-foreground",onClick:()=>D(`
  Scene: `),"aria-label":"Insert Scene",children:e.jsx(_,{className:"h-4 w-4"})})}),e.jsx(y,{children:"Insert Scene"})]}),e.jsx("div",{className:"w-px h-4 bg-border/50 mx-1"}),e.jsxs(g,{children:[e.jsx(f,{asChild:!0,children:e.jsx(p,{variant:"ghost",size:"icon",className:"h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",onClick:W,"aria-label":"Smart Format",children:e.jsx(G,{className:"h-4 w-4"})})}),e.jsx(y,{children:"Smart Format"})]}),e.jsxs(g,{children:[e.jsx(f,{asChild:!0,children:e.jsx(p,{variant:"ghost",size:"icon",className:k("h-8 w-8 transition-colors",x?"bg-primary/10 text-primary":"text-muted-foreground hover:text-foreground"),onClick:()=>R(!x),"aria-label":"Toggle Preview",children:e.jsx(ne,{className:"h-4 w-4"})})}),e.jsx(y,{children:"Toggle Preview"})]})]})})]})}),e.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[e.jsx("div",{className:k("flex-1 flex flex-col min-w-0"),children:e.jsx(U,{ref:d,value:t,onChange:n=>a(n.target.value),onKeyDown:n=>{(n.metaKey||n.ctrlKey)&&n.key==="Enter"&&(n.preventDefault(),B())},className:"flex-1 resize-none font-mono text-sm border-0 focus-visible:ring-0 rounded-none p-6 leading-relaxed bg-transparent",placeholder:`Chapter 1: The Beginning
  Scene 1: Waking up
  Scene 2: The Call

Chapter 2: The Journey
  Scene 1: Departure`})}),x&&e.jsxs("div",{className:"w-[300px] border-l border-border/50 bg-muted/10 flex flex-col animate-in slide-in-from-right-10 duration-200",children:[e.jsx("div",{className:"px-4 py-3 border-b border-border/50 text-xs font-semibold text-muted-foreground bg-muted/20",children:"Structure Preview"}),e.jsx(H,{className:"flex-1 p-4",children:e.jsxs("div",{className:"space-y-4",children:[I.map(n=>e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm font-medium text-foreground/90",children:[e.jsx(M,{className:"h-3.5 w-3.5 text-primary/70"}),e.jsx("span",{className:"truncate",children:n.title})]}),n.children&&n.children.length>0&&e.jsx("div",{className:"pl-4 space-y-1 mt-1 border-l border-border/50 ml-1.5",children:n.children.map(m=>e.jsxs("div",{className:"flex items-center gap-2 text-xs text-muted-foreground py-0.5",children:[e.jsx(_,{className:"h-3 w-3 opacity-50"}),e.jsx("span",{className:"truncate",children:m.title})]},m.lineIndex))})]},n.lineIndex)),I.length===0&&e.jsx("div",{className:"text-xs text-muted-foreground/50 italic text-center py-8",children:"Start typing to see your structure tree..."})]})})]})]}),e.jsxs(A,{className:"px-6 py-4 border-t border-border/50 bg-muted/20",children:[e.jsxs("div",{className:"mr-auto flex items-center gap-2 text-xs text-muted-foreground opacity-70",children:[e.jsx(te,{className:"h-3 w-3"}),e.jsx("span",{children:"Cmd/Ctrl + Enter to save"})]}),e.jsx(p,{variant:"ghost",onClick:()=>c(!1),children:"Cancel"}),e.jsxs(p,{onClick:B,disabled:T,children:[T&&e.jsx(Q,{className:"mr-2 h-4 w-4 animate-spin"}),"Save Changes"]})]})]})]})}try{C.displayName="StructureEditorDialog",C.__docgenInfo={description:"",displayName:"StructureEditorDialog",props:{projectId:{defaultValue:null,description:"",name:"projectId",required:!0,type:{name:"string"}},currentStructure:{defaultValue:null,description:"",name:"currentStructure",required:!0,type:{name:"string"}},onSave:{defaultValue:null,description:"",name:"onSave",required:!0,type:{name:"() => void"}}}}}catch{}const Ge={title:"Features/Writer/StructureEditorDialog",component:C,parameters:{layout:"centered"},decorators:[i=>e.jsx("div",{className:"p-4",children:e.jsx(i,{})})]},h={args:{projectId:"project-1",currentStructure:`Chapter 1: The Start
  Scene 1: Beginning`,onSave:()=>console.log("Save clicked"),children:e.jsx(p,{children:"Edit Structure"})}},v={args:{...h.args},play:async({canvasElement:i})=>{const s=w(i).getByRole("button",{name:"Edit Structure"});await N.click(s);const r=w(document.body);await P(r.findByRole("dialog",{name:"Structure Editor"})).resolves.toBeInTheDocument()}},b={args:{...h.args},play:async({canvasElement:i})=>{const s=w(i).getByRole("button",{name:"Edit Structure"});await N.click(s);const r=w(document.body);await r.findByRole("dialog",{name:"Structure Editor"});const o=await r.findByRole("button",{name:"Toggle Preview"});await N.click(o),await P(r.findByText("Structure Preview")).resolves.toBeInTheDocument()}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    projectId: "project-1",
    currentStructure: "Chapter 1: The Start\\n  Scene 1: Beginning",
    onSave: () => console.log("Save clicked"),
    children: <Button>Edit Structure</Button>
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Edit Structure"
    });
    await userEvent.click(button);

    // Wait for dialog to appear (it renders in a portal usually)
    // Since we are in storybook, we look at document body for portal
    const body = within(document.body);
    await expect(body.findByRole("dialog", {
      name: "Structure Editor"
    })).resolves.toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", {
      name: "Edit Structure"
    });
    await userEvent.click(button);
    const body = within(document.body);
    // Wait for dialog
    await body.findByRole("dialog", {
      name: "Structure Editor"
    });

    // Toggle preview
    const previewBtn = await body.findByRole("button", {
      name: "Toggle Preview"
    });
    await userEvent.click(previewBtn);
    await expect(body.findByText("Structure Preview")).resolves.toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source}}};const Qe=["Default","Open","WithPreview"];export{h as Default,v as Open,b as WithPreview,Qe as __namedExportsOrder,Ge as default};
