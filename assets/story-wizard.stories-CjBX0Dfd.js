import{j as m}from"./jsx-runtime-DMunRu3D.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DO9eRWwm.js";import{S as d,a as s}from"./story-wizard-DqauTZT2.js";import"./iframe-CGBE84mn.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-D1ku06iw.js";import"./index-Ds5eoLtd.js";import"./index-DkBymBmj.js";import"./index-Bg6SJ_lw.js";import"./index-8byG8t0Z.js";import"./index-C_hMtTF0.js";import"./index-nPQZkUgx.js";import"./index-D2wFZT_3.js";import"./index-C51Yaur6.js";import"./index-BQBA4lwE.js";import"./index-_KFvzRk_.js";import"./index-DKqWvx_r.js";import"./index-5vsR-Ejv.js";import"./index-CvTMI3mC.js";import"./action-middleware-7nNf9xPk.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D1RaMUSr.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B390jwCP.js";import"./proxy-B49KQ4i1.js";import"./loader-circle-BmGkBcp5.js";import"./createLucideIcon-6MLQDiJe.js";import"./button-CkKJoUUV.js";import"./index-B_jtOnfb.js";import"./label-S72eraYg.js";import"./select-2s_mCdeW.js";import"./chevron-down-DFZROUp3.js";import"./check-DfOnLzEj.js";import"./index-BdQq_4o_.js";import"./index-C1SnMRqx.js";import"./index-q2048704.js";import"./index-CHEUoYKF.js";import"./index-DjodvClV.js";import"./textarea-otlRd4cc.js";import"./wand-sparkles-_p0WtYTi.js";import"./info-CODW4H46.js";import"./WizardReviewStep-BUxXB_Ku.js";import"./card-BpAWE1Jj.js";import"./input-CU1-unue.js";import"./x-CpP8I8jK.js";import"./scroll-area-D8wR3FND.js";import"./refresh-cw-C5nBGffT.js";import"./plus-Cffclfcn.js";import"./search-Bx_LBqaE.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
