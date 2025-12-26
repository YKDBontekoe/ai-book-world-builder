import{j as r,c}from"./utils-DkVKkm3m.js";import{c as m}from"./index-6kQFYj-p.js";import{r as f}from"./iframe-BE-fZX6g.js";import{c as g}from"./createLucideIcon-CpZLxAdc.js";import"./preload-helper-PPVm8Dsz.js";const h=g("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]),b=m("flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm",{variants:{variant:{info:"border-blue-500/20 bg-blue-500/5",warning:"border-amber-500/20 bg-amber-500/5",success:"border-emerald-500/20 bg-emerald-500/5",error:"border-red-500/20 bg-red-500/5"}},defaultVariants:{variant:"info"}}),x={info:"text-blue-500",warning:"text-amber-500",success:"text-emerald-500",error:"text-red-500"},v={info:"text-blue-700 dark:text-blue-300",warning:"text-amber-700 dark:text-amber-300",success:"text-emerald-700 dark:text-emerald-300",error:"text-red-700 dark:text-red-300"},i=f.forwardRef(({className:o,variant:n="info",icon:d=h,children:l,...p},u)=>r.jsxs("div",{ref:u,className:c(b({variant:n}),o),...p,children:[r.jsx(d,{className:c("mt-0.5 h-4 w-4 shrink-0",x[n||"info"]),"aria-hidden":"true"}),r.jsx("div",{className:c("text-sm",v[n||"info"]),children:l})]}));i.displayName="TipCard";i.__docgenInfo={description:`A tip/info card component for displaying helpful hints and callouts.
Used primarily in configuration panels for user guidance.`,methods:[],displayName:"TipCard",props:{icon:{required:!1,tsType:{name:"ReactElementType",raw:"React.ElementType"},description:"Custom icon component (defaults to Lightbulb)",defaultValue:{value:"Lightbulb",computed:!0}},variant:{defaultValue:{value:'"info"',computed:!1},required:!1}},composes:["VariantProps"]};const j={title:"UI/TipCard",component:i,tags:["autodocs"],parameters:{layout:"centered"},decorators:[o=>r.jsx("div",{className:"w-[400px]",children:r.jsx(o,{})})]},e={args:{variant:"info",children:"This is a helpful tip for the user."}},a={args:{variant:"warning",children:"This action cannot be undone."}},s={args:{variant:"success",children:"Operation completed successfully."}},t={args:{variant:"error",children:"An error occurred while processing."}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "This is a helpful tip for the user."
  }
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: "This action cannot be undone."
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "success",
    children: "Operation completed successfully."
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "error",
    children: "An error occurred while processing."
  }
}`,...t.parameters?.docs?.source}}};const E=["Info","Warning","Success","Error"];export{t as Error,e as Info,s as Success,a as Warning,E as __namedExportsOrder,j as default};
