import{j as m}from"./jsx-runtime-BJcGwcGs.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BI-6GcA_.js";import{S as d,a as s}from"./story-wizard-DOQk5xqQ.js";import"./iframe-Bzcjzwrt.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index--ghMvtY9.js";import"./index-D5OzToa6.js";import"./index-C1kD5DCy.js";import"./index-BFTmqHD3.js";import"./index-DbFzjeVm.js";import"./index-Bn4QYgT8.js";import"./index-BaIt3qNM.js";import"./index-CizYMOrT.js";import"./index-CbUfq8Pr.js";import"./index-ujNpYEFr.js";import"./index-CGy44eZN.js";import"./index-BAZsWMUg.js";import"./index-CryKibhA.js";import"./index-Hx62Oqme.js";import"./action-middleware-BjCwb_Wu.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-K-7z_llF.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BkSzFzIN.js";import"./proxy-DHIqT_uW.js";import"./loader-circle-CVzF0djy.js";import"./createLucideIcon-Cv_vrvWW.js";import"./button-Cpg6qiue.js";import"./index-LHNt3CwB.js";import"./label-B91oHUCE.js";import"./select-DyFs_w7v.js";import"./chevron-down-DDjmxnPm.js";import"./check-B2INcALT.js";import"./index-BdQq_4o_.js";import"./index-CDTDv1Tp.js";import"./index-mITB6iMb.js";import"./index-CrzJ8Cxu.js";import"./index-CveCb9Yj.js";import"./textarea-PHNQvY8s.js";import"./wand-sparkles-aWD6TsYv.js";import"./info-XBQK2CTr.js";import"./WizardReviewStep-DwX1IE_M.js";import"./card-BkRuiDET.js";import"./input-D9sdZcCq.js";import"./x-CVY7Dv4l.js";import"./scroll-area-D5Rgp94e.js";import"./refresh-cw-DzXCL19W.js";import"./plus-BoxbIrFZ.js";import"./search-CZuma6m0.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
