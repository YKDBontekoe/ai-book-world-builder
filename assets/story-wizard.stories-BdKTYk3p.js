import{j as m}from"./jsx-runtime-BqDrxJce.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DV8RKhRS.js";import{S as d,a as s}from"./story-wizard-DPHxwV6z.js";import"./iframe-BHP2XuGJ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CmpA8APT.js";import"./index-YBoJNwNe.js";import"./index-aHU_Wloj.js";import"./index-5Yz3l4Xw.js";import"./index-BrNIVvMe.js";import"./index-2Ocrhz7K.js";import"./index-DBEobTgR.js";import"./index-CLRm3iAp.js";import"./index-BAqm3NPB.js";import"./index-t5WsjVEk.js";import"./index-Dnt_00iC.js";import"./index-C1_i5zHF.js";import"./index-C8lILG3t.js";import"./index-ClMxJzpW.js";import"./action-middleware-Cn7nn-vR.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DYsl1kBg.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-KASNvWcs.js";import"./proxy-DnUzv2hQ.js";import"./loader-circle-D4d696IR.js";import"./createLucideIcon-DYgVMYlc.js";import"./button-Cw4pe0fc.js";import"./index-B_jtOnfb.js";import"./label-BAk-7NT-.js";import"./select-Cxw0XM1E.js";import"./chevron-down-DiU3-YdI.js";import"./check-DF90VvnT.js";import"./index-BdQq_4o_.js";import"./index-CAP4VuEU.js";import"./index-D8A5mDns.js";import"./index-CM2jioVA.js";import"./index-eDIog85Z.js";import"./textarea-7dCrDf_4.js";import"./wand-sparkles-BM33Y36g.js";import"./info-BXfcOPyI.js";import"./WizardReviewStep-DeiqRGYL.js";import"./card-Ba54LmBm.js";import"./input-BGXvvND4.js";import"./x-cLLs5l30.js";import"./scroll-area-hD-souuh.js";import"./refresh-cw-DjvMN8jl.js";import"./plus-5ThHcMC9.js";import"./search-BRNb00z1.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
