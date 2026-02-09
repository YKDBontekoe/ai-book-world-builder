import{j as m}from"./jsx-runtime-DJjLIc3V.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DMsKxKyI.js";import{S as d,a as s}from"./story-wizard-Be_0Ph16.js";import"./iframe-DAirlFW6.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BLybB1Hr.js";import"./index-qKQx2c95.js";import"./index-B5Y8xRN-.js";import"./index-BpHW5Xqw.js";import"./index-Dgtegocv.js";import"./index-WDREQDgM.js";import"./index-DHyIRmhb.js";import"./index-C7YkGwps.js";import"./index-CzcoH-ve.js";import"./index-DTLezoDW.js";import"./index-BLrRPokY.js";import"./index-DNMmeLl3.js";import"./index-UGgXTotB.js";import"./index-PipBSU0-.js";import"./action-middleware-BGUbu-al.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-PvcEhMBa.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B0QePOwB.js";import"./proxy-gnjF4XLF.js";import"./loader-circle-DvUG3nE8.js";import"./createLucideIcon-NgGifad-.js";import"./button-DfhHmRTj.js";import"./index-B_jtOnfb.js";import"./label-DCqHS0EN.js";import"./select-puBzdCE0.js";import"./chevron-down-Dq6X3DqQ.js";import"./check-D0lgU83x.js";import"./index-BdQq_4o_.js";import"./index-ChI-alGm.js";import"./index-DcH6d2YE.js";import"./index-BIe_dOdr.js";import"./index-BTNVPzmw.js";import"./textarea-BjzqTwHf.js";import"./wand-sparkles-Dihix193.js";import"./info-gJduGf2K.js";import"./WizardReviewStep-CDvIbFbI.js";import"./card-BNkB0ffB.js";import"./input-vGRK1pBZ.js";import"./x-kLb18tg-.js";import"./scroll-area-Dsjhvqrf.js";import"./refresh-cw-DEKbotdJ.js";import"./plus-7hAxAkYi.js";import"./search-BeMKRMmN.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
