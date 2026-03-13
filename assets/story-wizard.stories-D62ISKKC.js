import{j as m}from"./jsx-runtime-Be1aVFFc.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Bt0gaBCT.js";import{S as d,a as s}from"./story-wizard-DUDcbl-u.js";import"./iframe-MHRjnQTb.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BNRSnlrL.js";import"./index-ByXoocGu.js";import"./index-CUQ84OSd.js";import"./index-MXHV4PYD.js";import"./index-DO-FTrGa.js";import"./index-D0xPMqyi.js";import"./index-BuBjgrBP.js";import"./index-zBpSK-Ey.js";import"./index-DOG1wMyL.js";import"./index-D0xEMdYI.js";import"./index-YDFMxOBr.js";import"./index-eDFpl3f3.js";import"./index-Bp144ibr.js";import"./index-CkdL4qHh.js";import"./action-middleware-Che68J4-.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BXNuMm1q.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CPFYmSiT.js";import"./proxy-Cw3y9hqd.js";import"./loader-circle-CjiUeA6w.js";import"./createLucideIcon-BFgNRV0T.js";import"./button-CmO8UAdA.js";import"./index-LHNt3CwB.js";import"./label-CjMTFncW.js";import"./select-BfTgtMAN.js";import"./chevron-down-COSzE1mf.js";import"./check-9A3Nth4O.js";import"./index-BdQq_4o_.js";import"./index-B-E53wTj.js";import"./index-Df8m4d-o.js";import"./index-C8wVGoQZ.js";import"./index-CtKiblAZ.js";import"./textarea-B-B7AvzG.js";import"./wand-sparkles-BI-YLGkE.js";import"./info-D9RL4Q1j.js";import"./WizardReviewStep-B4ZT_p9g.js";import"./card-BwfUzo6K.js";import"./input-DTVgh9K-.js";import"./x-DjjlnSkC.js";import"./scroll-area-CQGs06RU.js";import"./refresh-cw-Dv9W-C63.js";import"./plus-COcRuUkc.js";import"./search-BuZgpdl9.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
