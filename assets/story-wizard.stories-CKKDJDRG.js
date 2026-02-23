import{j as m}from"./jsx-runtime-CigVqepM.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DodXD061.js";import{S as d,a as s}from"./story-wizard-By7tCVKL.js";import"./iframe-B814EV1c.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Io7P3kHv.js";import"./index-C463aeHE.js";import"./index-CNpqNBc5.js";import"./index-Du7IehbS.js";import"./index-tgXaVn_Q.js";import"./index-CehtUZ5q.js";import"./index-BsNy5Hte.js";import"./index-ckpk5koR.js";import"./index-DXij2b0j.js";import"./index-B72UQc4P.js";import"./index-DELgv-Lx.js";import"./index-DW_rsnSu.js";import"./index-CiX1aNPv.js";import"./index-1r6MuIbM.js";import"./action-middleware-CG3LnqTm.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-bmA6dUmS.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DwefH4kU.js";import"./proxy-C50g5jfs.js";import"./loader-circle-hsw9uI-M.js";import"./createLucideIcon-Dw5Oesif.js";import"./button-T6MZ5aYq.js";import"./index-LHNt3CwB.js";import"./label-B6Tja6e7.js";import"./select-C8lK3eFB.js";import"./chevron-down-D-JDYKJV.js";import"./check-DiXrzVO1.js";import"./index-BdQq_4o_.js";import"./index-Bikwg3yA.js";import"./index-hZQgQm_v.js";import"./index-CeMMFj3_.js";import"./index-BYqHLZ41.js";import"./textarea-jwlKcpkt.js";import"./wand-sparkles-p_DSCWc_.js";import"./info-CjW9VDFk.js";import"./WizardReviewStep-Clwi1_DF.js";import"./card-BbK6E2io.js";import"./input-BiGDYXFn.js";import"./x-BcZJoHDQ.js";import"./scroll-area-CRB4rkKr.js";import"./refresh-cw-CKLtpa0e.js";import"./plus-DWT_8qbY.js";import"./search-D5iopQKQ.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
