import{j as m}from"./jsx-runtime-C3K4laFG.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Ca2Bes60.js";import{S as d,a as s}from"./story-wizard-B5Al8DUF.js";import"./iframe-BqTdNurh.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BXdH9P9J.js";import"./index-ToVTg5Ef.js";import"./index-CbyozzJZ.js";import"./index-BKLtZm0P.js";import"./index-QsnsfPc-.js";import"./index-k7KsEmLb.js";import"./index-C5NZc4QV.js";import"./index-WiT0vUGo.js";import"./index-B5HGbq99.js";import"./index-BL8Ejkm-.js";import"./index-CDaFrdZk.js";import"./index-em6XCjk4.js";import"./index-CGWlY4Re.js";import"./index-CSbQ5-eX.js";import"./action-middleware-8k6-VQSM.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Dv0eLV4Q.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DxTcVc6p.js";import"./proxy-yaQ0mct8.js";import"./loader-circle-Co-D5v03.js";import"./createLucideIcon-Dt64MdVp.js";import"./button-CPtKkf8D.js";import"./index-B_jtOnfb.js";import"./label-DKZkiUfm.js";import"./select-CUloquow.js";import"./chevron-down-BumOu1Xi.js";import"./check-CX-c6aqL.js";import"./index-BdQq_4o_.js";import"./index-PwbcocvZ.js";import"./index-J3L8L2zU.js";import"./index-CNANFWoK.js";import"./index-h-S_8B3V.js";import"./textarea-AQyVFn9h.js";import"./wand-sparkles-B83hxkeQ.js";import"./info-x4Loo59s.js";import"./WizardReviewStep-DaJVL0bg.js";import"./card-CdhY4xOb.js";import"./input-BEDMw1Fa.js";import"./x-ChwelBGZ.js";import"./scroll-area-emWZG4qX.js";import"./refresh-cw-Du4FuMKg.js";import"./plus-BrkY4NkN.js";import"./search-CCZoreiT.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
