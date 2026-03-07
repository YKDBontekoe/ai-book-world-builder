import{j as m}from"./jsx-runtime-Cm02dnOS.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B5MoIRos.js";import{S as d,a as s}from"./story-wizard-C-bFU4Tx.js";import"./iframe-BGuG1SDv.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DcG-vqRU.js";import"./index-B4GX8TDy.js";import"./index-C5nVOX7H.js";import"./index-CO02lqOV.js";import"./index-D08z3u1i.js";import"./index-Db7B7HJ3.js";import"./index-sK0NJo3C.js";import"./index-CvRaXT0g.js";import"./index-DJURNbDd.js";import"./index-CHU_ptMI.js";import"./index-DqVsKIK0.js";import"./index-Dgt-VGBO.js";import"./index-cNac-9a1.js";import"./index-B0rxeDSs.js";import"./action-middleware-BGcwIgPQ.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DEuSw8AC.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Dz6CTK_A.js";import"./proxy-Ql_0v7Gf.js";import"./loader-circle-Dz_VNjmz.js";import"./createLucideIcon-D-RkFIUj.js";import"./button-BXQKBbgz.js";import"./index-LHNt3CwB.js";import"./label-CniybYMD.js";import"./select-ChSRi-Fj.js";import"./chevron-down-C6KJyVpu.js";import"./check-C5PkC9s1.js";import"./index-BdQq_4o_.js";import"./index-y6JLTu-o.js";import"./index-Cmbq0ILR.js";import"./index-eH8dVias.js";import"./index-D6-_Yh3Y.js";import"./textarea-B3QAXUNO.js";import"./wand-sparkles-CtuOTCLj.js";import"./info-DQhUi7f8.js";import"./WizardReviewStep-BJVnUzSH.js";import"./card-mi4z3kiv.js";import"./input-DLF-vm9m.js";import"./x-DDd-Fyt2.js";import"./scroll-area-CklExWyb.js";import"./refresh-cw-i1K6jCfa.js";import"./plus-DIcUJOqF.js";import"./search-D3VUpKqB.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
