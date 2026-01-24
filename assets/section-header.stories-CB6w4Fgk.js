import{j as e}from"./jsx-runtime-CjvwsY_a.js";import{B as g}from"./button-BbC4ybK0.js";import{S as y}from"./status-badge-BPAZlVkf.js";import{c as l}from"./utils-CDN07tui.js";import{S as x}from"./settings-a2kM2ksp.js";import{P as h}from"./plus-l_hSSRsD.js";import"./iframe-BH2Pobba.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-kTtArVHZ.js";import"./index-B_jtOnfb.js";import"./loader-circle-n_BS6z8c.js";import"./createLucideIcon-CXUH5ScQ.js";import"./info-CO6a7Jp5.js";import"./circle-alert-C1qBt6mN.js";import"./triangle-alert-BIPeO4JK.js";import"./circle-check-22-zPBZA.js";function n({title:i,description:o,icon:c,iconClassName:p,action:m,metadata:d,className:u,...f}){return e.jsxs("div",{className:l("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",u),...f,children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[c&&e.jsx(c,{className:l("h-5 w-5 text-muted-foreground",p),"aria-hidden":"true"}),e.jsx("h3",{className:"text-lg font-semibold tracking-tight",children:i}),d&&e.jsx("div",{className:"ml-2 flex items-center",children:d})]}),o&&e.jsx("p",{className:"text-sm text-muted-foreground max-w-2xl",children:o})]}),m&&e.jsx("div",{className:"mt-2 sm:mt-0",children:m})]})}try{n.displayName="SectionHeader",n.__docgenInfo={description:"",displayName:"SectionHeader",props:{title:{defaultValue:null,description:"",name:"title",required:!0,type:{name:"ReactNode"}},description:{defaultValue:null,description:"",name:"description",required:!1,type:{name:"ReactNode"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"ElementType<any, keyof IntrinsicElements>"}},iconClassName:{defaultValue:null,description:"",name:"iconClassName",required:!1,type:{name:"string"}},action:{defaultValue:null,description:"",name:"action",required:!1,type:{name:"ReactNode"}},metadata:{defaultValue:null,description:"",name:"metadata",required:!1,type:{name:"ReactNode"}}}}}catch{}const H={title:"Design System/Atoms/SectionHeader",component:n,tags:["autodocs"],parameters:{layout:"padded"}},t={args:{title:"Project Settings",description:"Manage your project configuration and preferences."}},a={args:{title:"General",description:"Basic information about your project.",icon:x}},r={args:{title:"Team Members",description:"Invite and manage team members.",action:e.jsxs(g,{size:"sm",children:[e.jsx(h,{className:"mr-2 h-4 w-4"}),"Invite"]})}},s={args:{title:"Deployment",metadata:e.jsx(y,{status:"success",children:"Live"}),description:"Your project is currently deployed."}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Project Settings",
    description: "Manage your project configuration and preferences."
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: "General",
    description: "Basic information about your project.",
    icon: Settings
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Team Members",
    description: "Invite and manage team members.",
    action: <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite
            </Button>
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Deployment",
    metadata: <StatusBadge status="success">Live</StatusBadge>,
    description: "Your project is currently deployed."
  }
}`,...s.parameters?.docs?.source}}};const A=["Default","WithIcon","WithAction","WithMetadata"];export{t as Default,r as WithAction,a as WithIcon,s as WithMetadata,A as __namedExportsOrder,H as default};
