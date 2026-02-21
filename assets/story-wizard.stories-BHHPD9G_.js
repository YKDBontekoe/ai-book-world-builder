import{j as m}from"./jsx-runtime-Ba2KnEow.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DDx89G3j.js";import{S as d,a as s}from"./story-wizard-CKzDvilk.js";import"./iframe-CbLQfuCz.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-DIfFyp-V.js";import"./index-QWj1Dh_F.js";import"./index-BsHHfBXH.js";import"./index-ASnfCVGu.js";import"./index-FfhJf4tr.js";import"./index-yK8GYPw5.js";import"./index-DYalDHTx.js";import"./index-DwM7WEzO.js";import"./index-BJtSLSip.js";import"./index-CJyEP2Jt.js";import"./index-C9c9NRAw.js";import"./index-Cc1un8wU.js";import"./index-DXsXpBnG.js";import"./index-v0FgZA0d.js";import"./action-middleware-BNGgnzed.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CLVaBWLk.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BkDxwNKQ.js";import"./proxy-f4Pa9Om7.js";import"./loader-circle-CHUMuBBF.js";import"./createLucideIcon-Dex5lNfb.js";import"./button-MuIPHFAK.js";import"./index-h6qoG7Gi.js";import"./label-HaAHdNUu.js";import"./select-As9Jqksd.js";import"./chevron-down-xMv5Y3Bb.js";import"./check-B3tdsPps.js";import"./index-BdQq_4o_.js";import"./index-DZ4p3Piw.js";import"./index-CpQTHVFi.js";import"./index-BSR5L3Wo.js";import"./index-DCJ6O0ww.js";import"./textarea-Dy4eerjj.js";import"./wand-sparkles-DdHOPXj4.js";import"./info-DGGwKWlJ.js";import"./WizardReviewStep-C_CT8HqB.js";import"./card-C_las6nA.js";import"./input-Bihzry8B.js";import"./x-firTabsH.js";import"./scroll-area-CpfmUwnw.js";import"./refresh-cw-DsIZY6Yn.js";import"./plus-CpkodX1V.js";import"./search-DS76_UmW.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
