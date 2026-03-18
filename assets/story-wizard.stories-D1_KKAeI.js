import{j as m}from"./jsx-runtime-BE4sthyB.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BHwN9oJu.js";import{S as d,a as s}from"./story-wizard-DFT_eZPH.js";import"./iframe-SAvVxmxH.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BLXjOEyp.js";import"./index-PS9NSnCi.js";import"./index-BKvaPkQC.js";import"./index-_4TvtADJ.js";import"./index-DzYSMOiz.js";import"./index-DKJHatYi.js";import"./index-hqL-Kzh1.js";import"./index-CGovmK_U.js";import"./index-ZaKyYQwZ.js";import"./index-Cu2fJGFi.js";import"./index-N2qItpac.js";import"./index-vy7KA-9H.js";import"./index-Dg2gbh4d.js";import"./index-aw-9r-Hw.js";import"./action-middleware-DQ_qkRZI.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-l3f1gKO0.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CkDAYwZj.js";import"./proxy-wa3RAVmK.js";import"./loader-circle-Csd5fLJj.js";import"./createLucideIcon-CQoRtzbE.js";import"./button-BqxtwSpe.js";import"./index-LHNt3CwB.js";import"./label-D8oPGoht.js";import"./select-Be2txzq-.js";import"./chevron-down-DO_JMIfu.js";import"./check-B9iR8mJf.js";import"./index-BdQq_4o_.js";import"./index-DwYUmOJg.js";import"./index-CWgArfmo.js";import"./index-BlAFWq6a.js";import"./index-CZhI0tHv.js";import"./textarea-D_abYyq1.js";import"./wand-sparkles-YUfepcc9.js";import"./info-hsZtiBOY.js";import"./WizardReviewStep-BR4Z_krX.js";import"./card-tQzbsTzx.js";import"./input-CrlVBaZ5.js";import"./x-DlnIDAZe.js";import"./scroll-area-n3xJgX0D.js";import"./refresh-cw-D22gWA4Z.js";import"./plus-9T7wwCQo.js";import"./search-D2ZkgW1Q.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
