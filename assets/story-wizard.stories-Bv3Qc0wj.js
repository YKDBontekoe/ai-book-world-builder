import{j as m}from"./jsx-runtime-D4KSqXEo.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-q-5kl_j6.js";import{S as d,a as s}from"./story-wizard-CSjprW3H.js";import"./iframe-CDbfpGrG.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DZWAiN6b.js";import"./index-D49OYt68.js";import"./index-DWbvSMAv.js";import"./index-Z9TQBGi-.js";import"./index-ep73D4AS.js";import"./index-BVatQ_NV.js";import"./index-NBs1gYt0.js";import"./index-DIoaBeOE.js";import"./index-C5Ol2Be9.js";import"./index-BFVi1IVf.js";import"./index-D-31EbFe.js";import"./index-p2gUO4OI.js";import"./index-BhU-_IyA.js";import"./index-hfqEeEkH.js";import"./action-middleware-hF779X7t.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DJc5gRx7.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CQLW8CTX.js";import"./proxy-b12a7cIc.js";import"./loader-circle-C4gv0hWN.js";import"./createLucideIcon-BSBzSpfw.js";import"./button-DThmNHGV.js";import"./index-LHNt3CwB.js";import"./label-Bei39Jeo.js";import"./select-CWUOWKPf.js";import"./chevron-down-C4GTbrsn.js";import"./check-CWXApdTZ.js";import"./index-BdQq_4o_.js";import"./index-BjWJeg1-.js";import"./index-Cwx4xj5U.js";import"./index-OCHR9acJ.js";import"./index-BHkV5Gl0.js";import"./textarea-HJcGLIuV.js";import"./wand-sparkles-CISNS1k2.js";import"./info-DrlqanFC.js";import"./WizardReviewStep-DpncZE7Z.js";import"./card-DVj1cLEP.js";import"./input-CTIzNWzE.js";import"./x-C4czxUQW.js";import"./scroll-area-B9oALjLz.js";import"./refresh-cw-P0OgE4uC.js";import"./plus-Cx73ygqz.js";import"./search-3G8R-8qd.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
