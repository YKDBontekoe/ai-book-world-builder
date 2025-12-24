import{j as r,c}from"./utils-BBbsDSLg.js";import{C as d,d as i}from"./card-BX7J6vcI.js";import"./iframe-fyhj6FxE.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BN0K7l6Y.js";function t({children:a,className:m,columns:e={mobile:1,sm:2,lg:3},gap:o=4,...l}){return r.jsx("div",{className:c("grid","grid-cols-1",e.sm&&`sm:grid-cols-${e.sm}`,e.md&&`md:grid-cols-${e.md}`,e.lg&&`lg:grid-cols-${e.lg}`,e.xl&&`xl:grid-cols-${e.xl}`,`gap-${o}`,m),...l,children:a})}t.__docgenInfo={description:"",methods:[],displayName:"GridList",props:{children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},columns:{required:!1,tsType:{name:"signature",type:"object",raw:`{
	mobile?: number;
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
}`,signature:{properties:[{key:"mobile",value:{name:"number",required:!1}},{key:"sm",value:{name:"number",required:!1}},{key:"md",value:{name:"number",required:!1}},{key:"lg",value:{name:"number",required:!1}},{key:"xl",value:{name:"number",required:!1}}]}},description:"",defaultValue:{value:"{ mobile: 1, sm: 2, lg: 3 }",computed:!1}},gap:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"4",computed:!1}}}};const v={title:"UI/GridList",component:t,tags:["autodocs"],parameters:{layout:"padded"}},s={render:a=>r.jsx(t,{...a,children:Array.from({length:6}).map((m,e)=>r.jsx(d,{children:r.jsxs(i,{className:"p-6",children:[r.jsxs("div",{className:"font-medium",children:["Item ",e+1]}),r.jsxs("div",{className:"text-sm text-muted-foreground",children:["Description for item ",e+1]})]})},e))})},n={args:{columns:{mobile:1,sm:2,lg:3,xl:4},gap:6},render:a=>r.jsx(t,{...a,children:Array.from({length:8}).map((m,e)=>r.jsx(d,{children:r.jsx(i,{className:"p-6",children:r.jsxs("div",{className:"font-medium",children:["Item ",e+1]})})},e))})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <GridList {...args}>
      {Array.from({
      length: 6
    }).map((_, i) => <Card key={i}>
          <CardContent className="p-6">
            <div className="font-medium">Item {i + 1}</div>
            <div className="text-sm text-muted-foreground">
              Description for item {i + 1}
            </div>
          </CardContent>
        </Card>)}
    </GridList>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
    }).map((_, i) => <Card key={i}>
          <CardContent className="p-6">
            <div className="font-medium">Item {i + 1}</div>
          </CardContent>
        </Card>)}
    </GridList>
}`,...n.parameters?.docs?.source}}};const b=["Default","Responsive"];export{s as Default,n as Responsive,b as __namedExportsOrder,v as default};
