import{j as m}from"./jsx-runtime-lqxuE8QN.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BHatKX29.js";import{S as d,a as s}from"./story-wizard-B6jb2AK4.js";import"./iframe-DcihfV8D.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Du8kQ2ac.js";import"./index-DTJ8lFMs.js";import"./index-DleVaBOr.js";import"./index-BGAuIVIq.js";import"./index-BcCdflfr.js";import"./index-Ds9pZKXT.js";import"./index-C2-oGlq8.js";import"./index-BmmyoEWI.js";import"./index-CjSwWmNU.js";import"./index-B28XmaFH.js";import"./index-DV-xi_F-.js";import"./index-DZV4wv_j.js";import"./index-CpXQZEAo.js";import"./index-ByP33KiG.js";import"./action-middleware-Cjqoolhp.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Be4_B-jA.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Dyv0KZrL.js";import"./proxy-CEsJJq5V.js";import"./loader-circle-Dh6wBkhe.js";import"./createLucideIcon-JwnhaWXy.js";import"./button-BOqJrhS_.js";import"./index-B_jtOnfb.js";import"./label-CeP0inoh.js";import"./select-CBEEvLuf.js";import"./chevron-down-BUuiDWMH.js";import"./check-7rr5lMJk.js";import"./index-BdQq_4o_.js";import"./index-COKF-BJS.js";import"./index-Dw84F9cJ.js";import"./index-CpfGRhrl.js";import"./index-D9laSM8r.js";import"./textarea-CODASkXk.js";import"./wand-sparkles-D63ooCtM.js";import"./info-Cef2Uyxt.js";import"./WizardReviewStep-Dq9NGuRu.js";import"./card-BDa8bmFW.js";import"./input-DlzmbpVp.js";import"./x-DdzAAj5H.js";import"./scroll-area-DxxulnL5.js";import"./refresh-cw-D1n1E8MW.js";import"./plus-BcXKNWvw.js";import"./search-D0XBP9Qc.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
