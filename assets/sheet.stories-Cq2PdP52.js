import{j as e}from"./jsx-runtime-BRR3zdoT.js";import{r as a}from"./iframe-slStxzds.js";import{B as i}from"./button-CYxRwXTc.js";import{I as o}from"./input-K55zyuPD.js";import{L as n}from"./label-FmQxthZH.js";import{S as d,a as c,b as h,c as p,d as u,e as g,f as S,g as x}from"./sheet-DEx5EjsP.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Btg0mc_k.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./x-BUAYMxs4.js";import"./createLucideIcon-ChJOneYA.js";import"./index-CXgh6Mc0.js";import"./index-D48RlhEv.js";import"./index-BzCfyTJq.js";import"./index-Dc_FVRD7.js";import"./index-BU8SobIg.js";import"./index-CEvE01ho.js";import"./index-NnkBuPd4.js";import"./index-W3mhzZeP.js";import"./index-CxAviP-E.js";import"./index-By4eWgkD.js";import"./index-D0U8xe9R.js";import"./index-Zl00t5Zr.js";const A={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(h,{side:l,children:[e.jsxs(p,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: ({
    side = "right",
    ...args
  }: any) => {
    const nameId = React.useId();
    const usernameId = React.useId();
    return <Sheet {...args}>
                <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                    <SheetHeader>
                        <SheetTitle>Edit profile</SheetTitle>
                        <SheetDescription>
                            Make changes to your profile here. Click save when you're done.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={nameId} className="text-right">
                                Name
                            </Label>
                            <Input id={nameId} defaultValue="Pedro Duarte" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={usernameId} className="text-right">
                                Username
                            </Label>
                            <Input id={usernameId} defaultValue="@peduarte" className="col-span-3" />
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit">Save changes</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>;
  }
}`,...t.parameters?.docs?.source}}};const q=["Default"];export{t as Default,q as __namedExportsOrder,A as default};
