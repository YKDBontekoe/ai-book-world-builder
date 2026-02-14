import{j as m}from"./jsx-runtime-De8GtvFf.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CpsddG9I.js";import{S as d,a as s}from"./story-wizard-Db2DcjdW.js";import"./iframe-CYwxWqY3.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Bp9G6YXU.js";import"./index-B3guLFaO.js";import"./index-CaANDh3L.js";import"./index-DYFrppXT.js";import"./index-BSgrX6AW.js";import"./index-B3sBaf8H.js";import"./index-VNjtJtXW.js";import"./index-DT5b0a5G.js";import"./index-B89TlQkT.js";import"./index-BHJAOkJa.js";import"./index-CbCsXadO.js";import"./index-RaRIG57V.js";import"./index-MQPGXxeI.js";import"./index-D62q3zRA.js";import"./action-middleware-BnMzSQHP.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CQuqJIQl.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DXPZkoIX.js";import"./proxy-yyOLMSEh.js";import"./loader-circle-ky4yQq-D.js";import"./createLucideIcon-CzsQGk45.js";import"./button-A5-yLNil.js";import"./index-B_jtOnfb.js";import"./label-DSYeNzo4.js";import"./select-BA72WRjZ.js";import"./chevron-down-C4NT8nl2.js";import"./check-CpC3EAuU.js";import"./index-BdQq_4o_.js";import"./index-Dz9DEcUH.js";import"./index-D5lzAQQO.js";import"./index-Dzi17zYu.js";import"./index-bqe8OKGN.js";import"./textarea-DlnczdhM.js";import"./wand-sparkles-Disq1NVL.js";import"./info-n0ZHX5MG.js";import"./WizardReviewStep-k2WR3lyx.js";import"./card-Bnt84lL_.js";import"./input-B3gMclfr.js";import"./x-BUBQ9_pW.js";import"./scroll-area-rncjQ04T.js";import"./refresh-cw-CjFuktNB.js";import"./plus-BG1K0jAC.js";import"./search-B2Fuq_GC.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
