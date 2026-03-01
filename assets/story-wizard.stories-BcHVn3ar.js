import{j as m}from"./jsx-runtime-BKTpTTBe.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DQVKAeQ3.js";import{S as d,a as s}from"./story-wizard-SjJBFJH8.js";import"./iframe-CY6E8OXJ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BwpoVsrw.js";import"./index-BlKoRER7.js";import"./index-D76A1fnr.js";import"./index-BHia0Twu.js";import"./index-CmtoKuYQ.js";import"./index-BAj_Vw0m.js";import"./index-DDAXum5G.js";import"./index-DKLwonqb.js";import"./index-DP4j5A32.js";import"./index-B9e6wgKD.js";import"./index-CoEAgDnD.js";import"./index-C0Ffaf37.js";import"./index-BaRBITrN.js";import"./index-DCrodszK.js";import"./action-middleware-BGZEw5nH.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BqOQxZv6.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Bf1aVcse.js";import"./proxy-CSy8S79G.js";import"./loader-circle-Kr6VzIA1.js";import"./createLucideIcon-Cpp3vyfW.js";import"./button-BRpJlTYp.js";import"./index-LHNt3CwB.js";import"./label-DTZWK5DI.js";import"./select-CqFxxd-f.js";import"./chevron-down-TNm1UMRZ.js";import"./check-CXR1nV8O.js";import"./index-BdQq_4o_.js";import"./index-Do-SARq_.js";import"./index-CpJmeXIY.js";import"./index-D-A14zZP.js";import"./index-CXUgzca4.js";import"./textarea-Dt-1c8HZ.js";import"./wand-sparkles-DCBUJOp5.js";import"./info-CjI5aZg-.js";import"./WizardReviewStep-CqaJ15px.js";import"./card-Dg9nnbwT.js";import"./input-C7_AUKM_.js";import"./x-BV_YS9hc.js";import"./scroll-area-48te1OUu.js";import"./refresh-cw-Da35Vfr0.js";import"./plus-Br73Asv1.js";import"./search-C6mKrN8n.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
