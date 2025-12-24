import{j as e,c as i}from"./utils-D4ASBRhw.js";import{r as x}from"./iframe-BfvBqUT1.js";import{C as h,a as b,b as v,d as j}from"./card-DW0WRCEY.js";import{C,a as N,b as y}from"./collapsible-BZ6K1fJM.js";import{C as S}from"./chevron-down-o1Tb8h8a.js";import{I as o}from"./input-_awyhI36.js";import{L as l}from"./label-CjSHW7cP.js";import{S as c}from"./settings-CgguA65L.js";import"./preload-helper-PPVm8Dsz.js";import"./index-qDb45jKs.js";import"./index-Dc_FVRD7.js";import"./index-LNGOXMeL.js";import"./index-C_p9mr0h.js";import"./index-CzAOtfJX.js";import"./index-BmPtopuU.js";import"./index-B6UaIq1b.js";import"./index-B2kHzms1.js";import"./index-C49CmXqZ.js";import"./index-C2c4WoQ_.js";import"./createLucideIcon-DDk6ii6k.js";const w={primary:"text-primary",blue:"text-blue-500",violet:"text-violet-500",pink:"text-pink-500",amber:"text-amber-500",emerald:"text-emerald-500"};function s({title:a,icon:d,children:p,defaultOpen:m=!1,accentColor:u="primary",className:g}){const[n,f]=x.useState(m);return e.jsx(C,{open:n,onOpenChange:f,children:e.jsxs(h,{className:i("overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm",g),children:[e.jsx(N,{asChild:!0,children:e.jsx(b,{className:"cursor-pointer transition-colors hover:bg-muted/30",children:e.jsxs(v,{className:"flex items-center justify-between text-base",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:w[u],children:d}),a]}),e.jsx(S,{className:i("h-4 w-4 text-muted-foreground transition-transform",n&&"rotate-180")})]})})}),e.jsx(y,{children:e.jsx(j,{className:"space-y-4 pt-0",children:p})})]})})}s.__docgenInfo={description:`A collapsible section card with glassmorphism styling.
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
