import{j as m}from"./jsx-runtime-BNCuBUsW.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-pMPbqLVB.js";import{S as d,a as s}from"./story-wizard-NO2JHr_C.js";import"./iframe-qPouZ6hW.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CYAhQIfP.js";import"./index-BWKSPHDf.js";import"./index-CyzfL06m.js";import"./index-DLoKqrW1.js";import"./index-D3yfkkGF.js";import"./index-BcGDQCmO.js";import"./index-BKHgxb8t.js";import"./index-Bs5xqL8x.js";import"./index-C3YMplJC.js";import"./index-BFSkzWCZ.js";import"./index-DsaOu85t.js";import"./index-BTnxgUIf.js";import"./index-RMinhtfI.js";import"./index-BIy9TUUW.js";import"./action-middleware-Cw8lYTPF.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-wz6Eb1_k.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Bi-BKm51.js";import"./proxy-DRZiG7do.js";import"./loader-circle-D45R4fm6.js";import"./createLucideIcon-CFxraN2f.js";import"./button-C8q226ue.js";import"./index-LHNt3CwB.js";import"./label-CNn2WH-4.js";import"./select-Zo5OSZzJ.js";import"./chevron-down-B0OpcEpE.js";import"./check-VCPCOHMG.js";import"./index-BdQq_4o_.js";import"./index-F0SFpOFp.js";import"./index-CUxk84Ye.js";import"./index-B6-84urb.js";import"./index-I2lPRw-3.js";import"./textarea-DS-PHo8Z.js";import"./wand-sparkles-DbC-RgKF.js";import"./info-Ds5CoMyD.js";import"./WizardReviewStep-D9e_xA3y.js";import"./card-HPm_J_hp.js";import"./input-BDPWGDT7.js";import"./x-DmwNqPQ8.js";import"./scroll-area-DQ7fHIny.js";import"./refresh-cw-oyPDGwd1.js";import"./plus-vDQzzdA5.js";import"./search-BwPi1ja7.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
