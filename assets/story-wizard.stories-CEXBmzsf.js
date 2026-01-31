import{j as m}from"./jsx-runtime-Btt-yMwc.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DxSWXFhy.js";import{S as d,a as s}from"./story-wizard-BXzn0K6O.js";import"./iframe-DpcmUMW8.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DpjhC195.js";import"./index-btYDhrEa.js";import"./index-9Jay9NhU.js";import"./index-CTtW1CYB.js";import"./index-CshY_Uml.js";import"./index-DOGqS5y2.js";import"./index-C37N_vmJ.js";import"./index-CMPdjlsV.js";import"./index-Dzx6La4P.js";import"./index-BMUgwy8e.js";import"./index-g4Tfalgh.js";import"./index-6VjqU4nA.js";import"./index-bV0r_Vhc.js";import"./index-BCJM665P.js";import"./action-middleware-2CZV9Qfj.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D1vZw2te.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CqmC4HL2.js";import"./proxy-pffQv_eS.js";import"./loader-circle-CWQLghFm.js";import"./createLucideIcon-BqBkpq7X.js";import"./button-Roz5tla1.js";import"./index-B_jtOnfb.js";import"./label-D5kGzg1z.js";import"./select-DHO30a7g.js";import"./chevron-down-B3Ht2WCz.js";import"./check-13f35pj9.js";import"./index-BdQq_4o_.js";import"./index-_mgy6sbX.js";import"./index-DlJAWa5P.js";import"./index-BJRj9kQg.js";import"./index-jynuevBi.js";import"./textarea-BHYg-stf.js";import"./wand-sparkles-MO2zepHV.js";import"./info-dt5BtccT.js";import"./WizardReviewStep-BO8Pn1KT.js";import"./card-6UxKJNJm.js";import"./input-BknS2aiT.js";import"./x-CTpUdiJG.js";import"./scroll-area-BmyX9sBq.js";import"./refresh-cw-RAu2nP8u.js";import"./plus-6pElqgVC.js";import"./search-DjMtI1QW.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
