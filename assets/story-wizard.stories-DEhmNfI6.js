import{j as m}from"./jsx-runtime-C-4gG0NZ.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-FNsfbvks.js";import{S as d,a as s}from"./story-wizard-8TDNrj9m.js";import"./iframe-DmPoBDSz.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-B-eRin3t.js";import"./index-CfeZ93yh.js";import"./index-CdFpaTeL.js";import"./index-CADZtYxq.js";import"./index-CkjpluOV.js";import"./index-YOCd0-pw.js";import"./index-DHCwbPLs.js";import"./index-BLFODbc1.js";import"./index-e2mAcJSX.js";import"./index-D0WkA19h.js";import"./index--JdAeqpY.js";import"./index-BhSF-9wg.js";import"./index-DPv8R6Bi.js";import"./index-BTe6mWJX.js";import"./action-middleware-C2YV682x.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D4AGDeGQ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C6gR2wuR.js";import"./proxy-DgFOTUBv.js";import"./loader-circle-B7YlntPr.js";import"./createLucideIcon-DoEc1vGJ.js";import"./button-BDWcFmUV.js";import"./index-B_jtOnfb.js";import"./label-B18aCa-k.js";import"./select-DAwE_TFV.js";import"./chevron-down-DO4ZejoW.js";import"./check-DnONq0BW.js";import"./index-BdQq_4o_.js";import"./index-d9pqS1Kp.js";import"./index-gMa-SV9w.js";import"./index-DORoY_H-.js";import"./index-Cuw5Tnqa.js";import"./textarea-o1cUiD_7.js";import"./wand-sparkles-DFUVMJUO.js";import"./info-Cpp7LHpU.js";import"./WizardReviewStep-Dufd9oa8.js";import"./card-DlZw_vBI.js";import"./input-zbHhfY12.js";import"./x-DyfrpPhb.js";import"./scroll-area-Baqme_Ef.js";import"./refresh-cw-DfMEQc-b.js";import"./plus-CAPn18oU.js";import"./search-B2v9-Jh0.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
