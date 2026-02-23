import{j as m}from"./jsx-runtime-C9tIwYNL.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CY0hd12X.js";import{S as d,a as s}from"./story-wizard-D_1zKuOQ.js";import"./iframe-DF_chzP9.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Bx3y-EQw.js";import"./index-CwPpxxDg.js";import"./index-CjbtW27A.js";import"./index-CZAMIxF7.js";import"./index-C7ClVPf8.js";import"./index-CkgBjqlK.js";import"./index-i1zJFSxq.js";import"./index-DoV5X8uZ.js";import"./index-Cu-wbJFJ.js";import"./index-CJ3XxAcm.js";import"./index-CYazVLt-.js";import"./index-CTkTxgtD.js";import"./index-DI-CQvbD.js";import"./index-C3GuCCam.js";import"./action-middleware-5c4HrG18.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-34miZMMc.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DtVJ2UHP.js";import"./proxy-CobZz_cY.js";import"./loader-circle-CmX8IGOm.js";import"./createLucideIcon-DjSdiYtZ.js";import"./button-BsAwSZC-.js";import"./index-LHNt3CwB.js";import"./label-Dxx78iGI.js";import"./select-2tMwKAHO.js";import"./chevron-down-BGMFuVdz.js";import"./check-3SPZOAFR.js";import"./index-BdQq_4o_.js";import"./index-B8I9EmYI.js";import"./index-DksLufwS.js";import"./index-DfCvEdV6.js";import"./index-Ct45Ehvd.js";import"./textarea-nR7JrUSe.js";import"./wand-sparkles-BMid-YzP.js";import"./info-DOQ29XtA.js";import"./WizardReviewStep-Ui8lZD7e.js";import"./card-CdUrM3PE.js";import"./input-DcJ1o1Fs.js";import"./x-EXm50-hD.js";import"./scroll-area-D28bthkQ.js";import"./refresh-cw-BM3aJVYQ.js";import"./plus-Bs-Jt4tX.js";import"./search-YWNdDBiW.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
