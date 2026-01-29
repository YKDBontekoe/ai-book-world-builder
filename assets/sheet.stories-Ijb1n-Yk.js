import{j as e}from"./jsx-runtime-C2-f06ZH.js";import{r as a}from"./iframe-BAzJ5-me.js";import{B as i}from"./button-CYm1p2zJ.js";import{I as o}from"./input-CrRPbFmb.js";import{L as n}from"./label-D1dmOGfV.js";import{S as d,a as c,b as p,c as h,d as u,e as g,f as S,g as x}from"./sheet-CtumRgLN.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-h-Bamn3L.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./x-Q4m2_o6f.js";import"./createLucideIcon-SZfyMT7w.js";import"./index-BiIRLkwQ.js";import"./index-gh9oFeYY.js";import"./proxy-DVZDXNbO.js";import"./index-Dmtvoy8L.js";import"./index-Dc_FVRD7.js";import"./index-DeZwIEx4.js";import"./index-BYvSPhdM.js";import"./index-9-lTgOEN.js";import"./index-Bacgi-u2.js";import"./index-DkJd_URC.js";import"./index-6ZLagryB.js";import"./index-DRCIty1k.js";import"./tslib.es6-C91NJfYC.js";import"./index-qkq5N_yl.js";const G={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(p,{side:l,children:[e.jsxs(h,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
