import{j as m}from"./jsx-runtime-CAvCWP6l.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-RVloilnS.js";import{S as d,a as s}from"./story-wizard-CNpNydTf.js";import"./iframe-BvcWfE_Q.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-EkK5_ruT.js";import"./index-D7-ggrsw.js";import"./index-294tqNjA.js";import"./index-BdvsgX9d.js";import"./index-SJTRcweA.js";import"./index-RqWTaDyX.js";import"./index-DhnZWLui.js";import"./index-C4tdgKIL.js";import"./index-CBDJ7f50.js";import"./index-BSpn0rcn.js";import"./index-BLGP2udD.js";import"./index-B737Y0A4.js";import"./index-D44fERfJ.js";import"./index-B1Jl-_5C.js";import"./action-middleware-CugInt_S.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BiKInZO3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CGJnTVJu.js";import"./proxy-B6Uk4QYJ.js";import"./loader-circle-CZRXZeW4.js";import"./createLucideIcon-CHqQLITI.js";import"./button-lrjP4XD8.js";import"./index-LHNt3CwB.js";import"./label-k5DkdfFP.js";import"./select-fWBwpR6D.js";import"./chevron-down-DDUqUR41.js";import"./check-COjPBAjZ.js";import"./index-BdQq_4o_.js";import"./index-3yBsn1dy.js";import"./index-Cho2Uwub.js";import"./index-Bt92XAOa.js";import"./index-a5JJ8h1f.js";import"./textarea-BjQzhIO8.js";import"./wand-sparkles-DFjMcRlA.js";import"./info-CkAJFtsk.js";import"./WizardReviewStep-C6d_T1Ph.js";import"./card-CqycZ_N0.js";import"./input-054vPZe_.js";import"./x-Bwf5q6DJ.js";import"./scroll-area-BF776dLA.js";import"./refresh-cw-CyPjh7L5.js";import"./plus-D_7tGFaW.js";import"./search-CE3ovOL4.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
