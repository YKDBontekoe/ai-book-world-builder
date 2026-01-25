import{j as e}from"./jsx-runtime-BkxPgO02.js";import{r as a}from"./iframe-8oYaY12-.js";import{B as i}from"./button-DsSDXxqG.js";import{I as o}from"./input-Dmjg5FjG.js";import{L as n}from"./label-BWScb7aR.js";import{S as d,a as c,b as p,c as h,d as u,e as g,f as S,g as x}from"./sheet-DvNbJtWj.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-CrVx2R_3.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./x-PxvBKwuv.js";import"./createLucideIcon-B45m9wMx.js";import"./index-By6XbQ8D.js";import"./index-DG-lW7jO.js";import"./index-B_GmHuAd.js";import"./index-Dc_FVRD7.js";import"./index-BmrpOJG7.js";import"./index-C3x0aVZi.js";import"./index-DD7qk0su.js";import"./index-CnN1Qdb8.js";import"./index-DDLOsgpg.js";import"./index-Cg3JJct8.js";import"./index-KBgC2MSG.js";import"./tslib.es6-C91NJfYC.js";import"./index-BO926wF8.js";const z={title:"Design System/Atoms/Sheet",component:d,tags:["autodocs"],argTypes:{side:{control:"select",options:["top","bottom","left","right"]}}},t={render:({side:l="right",...m})=>{const r=a.useId(),s=a.useId();return e.jsxs(d,{...m,children:[e.jsx(c,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Sheet"})}),e.jsxs(p,{side:l,children:[e.jsxs(h,{children:[e.jsx(u,{children:"Edit profile"}),e.jsx(g,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(n,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(S,{children:e.jsx(x,{asChild:!0,children:e.jsx(i,{type:"submit",children:"Save changes"})})})]})]})}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const G=["Default"];export{t as Default,G as __namedExportsOrder,z as default};
