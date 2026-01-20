import{j as e}from"./jsx-runtime-C3IvzWVi.js";import{t as j,T as v}from"./index-CNveTckU.js";import{B as c}from"./button-DA6ZsMDd.js";import{r as a}from"./iframe-CEnoLFnq.js";import{c as f}from"./utils-CDN07tui.js";import{T as w}from"./triangle-alert-vJQ3mLqQ.js";import{C as T}from"./circle-check-big-BuFvrdXE.js";import"./index-CyQqk8W9.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-DZ7oUTVl.js";import"./index-B_jtOnfb.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-BGgf3h2D.js";const S={success:e.jsx(T,{size:16}),error:e.jsx(w,{size:16})};function s(t){return j.custom(i=>e.jsx(b,{description:t.description,id:i,type:t.type}))}function b(t){const{id:i,type:l,description:g}=t,p=a.useRef(null),[u,h]=a.useState(!1);return a.useEffect(()=>{const r=p.current;if(!r)return;const d=()=>{const x=Number.parseFloat(getComputedStyle(r).lineHeight),y=Math.round(r.scrollHeight/x);h(y>1)};d();const m=new ResizeObserver(d);return m.observe(r),()=>m.disconnect()},[]),e.jsx("div",{className:"flex toast-mobile:w-[356px] w-full justify-center",children:e.jsxs("div",{className:f("flex toast-mobile:w-fit w-full flex-row gap-3 rounded-lg bg-zinc-100 p-3",u?"items-start":"items-center"),"data-testid":"toast",children:[e.jsx("div",{className:f("data-[type=error]:text-red-600 data-[type=success]:text-green-600",{"pt-1":u}),"data-type":l,children:S[l]}),e.jsx("div",{className:"text-sm text-zinc-950",ref:p,children:g})]},i)})}try{s.displayName="toast",s.__docgenInfo={description:"",displayName:"toast",props:{type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"success"'},{value:'"error"'}]}},description:{defaultValue:null,description:"",name:"description",required:!0,type:{name:"string"}}}}}catch{}const A={title:"Design System/Atoms/Toast",decorators:[t=>e.jsxs("div",{children:[e.jsx(v,{}),e.jsx(t,{})]})],parameters:{layout:"centered"}},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(c,{onClick:()=>s({type:"success",description:"Operation successful!"}),children:"Show Success Toast"}),e.jsx(c,{variant:"destructive",onClick:()=>s({type:"error",description:"Something went wrong."}),children:"Show Error Toast"})]})},n={render:()=>e.jsx(c,{onClick:()=>s({type:"success",description:"This is a very long success message that should probably wrap to multiple lines if the container is small enough or the text is just too long for a single line."}),children:"Show Long Toast"})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const M=["Default","LongText"];export{o as Default,n as LongText,M as __namedExportsOrder,A as default};
