import{j as m}from"./jsx-runtime-BG7PIQAz.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-5e6bc4wv.js";import{S as d,a as s}from"./story-wizard-DEeh90Hv.js";import"./iframe-BcV767mS.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-B0nbtBxX.js";import"./index-Cw6M6jFX.js";import"./index-DAFW4r63.js";import"./index-Cfhkhxa5.js";import"./index-DKTQQi3u.js";import"./index-CzaWh3xq.js";import"./index-qHDMbL96.js";import"./index-CcCztStb.js";import"./index-C1VIbdS7.js";import"./index-Bu7RSlBX.js";import"./index-CPlwR5iA.js";import"./index-BLqix9VE.js";import"./index-Bx-llur1.js";import"./index-ByTQE9bs.js";import"./action-middleware-6-KM64ne.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Dm8zOqQ-.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CPGM4yQ4.js";import"./proxy-BfprifGV.js";import"./loader-circle-zMvSlZ6s.js";import"./createLucideIcon-C1NEY3g4.js";import"./button-BwbpB_8h.js";import"./index-B_jtOnfb.js";import"./label-CAK6oBBJ.js";import"./select-BxofOcw9.js";import"./chevron-down-CC0z4_Qe.js";import"./check-JAGk5D0s.js";import"./index-BdQq_4o_.js";import"./index-Dwo9teIM.js";import"./index-BwsFcZfE.js";import"./index-CjbMGtdi.js";import"./index-DhhzyToj.js";import"./textarea-BOKkDnV3.js";import"./wand-sparkles-B66Y8X78.js";import"./info-0Cynmue5.js";import"./WizardReviewStep--AY0IOQQ.js";import"./card-Dowb7yFi.js";import"./input-CLnnM_WT.js";import"./x-toD0G1Ow.js";import"./scroll-area-jBTTayUM.js";import"./refresh-cw-BoDEMxE0.js";import"./plus-PeWNgEPg.js";import"./search-bYuZba2q.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
