import{j as m}from"./jsx-runtime-DYVtm7aN.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-JjQVFZxh.js";import{S as d,a as s}from"./story-wizard-DzwkXAHE.js";import"./iframe-DTpTUVlJ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-B-DmGsWV.js";import"./index-ChoWRSla.js";import"./index-CqyonF03.js";import"./index-Cm_kQTAQ.js";import"./index-DiX2R5TG.js";import"./index-D_mMLAjk.js";import"./index-DtwgTGq8.js";import"./index-RlsrpYdt.js";import"./index-CTvSmDkT.js";import"./index-BkBg7nZY.js";import"./index-6wE_Jjlb.js";import"./index-Cpj3o0Eg.js";import"./index-zU4uyZZA.js";import"./index-BbJb6FUw.js";import"./action-middleware-C449b4rh.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BGl2U41g.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Bi2dHVQV.js";import"./proxy-BocVWjWm.js";import"./loader-circle-CanC02Ub.js";import"./createLucideIcon-rkVhT0Ic.js";import"./button-Di9odUmS.js";import"./index-LHNt3CwB.js";import"./label-CA6O8ruK.js";import"./select-LWa2JaaE.js";import"./chevron-down-DX2SQ3BH.js";import"./check-Dstqq-_k.js";import"./index-BdQq_4o_.js";import"./index-CA0L538x.js";import"./index-D1yzEwZX.js";import"./index-DT7fLVh9.js";import"./index-D5VIkRa8.js";import"./textarea-ykwrzEab.js";import"./wand-sparkles-DZhthaJK.js";import"./info-CECzMMYQ.js";import"./WizardReviewStep-DUb_HDNM.js";import"./card-DiYGC3Mp.js";import"./input-Cs9J0G0e.js";import"./x-BPo57FMs.js";import"./scroll-area-BUTtMlG1.js";import"./refresh-cw-BBwYYt33.js";import"./plus-T6GZ3-iA.js";import"./search-C8raUXLq.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
