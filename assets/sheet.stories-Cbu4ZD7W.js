import{j as e}from"./jsx-runtime-CAvCWP6l.js";import{r as a}from"./iframe-BvcWfE_Q.js";import{B as i}from"./button-lrjP4XD8.js";import{I as o}from"./input-054vPZe_.js";import{L as n}from"./label-k5DkdfFP.js";import{S as d,a as c,b as p,c as h,d as u,e as g,f as S,g as x}from"./sheet-BpDpaxMY.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-EkK5_ruT.js";import"./index-LHNt3CwB.js";import"./utils-BQHNewu7.js";import"./x-Bwf5q6DJ.js";import"./createLucideIcon-CHqQLITI.js";import"./index-BdvsgX9d.js";import"./index-SJTRcweA.js";import"./proxy-B6Uk4QYJ.js";import"./index-g2WSK9lD.js";import"./index-Dc_FVRD7.js";import"./index-D7-ggrsw.js";import"./index-DhnZWLui.js";import"./index-C4tdgKIL.js";import"./index-B737Y0A4.js";import"./index-294tqNjA.js";import"./index-RqWTaDyX.js";import"./index-Bt92XAOa.js";import"./tslib.es6-C91NJfYC.js";import"./index-BLGP2udD.js";const G={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(p,{side:l,children:[e.jsxs(h,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
