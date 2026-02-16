import{j as m}from"./jsx-runtime-D-PoNLY5.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CNatHFYn.js";import{S as d,a as s}from"./story-wizard-CbVcPTm1.js";import"./iframe-B8hqdTaZ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BFyR-7wv.js";import"./index-Df204DCd.js";import"./index-DfLwG-58.js";import"./index-74UuszB0.js";import"./index-C_dAfStz.js";import"./index-BFG0LULk.js";import"./index-BuiOwFX6.js";import"./index-DAyIHHPw.js";import"./index-Bq9vnNaR.js";import"./index-JMJ8SdQq.js";import"./index-73n_PaZK.js";import"./index-CxkkY5AM.js";import"./index-sUj2pgtj.js";import"./index-B1MeW86-.js";import"./action-middleware-DVQdi2N2.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-eCxmJl-n.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CTgjb1M_.js";import"./proxy-C5LIlq9r.js";import"./loader-circle-BVfQKysM.js";import"./createLucideIcon-C1lctqw7.js";import"./button-cdxiVXlQ.js";import"./index-B_jtOnfb.js";import"./label-NQp-HdzM.js";import"./select-BQHzhAsv.js";import"./chevron-down-CpL7Dnxh.js";import"./check-6S_z9mFH.js";import"./index-BdQq_4o_.js";import"./index-CBNxA1z3.js";import"./index-DLfBKy9Q.js";import"./index-D90d9zUZ.js";import"./index-KVurrZtz.js";import"./textarea-PO4xbTqT.js";import"./wand-sparkles-BLodZ704.js";import"./info-2ewFgucL.js";import"./WizardReviewStep-C4GQo70N.js";import"./card-BwIPIczP.js";import"./input-DxWJAR_S.js";import"./x-Bs3kF-_m.js";import"./scroll-area-BWBdWsMm.js";import"./refresh-cw-BOUFghED.js";import"./plus-B7jB0qfJ.js";import"./search-CeLSHKey.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
