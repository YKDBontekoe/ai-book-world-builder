import{j as e}from"./jsx-runtime-BOVgQ9xh.js";import{r as t}from"./iframe-ulBfQ5J1.js";import{B as i}from"./button-l8RtyRig.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-C1UVA6Ta.js";import{I as o}from"./input-BPWwquwA.js";import{L as l}from"./label-BZzDSnHC.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BlmzGvPT.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-312aQsiq.js";import"./index-Dc_FVRD7.js";import"./index-5xDXehqN.js";import"./index-BG6J0ziF.js";import"./index-gPumQNsS.js";import"./index-D7tmodBL.js";import"./index-qjKn_zjB.js";import"./index-D3W2II41.js";import"./index-CPC_KoOH.js";import"./index-D1zawjnh.js";import"./index-DWYu_stZ.js";import"./index-BUTS5qHv.js";import"./x-DBZmZ89M.js";import"./createLucideIcon-CooRkFWr.js";const _={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=t.useId(),s=t.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(o,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(i,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
