import{j as m}from"./jsx-runtime-DpwduvGg.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B-Pzk1NC.js";import{S as d,a as s}from"./story-wizard-BdkHFr6-.js";import"./iframe-1wBmPNgB.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-BHqsyan7.js";import"./index-BFj9k-nG.js";import"./index-yxeIZc5d.js";import"./index-KF8J44y7.js";import"./index-CPnUplyK.js";import"./index-gX7bp8HT.js";import"./index-BefCF7xE.js";import"./index-B6kkWCk8.js";import"./index-B-kPAItT.js";import"./index-Cu3jqRLS.js";import"./index-B0sbzggd.js";import"./index-D3Ze1Lvw.js";import"./index-K2eKBaCH.js";import"./index-BZ0qlniv.js";import"./action-middleware-BdYjigd5.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DDMinlVj.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-gvYM_5B3.js";import"./proxy-DZcrsWwO.js";import"./loader-circle-D3rxdYFW.js";import"./createLucideIcon-7AOXBR4R.js";import"./button-DOOOYFQF.js";import"./index-h6qoG7Gi.js";import"./label-1oaSQZvM.js";import"./select-DcWuADTp.js";import"./chevron-down-a7ojpr1O.js";import"./check-fd0DcBVQ.js";import"./index-BdQq_4o_.js";import"./index-DKDbObK0.js";import"./index-BslrX10-.js";import"./index-DhM1Hab5.js";import"./index-Dnp0b0BV.js";import"./textarea-oANqx1Jx.js";import"./wand-sparkles-DyeMxsya.js";import"./info-B-7LbyOP.js";import"./WizardReviewStep-CbUtqycB.js";import"./card-Ze_lkLl8.js";import"./input-BxEUTqc2.js";import"./x-sqVwfTx6.js";import"./scroll-area-DifWTSsm.js";import"./refresh-cw-DwrXc6ak.js";import"./plus-xQeRsw-l.js";import"./search-0Zc87sPW.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
