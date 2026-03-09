import{j as m}from"./jsx-runtime-Do6ufOv5.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BTOCnjUm.js";import{S as d,a as s}from"./story-wizard-DDlVK5a7.js";import"./iframe-BoeynKAF.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BkJcXvi0.js";import"./index-_KQK6QZa.js";import"./index-w5erfpoK.js";import"./index-Bz2nTYqF.js";import"./index-Bvi8Cavu.js";import"./index-DToQeRt-.js";import"./index-B2CkWbIm.js";import"./index-CK957aTR.js";import"./index-jeuVFA39.js";import"./index-CAydYrvz.js";import"./index-BLpaRgO-.js";import"./index-BhrbvJR_.js";import"./index-CSMYBW8l.js";import"./index-6OX_iF2S.js";import"./action-middleware-BSZgLeN6.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BoQvomxb.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BKW7hU-i.js";import"./proxy-X7hI_uZ4.js";import"./loader-circle-CO-TYtV5.js";import"./createLucideIcon-CmGi9Ts5.js";import"./button-BeQvtthc.js";import"./index-LHNt3CwB.js";import"./label-DS-0qRW9.js";import"./select-idbhxVVP.js";import"./chevron-down-Dwe5KE74.js";import"./check-BIQXZrrf.js";import"./index-BdQq_4o_.js";import"./index-BxdNDHEJ.js";import"./index-CjFLCyge.js";import"./index-6WbAwhAo.js";import"./index-MZWkMaBX.js";import"./textarea-DsDpK2sY.js";import"./wand-sparkles-DVd1k2_P.js";import"./info-DEDmDXe5.js";import"./WizardReviewStep-D6S1SjPq.js";import"./card-BWtOTBRx.js";import"./input-BYhETBg6.js";import"./x-D4v4cpHN.js";import"./scroll-area-CVkppGTp.js";import"./refresh-cw-BM09_6Zj.js";import"./plus-BJes0uVF.js";import"./search-BeoVnL8g.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
