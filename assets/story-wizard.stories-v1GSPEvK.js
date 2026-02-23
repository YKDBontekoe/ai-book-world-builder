import{j as m}from"./jsx-runtime-VUHxp2S6.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Bxk4IEmH.js";import{S as d,a as s}from"./story-wizard-gwrhZQ72.js";import"./iframe-oAdQraSv.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BTYdrH4q.js";import"./index-CZ27eQhd.js";import"./index-CQpgTjmf.js";import"./index-BlV-DTe1.js";import"./index-Dz64PwoB.js";import"./index-CKBhYMZ-.js";import"./index-D-QKc2CT.js";import"./index-Bx-sPiqj.js";import"./index-CiolJ_D2.js";import"./index-w4n5QgVV.js";import"./index-CYTH2uaa.js";import"./index-BIB7v7An.js";import"./index-B3lnRvVi.js";import"./index-BU0tfA8J.js";import"./action-middleware-DgFssNNW.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DfLM74kV.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DZBijA8d.js";import"./proxy-BF6CMMJP.js";import"./loader-circle-DOsRCIU-.js";import"./createLucideIcon-CNGBhRHX.js";import"./button-BeMfcPzU.js";import"./index-LHNt3CwB.js";import"./label-JRYJ5lob.js";import"./select-DOosLuPY.js";import"./chevron-down-BzsVzgCt.js";import"./check-BioiRwFg.js";import"./index-BdQq_4o_.js";import"./index-O3glxGop.js";import"./index-DtrV9tWT.js";import"./index-DM61q1H-.js";import"./index-BK6bMmgZ.js";import"./textarea-B1-BzJ-p.js";import"./wand-sparkles-BaioznmM.js";import"./info-CsLALEXc.js";import"./WizardReviewStep-DY42zMkq.js";import"./card-HQcv7zS9.js";import"./input-Bg-C9V-Y.js";import"./x-D5Haj2ZD.js";import"./scroll-area-C8HyuFge.js";import"./refresh-cw-Bqjt25mH.js";import"./plus-Dil4Y1sl.js";import"./search-OBIWc-kb.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
