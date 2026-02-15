import{j as m}from"./jsx-runtime-DRTDmoCA.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-By5f4oi9.js";import{S as d,a as s}from"./story-wizard-DmHhe5A6.js";import"./iframe-DoFnoXif.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-s9ubheok.js";import"./index-KDleEjOK.js";import"./index-CQAdw42k.js";import"./index-zwbqrNRK.js";import"./index-CBsrwyHi.js";import"./index-DtLUACEm.js";import"./index-CvTb-zyh.js";import"./index-Bq8CCPTm.js";import"./index-B2r3vdCr.js";import"./index-Sx9s4PGc.js";import"./index-DtFRUkxe.js";import"./index-CDLhLd6A.js";import"./index-Cmbu17au.js";import"./index-C4QgByq1.js";import"./action-middleware-BGn8StK0.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BTwyOQD0.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CtfXznlr.js";import"./proxy-C-xuASyi.js";import"./loader-circle-d4TA41nF.js";import"./createLucideIcon-CrIgM3i4.js";import"./button-ngokRpvP.js";import"./index-B_jtOnfb.js";import"./label-DTI-Lcub.js";import"./select-CqkTU3lM.js";import"./chevron-down-C_xAOh8U.js";import"./check-hyVo45W7.js";import"./index-BdQq_4o_.js";import"./index-Bmprda_8.js";import"./index-DVUr8K6H.js";import"./index-tnzkue7x.js";import"./index-DLQ-FEWV.js";import"./textarea-DqimY4DK.js";import"./wand-sparkles-Cqso_u2a.js";import"./info-D56-1keF.js";import"./WizardReviewStep-BB8nwP9A.js";import"./card-gGnalSKh.js";import"./input-e9S9dWtj.js";import"./x-Nf9hXtgl.js";import"./scroll-area-ChxxeY4z.js";import"./refresh-cw-g_-J3I8h.js";import"./plus-CSd6xONp.js";import"./search-3log6JQu.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
