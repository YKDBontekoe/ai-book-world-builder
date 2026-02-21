import{j as e}from"./jsx-runtime-DbNaUrgW.js";import{r as a}from"./iframe-BZeG8Bhh.js";import{B as i}from"./button-CcgbcN5d.js";import{I as o}from"./input-DLe2gqx4.js";import{L as n}from"./label-BgOgp-VB.js";import{S as d,a as c,b as p,c as h,d as u,e as g,f as S,g as x}from"./sheet-6khJAbA6.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-Dz8rHEAi.js";import"./index-h6qoG7Gi.js";import"./utils-CiB0LXSo.js";import"./x-D3pAHYoe.js";import"./createLucideIcon-7eqm4mhV.js";import"./index-BE2jKJHW.js";import"./index-FNH9Mxts.js";import"./proxy-D2Ug7zUq.js";import"./index-CGzbRnj4.js";import"./index-Dc_FVRD7.js";import"./index-CLlknz5p.js";import"./index-BDyKV7Mr.js";import"./index-CUPyHjvZ.js";import"./index-DnAyOk9o.js";import"./index-BPXPwWbz.js";import"./index-C_8vluZO.js";import"./index-Chq-VhpQ.js";import"./tslib.es6-C91NJfYC.js";import"./index-CvGYSK5V.js";const G={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(p,{side:l,children:[e.jsxs(h,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const J=["Default"];export{t as Default,J as __namedExportsOrder,G as default};
