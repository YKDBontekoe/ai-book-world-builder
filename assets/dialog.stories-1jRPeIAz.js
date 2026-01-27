import{j as e}from"./jsx-runtime-CGuwYgjx.js";import{r as i}from"./iframe-lEuH8Y9z.js";import{B as s}from"./button-DOUTkWrh.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-DJIkzL0Y.js";import{I as o}from"./input-BpftHNOK.js";import{L as l}from"./label-B3GS9i2L.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-Ddp5GVUY.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-OPQnekmA.js";import"./index-Dc_FVRD7.js";import"./index-Bo865CoR.js";import"./index-xwbzIXeJ.js";import"./index-CxSbv2i7.js";import"./index-DNI-lfbS.js";import"./index-D3rOd2u9.js";import"./index-zV144gyd.js";import"./index-DgsAjEiA.js";import"./index-ICPSHHpw.js";import"./index-BeLtPOMd.js";import"./tslib.es6-C91NJfYC.js";import"./index-CkhErRg9.js";import"./proxy-BzBITKss.js";import"./x-DP3-8tje.js";import"./createLucideIcon-bIfdBvxJ.js";const q={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=i.useId(),t=i.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(s,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(s,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
