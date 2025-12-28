import{j as e}from"./jsx-runtime-DIo8mxN6.js";import{r as x}from"./iframe-CaZYac9U.js";import{C as h,a as b,b as v,d as C}from"./card-PdZpD8oq.js";import{C as j,a as y,b as N}from"./collapsible-BEOjunz5.js";import{c as i}from"./utils-CDN07tui.js";import{C as S}from"./chevron-down-DopBCHNH.js";import{I as o}from"./input-gEewfp4u.js";import{L as l}from"./label-CqHv3Tc2.js";import{S as c}from"./settings-BBhkpqSr.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B_jtOnfb.js";import"./index-Dc_FVRD7.js";import"./index-0P4VjF1w.js";import"./index-DbmCKJ90.js";import"./index-Bh8fh9bI.js";import"./index-BCsN-gIg.js";import"./index-CSa0GPyE.js";import"./index-D4uQh_xL.js";import"./index-DI258tBo.js";import"./index-CpPyuxds.js";import"./createLucideIcon-BzZuwm2t.js";import"./x-C-aghKZk.js";const O={primary:"text-primary",blue:"text-blue-500",violet:"text-violet-500",pink:"text-pink-500",amber:"text-amber-500",emerald:"text-emerald-500"};function t({title:a,icon:d,children:p,defaultOpen:m=!1,accentColor:u="primary",className:g}){const[s,f]=x.useState(m);return e.jsx(j,{open:s,onOpenChange:f,children:e.jsxs(h,{className:i("overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm",g),children:[e.jsx(y,{asChild:!0,children:e.jsx(b,{className:"cursor-pointer transition-colors hover:bg-muted/30",children:e.jsxs(v,{className:"flex items-center justify-between text-base",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:O[u],children:d}),a]}),e.jsx(S,{className:i("h-4 w-4 text-muted-foreground transition-transform",s&&"rotate-180")})]})})}),e.jsx(N,{children:e.jsx(C,{className:"space-y-4 pt-0",children:p})})]})})}try{t.displayName="CollapsibleSection",t.__docgenInfo={description:`A collapsible section card with glassmorphism styling.
Used for organizing configuration panels into expandable groups.`,displayName:"CollapsibleSection",props:{title:{defaultValue:null,description:"Section title",name:"title",required:!0,type:{name:"string"}},icon:{defaultValue:null,description:"Icon component to display next to title",name:"icon",required:!0,type:{name:"ReactNode"}},children:{defaultValue:null,description:"Section content",name:"children",required:!0,type:{name:"ReactNode"}},defaultOpen:{defaultValue:{value:"false"},description:"Whether section is expanded by default",name:"defaultOpen",required:!1,type:{name:"boolean"}},accentColor:{defaultValue:{value:"primary"},description:"Accent color for the icon",name:"accentColor",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"blue"'},{value:'"violet"'},{value:'"pink"'},{value:'"amber"'},{value:'"emerald"'}]}},className:{defaultValue:null,description:"Additional class names for the card",name:"className",required:!1,type:{name:"string"}}}}}catch{}const K={title:"Design System/Atoms/CollapsibleSection",component:t,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{icon:{control:!1}}},r={args:{title:"General Settings",icon:e.jsx(c,{className:"h-4 w-4"})},render:a=>e.jsx(t,{...a,children:e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"grid gap-2",children:[e.jsx(l,{htmlFor:"name",children:"Name"}),e.jsx(o,{id:"name",defaultValue:"My Project"})]}),e.jsxs("div",{className:"grid gap-2",children:[e.jsx(l,{htmlFor:"desc",children:"Description"}),e.jsx(o,{id:"desc",placeholder:"Enter description"})]})]})})},n={args:{defaultOpen:!0,title:"Advanced Settings",icon:e.jsx(c,{className:"h-4 w-4"}),accentColor:"violet"},render:a=>e.jsx(t,{...a,children:e.jsx("div",{className:"p-2 text-sm text-muted-foreground",children:"Advanced configuration options appear here."})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: "General Settings",
    icon: <Settings className="h-4 w-4" />
  },
  render: args => <CollapsibleSection {...args}>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="My Project" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="desc">Description</Label>
                    <Input id="desc" placeholder="Enter description" />
                </div>
            </div>
        </CollapsibleSection>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    title: "Advanced Settings",
    icon: <Settings className="h-4 w-4" />,
    accentColor: "violet"
  },
  render: args => <CollapsibleSection {...args}>
            <div className="p-2 text-sm text-muted-foreground">
                Advanced configuration options appear here.
            </div>
        </CollapsibleSection>
}`,...n.parameters?.docs?.source}}};const Q=["Default","OpenByDefault"];export{r as Default,n as OpenByDefault,Q as __namedExportsOrder,K as default};
