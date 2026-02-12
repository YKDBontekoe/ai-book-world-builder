import{j as m}from"./jsx-runtime-DuiRdJ79.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DX3hurkQ.js";import{S as d,a as s}from"./story-wizard-ChmeOOia.js";import"./iframe-C3nWDyRF.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DT-icI2X.js";import"./index-B3Bg1A6X.js";import"./index-CSn64WaN.js";import"./index-CLYPl2nO.js";import"./index-CnaCnPz1.js";import"./index-B-nfSI_2.js";import"./index-D8qtmH78.js";import"./index-B70MxwR1.js";import"./index-HmTrfwi6.js";import"./index-C0bTaHf_.js";import"./index-C2oijE9t.js";import"./index-DZUHcQ1U.js";import"./index-CSrPeBfi.js";import"./index-DaeO158r.js";import"./action-middleware-DTgMPcvw.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Cr0PRJaC.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BbKeJvPM.js";import"./proxy--o6UXWTH.js";import"./loader-circle-CaFRCZ8Y.js";import"./createLucideIcon-BHtGdcHq.js";import"./button-B_i7-199.js";import"./index-B_jtOnfb.js";import"./label-BmSU7uD-.js";import"./select-Hp2tmala.js";import"./chevron-down-C5xOp9MR.js";import"./check-BucqW1Ml.js";import"./index-BdQq_4o_.js";import"./index-C4EE3RuT.js";import"./index-DOrAgWTn.js";import"./index-DiNrH1Od.js";import"./index-D1Aa41fr.js";import"./textarea-DflCsmpo.js";import"./wand-sparkles-BB8tX949.js";import"./info-BLJszhB0.js";import"./WizardReviewStep-DxPNQt8j.js";import"./card-f_XIa7Qi.js";import"./input-qSqDwrhP.js";import"./x-DOCmpsri.js";import"./scroll-area-BIJQT4hr.js";import"./refresh-cw-CPulBnMe.js";import"./plus-BoVQoVd5.js";import"./search-DLiUba-g.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
