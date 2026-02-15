import{j as r}from"./jsx-runtime-DMunRu3D.js";import{r as n}from"./iframe-CGBE84mn.js";import{T as f}from"./tooltip-DO9eRWwm.js";import{W as m}from"./writer-view-controls-DOMhM0qZ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-D1ku06iw.js";import"./index-Ds5eoLtd.js";import"./index-DkBymBmj.js";import"./index-Bg6SJ_lw.js";import"./index-8byG8t0Z.js";import"./index-C_hMtTF0.js";import"./index-nPQZkUgx.js";import"./index-D2wFZT_3.js";import"./index-C51Yaur6.js";import"./index-BQBA4lwE.js";import"./index-_KFvzRk_.js";import"./index-DKqWvx_r.js";import"./index-5vsR-Ejv.js";import"./button-CkKJoUUV.js";import"./index-B_jtOnfb.js";import"./createLucideIcon-6MLQDiJe.js";import"./proxy-B49KQ4i1.js";const R={title:"Features/Writer/Header/WriterViewControls",component:m,decorators:[e=>r.jsx(f,{children:r.jsx("div",{className:"p-10 flex justify-center bg-gray-50 dark:bg-zinc-900",children:r.jsx(e,{})})})],parameters:{layout:"fullscreen"}},a=e=>{const[p,l]=n.useState(e.isDirectorMode),[c,M]=n.useState(e.isTypewriterMode),[d,u]=n.useState(e.isZenMode);return r.jsx(m,{...e,isDirectorMode:p,toggleDirectorMode:()=>l(!p),isTypewriterMode:c,toggleTypewriterMode:()=>M(!c),isZenMode:d,toggleZenMode:()=>u(!d)})},o={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!1}},s={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!0,isTypewriterMode:!1,isZenMode:!1}},t={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!0,isZenMode:!1}},i={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
