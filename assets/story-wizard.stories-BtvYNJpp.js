import{j as m}from"./jsx-runtime-rRUc8C7L.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CkABrwHb.js";import{S as d,a as s}from"./story-wizard-CPLB90iy.js";import"./iframe-D7JxVGYl.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CqT-bCdd.js";import"./index-Fo4HJwq1.js";import"./index-DR1n6THc.js";import"./index-CuWd2o7o.js";import"./index-BFD3BmF-.js";import"./index-Bb6dRRQt.js";import"./index-BYoLl0f3.js";import"./index-BqPR1DcB.js";import"./index-Bpe6iD6P.js";import"./index-crXLLyVa.js";import"./index-CyoIyVAr.js";import"./index-D36SLLCJ.js";import"./index-CjTdPDd9.js";import"./index-CiuxUmxQ.js";import"./action-middleware-BEnAkhqo.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Ccxfrapj.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-ChhGAf0x.js";import"./proxy-BDOL1bTk.js";import"./loader-circle-BzTemZst.js";import"./createLucideIcon-B0OOPf_O.js";import"./button-CHXSQAfl.js";import"./index-LHNt3CwB.js";import"./label-rmQJ9P77.js";import"./select-DnYbQWQC.js";import"./chevron-down-C0mPFMwZ.js";import"./check-CtYd2m2E.js";import"./index-BdQq_4o_.js";import"./index-CuHucrXx.js";import"./index-DlR9W8C7.js";import"./index-yKFPdfYa.js";import"./index-BbWegNc-.js";import"./textarea-C6eNUu7b.js";import"./wand-sparkles-DAQHispZ.js";import"./info-7VYnWYhV.js";import"./WizardReviewStep-ByvA9ztj.js";import"./card-Buw4samL.js";import"./input-DlLT2I_t.js";import"./x-BbPME30D.js";import"./scroll-area-aSYDOzry.js";import"./refresh-cw-BlTjXgE_.js";import"./plus-BFI8-TZe.js";import"./search-BR5JfXH8.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
