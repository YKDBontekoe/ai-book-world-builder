import{j as r}from"./jsx-runtime-D1UpiHbx.js";import{r as n}from"./iframe-CJ9ST3nQ.js";import{T as f}from"./tooltip-SFly1yAm.js";import{W as m}from"./writer-view-controls-BzYt4BkK.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DzxdF0ZA.js";import"./index-C-TnkZqj.js";import"./index-CiQtvz38.js";import"./index-CDHr9zS4.js";import"./index-B2NNHitj.js";import"./index-BqDJDtFL.js";import"./index-Ch78LSwN.js";import"./index-CM3-SV60.js";import"./index-CBb52KTU.js";import"./index-CIDqnPu8.js";import"./index-BxPjKEKs.js";import"./index-BKNYxBHU.js";import"./index-D_pXLHTc.js";import"./button-DKrJF6Hk.js";import"./index-B_jtOnfb.js";import"./createLucideIcon-DrL2i6gp.js";import"./proxy-ByHBLDe3.js";const R={title:"Features/Writer/Header/WriterViewControls",component:m,decorators:[e=>r.jsx(f,{children:r.jsx("div",{className:"p-10 flex justify-center bg-gray-50 dark:bg-zinc-900",children:r.jsx(e,{})})})],parameters:{layout:"fullscreen"}},a=e=>{const[p,l]=n.useState(e.isDirectorMode),[c,M]=n.useState(e.isTypewriterMode),[d,u]=n.useState(e.isZenMode);return r.jsx(m,{...e,isDirectorMode:p,toggleDirectorMode:()=>l(!p),isTypewriterMode:c,toggleTypewriterMode:()=>M(!c),isZenMode:d,toggleZenMode:()=>u(!d)})},o={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!1}},s={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!0,isTypewriterMode:!1,isZenMode:!1}},t={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!0,isZenMode:!1}},i={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
