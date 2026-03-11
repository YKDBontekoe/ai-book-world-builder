import{j as m}from"./jsx-runtime-Zy9uZKJG.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-GsYW2uk0.js";import{S as d,a as s}from"./story-wizard-CDx9GSAM.js";import"./iframe-Cb8QJyBC.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-C3Dx2x1X.js";import"./index-CyQ6lUWg.js";import"./index-CZYzQJmp.js";import"./index-NVnhloxl.js";import"./index--baJ4ciM.js";import"./index-BIwpghgj.js";import"./index-3dzx3hlV.js";import"./index-DuzVWUjn.js";import"./index-B4r03WX5.js";import"./index-yapS5Wmy.js";import"./index-Cqq5pvdL.js";import"./index-Docg1Hx6.js";import"./index-D_DpDxXf.js";import"./index-D9vriMbI.js";import"./action-middleware-CRUooN_J.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BlRBkrcG.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CBUeIwvF.js";import"./proxy-BeDHi1DH.js";import"./loader-circle-DZKvdGro.js";import"./createLucideIcon-uB73FXnX.js";import"./button-BmjHuJx0.js";import"./index-LHNt3CwB.js";import"./label-qr7qO0gA.js";import"./select-DMRICjty.js";import"./chevron-down-B3xZ5bMr.js";import"./check-Fq4Bjjsf.js";import"./index-BdQq_4o_.js";import"./index-D1YTZwjg.js";import"./index-CiLqLcFT.js";import"./index-BkF9Ee5r.js";import"./index-BVJQXgjJ.js";import"./textarea-D-V-YfKt.js";import"./wand-sparkles-DSqjA1VY.js";import"./info-BqIZ4juZ.js";import"./WizardReviewStep-U7K-J3il.js";import"./card-CTrye3Lb.js";import"./input-B8W_oFt6.js";import"./x-2l6tnTCG.js";import"./scroll-area-DhnFncbN.js";import"./refresh-cw-vn7tRhGg.js";import"./plus-DBzyYVo2.js";import"./search-DLjDMOq-.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    templates: [STORY_TEMPLATES[0], {
      ...STORY_TEMPLATES[1],
      label: "Custom Template",
      description: "This is a custom template injected via props."
    }]
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Check if templates are rendered
    const heroTemplate = canvas.getByText("The Hero's Journey");
    await expect(heroTemplate).toBeInTheDocument();

    // Click the template
    await userEvent.click(heroTemplate);

    // Check if prompt is updated
    const promptInput = canvas.getByPlaceholderText(/e.g. A cyberpunk detective/i) as HTMLTextAreaElement;
    await expect(promptInput.value).toContain("A young farm boy discovers he is the heir");

    // Check if style is updated (e.g. Genre)
    // Note: Radix UI Select trigger usually displays the selected value.
    // We look for "Fantasy" in the document (it might be in the trigger).
    const fantasyText = canvas.getByText("Fantasy");
    await expect(fantasyText).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}};const xt=["Default","CustomTemplates","TemplateInteraction"];export{e as CustomTemplates,t as Default,o as TemplateInteraction,xt as __namedExportsOrder,gt as default};
