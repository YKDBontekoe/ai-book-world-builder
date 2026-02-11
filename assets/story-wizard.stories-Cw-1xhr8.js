import{j as m}from"./jsx-runtime-DuMZFmtd.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-uCVUidiv.js";import{S as d,a as s}from"./story-wizard-DsA6fKoR.js";import"./iframe-C-K_8C0z.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-5dgJDEd-.js";import"./index-CZJaqpiW.js";import"./index-DfjBKnUF.js";import"./index-HQdVUMto.js";import"./index-D6Aednwb.js";import"./index-DMb7JoD4.js";import"./index-C700Hl7U.js";import"./index-DiL2N6uk.js";import"./index-Dv_dO9dM.js";import"./index-DcZm956V.js";import"./index-Cb3Iwzd0.js";import"./index-CVKBc6Uh.js";import"./index-DArpuEIG.js";import"./index-C7mNqzsw.js";import"./action-middleware-DHQllB3w.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-7e-6nYrM.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-PbEMePSq.js";import"./proxy-D1Ce4GsX.js";import"./loader-circle-u6pXy-qL.js";import"./createLucideIcon-DC_C7yaM.js";import"./button-DS6nO1ZD.js";import"./index-B_jtOnfb.js";import"./label-CU_49iud.js";import"./select--O5QElwJ.js";import"./chevron-down-CP6Wgb5M.js";import"./check-BTqas55u.js";import"./index-BdQq_4o_.js";import"./index-CKF-bhp-.js";import"./index-CqMQsSor.js";import"./index-BWzSS-r6.js";import"./index-CusILwPs.js";import"./textarea-BR2tbjEl.js";import"./wand-sparkles-BNjRLkKq.js";import"./info-DRHBCWqJ.js";import"./WizardReviewStep-BpZI8rCX.js";import"./card-CjMwitN7.js";import"./input-CcgJdYDy.js";import"./x-C029RBII.js";import"./scroll-area-BJ8FWs_V.js";import"./refresh-cw-DFX3Ox3V.js";import"./plus-B2mAi476.js";import"./search-DyzY955E.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
