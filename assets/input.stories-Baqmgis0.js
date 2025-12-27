import{j as i}from"./jsx-runtime-CooJ2Alx.js";import{r as d,w as u,u as c,e as p}from"./iframe-BbMCY3CD.js";import{I as m}from"./input-ddL9q7f8.js";import{L as g}from"./label-Bz0PxrBY.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-BEHD0UYf.js";import"./x-DL8S2sJQ.js";import"./createLucideIcon-VzzCplY-.js";import"./index-CklPxmEV.js";import"./index-QoMh50Bu.js";import"./index-DDUFYt-2.js";import"./index-Dws3aEG1.js";const L={title:"Design System/Atoms/Input",component:m,tags:["autodocs"],argTypes:{type:{control:"select",options:["text","password","email","number","date"]},disabled:{control:"boolean"}}},a={args:{placeholder:"Type here..."}},t={render:n=>{const l=d.useId();return i.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[i.jsx(g,{htmlFor:l,children:"Email"}),i.jsx(m,{...n,type:"email",id:l,placeholder:"Email"})]})}},r={args:{disabled:!0,placeholder:"Disabled input"}},s={args:{type:"file"}},o={args:{placeholder:"Type something..."},play:async({canvasElement:n})=>{const e=u(n).getByRole("textbox");await c.type(e,"Hello Storybook"),await p(e).toHaveValue("Hello Storybook"),await c.clear(e),await p(e).toHaveValue("")}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const j=["Default","WithLabel","Disabled","File","InputInteraction"];export{a as Default,r as Disabled,s as File,o as InputInteraction,t as WithLabel,j as __namedExportsOrder,L as default};
