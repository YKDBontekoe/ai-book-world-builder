import{j as e}from"./jsx-runtime-CDGvmljq.js";import{r as a}from"./iframe-Bpgpcwxz.js";import{B as i}from"./button-CzeVQGsF.js";import{I as o}from"./input-BLG1yQAJ.js";import{L as n}from"./label-B92xw9IW.js";import{S as d,a as c,b as h,c as p,d as u,e as g,f as S,g as x}from"./sheet-DFMzU0g6.js";import"./preload-helper-PPVm8Dsz.js";import"./index-_ml_VXzt.js";import"./index-CklPxmEV.js";import"./utils-BEHD0UYf.js";import"./x-B1tXHOVD.js";import"./createLucideIcon-kya5NQ2J.js";import"./index-Bfh8Odns.js";import"./index-0T_s_OPL.js";import"./index-CJ7wZuj4.js";import"./index-Dc_FVRD7.js";import"./index-DHIL6TyK.js";import"./index-xWCKv8Gq.js";import"./index-E3bNmBEf.js";import"./index-Ci2_yXK6.js";import"./index-C30A3eSo.js";import"./index-ruEKtRn6.js";import"./index-CVWzokby.js";import"./index-oRayhCx3.js";const A={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(h,{side:l,children:[e.jsxs(p,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
