import{j as a}from"./jsx-runtime-C51Jlata.js";import{c as p}from"./utils-CDN07tui.js";import"./iframe-C1iJyMU9.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";function u(e){return e.replace(/([A-Z])/g," $1").replace(/_/g," ").replace(/^\w/,i=>i.toUpperCase()).trim()}function d(e){return e==null?"—":typeof e=="boolean"?e?"Yes":"No":typeof e=="number"?e.toLocaleString():String(e)}function r({data:e,className:i,maxHeight:c=250}){if(!e||typeof e!="object")return a.jsx("div",{className:"text-muted-foreground text-xs py-1",children:e==null?"—":String(e)});if(Array.isArray(e))return e.length===0?a.jsx("div",{className:"text-muted-foreground text-xs italic",children:"Empty list"}):a.jsx("div",{className:"flex flex-col gap-1",children:e.map((s,t)=>a.jsxs("div",{className:"flex items-start gap-2 text-xs",children:[a.jsxs("span",{className:"text-muted-foreground shrink-0",children:[t+1,"."]}),typeof s=="object"?a.jsx(r,{data:s,maxHeight:150}):a.jsx("span",{className:"font-mono",children:d(s)})]},`${t}-${typeof s=="string"?s.substring(0,10):t}`))});const m=Object.entries(e);return m.length===0?a.jsx("div",{className:"text-muted-foreground text-xs italic",children:"No data"}):a.jsx("div",{className:p("w-full rounded-lg border border-border/50 bg-muted/10 overflow-hidden",i),children:a.jsx("div",{className:"overflow-auto",style:{maxHeight:`${c}px`},children:a.jsx("div",{className:"divide-y divide-border/30",children:m.map(([s,t])=>a.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 hover:bg-muted/30 transition-colors",children:[a.jsx("div",{className:"shrink-0 sm:w-1/3 min-w-[100px]",children:a.jsx("span",{className:"text-xs font-medium text-muted-foreground",children:u(s)})}),a.jsx("div",{className:"flex-1 min-w-0",children:typeof t=="object"&&t!==null?a.jsx(r,{data:t,maxHeight:150}):a.jsx("div",{className:"text-sm font-mono break-all",children:d(t)})})]},s))})})})}try{r.displayName="KeyValueTable",r.__docgenInfo={description:"",displayName:"KeyValueTable",props:{data:{defaultValue:null,description:"",name:"data",required:!0,type:{name:"unknown"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},maxHeight:{defaultValue:{value:"250"},description:"",name:"maxHeight",required:!1,type:{name:"number"}}}}}catch{}const j={title:"Design System/Molecules/KeyValueTable",component:r,tags:["autodocs"],parameters:{layout:"padded"}},x={id:"user_123",name:"Alice Wonderland",email:"alice@example.com",isActive:!0,role:"admin",stats:{logins:42,lastLogin:"2023-10-27T10:00:00Z"},tags:["vip","early-access"]},n={args:{data:x}},o={args:{data:{project:"Apollo",details:{budget:1e6,team:{lead:"John Doe",members:["Jane","Bob"]}},milestones:[{name:"Phase 1",status:"complete"},{name:"Phase 2",status:"pending"}]}}},l={args:{data:{}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    data: sampleData
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    data: {
      project: "Apollo",
      details: {
        budget: 1000000,
        team: {
          lead: "John Doe",
          members: ["Jane", "Bob"]
        }
      },
      milestones: [{
        name: "Phase 1",
        status: "complete"
      }, {
        name: "Phase 2",
        status: "pending"
      }]
    }
  }
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    data: {}
  }
}`,...l.parameters?.docs?.source}}};const N=["Default","NestedData","Empty"];export{n as Default,l as Empty,o as NestedData,N as __namedExportsOrder,j as default};
