import{j as m}from"./jsx-runtime-B-jsqCfp.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-3mvA3n9C.js";import{S as d,a as s}from"./story-wizard-Cb9A3_Kz.js";import"./iframe-BSuIr9rD.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-B7dX-96y.js";import"./index-B5AaeSvg.js";import"./index-DGvTvNkL.js";import"./index-Bks7bd2g.js";import"./index-hqVJIaM7.js";import"./index-CYDNRS6B.js";import"./index-B3gBNdIt.js";import"./index-BdcxAv1Y.js";import"./index-D4pVmibW.js";import"./index-CRJWp4qC.js";import"./index-Bbcsi-Yf.js";import"./index-Z0uCmfcU.js";import"./index-DhNsCQbG.js";import"./index-_3dwHJQZ.js";import"./action-middleware-BTQW-AHa.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Db6vXesi.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-2r8Ts89Q.js";import"./proxy-DbfglYKH.js";import"./loader-circle-CMLJth3V.js";import"./createLucideIcon-9hrGu-0a.js";import"./button-bfwCN_7K.js";import"./index-LHNt3CwB.js";import"./label-5NNr_i9_.js";import"./select-CzG4kd6e.js";import"./chevron-down-D7EUvs65.js";import"./check-7bTgnUmq.js";import"./index-BdQq_4o_.js";import"./index-B2VlrPLw.js";import"./index-Ku_eNKMZ.js";import"./index-Dhp6tCIN.js";import"./index-okTi5kph.js";import"./textarea-CcJEkjvJ.js";import"./wand-sparkles-BMNCLBLD.js";import"./info-DHFcAYOf.js";import"./WizardReviewStep-NXsAVdr6.js";import"./card-CqNxjCFE.js";import"./input-Cn1mTJCP.js";import"./x-BJU-Jngw.js";import"./scroll-area-DI2zJEjs.js";import"./refresh-cw-jOfS-t3y.js";import"./plus-szQCHaVW.js";import"./search-e_cB0qI8.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
