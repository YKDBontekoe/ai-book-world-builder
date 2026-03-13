import{j as m}from"./jsx-runtime-WYP5hpO_.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CfdFJz2b.js";import{S as d,a as s}from"./story-wizard-BrPVrmY_.js";import"./iframe-DJ9fBjhT.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Dfx6P4Wq.js";import"./index-Dnv5Is9Q.js";import"./index-DAJfr_YO.js";import"./index-C_-qBkTn.js";import"./index-DmFzGZDJ.js";import"./index-BKyrIh5O.js";import"./index-Cfw7kopk.js";import"./index-mQaiHhgx.js";import"./index-cf9JP7gF.js";import"./index-BZbQf-BU.js";import"./index-DsIInaTd.js";import"./index-CIP0sduY.js";import"./index-CjbE3k6t.js";import"./index-BpFnUbrw.js";import"./action-middleware-CVpuI3RF.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DjMgoUqM.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-bsAa6o5N.js";import"./proxy-4q86S5Kx.js";import"./loader-circle-vFxdRpXc.js";import"./createLucideIcon-Du02JgDt.js";import"./button-lY2YOzbc.js";import"./index-LHNt3CwB.js";import"./label-DJgXhI5p.js";import"./select-CfdbU8RW.js";import"./chevron-down-vX6D4U52.js";import"./check-C4PQKnUI.js";import"./index-BdQq_4o_.js";import"./index-DNhbB19X.js";import"./index-BK0LaCNN.js";import"./index-C4CO6f9T.js";import"./index-gHIkvDn7.js";import"./textarea-DA50OicB.js";import"./wand-sparkles-CaCc2Em-.js";import"./info-BmxWkNZi.js";import"./WizardReviewStep-UoWA7_vm.js";import"./card-sdk-K0Hy.js";import"./input-dsjsvqpr.js";import"./x-DoeXFJQr.js";import"./scroll-area-CfLfVkmW.js";import"./refresh-cw-6zjb5Iy9.js";import"./plus-DW3nR91e.js";import"./search-QN8-nS8Y.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
