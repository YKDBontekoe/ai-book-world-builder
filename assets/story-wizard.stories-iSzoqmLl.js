import{j as m}from"./jsx-runtime-Bq2Azj_f.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DxliI8u6.js";import{S as d,a as s}from"./story-wizard-CR60ex9m.js";import"./iframe-B1HHSlUi.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-nr4XQ2K-.js";import"./index-Coa3j4FK.js";import"./index-DnX4F1KS.js";import"./index-BqmGA97K.js";import"./index-_Ti162_O.js";import"./index-Dt8mz5pq.js";import"./index-DPsmvJVL.js";import"./index-6NN2H6nU.js";import"./index-Aln3RA6d.js";import"./index-CCCTeCb2.js";import"./index-YtqGt546.js";import"./index-BVzkJeFP.js";import"./index-B2EgDebB.js";import"./index-BRMAodDz.js";import"./action-middleware-BbzH2v1_.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CQwK4MSd.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Pfp_jF6-.js";import"./proxy-BqMTZWUX.js";import"./loader-circle-DL5mOihp.js";import"./createLucideIcon-CKETgYCh.js";import"./button-ID1UaHdq.js";import"./index-LHNt3CwB.js";import"./label-ClVj4aQe.js";import"./select-Cl-g9YQI.js";import"./chevron-down-B34CVVpv.js";import"./check-BeOcDLQf.js";import"./index-BdQq_4o_.js";import"./index-BeRxs0m6.js";import"./index-Bp4EVK7c.js";import"./index-CBOH8EL7.js";import"./index-DrtzZ3Ob.js";import"./textarea-BVqIw7VN.js";import"./wand-sparkles-DZcHrqeC.js";import"./info-BtQHQWA5.js";import"./WizardReviewStep-Da6EK8Lv.js";import"./card-D9bj-ZxF.js";import"./input-CreqM3JG.js";import"./x-Clsh0cU8.js";import"./scroll-area-CZcP9c9O.js";import"./refresh-cw-CxdOyw4u.js";import"./plus-CDKfJy9V.js";import"./search-t4j5ERFZ.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
