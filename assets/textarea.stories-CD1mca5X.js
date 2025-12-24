import{j as t,c as p}from"./utils-D919-vfU.js";import{r as i}from"./iframe-DQMhE4oJ.js";import{L as u}from"./label-JFSZL2wX.js";import"./preload-helper-PPVm8Dsz.js";import"./index-oPNBu4GW.js";import"./index-CgWGBIbl.js";import"./index-v5APHw6t.js";import"./index-C0yBok2Y.js";const o=i.forwardRef(({className:n,submitOnCtrlEnter:r,onKeyDown:d,...l},c)=>{const m=e=>{r&&(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&(e.preventDefault(),e.currentTarget.form?.requestSubmit()),d?.(e)};return t.jsx("textarea",{className:p("flex min-h-[80px] w-full rounded-lg glass-input px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",n),ref:c,onKeyDown:m,...l})});o.displayName="Textarea";o.__docgenInfo={description:"",methods:[],displayName:"Textarea",props:{submitOnCtrlEnter:{required:!1,tsType:{name:"boolean"},description:""}}};const T={title:"UI/Textarea",component:o,tags:["autodocs"],args:{placeholder:"Type your message here."}},a={render:n=>{const r=i.useId();return t.jsxs("div",{className:"grid w-full gap-1.5",children:[t.jsx(u,{htmlFor:r,children:"Your Message"}),t.jsx(o,{...n,id:r})]})}},s={args:{disabled:!0,placeholder:"Disabled textarea"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: (args: any) => {
    const messageId = React.useId();
    return <div className="grid w-full gap-1.5">
                <Label htmlFor={messageId}>Your Message</Label>
                <Textarea {...args} id={messageId} />
            </div>;
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    placeholder: "Disabled textarea"
  }
}`,...s.parameters?.docs?.source}}};const w=["WithLabel","Disabled"];export{s as Disabled,a as WithLabel,w as __namedExportsOrder,T as default};
