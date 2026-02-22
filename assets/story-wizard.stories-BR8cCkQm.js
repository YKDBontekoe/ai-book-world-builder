import{j as m}from"./jsx-runtime-BW5RJzwf.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Ct8c3BXk.js";import{S as d,a as s}from"./story-wizard-D4Kmd17F.js";import"./iframe-JdzmjXmp.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CkifnIea.js";import"./index-B4Ieak7j.js";import"./index-ZKyW6BtV.js";import"./index-BeIQY9ct.js";import"./index-z42Yel7R.js";import"./index-8v1ZO3zZ.js";import"./index-XXyFvpJx.js";import"./index-BhX6fPfp.js";import"./index-DmrxLHmN.js";import"./index-cBJ4kSu4.js";import"./index-DnWB8Kgi.js";import"./index-D4g1v9ok.js";import"./index-CokZz2oc.js";import"./index-B3SXL8Xt.js";import"./action-middleware-CEpfn1VS.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-iuKz99Xi.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Ch1TQ8uM.js";import"./proxy-Bj7YkdJH.js";import"./loader-circle-CIDzyInO.js";import"./createLucideIcon-DmduVPMp.js";import"./button-BvJae0S0.js";import"./index-LHNt3CwB.js";import"./label-Cm1yjSNJ.js";import"./select-BsbQc2Ps.js";import"./chevron-down-C6E4gi3J.js";import"./check-CmNNi_62.js";import"./index-BdQq_4o_.js";import"./index-BJv9Xkw0.js";import"./index-DFrl3nXm.js";import"./index-CFVwMOZa.js";import"./index-BSVYWYoK.js";import"./textarea-BlslTrTW.js";import"./wand-sparkles-CZ963_eO.js";import"./info-o-uBRdkj.js";import"./WizardReviewStep-m69zO007.js";import"./card-BC1N4bdV.js";import"./input-DRpoFTgu.js";import"./x-C296q2Za.js";import"./scroll-area-DxbkERvn.js";import"./refresh-cw-Bcd0Tswt.js";import"./plus-YCWVGXrB.js";import"./search-CVg9xCIC.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
