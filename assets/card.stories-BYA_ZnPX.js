import{j as r}from"./jsx-runtime-DpwduvGg.js";import{B as n}from"./button-DOOOYFQF.js";import{C as t,a as o,b as d,c as i,d as c,e as l}from"./card-Ze_lkLl8.js";import"./iframe-1wBmPNgB.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BHqsyan7.js";import"./index-h6qoG7Gi.js";import"./utils-CiB0LXSo.js";const v={title:"Design System/Atoms/Card",component:t,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","interactive","glass"]}}},e={render:s=>r.jsxs(t,{...s,className:"w-[350px]",children:[r.jsxs(o,{children:[r.jsx(d,{children:"Card Title"}),r.jsx(i,{children:"Card Description goes here."})]}),r.jsx(c,{children:r.jsx("p",{children:"This is the main content of the card."})}),r.jsxs(l,{className:"flex justify-between",children:[r.jsx(n,{variant:"outline",children:"Cancel"}),r.jsx(n,{children:"Action"})]})]})},a={args:{variant:"glass"},render:s=>r.jsxs(t,{...s,className:"w-[350px]",children:[r.jsxs(o,{children:[r.jsx(d,{children:"Glass Card"}),r.jsx(i,{children:"Translucent card for overlays."})]}),r.jsx(c,{children:r.jsx("p",{children:"Content visible through glass effect."})}),r.jsx(l,{children:r.jsx(n,{variant:"glass",children:"Glass Button"})})]}),parameters:{backgrounds:{default:"dark"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: args => <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This is the main content of the card.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Action</Button>
            </CardFooter>
        </Card>
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "glass"
  },
  render: args => <Card {...args} className="w-[350px]">
            <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Translucent card for overlays.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Content visible through glass effect.</p>
            </CardContent>
            <CardFooter>
                <Button variant="glass">Glass Button</Button>
            </CardFooter>
        </Card>,
  parameters: {
    backgrounds: {
      default: "dark"
    }
  }
}`,...a.parameters?.docs?.source}}};const T=["Default","Glass"];export{e as Default,a as Glass,T as __namedExportsOrder,v as default};
