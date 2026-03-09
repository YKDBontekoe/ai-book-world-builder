import{j as m}from"./jsx-runtime-zdTW1I0N.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B4FJ74Ek.js";import{S as d,a as s}from"./story-wizard-gn6vaOA6.js";import"./iframe-CU2Y_Y8x.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CLyLQ0pa.js";import"./index-DDVXZXBs.js";import"./index-Bf0gH-ei.js";import"./index-lj6r4yYm.js";import"./index-CAbP3Zow.js";import"./index-CmBayl5x.js";import"./index-Doa4wdIr.js";import"./index-CuSx843W.js";import"./index-CfpyBQHw.js";import"./index-BhsgBaCP.js";import"./index-CorliuGp.js";import"./index-JGhukXfj.js";import"./index-B92FRYRk.js";import"./index-BIFFeDtI.js";import"./action-middleware-ChGYEIOy.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DMnBX0mc.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-QJVIBnFg.js";import"./proxy-ShAbU8q9.js";import"./loader-circle-D0lN7B0A.js";import"./createLucideIcon-LC3Y0AaK.js";import"./button-CrqBN7KZ.js";import"./index-LHNt3CwB.js";import"./label-Bi8rzZfL.js";import"./select-DVNPA_Gh.js";import"./chevron-down-Cro8sFep.js";import"./check-urizcce_.js";import"./index-BdQq_4o_.js";import"./index-EQr7PkMZ.js";import"./index-D6tghSaM.js";import"./index-DZDakhTw.js";import"./index-Cx3_2MjB.js";import"./textarea-CtnnyoR7.js";import"./wand-sparkles-akSs5gnv.js";import"./info-2DHBd5Hx.js";import"./WizardReviewStep-CJ7ppX72.js";import"./card-BnMKJytW.js";import"./input-BCbywUI8.js";import"./x-DzJPohoP.js";import"./scroll-area-CnJIeF5K.js";import"./refresh-cw-FrJohcVz.js";import"./plus-D93yBaKi.js";import"./search-AFbFq8TF.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
