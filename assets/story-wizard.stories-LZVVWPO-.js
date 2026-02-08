import{j as m}from"./jsx-runtime-BnX-zYb9.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-YK2tsDPD.js";import{S as d,a as s}from"./story-wizard-B-RF7jk0.js";import"./iframe-fVu7Aydl.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BlIxVf2Y.js";import"./index-CkEbHcyg.js";import"./index-BPh6CQPB.js";import"./index-Dgh5w6eN.js";import"./index-Bc2yxztq.js";import"./index-u4xcm24o.js";import"./index-DT2LU3yS.js";import"./index--qYjDyRN.js";import"./index-B4Da_lFi.js";import"./index-DiWS43aT.js";import"./index-b-Wuk_-v.js";import"./index-BQg0YpEQ.js";import"./index-f3JTEnTP.js";import"./index-MMrPP7q7.js";import"./action-middleware-BO5So2wr.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DUeZ1kG-.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DeObLDGG.js";import"./proxy-DSX4kDar.js";import"./loader-circle--vlPcw8e.js";import"./createLucideIcon-aM5jGbjr.js";import"./button-DZE9Tzzn.js";import"./index-B_jtOnfb.js";import"./label-ByNXWhHP.js";import"./select-BrCJ4Os4.js";import"./chevron-down-CTrEFfCI.js";import"./check-Cb0tcaCe.js";import"./index-BdQq_4o_.js";import"./index-CuxLdzkQ.js";import"./index-DT-azDlJ.js";import"./index-B_7uTKnq.js";import"./index-CZl7W3fM.js";import"./textarea-BPvt5DoQ.js";import"./wand-sparkles-Btd7Wypa.js";import"./info-1HwI9WhJ.js";import"./WizardReviewStep-DrMOqhh9.js";import"./card-pY-QBRfz.js";import"./input-CCS4-BWT.js";import"./x-CHuoOWR9.js";import"./scroll-area-vPe6iH_W.js";import"./refresh-cw-hgNx69Jw.js";import"./plus-Dc8WPxWD.js";import"./search-CDyt6Q0e.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
