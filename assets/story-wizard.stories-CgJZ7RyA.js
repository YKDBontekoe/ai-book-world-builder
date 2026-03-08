import{j as m}from"./jsx-runtime-CQmVFpmp.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B7s1V7Nk.js";import{S as d,a as s}from"./story-wizard-BwYaDjbl.js";import"./iframe-D0lpiq-m.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Cwxt0NNb.js";import"./index-BHR17jT2.js";import"./index-C_Q10GBL.js";import"./index-BdLcq6Ji.js";import"./index-DYd4LCCy.js";import"./index-BWHzZf8V.js";import"./index-Qc2RY4Iz.js";import"./index-DAEF_XpY.js";import"./index-DRpC3aMJ.js";import"./index-gE9_vgEH.js";import"./index-By4nv4oo.js";import"./index-CQNEZBNp.js";import"./index-B0JhMCQy.js";import"./index-Be5bij20.js";import"./action-middleware-3Ez86wEu.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BerG_PvO.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CbRBJKzj.js";import"./proxy-UnSSrg_f.js";import"./loader-circle-BszFJA_m.js";import"./createLucideIcon-kdGv-s5O.js";import"./button-8P20DPm9.js";import"./index-LHNt3CwB.js";import"./label-B2ivLywm.js";import"./select-BeR4yLyw.js";import"./chevron-down-KGbYoV3N.js";import"./check-DewhCmTt.js";import"./index-BdQq_4o_.js";import"./index-D2O9R96b.js";import"./index-DamGTt5T.js";import"./index-BFxTVZaT.js";import"./index-DSRGU6QC.js";import"./textarea-D_oNs2JV.js";import"./wand-sparkles-B7RFg1pu.js";import"./info-CwH-XX0a.js";import"./WizardReviewStep-KBufxd-H.js";import"./card-CAJwWUmJ.js";import"./input-CYJit3g7.js";import"./x-DntecGvv.js";import"./scroll-area-DpO-ifzH.js";import"./refresh-cw-BlG7AAfk.js";import"./plus-BOjth-YU.js";import"./search-wrbZVk2v.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
