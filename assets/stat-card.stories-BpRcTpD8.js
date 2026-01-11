import{j as e}from"./jsx-runtime-CVEtN_Js.js";import{c as f}from"./index-B_jtOnfb.js";import{r as b}from"./iframe-BZswoYZg.js";import{c as l}from"./utils-CDN07tui.js";import{U as n}from"./users-DPuG5HWw.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./createLucideIcon-ru42-5_c.js";const y=f("rounded-xl border p-4 text-center backdrop-blur-sm",{variants:{variant:{default:"border-border/50 bg-background/50",primary:"border-primary/20 bg-primary/5"}},defaultVariants:{variant:"default"}}),x={default:"text-muted-foreground",primary:"text-primary",blue:"text-blue-500",violet:"text-violet-500",amber:"text-amber-500",emerald:"text-emerald-500",pink:"text-pink-500"},o=b.forwardRef(({className:s,variant:i,icon:c,value:d,label:u,iconColor:m="default",...p},v)=>e.jsxs("div",{ref:v,className:l(y({variant:i}),s),...p,children:[e.jsx("span",{className:l("mx-auto block h-5 w-5",x[m]),"aria-hidden":"true",children:c}),e.jsx("p",{className:"mt-2 font-mono text-2xl font-bold",children:d}),e.jsx("p",{className:"text-xs text-muted-foreground",children:u})]}));o.displayName="StatCard";try{o.displayName="StatCard",o.__docgenInfo={description:`A stat display card with icon, value, and label.
Used for displaying key metrics in dashboards.`,displayName:"StatCard",props:{icon:{defaultValue:null,description:"Icon component to display",name:"icon",required:!0,type:{name:"ReactNode"}},value:{defaultValue:null,description:"Main value to display",name:"value",required:!0,type:{name:"string | number"}},label:{defaultValue:null,description:"Label describing the value",name:"label",required:!0,type:{name:"string"}},iconColor:{defaultValue:{value:"default"},description:"Icon color variant",name:"iconColor",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"primary"'},{value:'"blue"'},{value:'"violet"'},{value:'"pink"'},{value:'"amber"'},{value:'"emerald"'}]}},variant:{defaultValue:null,description:"",name:"variant",required:!1,type:{name:'"default" | "primary" | null'}}}}}catch{}const k={title:"Design System/Molecules/StatCard",component:o,tags:["autodocs"],parameters:{layout:"centered"}},a={args:{icon:e.jsx(n,{}),value:"1,234",label:"Total Users"}},r={args:{icon:e.jsx(n,{}),value:"5,678",label:"Active Users",variant:"primary",iconColor:"primary"}},t={args:{icon:e.jsx(n,{}),value:"98%",label:"Satisfaction",iconColor:"emerald"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const V=["Default","Primary","ColoredIcon"];export{t as ColoredIcon,a as Default,r as Primary,V as __namedExportsOrder,k as default};
