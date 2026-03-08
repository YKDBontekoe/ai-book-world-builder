import{j as m}from"./jsx-runtime-RNnOzMnq.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Cqonzjbp.js";import{S as d,a as s}from"./story-wizard-B8iQabtD.js";import"./iframe-LZccDJfh.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BvX9yHkE.js";import"./index-joK_Uxra.js";import"./index-_-Bawjtm.js";import"./index-CKg7dPNA.js";import"./index-ByO7QkCA.js";import"./index-B6Nw-5rg.js";import"./index-Dc7yhKE_.js";import"./index-CRT3rJQH.js";import"./index-BE1d6wxr.js";import"./index-KyT8VH_Y.js";import"./index-TIOzKIrz.js";import"./index-CQeyHNqO.js";import"./index-DQt5B-ly.js";import"./index-DhOGkmhw.js";import"./action-middleware-4x22N8Yg.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-ejimkfIJ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C0__quf3.js";import"./proxy-di-hPjh5.js";import"./loader-circle-DzUpkxC1.js";import"./createLucideIcon-C6ZwSUS5.js";import"./button-DzEZ6X9l.js";import"./index-LHNt3CwB.js";import"./label-BrSapAqi.js";import"./select-C9gpazaD.js";import"./chevron-down-BdL779zH.js";import"./check-DPnswElG.js";import"./index-BdQq_4o_.js";import"./index-DorAG8eE.js";import"./index-k703n7uZ.js";import"./index-v1YWwvaq.js";import"./index-DLG7sH1X.js";import"./textarea-CTYX_A02.js";import"./wand-sparkles-CO2z20Rl.js";import"./info-8EoDkSYc.js";import"./WizardReviewStep-Bzk-5ERP.js";import"./card-Cke2vDnk.js";import"./input-BTs0_Eo2.js";import"./x-C2ei6pO9.js";import"./scroll-area-BjB9FXWE.js";import"./refresh-cw-CQzooZbq.js";import"./plus-CvOx-upf.js";import"./search-RakFMDad.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
