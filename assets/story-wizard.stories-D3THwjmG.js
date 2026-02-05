import{j as m}from"./jsx-runtime-AmyJYj1e.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-SX133ypW.js";import{S as d,a as s}from"./story-wizard-D9CAGsSC.js";import"./iframe-B0fSTETx.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BHdTleXa.js";import"./index-CyEkNvAM.js";import"./index-B-mXX1u4.js";import"./index-CxofJMxH.js";import"./index-Bb7qZ2Dc.js";import"./index-DXytfJEb.js";import"./index-BllYu9j6.js";import"./index-BT15jI2o.js";import"./index-DFmY0R4_.js";import"./index-BVRDCnuO.js";import"./index-ppjla8r6.js";import"./index-CN0ttwfs.js";import"./index-Db1_3lKA.js";import"./index-BPUCQ0YS.js";import"./action-middleware-CVBBsGPJ.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-cog5QWy3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Bdbl6xez.js";import"./proxy-BJvULO7p.js";import"./loader-circle-CcGwwlcf.js";import"./createLucideIcon-67OKxM_P.js";import"./button-BRyr2K_L.js";import"./index-B_jtOnfb.js";import"./label-HY9VO6ug.js";import"./select-aKopCGNa.js";import"./chevron-down-Bt1fJB2b.js";import"./check-DZXoQgOB.js";import"./index-BdQq_4o_.js";import"./index-B7fljRZp.js";import"./index-DoV6akLg.js";import"./index-wiUClUa7.js";import"./index-Bh-J0LyC.js";import"./textarea-DVdDQq1_.js";import"./wand-sparkles-DL-UUa0P.js";import"./info-C2fKeVft.js";import"./WizardReviewStep-DRIh5Rtl.js";import"./card-C1KRMpBv.js";import"./input-BhWIsB5V.js";import"./x-fHW5-7CD.js";import"./scroll-area-CLh5h0F5.js";import"./refresh-cw-CLIvG8E-.js";import"./plus-VfWuvIfR.js";import"./search-BczrjSEp.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
