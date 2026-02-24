import{j as m}from"./jsx-runtime-Hy6hrTeP.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DvQmKhMo.js";import{S as d,a as s}from"./story-wizard-Ar0I8-is.js";import"./iframe-B1v79sRb.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-rdTZTY0K.js";import"./index-O0nLMq2x.js";import"./index-62fWy1ca.js";import"./index-Duv_rHVt.js";import"./index-DruogkYN.js";import"./index-CmPr7s5v.js";import"./index-CVuBiHZL.js";import"./index-SPpKczD3.js";import"./index-CG1nMM8Y.js";import"./index-N3OFe5d1.js";import"./index-t5vm0fH5.js";import"./index-BZPFsP86.js";import"./index-CdqQo6vR.js";import"./index-DRU9_vyE.js";import"./action-middleware-DyJX6epC.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-O6hpA43K.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Dl7_VjfV.js";import"./proxy-CN1Saz3C.js";import"./loader-circle-BTwzSn7t.js";import"./createLucideIcon-IZ3Ej_7Y.js";import"./button-flx_oLDS.js";import"./index-LHNt3CwB.js";import"./label-CjK4WJLG.js";import"./select-VeKjrgfb.js";import"./chevron-down-nFJNT7o9.js";import"./check-BpWbXy1z.js";import"./index-BdQq_4o_.js";import"./index-BV29toM8.js";import"./index-C0JqKj1v.js";import"./index-6DSwDoEx.js";import"./index-B-S9dez_.js";import"./textarea-D6Evbjvu.js";import"./wand-sparkles-Caz4pwMB.js";import"./info-BD_mB4a3.js";import"./WizardReviewStep-f5p-DigK.js";import"./card-CNC7FxHM.js";import"./input-mhNYbhuS.js";import"./x-Cy05pQpo.js";import"./scroll-area-DzZt2Fmh.js";import"./refresh-cw-DlDx0jLo.js";import"./plus-DUwqyXFR.js";import"./search-CU5m9Du_.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
