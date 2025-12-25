import{j as t,c as j}from"./utils-D4iu72I1.js";import{r as l}from"./iframe-DiGQ4VQL.js";import{c as w}from"./index-B2n0C2m9.js";import{P as x}from"./index-BGw5349_.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BPYz3fQL.js";import"./index-D4FQ5KSD.js";var p="Progress",f=100,[y]=w(p),[R,S]=y(p),P=l.forwardRef((e,r)=>{const{__scopeProgress:o,value:s=null,max:a,getValueLabel:E=T,..._}=e;(a||a===0)&&!v(a)&&console.error(D(`${a}`,"Progress"));const n=v(a)?a:f;s!==null&&!g(s,n)&&console.error(M(`${s}`,"Progress"));const i=g(s,n)?s:null,$=d(i)?E(i,n):void 0;return t.jsx(R,{scope:o,value:i,max:n,children:t.jsx(x.div,{"aria-valuemax":n,"aria-valuemin":0,"aria-valuenow":d(i)?i:void 0,"aria-valuetext":$,role:"progressbar","data-state":h(i,n),"data-value":i??void 0,"data-max":n,..._,ref:r})})});P.displayName=p;var N="ProgressIndicator",b=l.forwardRef((e,r)=>{const{__scopeProgress:o,...s}=e,a=S(N,o);return t.jsx(x.div,{"data-state":h(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...s,ref:r})});b.displayName=N;function T(e,r){return`${Math.round(e/r*100)}%`}function h(e,r){return e==null?"indeterminate":e===r?"complete":"loading"}function d(e){return typeof e=="number"}function v(e){return d(e)&&!isNaN(e)&&e>0}function g(e,r){return d(e)&&!isNaN(e)&&e<=r&&e>=0}function D(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${f}\`.`}function M(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${f} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var I=P,V=b;const m=l.forwardRef(({className:e,value:r,...o},s)=>t.jsx(I,{ref:s,className:j("relative h-4 w-full overflow-hidden rounded-full bg-secondary",e),...o,children:t.jsx(V,{className:"h-full w-full flex-1 bg-primary transition-all",style:{transform:`translateX(-${100-(r||0)}%)`}})}));m.displayName=I.displayName;m.__docgenInfo={description:"",methods:[]};const F={title:"UI/Progress",component:m,tags:["autodocs"],parameters:{layout:"centered"},decorators:[e=>t.jsx("div",{className:"w-[300px]",children:t.jsx(e,{})})]},u={args:{value:60}},c={render:()=>{const[e,r]=l.useState(13);return l.useEffect(()=>{const o=setTimeout(()=>r(66),500);return()=>clearTimeout(o)},[]),t.jsx(m,{value:e,className:"w-[60%]"})}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60
  }
}`,...u.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [progress, setProgress] = React.useState(13);
    React.useEffect(() => {
      const timer = setTimeout(() => setProgress(66), 500);
      return () => clearTimeout(timer);
    }, []);
    return <Progress value={progress} className="w-[60%]" />;
  }
}`,...c.parameters?.docs?.source}}};const k=["Default","Indeterminate"];export{u as Default,c as Indeterminate,k as __namedExportsOrder,F as default};
