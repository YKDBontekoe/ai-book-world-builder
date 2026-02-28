import{j as m}from"./jsx-runtime-BZGAbbGm.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-De5OLUcj.js";import{S as d,a as s}from"./story-wizard-CFSdej9H.js";import"./iframe-Bgq24F1L.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-C2Au3r-3.js";import"./index-vLRZ6Iom.js";import"./index-F1RX43xa.js";import"./index-RXWQ4KwW.js";import"./index-BmW1txHF.js";import"./index-KJH4Ocs-.js";import"./index-DtwLec8e.js";import"./index-DPrU82Q9.js";import"./index-DwtphAiI.js";import"./index-CKBtbVDd.js";import"./index-D2M8jdDQ.js";import"./index-CufRynWU.js";import"./index-D0MOueA1.js";import"./index-DOoGEdkN.js";import"./action-middleware-CUTPdoy2.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D2Wc76H_.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BUClKjlo.js";import"./proxy-4MVWP_nm.js";import"./loader-circle-VvVgqwOP.js";import"./createLucideIcon-BzyCYLKA.js";import"./button-LGEUbGEc.js";import"./index-LHNt3CwB.js";import"./label-7sVnshxz.js";import"./select-ChIyAxsM.js";import"./chevron-down-By5Fia9J.js";import"./check-BNLEIaP-.js";import"./index-BdQq_4o_.js";import"./index-DU2BV0jU.js";import"./index-DTzyFOER.js";import"./index-CYU3CIhq.js";import"./index-fOZoTbz_.js";import"./textarea-D25qifXB.js";import"./wand-sparkles-C-9uQg4m.js";import"./info-DkQPG2Xx.js";import"./WizardReviewStep-CWm2nnWR.js";import"./card-CioDnUI9.js";import"./input-u61Vi9a3.js";import"./x-BzJK-sdt.js";import"./scroll-area-D4pkf_zR.js";import"./refresh-cw-CCeGkKjl.js";import"./plus-zFujZP8j.js";import"./search-CHa4s9Mt.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
