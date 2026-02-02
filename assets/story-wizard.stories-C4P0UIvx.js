import{j as m}from"./jsx-runtime-BcNMsz-9.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-l4R9CDLv.js";import{S as d,a as s}from"./story-wizard-DiMVZzF1.js";import"./iframe-B56KOMhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BcrkSDZ0.js";import"./index-C2i7gtYC.js";import"./index-DxVRd0zu.js";import"./index-B_wIuzEu.js";import"./index-E88CDYH1.js";import"./index-tUPbcOhw.js";import"./index-CGkAA3Zn.js";import"./index-DXFUFLRv.js";import"./index-BXOWdFz4.js";import"./index-BNzZLR1o.js";import"./index-o7aUfCKn.js";import"./index-D8W-Ktw5.js";import"./index-Dqd0UGVL.js";import"./index-BGUOFXGf.js";import"./action-middleware-C6fn19Q2.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BlSeT86h.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-8r758LfP.js";import"./proxy-CTac6lqg.js";import"./loader-circle-BdDrNZZb.js";import"./createLucideIcon-WmN9LORG.js";import"./button-DGOCOrB0.js";import"./index-B_jtOnfb.js";import"./label-DxzEhlkb.js";import"./select-CQQb2msB.js";import"./chevron-down-DIPYcTkb.js";import"./check-CShypU-E.js";import"./index-BdQq_4o_.js";import"./index-B4smjJB_.js";import"./index-CjA8Ea3J.js";import"./index-DMksS9Bm.js";import"./index-DS2cDYX7.js";import"./textarea-D6DuXTeS.js";import"./wand-sparkles-Ckn5OzLJ.js";import"./info-yWu7RAGS.js";import"./WizardReviewStep-O8jFfDhP.js";import"./card-DlSjBoW4.js";import"./input-Cj3429iG.js";import"./x-DZen6TRZ.js";import"./scroll-area-DGbSDXPR.js";import"./refresh-cw-SS8k6u7_.js";import"./plus-P7bxrHRk.js";import"./search-BuKvaZ9d.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
