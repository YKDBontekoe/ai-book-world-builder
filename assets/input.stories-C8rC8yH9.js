import{j as l}from"./jsx-runtime-BKTpTTBe.js";import{w as d,u as p,e as c}from"./index-Do1wm97G.js";import{r as u}from"./iframe-CY6E8OXJ.js";import{I as m}from"./input-C7_AUKM_.js";import{L as g}from"./label-DTZWK5DI.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./x-BV_YS9hc.js";import"./createLucideIcon-Cpp3vyfW.js";import"./index-LHNt3CwB.js";import"./index-BHia0Twu.js";import"./index-CmtoKuYQ.js";import"./index-BwpoVsrw.js";const k={title:"Design System/Atoms/Input",component:m,tags:["autodocs"],argTypes:{type:{control:"select",options:["text","password","email","number","date"]},disabled:{control:"boolean"}}},a={args:{placeholder:"Type here..."}},t={render:n=>{const i=u.useId();return l.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[l.jsx(g,{htmlFor:i,children:"Email"}),l.jsx(m,{...n,type:"email",id:i,placeholder:"Email"})]})}},r={args:{disabled:!0,placeholder:"Disabled input"}},s={args:{type:"file"}},o={args:{placeholder:"Type something..."},play:async({canvasElement:n})=>{const e=d(n).getByRole("textbox");await p.type(e,"Hello Storybook"),await c(e).toHaveValue("Hello Storybook"),await p.clear(e),await c(e).toHaveValue("")}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type here..."
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const emailId = React.useId();
    return <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor={emailId}>Email</Label>
                <Input {...args} type="email" id={emailId} placeholder="Email" />
            </div>;
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled input"
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: "file"
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type something..."
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Simulate user typing
    await userEvent.type(input, "Hello Storybook");

    // Verify value
    await expect(input).toHaveValue("Hello Storybook");

    // Simulate clear (backspace)
    await userEvent.clear(input);
    await expect(input).toHaveValue("");
  }
}`,...o.parameters?.docs?.source}}};const T=["Default","WithLabel","Disabled","File","InputInteraction"];export{a as Default,r as Disabled,s as File,o as InputInteraction,t as WithLabel,T as __namedExportsOrder,k as default};
