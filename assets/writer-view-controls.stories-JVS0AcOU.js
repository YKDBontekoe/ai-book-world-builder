import{j as r}from"./jsx-runtime-Ba2KnEow.js";import{r as n}from"./iframe-CbLQfuCz.js";import{T as f}from"./tooltip-DDx89G3j.js";import{W as m}from"./writer-view-controls-aLQuQOq0.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-DIfFyp-V.js";import"./index-QWj1Dh_F.js";import"./index-BsHHfBXH.js";import"./index-ASnfCVGu.js";import"./index-FfhJf4tr.js";import"./index-yK8GYPw5.js";import"./index-DYalDHTx.js";import"./index-DwM7WEzO.js";import"./index-BJtSLSip.js";import"./index-CJyEP2Jt.js";import"./index-C9c9NRAw.js";import"./index-Cc1un8wU.js";import"./index-DXsXpBnG.js";import"./button-MuIPHFAK.js";import"./index-h6qoG7Gi.js";import"./createLucideIcon-Dex5lNfb.js";import"./proxy-f4Pa9Om7.js";const R={title:"Features/Writer/Header/WriterViewControls",component:m,decorators:[e=>r.jsx(f,{children:r.jsx("div",{className:"p-10 flex justify-center bg-gray-50 dark:bg-zinc-900",children:r.jsx(e,{})})})],parameters:{layout:"fullscreen"}},a=e=>{const[p,l]=n.useState(e.isDirectorMode),[c,M]=n.useState(e.isTypewriterMode),[d,u]=n.useState(e.isZenMode);return r.jsx(m,{...e,isDirectorMode:p,toggleDirectorMode:()=>l(!p),isTypewriterMode:c,toggleTypewriterMode:()=>M(!c),isZenMode:d,toggleZenMode:()=>u(!d)})},o={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!1}},s={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!0,isTypewriterMode:!1,isZenMode:!1}},t={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!0,isZenMode:!1}},i={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
