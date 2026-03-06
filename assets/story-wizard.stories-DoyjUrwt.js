import{j as m}from"./jsx-runtime-BHIs1CAg.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CF2ZGmZ6.js";import{S as d,a as s}from"./story-wizard-C-cpj0dM.js";import"./iframe-Bo2YK2Xq.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Zaj9U2Kq.js";import"./index-DhxrpOAo.js";import"./index-Bnugz-b6.js";import"./index-P6ogo_bq.js";import"./index-DMAKLREN.js";import"./index-BfV2MV6h.js";import"./index-D8jXzpuH.js";import"./index-DqOO2Rpa.js";import"./index-BVY6CmKc.js";import"./index-B4O-jCXm.js";import"./index-A95ob4d1.js";import"./index-BJNo-2Br.js";import"./index-Bk6MoA8H.js";import"./index-Cx28MV52.js";import"./action-middleware-D1bKXXgJ.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BASnegc-.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CMqE887P.js";import"./proxy-DDLq_Jwl.js";import"./loader-circle-CJUNBl7B.js";import"./createLucideIcon-BukYGnVB.js";import"./button-DIRpz6Z1.js";import"./index-LHNt3CwB.js";import"./label-lF_Z8yoK.js";import"./select--wCAjpTO.js";import"./chevron-down-Bx8hwjky.js";import"./check-BrjdanTP.js";import"./index-BdQq_4o_.js";import"./index-BjmENC1z.js";import"./index-DWjlS3tU.js";import"./index-B0BjGmyZ.js";import"./index-RNf9Dhnm.js";import"./textarea-CY75lC_1.js";import"./wand-sparkles-BRo_5k2Z.js";import"./info-BVEqPail.js";import"./WizardReviewStep-BIDlYVxe.js";import"./card-ErPaI7aS.js";import"./input-B6o1aPaq.js";import"./x-DR8rVaGy.js";import"./scroll-area-CASs2cUo.js";import"./refresh-cw-CFbAmDAI.js";import"./plus-Bgx8gw4i.js";import"./search-CxK648Am.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
