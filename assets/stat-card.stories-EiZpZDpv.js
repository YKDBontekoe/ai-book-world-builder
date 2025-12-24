import{j as e,c as n}from"./utils-CaVXCjuD.js";import{c as b}from"./index-CZx9qGgc.js";import{r as f}from"./iframe-Bli-X5mp.js";import{U as o}from"./users-C7izDrKX.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-DYSqYRA4.js";const x=b("rounded-xl border p-4 text-center backdrop-blur-sm",{variants:{variant:{default:"border-border/50 bg-background/50",primary:"border-primary/20 bg-primary/5"}},defaultVariants:{variant:"default"}}),y={default:"text-muted-foreground",primary:"text-primary",blue:"text-blue-500",violet:"text-violet-500",amber:"text-amber-500",emerald:"text-emerald-500",pink:"text-pink-500"},s=f.forwardRef(({className:l,variant:i,icon:c,value:d,label:m,iconColor:u="default",...p},v)=>e.jsxs("div",{ref:v,className:n(x({variant:i}),l),...p,children:[e.jsx("span",{className:n("mx-auto block h-5 w-5",y[u]),"aria-hidden":"true",children:c}),e.jsx("p",{className:"mt-2 font-mono text-2xl font-bold",children:d}),e.jsx("p",{className:"text-xs text-muted-foreground",children:m})]}));s.displayName="StatCard";s.__docgenInfo={description:`A stat display card with icon, value, and label.
Used for displaying key metrics in dashboards.`,methods:[],displayName:"StatCard",props:{icon:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Icon component to display"},value:{required:!0,tsType:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]},description:"Main value to display"},label:{required:!0,tsType:{name:"string"},description:"Label describing the value"},iconColor:{required:!1,tsType:{name:"union",raw:"keyof typeof iconColors",elements:[{name:"literal",value:"default"},{name:"literal",value:"primary"},{name:"literal",value:"blue"},{name:"literal",value:"violet"},{name:"literal",value:"amber"},{name:"literal",value:"emerald"},{name:"literal",value:"pink"}]},description:"Icon color variant",defaultValue:{value:'"default"',computed:!1}}},composes:["VariantProps"]};const k={title:"UI/StatCard",component:s,tags:["autodocs"],parameters:{layout:"centered"}},a={args:{icon:e.jsx(o,{}),value:"1,234",label:"Total Users"}},r={args:{icon:e.jsx(o,{}),value:"5,678",label:"Active Users",variant:"primary",iconColor:"primary"}},t={args:{icon:e.jsx(o,{}),value:"98%",label:"Satisfaction",iconColor:"emerald"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <Users />,
    value: "1,234",
    label: "Total Users"
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <Users />,
    value: "5,678",
    label: "Active Users",
    variant: "primary",
    iconColor: "primary"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <Users />,
    value: "98%",
    label: "Satisfaction",
    iconColor: "emerald"
  }
}`,...t.parameters?.docs?.source}}};const N=["Default","Primary","ColoredIcon"];export{t as ColoredIcon,a as Default,r as Primary,N as __namedExportsOrder,k as default};
