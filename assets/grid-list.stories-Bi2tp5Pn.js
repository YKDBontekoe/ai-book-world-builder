import{j as r}from"./jsx-runtime-BvacWYOT.js";import{C as g,d as n}from"./card-D0WSrVnz.js";import{c as t}from"./utils-BQHNewu7.js";import"./iframe-BF9R5wty.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-LHNt3CwB.js";const p={1:"grid-cols-1",2:"grid-cols-2",3:"grid-cols-3",4:"grid-cols-4",5:"grid-cols-5",6:"grid-cols-6",7:"grid-cols-7",8:"grid-cols-8",9:"grid-cols-9",10:"grid-cols-10",11:"grid-cols-11",12:"grid-cols-12"},u={1:"sm:grid-cols-1",2:"sm:grid-cols-2",3:"sm:grid-cols-3",4:"sm:grid-cols-4",5:"sm:grid-cols-5",6:"sm:grid-cols-6",7:"sm:grid-cols-7",8:"sm:grid-cols-8",9:"sm:grid-cols-9",10:"sm:grid-cols-10",11:"sm:grid-cols-11",12:"sm:grid-cols-12"},x={1:"md:grid-cols-1",2:"md:grid-cols-2",3:"md:grid-cols-3",4:"md:grid-cols-4",5:"md:grid-cols-5",6:"md:grid-cols-6",7:"md:grid-cols-7",8:"md:grid-cols-8",9:"md:grid-cols-9",10:"md:grid-cols-10",11:"md:grid-cols-11",12:"md:grid-cols-12"},f={1:"lg:grid-cols-1",2:"lg:grid-cols-2",3:"lg:grid-cols-3",4:"lg:grid-cols-4",5:"lg:grid-cols-5",6:"lg:grid-cols-6",7:"lg:grid-cols-7",8:"lg:grid-cols-8",9:"lg:grid-cols-9",10:"lg:grid-cols-10",11:"lg:grid-cols-11",12:"lg:grid-cols-12"},y={1:"xl:grid-cols-1",2:"xl:grid-cols-2",3:"xl:grid-cols-3",4:"xl:grid-cols-4",5:"xl:grid-cols-5",6:"xl:grid-cols-6",7:"xl:grid-cols-7",8:"xl:grid-cols-8",9:"xl:grid-cols-9",10:"xl:grid-cols-10",11:"xl:grid-cols-11",12:"xl:grid-cols-12"},a={0:"gap-0",1:"gap-1",2:"gap-2",3:"gap-3",4:"gap-4",5:"gap-5",6:"gap-6",7:"gap-7",8:"gap-8",9:"gap-9",10:"gap-10",11:"gap-11",12:"gap-12",16:"gap-16",20:"gap-20",24:"gap-24",32:"gap-32"};function e({children:d,className:l,columns:s={mobile:1,sm:2,lg:3},gap:c=4,...m}){return r.jsx("div",{className:t("grid",p[s.mobile??1]||"grid-cols-1",s.sm&&u[s.sm],s.md&&x[s.md],s.lg&&f[s.lg],s.xl&&y[s.xl],a[c]||a[4],l),...m,children:d})}try{e.displayName="GridList",e.__docgenInfo={description:"",displayName:"GridList",props:{columns:{defaultValue:{value:"{ mobile: 1, sm: 2, lg: 3 }"},description:"",name:"columns",required:!1,type:{name:"{ mobile?: number; sm?: number; md?: number | undefined; lg?: number | undefined; xl?: number | undefined; } | undefined"}},gap:{defaultValue:{value:"4"},description:"",name:"gap",required:!1,type:{name:"number"}}}}}catch{}const G={title:"Design System/Atoms/GridList",component:e,tags:["autodocs"],parameters:{layout:"padded"}},i={render:d=>r.jsx(e,{...d,children:Array.from({length:6}).map((l,s)=>r.jsx(g,{children:r.jsxs(n,{className:"p-6",children:[r.jsxs("div",{className:"font-medium",children:["Item ",s+1]}),r.jsxs("div",{className:"text-sm text-muted-foreground",children:["Description for item ",s+1]})]})},s))})},o={args:{columns:{mobile:1,sm:2,lg:3,xl:4},gap:6},render:d=>r.jsx(e,{...d,children:Array.from({length:8}).map((l,s)=>r.jsx(g,{children:r.jsx(n,{className:"p-6",children:r.jsxs("div",{className:"font-medium",children:["Item ",s+1]})})},s))})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => <GridList {...args}>
            {Array.from({
      length: 6
    }).map((_, i) =>
    // biome-ignore lint/suspicious/noArrayIndexKey: Static storybook example
    <Card key={i}>
                    <CardContent className="p-6">
                        <div className="font-medium">Item {i + 1}</div>
                        <div className="text-sm text-muted-foreground">
                            Description for item {i + 1}
                        </div>
                    </CardContent>
                </Card>)}
        </GridList>
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    columns: {
      mobile: 1,
      sm: 2,
      lg: 3,
      xl: 4
    },
    gap: 6
  },
  render: args => <GridList {...args}>
            {Array.from({
      length: 8
    }).map((_, i) =>
    // biome-ignore lint/suspicious/noArrayIndexKey: Static storybook example
    <Card key={i}>
                    <CardContent className="p-6">
                        <div className="font-medium">Item {i + 1}</div>
                    </CardContent>
                </Card>)}
        </GridList>
}`,...o.parameters?.docs?.source}}};const L=["Default","Responsive"];export{i as Default,o as Responsive,L as __namedExportsOrder,G as default};
