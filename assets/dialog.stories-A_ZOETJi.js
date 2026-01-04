import{j as e}from"./jsx-runtime-PR5awWR-.js";import{r as t}from"./iframe-DtTbX756.js";import{B as i}from"./button-DW5gfamC.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-CIRBHuzp.js";import{I as o}from"./input-C9MQqm3I.js";import{L as l}from"./label-CUx9XwW7.js";import"./preload-helper-PPVm8Dsz.js";import"./index-VLHf9RGp.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-BA1PmJ8V.js";import"./index-Dc_FVRD7.js";import"./index-GVGGaCJP.js";import"./index-Dv-zKNE2.js";import"./index-Btwyx-CP.js";import"./index-DP_UNARq.js";import"./index-C45F_e6h.js";import"./index-CceaGYc8.js";import"./index-DlwTAF1L.js";import"./index-CG0RmRxa.js";import"./index-NkHibAGT.js";import"./index-CeJ1F2jW.js";import"./x-DFbMIYAU.js";import"./createLucideIcon-D9Cku1Vt.js";const _={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=t.useId(),s=t.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(i,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const A=["Default"];export{a as Default,A as __namedExportsOrder,_ as default};
