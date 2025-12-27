import{j as a}from"./jsx-runtime-COQXk7pT.js";import{r as d}from"./iframe-BVIKD7GS.js";import{L as m}from"./label-UgVf3wyf.js";import{T as t}from"./textarea-DZ-vhTsu.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CklPxmEV.js";import"./utils-BEHD0UYf.js";import"./index-BMMc4eL9.js";import"./index-B-NBU9Wg.js";import"./index-COiuoR0n.js";const f={title:"Design System/Atoms/Textarea",component:t,tags:["autodocs"],args:{placeholder:"Type your message here."}},e={render:o=>{const s=d.useId();return a.jsxs("div",{className:"grid w-full gap-1.5",children:[a.jsx(m,{htmlFor:s,children:"Your Message"}),a.jsx(t,{...o,id:s})]})}},r={args:{disabled:!0,placeholder:"Disabled textarea"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const I=["WithLabel","Disabled"];export{r as Disabled,e as WithLabel,I as __namedExportsOrder,f as default};
