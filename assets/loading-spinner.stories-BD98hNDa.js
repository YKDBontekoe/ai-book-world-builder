import{j as r}from"./jsx-runtime-CM1ygEyn.js";import{c as m}from"./index-B_jtOnfb.js";import{r as p}from"./iframe-CwLM70Yl.js";import{c as u}from"./utils-CDN07tui.js";import{L as l}from"./loader-circle-tfGM47pa.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./createLucideIcon-BmWyu2yO.js";const g=m("animate-spin",{variants:{size:{xs:"h-3 w-3",sm:"h-4 w-4",md:"h-6 w-6",lg:"h-8 w-8"},variant:{default:"text-foreground",primary:"text-primary",muted:"text-muted-foreground",success:"text-[var(--status-success)]",warning:"text-[var(--status-warning)]",error:"text-[var(--status-error)]",info:"text-[var(--status-info)]"}},defaultVariants:{size:"sm",variant:"muted"}}),e=p.forwardRef(({className:i,size:t,variant:o,...d},c)=>r.jsx(l,{ref:c,className:u(g({size:t,variant:o}),i),...d}));e.displayName="LoadingSpinner";try{e.displayName="LoadingSpinner",e.__docgenInfo={description:`A unified loading spinner component with consistent sizing and color variants.
Replaces scattered Loader2 instances throughout the codebase.`,displayName:"LoadingSpinner",props:{variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:'"default" | "success" | "warning" | "error" | "info" | "primary" | "muted" | null'}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:'"sm" | "lg" | "xs" | "md" | null'}}}}}catch{}const h={title:"Design System/Atoms/LoadingSpinner",component:e,tags:["autodocs"],parameters:{layout:"centered"}},a={args:{size:"md",variant:"default"}},n={render:()=>r.jsxs("div",{className:"flex gap-4 items-center",children:[r.jsx(e,{size:"xs"}),r.jsx(e,{size:"sm"}),r.jsx(e,{size:"md"}),r.jsx(e,{size:"lg"})]})},s={render:()=>r.jsxs("div",{className:"flex gap-4 items-center bg-zinc-100 p-4 rounded",children:[r.jsx(e,{variant:"primary"}),r.jsx(e,{variant:"muted"}),r.jsx(e,{variant:"success"}),r.jsx(e,{variant:"warning"}),r.jsx(e,{variant:"error"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    size: "md",
    variant: "default"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 items-center">
            <LoadingSpinner size="xs" />
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
        </div>
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 items-center bg-zinc-100 p-4 rounded">
            <LoadingSpinner variant="primary" />
            <LoadingSpinner variant="muted" />
            <LoadingSpinner variant="success" />
            <LoadingSpinner variant="warning" />
            <LoadingSpinner variant="error" />
        </div>
}`,...s.parameters?.docs?.source}}};const w=["Default","Sizes","Variants"];export{a as Default,n as Sizes,s as Variants,w as __namedExportsOrder,h as default};
