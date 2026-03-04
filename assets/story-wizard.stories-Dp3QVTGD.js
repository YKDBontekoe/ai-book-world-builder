import{j as m}from"./jsx-runtime-BvacWYOT.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Cz5n_rLu.js";import{S as d,a as s}from"./story-wizard-BnwpGWqt.js";import"./iframe-BF9R5wty.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Cnx2U0Mc.js";import"./index-BYOmul06.js";import"./index--ipnKF1x.js";import"./index-CuMh9Tm4.js";import"./index-D6ceDtlZ.js";import"./index-C21Cd9Vm.js";import"./index-BFDi71Lr.js";import"./index-Rb1Clwc_.js";import"./index-CjYhtG4D.js";import"./index-uxjzQ8fX.js";import"./index-76xANmTv.js";import"./index-nsfKmvlm.js";import"./index-9ln5HWY6.js";import"./index-AI0HPB5S.js";import"./action-middleware-Dqq0jykp.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Bian-Feb.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-d9UTsljz.js";import"./proxy-DjJpqZRZ.js";import"./loader-circle-6Db_FaEx.js";import"./createLucideIcon-id0NuxEr.js";import"./button-_OOgkNdE.js";import"./index-LHNt3CwB.js";import"./label-340XZdXk.js";import"./select-DNStygDh.js";import"./chevron-down-8IIVaZe3.js";import"./check-DAdLL1Pz.js";import"./index-BdQq_4o_.js";import"./index-DJ1JFK30.js";import"./index-CgnENdYu.js";import"./index-JRnqwyYL.js";import"./index-DypM2Rm9.js";import"./textarea-C4_tijBE.js";import"./wand-sparkles-Harb5-dN.js";import"./info-C2G1Il6s.js";import"./WizardReviewStep-DvZumq2X.js";import"./card-D0WSrVnz.js";import"./input-CYXYGWq1.js";import"./x-BOuzkRVY.js";import"./scroll-area-DgI0gPrv.js";import"./refresh-cw-CmjvC2oM.js";import"./plus-eT5zIjaJ.js";import"./search-BYtnZ7pP.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
