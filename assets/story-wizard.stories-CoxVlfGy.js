import{j as m}from"./jsx-runtime-nXMzGXAu.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-vVxEEzs1.js";import{S as d,a as s}from"./story-wizard-B8YO_0oH.js";import"./iframe-CKkKSv7j.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-SZrvoxfu.js";import"./index-CoxhzRDu.js";import"./index-CL26Hy5d.js";import"./index-BCnPk7Bu.js";import"./index-B_vjQ2uZ.js";import"./index-BBBGRNpQ.js";import"./index-Bm3XvsRO.js";import"./index-ncuI_-C4.js";import"./index-q22QjpnH.js";import"./index-BpiTpfFP.js";import"./index-ChBSQA0-.js";import"./index-Bme5MBi1.js";import"./index-DKmX-G-P.js";import"./index-DReBP7Dm.js";import"./action-middleware-C8Ktp5Rl.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DUKbep-k.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C5-Q6GP5.js";import"./proxy-Cz1JBX5i.js";import"./loader-circle-Cft_zj0i.js";import"./createLucideIcon-D1Y-k0tp.js";import"./button-ivpquM-E.js";import"./index-B_jtOnfb.js";import"./label-BJFwK99P.js";import"./select-C53nInRL.js";import"./chevron-down-c-jHjDfq.js";import"./check-CL_GQFIY.js";import"./index-BdQq_4o_.js";import"./index-CBF5sCdS.js";import"./index-CbBuv5Vg.js";import"./index-C9Ol_Vy-.js";import"./index-DV82-_g5.js";import"./textarea-iVHrLazh.js";import"./wand-sparkles-j5K0yGPz.js";import"./info-BgQ9-YfQ.js";import"./WizardReviewStep-CFG4lHoJ.js";import"./card-DX-lkuDp.js";import"./input-CETAcGID.js";import"./x-BMbPTwHB.js";import"./scroll-area-CKtBih8u.js";import"./refresh-cw-C7Xesnr4.js";import"./plus-BklwJyqG.js";import"./search-BIVq5zVP.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
