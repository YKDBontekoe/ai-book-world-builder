import{j as r}from"./jsx-runtime-DkXG0dSe.js";import{C as d,d as m}from"./card-BK2twvZ7.js";import{c}from"./utils-CDN07tui.js";import"./iframe-CQhYFeFS.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-B_jtOnfb.js";function n({children:s,className:t,columns:e={mobile:1,sm:2,lg:3},gap:o=4,...l}){return r.jsx("div",{className:c("grid","grid-cols-1",e.sm&&`sm:grid-cols-${e.sm}`,e.md&&`md:grid-cols-${e.md}`,e.lg&&`lg:grid-cols-${e.lg}`,e.xl&&`xl:grid-cols-${e.xl}`,`gap-${o}`,t),...l,children:s})}try{n.displayName="GridList",n.__docgenInfo={description:"",displayName:"GridList",props:{columns:{defaultValue:{value:"{ mobile: 1, sm: 2, lg: 3 }"},description:"",name:"columns",required:!1,type:{name:"{ mobile?: number; sm?: number; md?: number | undefined; lg?: number | undefined; xl?: number | undefined; } | undefined"}},gap:{defaultValue:{value:"4"},description:"",name:"gap",required:!1,type:{name:"number"}}}}}catch{}const b={title:"Design System/Atoms/GridList",component:n,tags:["autodocs"],parameters:{layout:"padded"}},a={render:s=>r.jsx(n,{...s,children:Array.from({length:6}).map((t,e)=>r.jsx(d,{children:r.jsxs(m,{className:"p-6",children:[r.jsxs("div",{className:"font-medium",children:["Item ",e+1]}),r.jsxs("div",{className:"text-sm text-muted-foreground",children:["Description for item ",e+1]})]})},e))})},i={args:{columns:{mobile:1,sm:2,lg:3,xl:4},gap:6},render:s=>r.jsx(n,{...s,children:Array.from({length:8}).map((t,e)=>r.jsx(d,{children:r.jsx(m,{className:"p-6",children:r.jsxs("div",{className:"font-medium",children:["Item ",e+1]})})},e))})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const h=["Default","Responsive"];export{a as Default,i as Responsive,h as __namedExportsOrder,b as default};
