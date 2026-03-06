import{j as m}from"./jsx-runtime-BzqBwUZt.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CeW49ew5.js";import{S as d,a as s}from"./story-wizard-DIrizHF-.js";import"./iframe-kWWdyHKV.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-jfPIItnJ.js";import"./index-FDGOHxpb.js";import"./index-DLmRF92j.js";import"./index-CzNGwsTc.js";import"./index-DatsX4CU.js";import"./index-Bo7cVZXJ.js";import"./index-BZxD4EQ1.js";import"./index-Cpmv2FS2.js";import"./index-DZnXZ00o.js";import"./index-B_TFWOsT.js";import"./index-DRlkMLdx.js";import"./index-B4gtXHTQ.js";import"./index-CHyEtJUw.js";import"./index-rH0cvw8C.js";import"./action-middleware-BI2yw5OC.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CvXVXB3d.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Dwd6uPe9.js";import"./proxy-vidJqEKo.js";import"./loader-circle-bi0TMXSG.js";import"./createLucideIcon-DTQJhQ6r.js";import"./button-v0eZgNI1.js";import"./index-LHNt3CwB.js";import"./label-DfzTsOpw.js";import"./select-DIkYl1Sm.js";import"./chevron-down-B5HuKM3u.js";import"./check-DbdyFGGz.js";import"./index-BdQq_4o_.js";import"./index-OiylsTNZ.js";import"./index-D-gnvRr2.js";import"./index-B2AqHzTa.js";import"./index-Dk-tirMC.js";import"./textarea-D6sa5BVW.js";import"./wand-sparkles-Dc2KT4zK.js";import"./info-CXICbFxO.js";import"./WizardReviewStep-CvSDpbB_.js";import"./card-H-ZXAp0b.js";import"./input-Cs_DO3P4.js";import"./x-DHh-Ar-p.js";import"./scroll-area-CkkYveyE.js";import"./refresh-cw-Lh9nlni_.js";import"./plus-CRmDw6mE.js";import"./search-DBJG0wAf.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
