import{j as e}from"./utils-DkVKkm3m.js";import{r as a}from"./iframe-BE-fZX6g.js";import{B as i}from"./button-CCRVvTp0.js";import{I as o}from"./input-5QYnee__.js";import{L as d}from"./label-hd9wRykD.js";import{S as n,a as c,b as h,c as p,d as u,e as g,f as S,g as x}from"./sheet-BQX5lsXt.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Gct2mG-U.js";import"./index-6kQFYj-p.js";import"./createLucideIcon-CpZLxAdc.js";import"./index-B_AU1API.js";import"./index-CUq73CUl.js";import"./index-DvKnoq2z.js";import"./index-Dc_FVRD7.js";import"./index-BKeeFBIl.js";import"./index-DGwHzn0a.js";import"./index-BPgxcm0O.js";import"./index-DcQaO-Hw.js";import"./index-BvnsMt5c.js";import"./index-vvdIrePx.js";import"./index-CM8Npefd.js";import"./index-CyHg7oCK.js";const P={title:"UI/Sheet",component:n,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(n,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(h,{side:l,children:[e.jsxs(p,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(d,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(d,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const _=["Default"];export{t as Default,_ as __namedExportsOrder,P as default};
