import{j as m}from"./jsx-runtime-ChW6iIu2.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CYUepzpj.js";import{S as d,a as s}from"./story-wizard-DfVX8QZF.js";import"./iframe-po7mj4Q1.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CVNLDsZr.js";import"./index-BsHwlI2Q.js";import"./index-CvpHsPXs.js";import"./index-B3LMLHep.js";import"./index-C9Eekj9Y.js";import"./index-ClI9ylTq.js";import"./index-BF07gLTV.js";import"./index-BYlQsO7g.js";import"./index-CMXwfFuu.js";import"./index-CmzRqjPC.js";import"./index-C3h6ecFz.js";import"./index-DO34DQeO.js";import"./index-D4PC0HgI.js";import"./index-CoB94v6H.js";import"./action-middleware-XgyK-YuQ.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-dQdxls20.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CxsEYjXw.js";import"./proxy-3mJJ0yyR.js";import"./loader-circle-yCKEwAhh.js";import"./createLucideIcon-CrcYvHKc.js";import"./button-DCvt8u0x.js";import"./index-LHNt3CwB.js";import"./label-Bpy3Mv-K.js";import"./select-BPPtS4jf.js";import"./chevron-down-8JOICIjX.js";import"./check-CqhKxfdS.js";import"./index-BdQq_4o_.js";import"./index-BJGZDO1n.js";import"./index-DJlke1l2.js";import"./index-BaZJV-o3.js";import"./index-CUgsuqcv.js";import"./textarea-DlOIZdyc.js";import"./wand-sparkles-CmTcZhIG.js";import"./info-D69vcUTD.js";import"./WizardReviewStep-BB1wZau_.js";import"./card-UVeLdAbo.js";import"./input-rMJVzH9x.js";import"./x-26l96y-M.js";import"./scroll-area-Btwi4vPz.js";import"./refresh-cw-BVaCXoUC.js";import"./plus-ReExPWLa.js";import"./search-8jVtGPNs.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
