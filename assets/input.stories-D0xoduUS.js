import{j as t}from"./utils-Dl0kpkPh.js";import{r as m}from"./iframe-Ca7X6zeM.js";import{I as l}from"./input-CDsV6XsS.js";import{L as n}from"./label-DHVwjj8L.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-BMgkF2Yj.js";import"./index-DhRffIYo.js";import"./index-D-NpbMoh.js";import"./index-vJ9Rsuc5.js";import"./index-FbEtZPT4.js";const y={title:"UI/Input",component:l,tags:["autodocs"],argTypes:{type:{control:"select",options:["text","password","email","number","date"]},disabled:{control:"boolean"}}},e={args:{placeholder:"Type here..."}},r={render:i=>{const o=m.useId();return t.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[t.jsx(n,{htmlFor:o,children:"Email"}),t.jsx(l,{...i,type:"email",id:o,placeholder:"Email"})]})}},a={args:{disabled:!0,placeholder:"Disabled input"}},s={args:{type:"file"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type here..."
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const emailId = React.useId();
    return <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor={emailId}>Email</Label>
                <Input {...args} type="email" id={emailId} placeholder="Email" />
            </div>;
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled input"
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: "file"
  }
}`,...s.parameters?.docs?.source}}};const E=["Default","WithLabel","Disabled","File"];export{e as Default,a as Disabled,s as File,r as WithLabel,E as __namedExportsOrder,y as default};
