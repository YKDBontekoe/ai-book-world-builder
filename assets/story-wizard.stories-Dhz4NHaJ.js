import{j as m}from"./jsx-runtime-DyOiO72i.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BYnikvg8.js";import{S as d,a as s}from"./story-wizard-CUaGBH4t.js";import"./iframe-B5pKUBeR.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-6OtRLj0H.js";import"./index-UqfOUYYw.js";import"./index-Dew8JpAn.js";import"./index-CBhwPLgZ.js";import"./index-oTfGq_vk.js";import"./index-DnGQ5QZw.js";import"./index-BBeQkk4a.js";import"./index-Dl2F83qj.js";import"./index-CktgQ4n4.js";import"./index-DLqB8-4b.js";import"./index-IwLIFyVg.js";import"./index-B7b_lhgo.js";import"./index-CgklPWKr.js";import"./index-DTxGVCpj.js";import"./action-middleware-Bt5L_uAb.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CFY08iH1.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Cq4WC6gO.js";import"./proxy-BZby7sRG.js";import"./loader-circle-9ylXScNo.js";import"./createLucideIcon-BUdYZuiO.js";import"./button-Dgdz2aI0.js";import"./index-LHNt3CwB.js";import"./label-5zsEdofh.js";import"./select-eTvw65Hl.js";import"./chevron-down-BbQMe1sn.js";import"./check-DffN88_5.js";import"./index-BdQq_4o_.js";import"./index-VtxRRvf2.js";import"./index-B1OFY2jw.js";import"./index-Cc1ORBWx.js";import"./index-DHk1etjm.js";import"./textarea-D8f7zhHT.js";import"./wand-sparkles-BpgSuMsy.js";import"./info-BmXaoKRy.js";import"./WizardReviewStep-1s3YJP_e.js";import"./card-DU3MzGgD.js";import"./input-BbpSG4tA.js";import"./x-DAixkiaH.js";import"./scroll-area-Ci4ZI6_7.js";import"./refresh-cw-B-FnzgYj.js";import"./plus-CUE544zg.js";import"./search-X7ex3_vM.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
