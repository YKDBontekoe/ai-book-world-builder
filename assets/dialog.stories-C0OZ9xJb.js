import{j as e,c as i}from"./utils-C5YlSYqF.js";import{r as o}from"./iframe-ybjbv0n2.js";import{B as g}from"./button-B5EaYe4O.js";import{R as I,T as b,P as _,C as x,b as w,a as h,D as N,O as D}from"./index-Dpd7AKBZ.js";import{X as C}from"./x-B5yN-Qkv.js";import{I as u}from"./input-iD8rVUGB.js";import{L as f}from"./label-TA3_gZYr.js";import"./preload-helper-PPVm8Dsz.js";import"./index-oLCZrnN8.js";import"./index-PGjCCy6q.js";import"./index-Dc_FVRD7.js";import"./index-BhYXv_xt.js";import"./index-BxgBFYZv.js";import"./index-BF0J-bEE.js";import"./index-B6jmt2pe.js";import"./index-Ca2mDIK7.js";import"./index-Bp-7itJj.js";import"./index-DBz-mhmG.js";import"./index-DljWZqmF.js";import"./index-B6mu7Y2J.js";import"./index-MJ24zLVc.js";import"./createLucideIcon-Cjibm4PE.js";const y=I,T=b,F=_,l=o.forwardRef(({className:t,...a},s)=>e.jsx(D,{ref:s,className:i("fixed inset-0 z-50 glass-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...a}));l.displayName=D.displayName;const d=o.forwardRef(({className:t,children:a,hideCloseButton:s,...j},v)=>e.jsxs(F,{children:[e.jsx(l,{}),e.jsxs(x,{ref:v,className:i("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border glass-panel p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl",t),...j,children:[a,!s&&e.jsxs(w,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[e.jsx(C,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Close"})]})]})]}));d.displayName=x.displayName;const n=({className:t,...a})=>e.jsx("div",{className:i("flex flex-col space-y-1.5 text-center sm:text-left",t),...a});n.displayName="DialogHeader";const c=({className:t,...a})=>e.jsx("div",{className:i("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a});c.displayName="DialogFooter";const m=o.forwardRef(({className:t,...a},s)=>e.jsx(h,{ref:s,className:i("text-lg font-semibold leading-none tracking-tight",t),...a}));m.displayName=h.displayName;const p=o.forwardRef(({className:t,...a},s)=>e.jsx(N,{ref:s,className:i("text-sm text-muted-foreground",t),...a}));p.displayName=N.displayName;l.__docgenInfo={description:"",methods:[]};d.__docgenInfo={description:"",methods:[],props:{hideCloseButton:{required:!1,tsType:{name:"boolean"},description:""}}};n.__docgenInfo={description:"",methods:[],displayName:"DialogHeader"};c.__docgenInfo={description:"",methods:[],displayName:"DialogFooter"};m.__docgenInfo={description:"",methods:[]};p.__docgenInfo={description:"",methods:[]};const Z={title:"UI/Dialog",component:y,tags:["autodocs"]},r={render:t=>{const a=o.useId(),s=o.useId();return e.jsxs(y,{...t,children:[e.jsx(T,{asChild:!0,children:e.jsx(g,{variant:"outline",children:"Edit Profile"})}),e.jsxs(d,{className:"sm:max-w-[425px]",children:[e.jsxs(n,{children:[e.jsx(m,{children:"Edit profile"}),e.jsx(p,{children:"Make changes to your profile here. Click save when you're done."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(f,{htmlFor:a,className:"text-right",children:"Name"}),e.jsx(u,{id:a,defaultValue:"Pedro Duarte",className:"col-span-3"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(f,{htmlFor:s,className:"text-right",children:"Username"}),e.jsx(u,{id:s,defaultValue:"@peduarte",className:"col-span-3"})]})]}),e.jsx(c,{children:e.jsx(g,{type:"submit",children:"Save changes"})})]})]})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const $=["Default"];export{r as Default,$ as __namedExportsOrder,Z as default};
