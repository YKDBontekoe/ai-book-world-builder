import{j as e}from"./jsx-runtime-D6lg5oEM.js";import{r as i}from"./iframe-PpIoxTwR.js";import{B as w}from"./button-Du2kKRKF.js";import{C as F,a as R,b as A,c as L,d as P,e as D}from"./card-BXl2qVVw.js";import{I as v}from"./input-CjcRemtJ.js";import{L as h}from"./label-DqwxjTzH.js";import{c as j}from"./index-Dc_FVRD7.js";import{c as J}from"./index-CRwT03km.js";import{c as S,R as Q,I as W}from"./index-6Q1_BLsq.js";import{P as X}from"./index-BIlFKxRT.js";import{P as T}from"./index-DdC7b3-Y.js";import{u as Y}from"./index-B5_MhxyJ.js";import{u as Z}from"./index-CFUBKiYJ.js";import{u as ee}from"./index-DZO7x7gM.js";import{c as _}from"./utils-CDN07tui.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BZB6OKAD.js";import"./index-B_jtOnfb.js";import"./x-Db28P2wR.js";import"./createLucideIcon-DHxcEPcE.js";import"./index-CExptHD4.js";import"./index-fHDB_X2l.js";import"./index-CDwZ3uFA.js";import"./index-DeAWbZlU.js";var I="Tabs",[ae]=J(I,[S]),V=S(),[se,N]=ae(I),E=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,onValueChange:o,defaultValue:l,orientation:n="horizontal",dir:u,activationMode:m="automatic",...f}=a,c=Y(u),[d,p]=Z({prop:t,onChange:o,defaultProp:l??"",caller:I});return e.jsx(se,{scope:r,baseId:ee(),value:d,onValueChange:p,orientation:n,dir:c,activationMode:m,children:e.jsx(T.div,{dir:c,"data-orientation":n,...f,ref:s})})});E.displayName=I;var M="TabsList",k=i.forwardRef((a,s)=>{const{__scopeTabs:r,loop:t=!0,...o}=a,l=N(M,r),n=V(r);return e.jsx(Q,{asChild:!0,...n,orientation:l.orientation,dir:l.dir,loop:t,children:e.jsx(T.div,{role:"tablist","aria-orientation":l.orientation,...o,ref:s})})});k.displayName=M;var B="TabsTrigger",$=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,disabled:o=!1,...l}=a,n=N(B,r),u=V(r),m=q(n.baseId,t),f=K(n.baseId,t),c=t===n.value;return e.jsx(W,{asChild:!0,...u,focusable:!o,active:c,children:e.jsx(T.button,{type:"button",role:"tab","aria-selected":c,"aria-controls":f,"data-state":c?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:m,...l,ref:s,onMouseDown:j(a.onMouseDown,d=>{!o&&d.button===0&&d.ctrlKey===!1?n.onValueChange(t):d.preventDefault()}),onKeyDown:j(a.onKeyDown,d=>{[" ","Enter"].includes(d.key)&&n.onValueChange(t)}),onFocus:j(a.onFocus,()=>{const d=n.activationMode!=="manual";!c&&!o&&d&&n.onValueChange(t)})})})});$.displayName=B;var G="TabsContent",H=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,forceMount:o,children:l,...n}=a,u=N(G,r),m=q(u.baseId,t),f=K(u.baseId,t),c=t===u.value,d=i.useRef(c);return i.useEffect(()=>{const p=requestAnimationFrame(()=>d.current=!1);return()=>cancelAnimationFrame(p)},[]),e.jsx(X,{present:o||c,children:({present:p})=>e.jsx(T.div,{"data-state":c?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":m,hidden:!p,id:f,tabIndex:0,...n,ref:s,style:{...a.style,animationDuration:d.current?"0s":void 0},children:p&&l})})});H.displayName=G;function q(a,s){return`${a}-trigger-${s}`}function K(a,s){return`${a}-content-${s}`}var re=E,O=k,U=$,z=H;const y=re,x=i.forwardRef(({className:a,...s},r)=>e.jsx(O,{ref:r,className:_("inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",a),...s}));x.displayName=O.displayName;const b=i.forwardRef(({className:a,...s},r)=>e.jsx(U,{ref:r,className:_("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",a),...s}));b.displayName=U.displayName;const g=i.forwardRef(({className:a,...s},r)=>e.jsx(z,{ref:r,className:_("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",a),...s}));g.displayName=z.displayName;try{y.displayName="Tabs",y.__docgenInfo={description:"",displayName:"Tabs",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}try{x.displayName="TabsList",x.__docgenInfo={description:"",displayName:"TabsList",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}try{b.displayName="TabsTrigger",b.__docgenInfo={description:"",displayName:"TabsTrigger",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}try{g.displayName="TabsContent",g.__docgenInfo={description:"",displayName:"TabsContent",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}const Re={title:"Design System/Atoms/Tabs",component:y,tags:["autodocs"],args:{defaultValue:"account",className:"w-[400px]"}},C={render:a=>{const s=i.useId(),r=i.useId(),t=i.useId(),o=i.useId();return e.jsxs(y,{...a,children:[e.jsxs(x,{className:"grid w-full grid-cols-2",children:[e.jsx(b,{value:"account",children:"Account"}),e.jsx(b,{value:"password",children:"Password"})]}),e.jsx(g,{value:"account",children:e.jsxs(F,{children:[e.jsxs(R,{children:[e.jsx(A,{children:"Account"}),e.jsx(L,{children:"Make changes to your account here. Click save when you're done."})]}),e.jsxs(P,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(h,{htmlFor:s,children:"Name"}),e.jsx(v,{id:s,defaultValue:"Pedro Duarte"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(h,{htmlFor:r,children:"Username"}),e.jsx(v,{id:r,defaultValue:"@peduarte"})]})]}),e.jsx(D,{children:e.jsx(w,{children:"Save changes"})})]})}),e.jsx(g,{value:"password",children:e.jsxs(F,{children:[e.jsxs(R,{children:[e.jsx(A,{children:"Password"}),e.jsx(L,{children:"Change your password here. After saving, you'll be logged out."})]}),e.jsxs(P,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(h,{htmlFor:t,children:"Current password"}),e.jsx(v,{id:t,type:"password"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(h,{htmlFor:o,children:"New password"}),e.jsx(v,{id:o,type:"password"})]})]}),e.jsx(D,{children:e.jsx(w,{children:"Save password"})})]})})]})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const nameId = React.useId();
    const usernameId = React.useId();
    const currentId = React.useId();
    const newId = React.useId();
    return <Tabs {...args}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor={nameId}>Name</Label>
                                <Input id={nameId} defaultValue="Pedro Duarte" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={usernameId}>Username</Label>
                                <Input id={usernameId} defaultValue="@peduarte" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="password">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor={currentId}>Current password</Label>
                                <Input id={currentId} type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={newId}>New password</Label>
                                <Input id={newId} type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>;
  }
}`,...C.parameters?.docs?.source}}};const Ae=["Default"];export{C as Default,Ae as __namedExportsOrder,Re as default};
