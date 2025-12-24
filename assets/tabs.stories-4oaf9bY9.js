import{j as e,c as j}from"./utils-CRavJ7Os.js";import{r as i}from"./iframe-BzFykuzF.js";import{B as N}from"./button-DE_qiNgE.js";import{C as F,a as R,b as _,c as A,d as P,e as L}from"./card-Dea-rNeV.js";import{I as v}from"./input-0XBcMdum.js";import{L as b}from"./label-0wFb-Lny.js";import{c as I}from"./index-Dc_FVRD7.js";import{c as J}from"./index-BTKt_rPH.js";import{c as D,R as Q,I as W}from"./index-BiH2lKQY.js";import{P as X}from"./index-C3bsDPKB.js";import{P as x}from"./index-CrK3AwHy.js";import{u as Y}from"./index-CpFY6hso.js";import{u as Z}from"./index-syQKn0Et.js";import{u as ee}from"./index-DfpQ3ufZ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D4oRfJ4T.js";import"./index-COf9j6Ue.js";import"./createLucideIcon-BIAuiQbk.js";import"./index-1QOI7MqQ.js";import"./index-C_tqhfjw.js";import"./index-lvwHFbWx.js";import"./index-C4MMp8uh.js";var T="Tabs",[ae]=J(T,[D]),S=D(),[se,y]=ae(T),E=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,onValueChange:o,defaultValue:l,orientation:n="horizontal",dir:u,activationMode:p="automatic",...f}=a,c=Y(u),[d,m]=Z({prop:t,onChange:o,defaultProp:l??"",caller:T});return e.jsx(se,{scope:r,baseId:ee(),value:d,onValueChange:m,orientation:n,dir:c,activationMode:p,children:e.jsx(x.div,{dir:c,"data-orientation":n,...f,ref:s})})});E.displayName=T;var M="TabsList",V=i.forwardRef((a,s)=>{const{__scopeTabs:r,loop:t=!0,...o}=a,l=y(M,r),n=S(r);return e.jsx(Q,{asChild:!0,...n,orientation:l.orientation,dir:l.dir,loop:t,children:e.jsx(x.div,{role:"tablist","aria-orientation":l.orientation,...o,ref:s})})});V.displayName=M;var k="TabsTrigger",B=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,disabled:o=!1,...l}=a,n=y(k,r),u=S(r),p=H(n.baseId,t),f=K(n.baseId,t),c=t===n.value;return e.jsx(W,{asChild:!0,...u,focusable:!o,active:c,children:e.jsx(x.button,{type:"button",role:"tab","aria-selected":c,"aria-controls":f,"data-state":c?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:p,...l,ref:s,onMouseDown:I(a.onMouseDown,d=>{!o&&d.button===0&&d.ctrlKey===!1?n.onValueChange(t):d.preventDefault()}),onKeyDown:I(a.onKeyDown,d=>{[" ","Enter"].includes(d.key)&&n.onValueChange(t)}),onFocus:I(a.onFocus,()=>{const d=n.activationMode!=="manual";!c&&!o&&d&&n.onValueChange(t)})})})});B.displayName=k;var $="TabsContent",G=i.forwardRef((a,s)=>{const{__scopeTabs:r,value:t,forceMount:o,children:l,...n}=a,u=y($,r),p=H(u.baseId,t),f=K(u.baseId,t),c=t===u.value,d=i.useRef(c);return i.useEffect(()=>{const m=requestAnimationFrame(()=>d.current=!1);return()=>cancelAnimationFrame(m)},[]),e.jsx(X,{present:o||c,children:({present:m})=>e.jsx(x.div,{"data-state":c?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":p,hidden:!m,id:f,tabIndex:0,...n,ref:s,style:{...a.style,animationDuration:d.current?"0s":void 0},children:m&&l})})});G.displayName=$;function H(a,s){return`${a}-trigger-${s}`}function K(a,s){return`${a}-content-${s}`}var re=E,U=V,O=B,q=G;const z=re,w=i.forwardRef(({className:a,...s},r)=>e.jsx(U,{ref:r,className:j("inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",a),...s}));w.displayName=U.displayName;const h=i.forwardRef(({className:a,...s},r)=>e.jsx(O,{ref:r,className:j("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",a),...s}));h.displayName=O.displayName;const C=i.forwardRef(({className:a,...s},r)=>e.jsx(q,{ref:r,className:j("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",a),...s}));C.displayName=q.displayName;w.__docgenInfo={description:"",methods:[]};h.__docgenInfo={description:"",methods:[]};C.__docgenInfo={description:"",methods:[]};const Ne={title:"UI/Tabs",component:z,tags:["autodocs"],args:{defaultValue:"account",className:"w-[400px]"}},g={render:a=>{const s=i.useId(),r=i.useId(),t=i.useId(),o=i.useId();return e.jsxs(z,{...a,children:[e.jsxs(w,{className:"grid w-full grid-cols-2",children:[e.jsx(h,{value:"account",children:"Account"}),e.jsx(h,{value:"password",children:"Password"})]}),e.jsx(C,{value:"account",children:e.jsxs(F,{children:[e.jsxs(R,{children:[e.jsx(_,{children:"Account"}),e.jsx(A,{children:"Make changes to your account here. Click save when you're done."})]}),e.jsxs(P,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(b,{htmlFor:s,children:"Name"}),e.jsx(v,{id:s,defaultValue:"Pedro Duarte"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(b,{htmlFor:r,children:"Username"}),e.jsx(v,{id:r,defaultValue:"@peduarte"})]})]}),e.jsx(L,{children:e.jsx(N,{children:"Save changes"})})]})}),e.jsx(C,{value:"password",children:e.jsxs(F,{children:[e.jsxs(R,{children:[e.jsx(_,{children:"Password"}),e.jsx(A,{children:"Change your password here. After saving, you'll be logged out."})]}),e.jsxs(P,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(b,{htmlFor:t,children:"Current password"}),e.jsx(v,{id:t,type:"password"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(b,{htmlFor:o,children:"New password"}),e.jsx(v,{id:o,type:"password"})]})]}),e.jsx(L,{children:e.jsx(N,{children:"Save password"})})]})})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};const Fe=["Default"];export{g as Default,Fe as __namedExportsOrder,Ne as default};
