import{j as e,c as m}from"./utils-f5myUOmm.js";import{c as p}from"./index-xelqgtvm.js";import{r as u}from"./iframe-pbCUPIbf.js";import{L as g}from"./loader-circle-BHWc7_0S.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-86XP680G.js";const l=p("animate-spin",{variants:{size:{xs:"h-3 w-3",sm:"h-4 w-4",md:"h-6 w-6",lg:"h-8 w-8"},variant:{default:"text-foreground",primary:"text-primary",muted:"text-muted-foreground",success:"text-[var(--status-success)]",warning:"text-[var(--status-warning)]",error:"text-[var(--status-error)]",info:"text-[var(--status-info)]"}},defaultVariants:{size:"sm",variant:"muted"}}),r=u.forwardRef(({className:i,size:t,variant:o,...d},c)=>e.jsx(g,{ref:c,className:m(l({size:t,variant:o}),i),...d}));r.displayName="LoadingSpinner";r.__docgenInfo={description:`A unified loading spinner component with consistent sizing and color variants.
Replaces scattered Loader2 instances throughout the codebase.`,methods:[],displayName:"LoadingSpinner",composes:["VariantProps"]};const j={title:"UI/LoadingSpinner",component:r,tags:["autodocs"],parameters:{layout:"centered"}},a={args:{size:"md",variant:"default"}},n={render:()=>e.jsxs("div",{className:"flex gap-4 items-center",children:[e.jsx(r,{size:"xs"}),e.jsx(r,{size:"sm"}),e.jsx(r,{size:"md"}),e.jsx(r,{size:"lg"})]})},s={render:()=>e.jsxs("div",{className:"flex gap-4 items-center bg-zinc-100 p-4 rounded",children:[e.jsx(r,{variant:"primary"}),e.jsx(r,{variant:"muted"}),e.jsx(r,{variant:"success"}),e.jsx(r,{variant:"warning"}),e.jsx(r,{variant:"error"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const h=["Default","Sizes","Variants"];export{a as Default,n as Sizes,s as Variants,h as __namedExportsOrder,j as default};
