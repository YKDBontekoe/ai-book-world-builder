import{j as m}from"./jsx-runtime-C_-1KnwA.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BPvNN096.js";import{S as d,a as s}from"./story-wizard-DrDe_fQV.js";import"./iframe-CCZbglN_.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BWR8hDFK.js";import"./index-C1CtzAmm.js";import"./index-H9Cv2ljt.js";import"./index-ym9A-CCF.js";import"./index-D6964rM3.js";import"./index-HWsjwHl4.js";import"./index-A_2pp4Q5.js";import"./index-DsYsq8rp.js";import"./index-do8e3H8m.js";import"./index-CwuAgCg5.js";import"./index-CiQHYukR.js";import"./index-ClpnBG2e.js";import"./index-Cv1L5869.js";import"./index-Bd5x8_TL.js";import"./action-middleware-GOiHHvV3.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DZad_dyN.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DjW_4ypg.js";import"./proxy-DyFPKOvt.js";import"./loader-circle-Dh8YKb9T.js";import"./createLucideIcon-B4T1axEy.js";import"./button-C2B-9c-T.js";import"./index-LHNt3CwB.js";import"./label-CTPYM4Wu.js";import"./select-BCEdBEUk.js";import"./chevron-down-Csx9g7Th.js";import"./check-DsGs_LyK.js";import"./index-BdQq_4o_.js";import"./index-DdUIFuo5.js";import"./index-DC8bpmu_.js";import"./index-BkqVULLK.js";import"./index-DHAO1lh9.js";import"./textarea-COFw7Oo_.js";import"./wand-sparkles-Zbg1UU_5.js";import"./info-CcJSuTpw.js";import"./WizardReviewStep-CYsy8CI5.js";import"./card-BRS7VEwR.js";import"./input-CcvmgDMD.js";import"./x-Bp207845.js";import"./scroll-area-DZJT70VI.js";import"./refresh-cw-BcODq2KL.js";import"./plus-DrWw_fLP.js";import"./search-CH0wbETV.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
