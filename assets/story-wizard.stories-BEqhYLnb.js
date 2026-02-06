import{j as m}from"./jsx-runtime-mSRTtD6k.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-ChJ_hRey.js";import{S as d,a as s}from"./story-wizard-CE0wuxio.js";import"./iframe-FkTZ_Xm-.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Ba7LhU5m.js";import"./index-YGx7ZWI8.js";import"./index-DeVqlL62.js";import"./index-DbOfnDsl.js";import"./index-CIxkc1Tp.js";import"./index-BUL9PLFf.js";import"./index-DHVRaKBp.js";import"./index-6T3zvhJ-.js";import"./index-CvPAZzzD.js";import"./index-DA7G7dDS.js";import"./index-Co1UViAQ.js";import"./index-BQtQEaBA.js";import"./index-u2JiGb7e.js";import"./index-Kl3k9Vpq.js";import"./action-middleware-DIgK9jQc.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CHb78RvP.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B0kHr6bE.js";import"./proxy-D8-2JDzM.js";import"./loader-circle-BErcpP4E.js";import"./createLucideIcon-D-YvSYNY.js";import"./button-BhGVtfzy.js";import"./index-B_jtOnfb.js";import"./label-HKED5WMU.js";import"./select-lu23zvS7.js";import"./chevron-down-CfauReUR.js";import"./check-CzdUzaXO.js";import"./index-BdQq_4o_.js";import"./index-EOD08lYX.js";import"./index-DekPC-35.js";import"./index-BBV5A40l.js";import"./index-ECydQf13.js";import"./textarea-B_RAJv6e.js";import"./wand-sparkles-Ddxra4U6.js";import"./info-Ob140Iec.js";import"./WizardReviewStep-DmcNu4aA.js";import"./card-Dai_CxKC.js";import"./input-Be1dgRh7.js";import"./x-dUR5UT1P.js";import"./scroll-area-C4wcrcHC.js";import"./refresh-cw-BQR2WOwV.js";import"./plus-tkw5Hq4u.js";import"./search-CZajAcTp.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
