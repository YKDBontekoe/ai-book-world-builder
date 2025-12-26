import{j as s,c as p}from"./utils-DAFI9laC.js";import"./iframe-CSnRqzqz.js";import"./preload-helper-PPVm8Dsz.js";function u(e){return e.replace(/([A-Z])/g," $1").replace(/_/g," ").replace(/^\w/,l=>l.toUpperCase()).trim()}function m(e){return e==null?"—":typeof e=="boolean"?e?"Yes":"No":typeof e=="number"?e.toLocaleString():String(e)}function i({data:e,className:l,maxHeight:c=250}){if(!e||typeof e!="object")return s.jsx("div",{className:"text-muted-foreground text-xs py-1",children:e==null?"—":String(e)});if(Array.isArray(e))return e.length===0?s.jsx("div",{className:"text-muted-foreground text-xs italic",children:"Empty list"}):s.jsx("div",{className:"flex flex-col gap-1",children:e.map((a,t)=>s.jsxs("div",{className:"flex items-start gap-2 text-xs",children:[s.jsxs("span",{className:"text-muted-foreground shrink-0",children:[t+1,"."]}),typeof a=="object"?s.jsx(i,{data:a,maxHeight:150}):s.jsx("span",{className:"font-mono",children:m(a)})]},t))});const d=Object.entries(e);return d.length===0?s.jsx("div",{className:"text-muted-foreground text-xs italic",children:"No data"}):s.jsx("div",{className:p("w-full rounded-lg border border-border/50 bg-muted/10 overflow-hidden",l),children:s.jsx("div",{className:"overflow-auto",style:{maxHeight:`${c}px`},children:s.jsx("div",{className:"divide-y divide-border/30",children:d.map(([a,t])=>s.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 hover:bg-muted/30 transition-colors",children:[s.jsx("div",{className:"shrink-0 sm:w-1/3 min-w-[100px]",children:s.jsx("span",{className:"text-xs font-medium text-muted-foreground",children:u(a)})}),s.jsx("div",{className:"flex-1 min-w-0",children:typeof t=="object"&&t!==null?s.jsx(i,{data:t,maxHeight:150}):s.jsx("div",{className:"text-sm font-mono break-all",children:m(t)})})]},a))})})})}i.__docgenInfo={description:"",methods:[],displayName:"KeyValueTable",props:{data:{required:!0,tsType:{name:"unknown"},description:""},className:{required:!1,tsType:{name:"string"},description:""},maxHeight:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"250",computed:!1}}}};const j={title:"Elements/KeyValueTable",component:i,tags:["autodocs"],parameters:{layout:"padded"}},x={id:"user_123",name:"Alice Wonderland",email:"alice@example.com",isActive:!0,role:"admin",stats:{logins:42,lastLogin:"2023-10-27T10:00:00Z"},tags:["vip","early-access"]},r={args:{data:x}},n={args:{data:{project:"Apollo",details:{budget:1e6,team:{lead:"John Doe",members:["Jane","Bob"]}},milestones:[{name:"Phase 1",status:"complete"},{name:"Phase 2",status:"pending"}]}}},o={args:{data:{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    data: sampleData
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    data: {}
  }
}`,...o.parameters?.docs?.source}}};const b=["Default","NestedData","Empty"];export{r as Default,o as Empty,n as NestedData,b as __namedExportsOrder,j as default};
