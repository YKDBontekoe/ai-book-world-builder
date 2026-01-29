import{j as t}from"./jsx-runtime-D9QlmZXn.js";import{r as l}from"./iframe-ICXFcYEu.js";import{c as $}from"./utils-CDN07tui.js";import{c as j}from"./index-C2YXkBtM.js";import{P as x}from"./index-BwNakqSk.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-CB4c4_jM.js";import"./index-wzA3stcz.js";var p="Progress",f=100,[w]=j(p),[R,S]=w(p),P=l.forwardRef((e,r)=>{const{__scopeProgress:o,value:s=null,max:a,getValueLabel:b=D,...I}=e;(a||a===0)&&!g(a)&&console.error(T(`${a}`,"Progress"));const n=g(a)?a:f;s!==null&&!v(s,n)&&console.error(V(`${s}`,"Progress"));const i=v(s,n)?s:null,E=m(i)?b(i,n):void 0;return t.jsx(R,{scope:o,value:i,max:n,children:t.jsx(x.div,{"aria-valuemax":n,"aria-valuemin":0,"aria-valuenow":m(i)?i:void 0,"aria-valuetext":E,role:"progressbar","data-state":y(i,n),"data-value":i??void 0,"data-max":n,...I,ref:r})})});P.displayName=p;var N="ProgressIndicator",_=l.forwardRef((e,r)=>{const{__scopeProgress:o,...s}=e,a=S(N,o);return t.jsx(x.div,{"data-state":y(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...s,ref:r})});_.displayName=N;function D(e,r){return`${Math.round(e/r*100)}%`}function y(e,r){return e==null?"indeterminate":e===r?"complete":"loading"}function m(e){return typeof e=="number"}function g(e){return m(e)&&!isNaN(e)&&e>0}function v(e,r){return m(e)&&!isNaN(e)&&e<=r&&e>=0}function T(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${f}\`.`}function V(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${f} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var h=P,A=_;const u=l.forwardRef(({className:e,value:r,...o},s)=>t.jsx(h,{ref:s,className:$("relative h-4 w-full overflow-hidden rounded-full bg-secondary",e),...o,children:t.jsx(A,{className:"h-full w-full flex-1 bg-primary transition-all",style:{transform:`translateX(-${100-(r||0)}%)`}})}));u.displayName=h.displayName;try{u.displayName="Progress",u.__docgenInfo={description:"",displayName:"Progress",props:{asChild:{defaultValue:null,description:"",name:"asChild",required:!1,type:{name:"boolean"}}}}}catch{}const k={title:"Design System/Atoms/Progress",component:u,tags:["autodocs"],parameters:{layout:"centered"},decorators:[e=>t.jsx("div",{className:"w-[300px]",children:t.jsx(e,{})})]},c={args:{value:60}},d={render:()=>{const[e,r]=l.useState(13);return l.useEffect(()=>{const o=setTimeout(()=>r(66),500);return()=>clearTimeout(o)},[]),t.jsx(u,{value:e,className:"w-[60%]"})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [progress, setProgress] = React.useState(13);
    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);
    return <Progress value={progress} className="w-[60%]" />;
  }
}`,...d.parameters?.docs?.source}}};const z=["Default","Indeterminate"];export{c as Default,d as Indeterminate,z as __namedExportsOrder,k as default};
