import{j as e}from"./jsx-runtime-B5HUvSyd.js";import{r as s}from"./iframe-suaJPEJX.js";import{B as i}from"./button-B_zYtrOc.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-UdSuI1Im.js";import{I as o}from"./input-Bz1zWCWk.js";import{L as l}from"./label-C0d9Cj0D.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-CZLOK1Mk.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-CBX0ddSy.js";import"./index-Dc_FVRD7.js";import"./index-CxioqEpp.js";import"./index-CgyXTBFk.js";import"./index-Dlwm0kIx.js";import"./index-B2GA0OnE.js";import"./index-BAj9DBXE.js";import"./index-6zNUXAZZ.js";import"./index-BtCwED4C.js";import"./index-UbT3IYmf.js";import"./index-DRr3_ftM.js";import"./index-BMI1ybrx.js";import"./x-DKTbCueR.js";import"./createLucideIcon-ysfh8cFP.js";const A={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=s.useId(),t=s.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(i,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const O=["Default"];export{a as Default,O as __namedExportsOrder,A as default};
