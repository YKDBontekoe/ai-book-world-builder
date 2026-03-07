import{j as a}from"./jsx-runtime-B8zZSjZv.js";import{r as d}from"./iframe-B_dc1Z9I.js";import{L as m}from"./label-T_VDVOOr.js";import{T as t}from"./textarea--bbTQ5Pj.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-LHNt3CwB.js";import"./utils-BQHNewu7.js";import"./index-ISYcmL2b.js";import"./index-Dhu_BDV_.js";import"./index-DlLR1Oe8.js";const I={title:"Design System/Atoms/Textarea",component:t,tags:["autodocs"],args:{placeholder:"Type your message here."}},e={render:o=>{const s=d.useId();return a.jsxs("div",{className:"grid w-full gap-1.5",children:[a.jsx(m,{htmlFor:s,children:"Your Message"}),a.jsx(t,{...o,id:s})]})}},r={args:{disabled:!0,placeholder:"Disabled textarea"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
