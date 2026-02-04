import{j as m}from"./jsx-runtime-DfafluF-.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Bfu4HXmX.js";import{S as d,a as s}from"./story-wizard-2-XDEivP.js";import"./iframe-C7R_cEJU.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-_BRm2HYo.js";import"./index-CXbh8hGx.js";import"./index-7j6ye7RS.js";import"./index-CxE8OPDb.js";import"./index-ZGvglfEg.js";import"./index-BDT0nyAo.js";import"./index-i34SGcgo.js";import"./index-CMuBuxRP.js";import"./index-CJkRCF-V.js";import"./index-iz-JCA8f.js";import"./index-CbLfBg3T.js";import"./index-DkwzXLr0.js";import"./index-CnJTE9ao.js";import"./index-DAC02V7l.js";import"./action-middleware-C35QlbE-.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CwLdm9B-.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BKJSAD_l.js";import"./proxy-BUiZUt2W.js";import"./loader-circle-CpNXxEZd.js";import"./createLucideIcon-CoMekddw.js";import"./button-DaYrG4he.js";import"./index-B_jtOnfb.js";import"./label-CStuCrfu.js";import"./select-Czecu8Ij.js";import"./chevron-down-B4_jOH_o.js";import"./check-CZRi80V7.js";import"./index-BdQq_4o_.js";import"./index-BuPOHG4B.js";import"./index-CU0YqRTG.js";import"./index-CMPGJ7RO.js";import"./index-Cb6JFBvK.js";import"./textarea-B9PxqYYc.js";import"./wand-sparkles-nfiFg5M0.js";import"./info-BReaDW0l.js";import"./WizardReviewStep-U1_9Pcmu.js";import"./card-DHuHx4jz.js";import"./input-DEx7x5fc.js";import"./x-BUFYtfCH.js";import"./scroll-area-MrLeQgUc.js";import"./refresh-cw-BMHFIhhL.js";import"./plus-C6MN0u9n.js";import"./search-CbhIO8Yo.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
