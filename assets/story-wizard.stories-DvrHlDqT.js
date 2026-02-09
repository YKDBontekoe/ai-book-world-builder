import{j as m}from"./jsx-runtime-CrsxdLKy.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DqFmw5Jc.js";import{S as d,a as s}from"./story-wizard-DiKQ66_G.js";import"./iframe-CB45fEiQ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BdkFbAIf.js";import"./index-EC9GEgw9.js";import"./index-nl59Gbg8.js";import"./index-BAS3cBYX.js";import"./index-fqD0lDN5.js";import"./index-C_Rvn1s7.js";import"./index-DbBEb3xZ.js";import"./index-8F_Jwwb7.js";import"./index-CcM7g--l.js";import"./index-XTfzZfS3.js";import"./index-DqD62KzK.js";import"./index-CoDIeZGJ.js";import"./index-Dl3p058U.js";import"./index-1q-Vtcql.js";import"./action-middleware-D3xWxyh1.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CBhvjcd5.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C2tqW7CP.js";import"./proxy-JJKQ6K1i.js";import"./loader-circle-CKadLF6P.js";import"./createLucideIcon-BKu4cgS1.js";import"./button-CrMBv3xR.js";import"./index-B_jtOnfb.js";import"./label-C1jfTeew.js";import"./select-CbH5rl3s.js";import"./chevron-down-D35EK3XI.js";import"./check-D2SPrlN1.js";import"./index-BdQq_4o_.js";import"./index-BnFdNBkX.js";import"./index-3LKxDYgF.js";import"./index-BwgTI6Xm.js";import"./index-DKiCtAUW.js";import"./textarea-CwUgOYHk.js";import"./wand-sparkles-Bkq5lIWZ.js";import"./info-DN4dUYNq.js";import"./WizardReviewStep-CsiA2FHb.js";import"./card-Brvgbg3z.js";import"./input-8lnIw8Az.js";import"./x-j65Vwx7K.js";import"./scroll-area-nb9bOS4h.js";import"./refresh-cw-DFR7a2bK.js";import"./plus-CnIdCyY4.js";import"./search-Cy6qJfE_.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
