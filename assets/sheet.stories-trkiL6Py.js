import{j as e}from"./jsx-runtime-CEb6Yu9Z.js";import{r as a}from"./iframe-Cj3WSm0_.js";import{B as i}from"./button-Gyupqktc.js";import{I as o}from"./input-DdunQMHj.js";import{L as n}from"./label-CCnuAom7.js";import{S as d,a as c,b as h,c as p,d as u,e as g,f as S,g as x}from"./sheet-B7XAOcUI.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DaG_3QA0.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./x-B4eIidRG.js";import"./createLucideIcon-BUkDJWX8.js";import"./index-1f8CCRBw.js";import"./index-BYQPaGSA.js";import"./index-BaJWiX1E.js";import"./index-Dc_FVRD7.js";import"./index-ClvgDko_.js";import"./index-BKI82s4N.js";import"./index-Dq2FebdD.js";import"./index-CpYPvIvp.js";import"./index-DSqLdEHd.js";import"./index-CwnPP5k2.js";import"./index-aRrTZwOb.js";import"./index-CjBiL2H0.js";const A={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(h,{side:l,children:[e.jsxs(p,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
