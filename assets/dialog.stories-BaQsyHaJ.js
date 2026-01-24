import{j as e}from"./jsx-runtime-TrN1N8XZ.js";import{r as s}from"./iframe-DmpuEM7e.js";import{B as i}from"./button-DMmwipFw.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-Bs72chNw.js";import{I as o}from"./input-B52y4tbz.js";import{L as l}from"./label-wm_kbT_W.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BH8shF5E.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-D2U9tuph.js";import"./index-Dc_FVRD7.js";import"./index-COYULmnM.js";import"./index--i9XrAAG.js";import"./index-BsYVj7d8.js";import"./index-DBI7tuw6.js";import"./index-4A7CXiOY.js";import"./index-CfPJMG6P.js";import"./index-DHr9tZRl.js";import"./index-RpBCTOgW.js";import"./index-BkDICx22.js";import"./tslib.es6-C91NJfYC.js";import"./index-BwTVGiFE.js";import"./x-BlPP50T5.js";import"./createLucideIcon-VZapp0MG.js";const O={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=s.useId(),t=s.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(i,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const q=["Default"];export{a as Default,q as __namedExportsOrder,O as default};
