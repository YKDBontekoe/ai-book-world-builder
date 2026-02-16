import{j as e}from"./jsx-runtime-D1UpiHbx.js";import{r as a}from"./iframe-CJ9ST3nQ.js";import{B as i}from"./button-DKrJF6Hk.js";import{I as o}from"./input-DS4v0osL.js";import{L as n}from"./label-C7veeXoL.js";import{S as d,a as c,b as p,c as h,d as u,e as g,f as S,g as x}from"./sheet-DFQYw3TC.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-DzxdF0ZA.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./x-DFCjJdpJ.js";import"./createLucideIcon-DrL2i6gp.js";import"./index-CDHr9zS4.js";import"./index-B2NNHitj.js";import"./proxy-ByHBLDe3.js";import"./index-DUHM0FW3.js";import"./index-Dc_FVRD7.js";import"./index-C-TnkZqj.js";import"./index-Ch78LSwN.js";import"./index-CM3-SV60.js";import"./index-BKNYxBHU.js";import"./index-CiQtvz38.js";import"./index-BqDJDtFL.js";import"./index-B7plcb3H.js";import"./tslib.es6-C91NJfYC.js";import"./index-BxPjKEKs.js";const G={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(p,{side:l,children:[e.jsxs(h,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
