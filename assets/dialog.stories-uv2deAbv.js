import{j as e}from"./jsx-runtime-D1UpiHbx.js";import{r as i}from"./iframe-CJ9ST3nQ.js";import{B as s}from"./button-DKrJF6Hk.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-Cf52cmEu.js";import{I as o}from"./input-DS4v0osL.js";import{L as l}from"./label-C7veeXoL.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-DzxdF0ZA.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-DUHM0FW3.js";import"./index-Dc_FVRD7.js";import"./index-C-TnkZqj.js";import"./index-Ch78LSwN.js";import"./index-CM3-SV60.js";import"./index-BKNYxBHU.js";import"./index-CiQtvz38.js";import"./index-CDHr9zS4.js";import"./index-B2NNHitj.js";import"./index-BqDJDtFL.js";import"./index-B7plcb3H.js";import"./tslib.es6-C91NJfYC.js";import"./index-BxPjKEKs.js";import"./proxy-ByHBLDe3.js";import"./x-DFCjJdpJ.js";import"./createLucideIcon-DrL2i6gp.js";const q={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=i.useId(),t=i.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(s,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(s,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
