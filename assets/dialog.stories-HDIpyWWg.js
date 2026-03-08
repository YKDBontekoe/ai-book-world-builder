import{j as e}from"./jsx-runtime-vqeZ327E.js";import{r as i}from"./iframe-Bm-3-6Ef.js";import{B as s}from"./button-DuJSFWNQ.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-7N7VSsEA.js";import{I as o}from"./input-C6egzott.js";import{L as l}from"./label-EqwDLwf-.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BgFtLznm.js";import"./index-LHNt3CwB.js";import"./utils-BQHNewu7.js";import"./index-oJMYEX60.js";import"./index-Dc_FVRD7.js";import"./index-CMgUxQ3M.js";import"./index-DcrU0HYy.js";import"./index-OAEOqvR_.js";import"./index-Cp3wN83r.js";import"./index-DDPWiUQC.js";import"./index-BRXr-EPr.js";import"./index-Bhfcucu9.js";import"./index-CQt4WdtJ.js";import"./index-Clhhb476.js";import"./tslib.es6-C91NJfYC.js";import"./index-DgzveZBH.js";import"./proxy-C4U5bknV.js";import"./x-DWwu9pj_.js";import"./createLucideIcon-ConE60GQ.js";const q={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=i.useId(),t=i.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(s,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(s,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
