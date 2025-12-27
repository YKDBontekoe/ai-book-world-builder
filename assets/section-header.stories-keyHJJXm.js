import{j as e,c as m}from"./utils-C8J3Y5b9.js";import{B as f}from"./button-Cfuq_u7G.js";import{S as h}from"./status-badge-DQ8qkD51.js";import{S as x}from"./settings-_UpBLdPF.js";import{c as y}from"./createLucideIcon-D-53uMlG.js";import"./iframe-BRZ2wzD0.js";import"./preload-helper-DiVmySF1.js";import"./index-Bb23PYst.js";import"./index-BwxQtLVs.js";import"./loader-circle-gdcX5I9v.js";import"./triangle-alert-t1BOrDK4.js";const j=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],N=y("plus",j);function d({title:p,description:o,icon:n,iconClassName:l,action:i,metadata:c,className:u,...g}){return e.jsxs("div",{className:m("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",u),...g,children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[n&&e.jsx(n,{className:m("h-5 w-5 text-muted-foreground",l),"aria-hidden":"true"}),e.jsx("h3",{className:"text-lg font-semibold tracking-tight",children:p}),c&&e.jsx("div",{className:"ml-2 flex items-center",children:c})]}),o&&e.jsx("p",{className:"text-sm text-muted-foreground max-w-2xl",children:o})]}),i&&e.jsx("div",{className:"mt-2 sm:mt-0",children:i})]})}d.__docgenInfo={description:"",methods:[],displayName:"SectionHeader",props:{title:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},description:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},icon:{required:!1,tsType:{name:"ReactElementType",raw:"React.ElementType"},description:""},iconClassName:{required:!1,tsType:{name:"string"},description:""},action:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},metadata:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}},composes:["Omit"]};const _={title:"UI/SectionHeader",component:d,tags:["autodocs"],parameters:{layout:"padded"}},t={args:{title:"Project Settings",description:"Manage your project configuration and preferences."}},a={args:{title:"General",description:"Basic information about your project.",icon:x}},s={args:{title:"Team Members",description:"Invite and manage team members.",action:e.jsxs(f,{size:"sm",children:[e.jsx(N,{className:"mr-2 h-4 w-4"}),"Invite"]})}},r={args:{title:"Deployment",metadata:e.jsx(h,{status:"success",children:"Live"}),description:"Your project is currently deployed."}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Team Members",
    description: "Invite and manage team members.",
    action: <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite
            </Button>
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: "Deployment",
    metadata: <StatusBadge status="success">Live</StatusBadge>,
    description: "Your project is currently deployed."
  }
}`,...r.parameters?.docs?.source}}};const D=["Default","WithIcon","WithAction","WithMetadata"];export{t as Default,s as WithAction,a as WithIcon,r as WithMetadata,D as __namedExportsOrder,_ as default};
