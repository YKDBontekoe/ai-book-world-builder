import{j as a}from"./jsx-runtime-Cm02dnOS.js";import{r as d}from"./iframe-BGuG1SDv.js";import{L as m}from"./label-CniybYMD.js";import{T as t}from"./textarea-B3QAXUNO.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-LHNt3CwB.js";import"./utils-BQHNewu7.js";import"./index-CO02lqOV.js";import"./index-D08z3u1i.js";import"./index-DcG-vqRU.js";const I={title:"Design System/Atoms/Textarea",component:t,tags:["autodocs"],args:{placeholder:"Type your message here."}},e={render:o=>{const s=d.useId();return a.jsxs("div",{className:"grid w-full gap-1.5",children:[a.jsx(m,{htmlFor:s,children:"Your Message"}),a.jsx(t,{...o,id:s})]})}},r={args:{disabled:!0,placeholder:"Disabled textarea"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const messageId = React.useId();
    return <div className="grid w-full gap-1.5">
                <Label htmlFor={messageId}>Your Message</Label>
                <Textarea {...args} id={messageId} />
            </div>;
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled textarea"
  }
}`,...r.parameters?.docs?.source}}};const L=["WithLabel","Disabled"];export{r as Disabled,e as WithLabel,L as __namedExportsOrder,I as default};
