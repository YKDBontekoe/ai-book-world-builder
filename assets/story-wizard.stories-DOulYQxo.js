import{j as m}from"./jsx-runtime-BwHitXWg.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DkCq2lPB.js";import{S as d,a as s}from"./story-wizard-DxCa5mtx.js";import"./iframe-DwkoW40D.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Dc2svjO5.js";import"./index-DoqnkdCd.js";import"./index-Dz7VKJmX.js";import"./index-DCg8KPlE.js";import"./index-BolTDSyA.js";import"./index-CUtz9Peh.js";import"./index-DWPb-3Rc.js";import"./index-tmpLoPKD.js";import"./index-SikYL4eS.js";import"./index-DySUjA1j.js";import"./index-BKJ4WOzz.js";import"./index-CVF-HcFD.js";import"./index-h0_doWfO.js";import"./index-DLKkZprS.js";import"./action-middleware-RYyCD1-S.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Bs8YR3ps.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DA_IItOr.js";import"./proxy-fjWUUfrA.js";import"./loader-circle-CAHbtC2P.js";import"./createLucideIcon-DXw4KgZ6.js";import"./button-vz-06iqK.js";import"./index-LHNt3CwB.js";import"./label-DI-mrNAR.js";import"./select-Bn11U6H7.js";import"./chevron-down-DfoBpDnz.js";import"./check-BIdHu-Qe.js";import"./index-BdQq_4o_.js";import"./index-C0YrqVjW.js";import"./index-BXa10wwR.js";import"./index-DdTtFGG5.js";import"./index-BA_WRbpp.js";import"./textarea-BkVeSucW.js";import"./wand-sparkles-DPuGJNL9.js";import"./info-Ggv_iSq_.js";import"./WizardReviewStep-BMOY9x6p.js";import"./card-CPlMRbp7.js";import"./input-Zo6bmZbf.js";import"./x-BkboyTmZ.js";import"./scroll-area-DoHMe_Ds.js";import"./refresh-cw-4KgTv1BO.js";import"./plus-CNdb0FVO.js";import"./search-Ce_ucFGG.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
