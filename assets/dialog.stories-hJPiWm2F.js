import{j as e}from"./jsx-runtime-C5WAP7zH.js";import{r as s}from"./iframe-BPQmeCJi.js";import{B as i}from"./button-khZlkwON.js";import{D as m,a as d,b as c,c as p,d as g,e as u,f as h}from"./dialog-BWtd1LDH.js";import{I as o}from"./input-DhAWtQ3h.js";import{L as l}from"./label-BTTp1O32.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index--dSwhkFJ.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-D4m9sh5H.js";import"./index-Dc_FVRD7.js";import"./index-Q0NkclQc.js";import"./index-_WXTWG25.js";import"./index-BuYVPBBU.js";import"./index-C7AvY3eD.js";import"./index-BGZ-WPfc.js";import"./index-M1OSD6Xt.js";import"./index-hlV30jwM.js";import"./index-D8ZT_Lvl.js";import"./index-S89Ids-k.js";import"./index-BgPsx88G.js";import"./x-BH7NFeW1.js";import"./createLucideIcon-DYgqfnxb.js";const A={title:"Design System/Atoms/Dialog",component:m,tags:["autodocs"]},a={render:n=>{const r=s.useId(),t=s.useId();return e.jsxs(m,{...n,children:[e.jsx(d,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Edit Profile"})}),e.jsxs(c,{className:"sm:max-w-[425px]",children:[e.jsxs(p,{children:[e.jsx(g,{children:"Edit profile"}),e.jsx(u,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:r,className:"text-right",children:"Name"}),e.jsx(o,{id:r,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(l,{htmlFor:t,className:"text-right",children:"Username"}),e.jsx(o,{id:t,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(h,{children:e.jsx(i,{type:"submit",children:"Save changes"})})]})]})}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
