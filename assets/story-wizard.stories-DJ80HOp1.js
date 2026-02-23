import{j as m}from"./jsx-runtime-B3OS9bcB.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CAL5Iwfx.js";import{S as d,a as s}from"./story-wizard-DMr8_nO6.js";import"./iframe-CDh4tmcG.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DCD1Eqe3.js";import"./index-CeNSX6vm.js";import"./index-dcP-N6cD.js";import"./index-Pls5Kd53.js";import"./index-CBxfViTG.js";import"./index-CB7mYWfh.js";import"./index-DxocRxdc.js";import"./index-DdReKs6X.js";import"./index-Dbq1t-81.js";import"./index-ohZLAVtG.js";import"./index-Bzia9LTM.js";import"./index-DFeXttUn.js";import"./index-DL2SeznT.js";import"./index-DzvQPsEy.js";import"./action-middleware-361eMULy.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CJDAGxZB.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C6MTCDZG.js";import"./proxy-B6UbSF0o.js";import"./loader-circle-CslVril-.js";import"./createLucideIcon-DPPSvnGb.js";import"./button-Wmt1KB-W.js";import"./index-LHNt3CwB.js";import"./label-er6siuWt.js";import"./select-BJuWlt6q.js";import"./chevron-down-D1mEarH_.js";import"./check-CEE_xOmi.js";import"./index-BdQq_4o_.js";import"./index-CF2Y6UMA.js";import"./index-ChCMMjHq.js";import"./index-D1Cjmjqp.js";import"./index-DuAkMvCW.js";import"./textarea-DS1vm9pv.js";import"./wand-sparkles-CbnKwabX.js";import"./info-DyFPOEYd.js";import"./WizardReviewStep-D8dYyVVF.js";import"./card-2DKpZQj9.js";import"./input-DStun6aB.js";import"./x-VTWqJDzR.js";import"./scroll-area-D0rLveQ2.js";import"./refresh-cw-D8Lp9heT.js";import"./plus-F86LqpdP.js";import"./search-DViXFfyB.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
