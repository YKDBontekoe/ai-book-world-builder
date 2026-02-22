import{j as m}from"./jsx-runtime-DcUSkgLi.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BDwZYt2l.js";import{S as d,a as s}from"./story-wizard-qp7cmGAn.js";import"./iframe-BsB9_QO6.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Ce8vt8PQ.js";import"./index-U6MI4lM7.js";import"./index-CU6acNhn.js";import"./index-Bk9ARANG.js";import"./index-CDTonx5k.js";import"./index-C4Jn-R70.js";import"./index-C8i3YoyZ.js";import"./index-DYNa188W.js";import"./index-epYx1ASv.js";import"./index-DYy_JaKn.js";import"./index-CzrR7yld.js";import"./index-a8Brz2hf.js";import"./index-w4Hfcg36.js";import"./index-Bn947zr2.js";import"./action-middleware-C_CjonXC.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DfHuWTWD.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BO8D-qux.js";import"./proxy-DZr0c7NW.js";import"./loader-circle-GXTkVM7x.js";import"./createLucideIcon-BCoics7G.js";import"./button-DEodN9J5.js";import"./index-LHNt3CwB.js";import"./label-BxIIm2bw.js";import"./select-CI2y-DQG.js";import"./chevron-down-vvYTaHyu.js";import"./check-B4bQvWVO.js";import"./index-BdQq_4o_.js";import"./index-BX6p7xx4.js";import"./index-BHYz3R6P.js";import"./index-GTVHAOfb.js";import"./index-CjM9u0IQ.js";import"./textarea-B0FpHTb1.js";import"./wand-sparkles-L-ZdkWhI.js";import"./info-Ct7R8AEz.js";import"./WizardReviewStep-QC9G-Gg_.js";import"./card-By-CVqHp.js";import"./input-CzfmMwlG.js";import"./x--rMx23NU.js";import"./scroll-area-GkYGvDmv.js";import"./refresh-cw-DKISgbH9.js";import"./plus-dxx4ghYr.js";import"./search-DBWE6Y8G.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
