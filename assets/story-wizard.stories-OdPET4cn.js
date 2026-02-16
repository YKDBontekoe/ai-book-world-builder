import{j as m}from"./jsx-runtime-D1UpiHbx.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-SFly1yAm.js";import{S as d,a as s}from"./story-wizard-C76Vnosy.js";import"./iframe-CJ9ST3nQ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DzxdF0ZA.js";import"./index-C-TnkZqj.js";import"./index-CiQtvz38.js";import"./index-CDHr9zS4.js";import"./index-B2NNHitj.js";import"./index-BqDJDtFL.js";import"./index-Ch78LSwN.js";import"./index-CM3-SV60.js";import"./index-CBb52KTU.js";import"./index-CIDqnPu8.js";import"./index-BxPjKEKs.js";import"./index-BKNYxBHU.js";import"./index-D_pXLHTc.js";import"./index-D9lHNi1_.js";import"./action-middleware-ClRyLV34.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-zXGEgSmM.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DmMqmo-8.js";import"./proxy-ByHBLDe3.js";import"./loader-circle-D_sI59-F.js";import"./createLucideIcon-DrL2i6gp.js";import"./button-DKrJF6Hk.js";import"./index-B_jtOnfb.js";import"./label-C7veeXoL.js";import"./select-BCJON_PY.js";import"./chevron-down-EY7vuc4Y.js";import"./check-DL5rMkkR.js";import"./index-BdQq_4o_.js";import"./index-D67bh27f.js";import"./index-CCJGxTTm.js";import"./index-B7plcb3H.js";import"./index-D1AdZIAC.js";import"./textarea-s_JiDjPx.js";import"./wand-sparkles-CASnVKrx.js";import"./info-CRT7lVvs.js";import"./WizardReviewStep-Dw4V9xw8.js";import"./card-CWg42R0H.js";import"./input-DS4v0osL.js";import"./x-DFCjJdpJ.js";import"./scroll-area-BMLWrCmT.js";import"./refresh-cw-C95Q7Me6.js";import"./plus-DF7AjnlQ.js";import"./search-DRPNq4YC.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
