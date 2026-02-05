import{j as m}from"./jsx-runtime-D1GjQEVf.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B-4aM2LG.js";import{S as d,a as s}from"./story-wizard-BW4BLqW1.js";import"./iframe-DNjoFQhl.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DoD4ZqPn.js";import"./index-DmRXEt-c.js";import"./index-CrNO4qfR.js";import"./index-DC_oym6r.js";import"./index-iV_sYSCg.js";import"./index-BkPybi4r.js";import"./index-CHGISkBC.js";import"./index-BDxU2NY1.js";import"./index-Csxr9kHP.js";import"./index-CKs7JRlo.js";import"./index-dNdL4NAi.js";import"./index-Evg4uWCw.js";import"./index-Bxqp1IjU.js";import"./index-DikYtEq-.js";import"./action-middleware-CW-M3jWO.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BiGIS1-1.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DGMUWK5A.js";import"./proxy-Dn8RO2Y5.js";import"./loader-circle-Bfymm9hd.js";import"./createLucideIcon-MijHHWLg.js";import"./button-nsKTIe3D.js";import"./index-B_jtOnfb.js";import"./label-DGINBxPe.js";import"./select-jQCPKtW2.js";import"./chevron-down-CD2BoaEB.js";import"./check-q9RpPpDr.js";import"./index-BdQq_4o_.js";import"./index-BolFlQZN.js";import"./index-xn7mZDgG.js";import"./index-B4FRCqox.js";import"./index-u_eCVbDO.js";import"./textarea-CSl5hJQv.js";import"./wand-sparkles-BriS3bX_.js";import"./info-D3a17Vyx.js";import"./WizardReviewStep-Rsqz3sCk.js";import"./card-BaX5VHDQ.js";import"./input-CHZHN4f2.js";import"./x-DET8nks2.js";import"./scroll-area-CEiG_E2V.js";import"./refresh-cw-CRGub-n9.js";import"./plus-C11G_jLi.js";import"./search-BlpTujll.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
