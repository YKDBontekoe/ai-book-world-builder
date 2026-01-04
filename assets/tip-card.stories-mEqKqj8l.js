import{j as r}from"./jsx-runtime-BWbKVa0X.js";import{c as m}from"./index-B_jtOnfb.js";import{r as f}from"./iframe-D9KKh0by.js";import{c}from"./utils-CDN07tui.js";import{c as g}from"./createLucideIcon-Y-0einC4.js";import"./preload-helper-PPVm8Dsz.js";const h=[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]],b=g("lightbulb",h),x=m("flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm",{variants:{variant:{info:"border-blue-500/20 bg-blue-500/5",warning:"border-amber-500/20 bg-amber-500/5",success:"border-emerald-500/20 bg-emerald-500/5",error:"border-red-500/20 bg-red-500/5"}},defaultVariants:{variant:"info"}}),y={info:"text-blue-500",warning:"text-amber-500",success:"text-emerald-500",error:"text-red-500"},v={info:"text-blue-700 dark:text-blue-300",warning:"text-amber-700 dark:text-amber-300",success:"text-emerald-700 dark:text-emerald-300",error:"text-red-700 dark:text-red-300"},o=f.forwardRef(({className:e,variant:i="info",icon:d=b,children:l,...p},u)=>r.jsxs("div",{ref:u,className:c(x({variant:i}),e),...p,children:[r.jsx(d,{className:c("mt-0.5 h-4 w-4 shrink-0",y[i||"info"]),"aria-hidden":"true"}),r.jsx("div",{className:c("text-sm",v[i||"info"]),children:l})]}));o.displayName="TipCard";try{o.displayName="TipCard",o.__docgenInfo={description:`A tip/info card component for displaying helpful hints and callouts.
Used primarily in configuration panels for user guidance.`,displayName:"TipCard",props:{icon:{defaultValue:null,description:"Custom icon component (defaults to Lightbulb)",name:"icon",required:!1,type:{name:"ElementType<any, keyof IntrinsicElements>"}},variant:{defaultValue:{value:"info"},description:"",name:"variant",required:!1,type:{name:'"success" | "warning" | "error" | "info" | null'}}}}}catch{}const j={title:"Design System/Molecules/TipCard",component:o,tags:["autodocs"],parameters:{layout:"centered"},decorators:[e=>r.jsx("div",{className:"w-[400px]",children:r.jsx(e,{})})]},a={args:{variant:"info",children:"This is a helpful tip for the user."}},s={args:{variant:"warning",children:"This action cannot be undone."}},n={args:{variant:"success",children:"Operation completed successfully."}},t={args:{variant:"error",children:"An error occurred while processing."}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info",
    children: "This is a helpful tip for the user."
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning",
    children: "This action cannot be undone."
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "success",
    children: "Operation completed successfully."
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "error",
    children: "An error occurred while processing."
  }
}`,...t.parameters?.docs?.source}}};const N=["Info","Warning","Success","ErrorState"];export{t as ErrorState,a as Info,n as Success,s as Warning,N as __namedExportsOrder,j as default};
