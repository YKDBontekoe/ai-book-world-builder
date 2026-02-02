import{j as e}from"./jsx-runtime-CjXMCCMY.js";import{r as i}from"./iframe-DBjsy9jC.js";import{B as s}from"./button-DNeZXcvH.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-DP9pDiwM.js";import{I as o}from"./input-B2QLhptQ.js";import{L as l}from"./label-D_0mnlKU.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-CmX3xzop.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-BtQzX8nw.js";import"./index-Dc_FVRD7.js";import"./index-DJc7JYCP.js";import"./index-BERZZeLe.js";import"./index-CF3tRaCH.js";import"./index-CUkJHeN7.js";import"./index-84ixZTpt.js";import"./index-CsC1K12S.js";import"./index-B2kbB7Q5.js";import"./index-BKj7uqd3.js";import"./index-YvN5oCWL.js";import"./tslib.es6-C91NJfYC.js";import"./index-Bas82Z5s.js";import"./proxy-Bk77pFzG.js";import"./x-B0gj_PoI.js";import"./createLucideIcon-AQNfKgHk.js";const q={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=i.useId(),t=i.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(s,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(s,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const nameId = React.useId();
    const usernameId = React.useId();
    return <Dialog {...args}>
                <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
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
                    <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>;
  }
}`,...a.parameters?.docs?.source}}};const z=["Default"];export{a as Default,z as __namedExportsOrder,q as default};
