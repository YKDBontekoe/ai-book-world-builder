import{j as r}from"./jsx-runtime-BywyK9sa.js";import{B as n}from"./button-C06OVXKt.js";import{C as t,a as o,b as d,c as i,d as c,e as l}from"./card-By9AAJ7A.js";import"./iframe-B-_cFqjo.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Dr3lSX68.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";const j={title:"Design System/Atoms/Card",component:t,tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","interactive","glass"]}}},e={render:s=>r.jsxs(t,{...s,className:"w-[350px]",children:[r.jsxs(o,{children:[r.jsx(d,{children:"Card Title"}),r.jsx(i,{children:"Card Description goes here."})]}),r.jsx(c,{children:r.jsx("p",{children:"This is the main content of the card."})}),r.jsxs(l,{className:"flex justify-between",children:[r.jsx(n,{variant:"outline",children:"Cancel"}),r.jsx(n,{children:"Action"})]})]})},a={args:{variant:"glass"},render:s=>r.jsxs(t,{...s,className:"w-[350px]",children:[r.jsxs(o,{children:[r.jsx(d,{children:"Glass Card"}),r.jsx(i,{children:"Translucent card for overlays."})]}),r.jsx(c,{children:r.jsx("p",{children:"Content visible through glass effect."})}),r.jsx(l,{children:r.jsx(n,{variant:"glass",children:"Glass Button"})})]}),parameters:{backgrounds:{default:"dark"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const v=["Default","Glass"];export{e as Default,a as Glass,v as __namedExportsOrder,j as default};
