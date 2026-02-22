import{j as m}from"./jsx-runtime-CmXr4ZLr.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CyfCT0jX.js";import{S as d,a as s}from"./story-wizard-2VkuAjY9.js";import"./iframe-CNcg9uZb.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BJc8Pgc4.js";import"./index-BuQ0nRPN.js";import"./index-iN4zdWwO.js";import"./index-BaoMJQOi.js";import"./index-DX8NNdbx.js";import"./index-4LdBEcpz.js";import"./index-DeAbCsY3.js";import"./index-D5p0EoGc.js";import"./index-Cf4zZ5Tx.js";import"./index-Ba9Z-7ps.js";import"./index-B4rc_1lj.js";import"./index-BZxSiVl4.js";import"./index-CE91izEb.js";import"./index-CRRVdsG3.js";import"./action-middleware-C-T2lyaN.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-WJ_lp5op.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C-PsSjw8.js";import"./proxy-IIYKWjyF.js";import"./loader-circle-C_VihoNu.js";import"./createLucideIcon-BaV4Se2Z.js";import"./button-BtyBBOPs.js";import"./index-LHNt3CwB.js";import"./label-Bk5XMO2E.js";import"./select-7gZxXKMY.js";import"./chevron-down-Bftdjlm9.js";import"./check-X1u4r57K.js";import"./index-BdQq_4o_.js";import"./index-Wiq5yuiG.js";import"./index-B3Ox10yJ.js";import"./index-BXtagL3o.js";import"./index-BY0oI3eo.js";import"./textarea-QNQ8_cfe.js";import"./wand-sparkles-CvYG3BXk.js";import"./info-DU8Ct3aR.js";import"./WizardReviewStep-kDYeUD1I.js";import"./card-CcfjZw1u.js";import"./input-D23vuwzW.js";import"./x-ZCfbERLE.js";import"./scroll-area-MU7R5r3e.js";import"./refresh-cw-CHof7DUd.js";import"./plus-CSK6tAGl.js";import"./search-D9ZQboip.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
