import{j as e,c as i}from"./utils-BBbsDSLg.js";import{r as x}from"./iframe-fyhj6FxE.js";import{C as h,a as b,b as v,d as j}from"./card-BX7J6vcI.js";import{C,a as N,b as y}from"./collapsible-WyFF7FUE.js";import{C as S}from"./chevron-down-DBSSWPMX.js";import{I as o}from"./input-BjK8bpdq.js";import{L as l}from"./label-CQyp79OQ.js";import{S as c}from"./settings--oNxt8fh.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BN0K7l6Y.js";import"./index-Dc_FVRD7.js";import"./index-UkL2_Dvd.js";import"./index-DpC_w_uA.js";import"./index-ngk6u2Me.js";import"./index-BC9-jFOQ.js";import"./index-Rsv80y3G.js";import"./index-DI_NvLGA.js";import"./index-BKp_c7KG.js";import"./index-qJDHZ1Mp.js";import"./createLucideIcon-Cw-nM7D0.js";const w={primary:"text-primary",blue:"text-blue-500",violet:"text-violet-500",pink:"text-pink-500",amber:"text-amber-500",emerald:"text-emerald-500"};function s({title:a,icon:d,children:p,defaultOpen:m=!1,accentColor:u="primary",className:g}){const[n,f]=x.useState(m);return e.jsx(C,{open:n,onOpenChange:f,children:e.jsxs(h,{className:i("overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm",g),children:[e.jsx(N,{asChild:!0,children:e.jsx(b,{className:"cursor-pointer transition-colors hover:bg-muted/30",children:e.jsxs(v,{className:"flex items-center justify-between text-base",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:w[u],children:d}),a]}),e.jsx(S,{className:i("h-4 w-4 text-muted-foreground transition-transform",n&&"rotate-180")})]})})}),e.jsx(y,{children:e.jsx(j,{className:"space-y-4 pt-0",children:p})})]})})}s.__docgenInfo={description:`A collapsible section card with glassmorphism styling.
Used for organizing configuration panels into expandable groups.`,methods:[],displayName:"CollapsibleSection",props:{title:{required:!0,tsType:{name:"string"},description:"Section title"},icon:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Icon component to display next to title"},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Section content"},defaultOpen:{required:!1,tsType:{name:"boolean"},description:"Whether section is expanded by default",defaultValue:{value:"false",computed:!1}},accentColor:{required:!1,tsType:{name:"union",raw:"keyof typeof accentColors",elements:[{name:"literal",value:"primary"},{name:"literal",value:"blue"},{name:"literal",value:"violet"},{name:"literal",value:"pink"},{name:"literal",value:"amber"},{name:"literal",value:"emerald"}]},description:"Accent color for the icon",defaultValue:{value:'"primary"',computed:!1}},className:{required:!1,tsType:{name:"string"},description:"Additional class names for the card"}}};const W={title:"UI/CollapsibleSection",component:s,tags:["autodocs"],parameters:{layout:"padded"},argTypes:{icon:{control:!1}}},t={args:{title:"General Settings",icon:e.jsx(c,{className:"h-4 w-4"})},render:a=>e.jsx(s,{...a,children:e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"grid gap-2",children:[e.jsx(l,{htmlFor:"name",children:"Name"}),e.jsx(o,{id:"name",defaultValue:"My Project"})]}),e.jsxs("div",{className:"grid gap-2",children:[e.jsx(l,{htmlFor:"desc",children:"Description"}),e.jsx(o,{id:"desc",placeholder:"Enter description"})]})]})})},r={args:{defaultOpen:!0,title:"Advanced Settings",icon:e.jsx(c,{className:"h-4 w-4"}),accentColor:"violet"},render:a=>e.jsx(s,{...a,children:e.jsx("div",{className:"p-2 text-sm text-muted-foreground",children:"Advanced configuration options appear here."})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const J=["Default","OpenByDefault"];export{t as Default,r as OpenByDefault,J as __namedExportsOrder,W as default};
