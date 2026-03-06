import{j as m}from"./jsx-runtime-_BsKU3CA.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CYRg1Jgy.js";import{S as d,a as s}from"./story-wizard-lcrxc-r9.js";import"./iframe-G0JQq2Vj.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DOdmBvHT.js";import"./index-v3HbSkMi.js";import"./index-fmUpydyE.js";import"./index-DFFjEYLx.js";import"./index-BIXqq5Wv.js";import"./index-Bvq19cbO.js";import"./index-CXuAX8Y6.js";import"./index-Cnphj8vb.js";import"./index-BSzPFDRK.js";import"./index-CwcQfslr.js";import"./index-C4QVNxqi.js";import"./index-1FALfDKL.js";import"./index-CvuAfLAW.js";import"./index-ByNSGLH7.js";import"./action-middleware-1WQH8PE9.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-C-katlpC.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Dk_UKwCH.js";import"./proxy-B_88eomg.js";import"./loader-circle-B7JoweqJ.js";import"./createLucideIcon-CnkoMBZp.js";import"./button-CQMED6j-.js";import"./index-LHNt3CwB.js";import"./label-DGqFznB1.js";import"./select-e4U-QvUy.js";import"./chevron-down-DNX_VCLw.js";import"./check-Cof-pzX6.js";import"./index-BdQq_4o_.js";import"./index-DjzhAHr3.js";import"./index-DbrH2fM9.js";import"./index-Desf6K3s.js";import"./index-CNVoXX1r.js";import"./textarea-lgMYxfwC.js";import"./wand-sparkles-DrUaq9h7.js";import"./info-Cb66c53y.js";import"./WizardReviewStep-C6paIKst.js";import"./card-DbQ1OHH1.js";import"./input-fsIImHmX.js";import"./x-BE5lKehL.js";import"./scroll-area-BVwrrjdI.js";import"./refresh-cw-CsvoLR98.js";import"./plus-BKoxvJdj.js";import"./search-DT1sYZW5.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
