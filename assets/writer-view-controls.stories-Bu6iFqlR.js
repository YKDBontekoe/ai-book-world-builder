import{j as r}from"./jsx-runtime-CigVqepM.js";import{r as n}from"./iframe-B814EV1c.js";import{T as f}from"./tooltip-DodXD061.js";import{W as m}from"./writer-view-controls-Dvlhg5zM.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Io7P3kHv.js";import"./index-C463aeHE.js";import"./index-CNpqNBc5.js";import"./index-Du7IehbS.js";import"./index-tgXaVn_Q.js";import"./index-CehtUZ5q.js";import"./index-BsNy5Hte.js";import"./index-ckpk5koR.js";import"./index-DXij2b0j.js";import"./index-B72UQc4P.js";import"./index-DELgv-Lx.js";import"./index-DW_rsnSu.js";import"./index-CiX1aNPv.js";import"./button-T6MZ5aYq.js";import"./index-LHNt3CwB.js";import"./createLucideIcon-Dw5Oesif.js";import"./proxy-C50g5jfs.js";const R={title:"Features/Writer/Header/WriterViewControls",component:m,decorators:[e=>r.jsx(f,{children:r.jsx("div",{className:"p-10 flex justify-center bg-gray-50 dark:bg-zinc-900",children:r.jsx(e,{})})})],parameters:{layout:"fullscreen"}},a=e=>{const[p,l]=n.useState(e.isDirectorMode),[c,M]=n.useState(e.isTypewriterMode),[d,u]=n.useState(e.isZenMode);return r.jsx(m,{...e,isDirectorMode:p,toggleDirectorMode:()=>l(!p),isTypewriterMode:c,toggleTypewriterMode:()=>M(!c),isZenMode:d,toggleZenMode:()=>u(!d)})},o={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!1}},s={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!0,isTypewriterMode:!1,isZenMode:!1}},t={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!0,isZenMode:!1}},i={render:e=>r.jsx(a,{...e}),args:{isDirectorMode:!1,isTypewriterMode:!1,isZenMode:!0}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
