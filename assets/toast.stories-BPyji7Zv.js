import{j as e}from"./jsx-runtime-CmXr4ZLr.js";import{t as j,T as v}from"./index-CRRVdsG3.js";import{B as a}from"./button-BtyBBOPs.js";import{r as c}from"./iframe-CNcg9uZb.js";import{c as f}from"./utils-BQHNewu7.js";import{T as w}from"./triangle-alert-ey9n57kz.js";import{c as T}from"./createLucideIcon-BaV4Se2Z.js";import"./index-DX8NNdbx.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BJc8Pgc4.js";import"./index-LHNt3CwB.js";import"./preload-helper-PPVm8Dsz.js";const S=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],_=T("circle-check-big",S),b={success:e.jsx(_,{size:16}),error:e.jsx(w,{size:16})};function s(t){return j.custom(i=>e.jsx(k,{description:t.description,id:i,type:t.type}))}function k(t){const{id:i,type:l,description:h}=t,p=c.useRef(null),[u,g]=c.useState(!1);return c.useEffect(()=>{const r=p.current;if(!r)return;const d=()=>{const x=Number.parseFloat(getComputedStyle(r).lineHeight),y=Math.round(r.scrollHeight/x);g(y>1)};d();const m=new ResizeObserver(d);return m.observe(r),()=>m.disconnect()},[]),e.jsx("div",{className:"flex toast-mobile:w-[356px] w-full justify-center",children:e.jsxs("div",{className:f("flex toast-mobile:w-fit w-full flex-row gap-3 rounded-lg bg-zinc-100 p-3",u?"items-start":"items-center"),"data-testid":"toast",children:[e.jsx("div",{className:f("data-[type=error]:text-red-600 data-[type=success]:text-green-600",{"pt-1":u}),"data-type":l,children:b[l]}),e.jsx("div",{className:"text-sm text-zinc-950",ref:p,children:h})]},i)})}try{s.displayName="toast",s.__docgenInfo={description:"",displayName:"toast",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"success"'},{value:'"error"'}]}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const q={title:"Design System/Atoms/Toast",decorators:[t=>e.jsxs("div",{children:[e.jsx(v,{}),e.jsx(t,{})]})],parameters:{layout:"centered"}},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(a,{onClick:()=>s({type:"success",description:"Operation successful!"}),children:"Show Success Toast"}),e.jsx(a,{variant:"destructive",onClick:()=>s({type:"error",description:"Something went wrong."}),children:"Show Error Toast"})]})},n={render:()=>e.jsx(a,{onClick:()=>s({type:"success",description:"This is a very long success message that should probably wrap to multiple lines if the container is small enough or the text is just too long for a single line."}),children:"Show Long Toast"})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
            <Button onClick={() => toast({
      type: "success",
      description: "Operation successful!"
    })}>
                Show Success Toast
            </Button>
            <Button variant="destructive" onClick={() => toast({
      type: "error",
      description: "Something went wrong."
    })}>
                Show Error Toast
            </Button>
        </div>
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Button onClick={() => toast({
    type: "success",
    description: "This is a very long success message that should probably wrap to multiple lines if the container is small enough or the text is just too long for a single line."
  })}>
            Show Long Toast
        </Button>
}`,...n.parameters?.docs?.source}}};const I=["Default","LongText"];export{o as Default,n as LongText,I as __namedExportsOrder,q as default};
