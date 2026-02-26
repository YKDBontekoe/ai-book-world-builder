import{j as r}from"./jsx-runtime-BJcGwcGs.js";import{r as n}from"./iframe-Bzcjzwrt.js";import{T as f}from"./tooltip-BI-6GcA_.js";import{W as m}from"./writer-view-controls-By-r-tVt.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index--ghMvtY9.js";import"./index-D5OzToa6.js";import"./index-C1kD5DCy.js";import"./index-BFTmqHD3.js";import"./index-DbFzjeVm.js";import"./index-Bn4QYgT8.js";import"./index-BaIt3qNM.js";import"./index-CizYMOrT.js";import"./index-CbUfq8Pr.js";import"./index-ujNpYEFr.js";import"./index-CGy44eZN.js";import"./index-BAZsWMUg.js";import"./index-CryKibhA.js";import"./button-Cpg6qiue.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-Cv_vrvWW.js";import"./proxy-DHIqT_uW.js";const R={title:"Features/Writer/Header/WriterViewControls",component:m,decorators:[e=>r.jsx(f,{children:r.jsx("div",{className:"p-10 flex justify-center bg-gray-50 dark:bg-zinc-900",children:r.jsx(e,{})})})],parameters:{layout:"fullscreen"}},a=e=>{const[p,l]=n.useState(e.isDirectorMode),[c,M]=n.useState(e.isTypewriterMode),[d,u]=n.useState(e.isZenMode);return r.jsx(m,{...e,isDirectorMode:p,toggleDirectorMode:()=>l(!p),isTypewriterMode:c,toggleTypewriterMode:()=>M(!c),isZenMode:d,toggleZenMode:()=>u(!d)})},o={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!1}},s={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!0,isTypewriterMode:!1,isZenMode:!1}},t={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!0,isZenMode:!1}},i={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: false,
    isZenMode: false
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: true,
    isTypewriterMode: false,
    isZenMode: false
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: true,
    isZenMode: false
  }
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: false,
    isZenMode: true
  }
}`,...i.parameters?.docs?.source}}};const q=["Default","DirectorActive","TypewriterActive","ZenActive"];export{o as Default,s as DirectorActive,t as TypewriterActive,i as ZenActive,q as __namedExportsOrder,R as default};
