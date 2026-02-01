import{j as m}from"./jsx-runtime-D0RWKmAu.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-xww2W71M.js";import{S as d,a as s}from"./story-wizard-CS-d8k84.js";import"./iframe-B3fGxL8E.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BNocoH4U.js";import"./index-DxNYJR6u.js";import"./index-DqeUBIi8.js";import"./index-D40bD9G2.js";import"./index-DfwL66Vf.js";import"./index-_5IJBP-4.js";import"./index-CKwb-aLg.js";import"./index-CkFZejF2.js";import"./index-B14vMfGx.js";import"./index-nppNWyng.js";import"./index-CZ_DqdpP.js";import"./index-DDylOXSJ.js";import"./index-D5Molb2f.js";import"./index-RcpSIBLy.js";import"./action-middleware-D2MgxuWR.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DP1jE2P3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Bmn5_zOZ.js";import"./proxy-Casl2Xr8.js";import"./loader-circle-BjWz1D9s.js";import"./createLucideIcon-D58iH_x9.js";import"./button-BM3_BMbG.js";import"./index-B_jtOnfb.js";import"./label-CNX8USm3.js";import"./select-CJ2TCgt8.js";import"./chevron-down-BCzU11a4.js";import"./check-pV64hE2k.js";import"./index-BdQq_4o_.js";import"./index-CuHpLpg0.js";import"./index-CuTbP2my.js";import"./index-Cz565f3x.js";import"./index-Cd6dwi0i.js";import"./textarea-CHaeqHhy.js";import"./wand-sparkles-Yjv2k20P.js";import"./info-CKJhSbxI.js";import"./WizardReviewStep-bKBqYC6i.js";import"./card-BVM7XXF8.js";import"./input-CByWV0RD.js";import"./x-FU4hTmrc.js";import"./scroll-area-DryBg09_.js";import"./refresh-cw-DfmBN8k1.js";import"./plus-CBkCjsBC.js";import"./search-B5m8eMk_.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
