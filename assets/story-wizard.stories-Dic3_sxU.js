import{j as m}from"./jsx-runtime-DwuM050q.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-cCaNuJdz.js";import{S as d,a as s}from"./story-wizard-BhyuW7wD.js";import"./iframe-CHiHFW1C.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-ByytxRBh.js";import"./index-Dzw952S6.js";import"./index-B9jpPkTI.js";import"./index-B4ajr2g0.js";import"./index-CMdfZ4u8.js";import"./index-DGTXWW9D.js";import"./index-B2XDCAEg.js";import"./index-D_ODaZL5.js";import"./index-BxZZh_5q.js";import"./index-DfQ8cDO_.js";import"./index-TaeUvYHB.js";import"./index-CtEMlUCN.js";import"./index-BoKWmEKf.js";import"./index-B6cOkujo.js";import"./action-middleware-BOkx4rkp.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-B2TuKowJ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Ds6qpQ6M.js";import"./proxy-Dg6AkZ54.js";import"./loader-circle-qZZxXdkF.js";import"./createLucideIcon-CiaxLVQt.js";import"./button-OFwFqZ2H.js";import"./index-B_jtOnfb.js";import"./label-Dpe0qA2W.js";import"./select-BV8UGU0c.js";import"./chevron-down-BQDw0y5b.js";import"./check-1Np8RsuI.js";import"./index-BdQq_4o_.js";import"./index-CLoDY5sg.js";import"./index-BLsDpdRG.js";import"./index-Bj3th3Ad.js";import"./index-BFuoPC8j.js";import"./textarea-Cy401qhq.js";import"./wand-sparkles-CxLAngVR.js";import"./info-ypYTHZ8W.js";import"./WizardReviewStep-BwSKbB07.js";import"./card-Bzfb5joY.js";import"./input-FjKmfMMp.js";import"./x-B7u2Z4DI.js";import"./scroll-area-BA0kSBBh.js";import"./refresh-cw-l-sdVHjy.js";import"./plus-CBp5s3dp.js";import"./search-Cq5ojSJx.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
