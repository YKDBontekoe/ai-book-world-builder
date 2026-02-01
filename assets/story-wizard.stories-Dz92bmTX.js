import{j as m}from"./jsx-runtime-DwsVLPJM.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DVvDM7-b.js";import{S as d,a as s}from"./story-wizard-Bt2-hqwm.js";import"./iframe-DKVvfoB-.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BNOqqlgx.js";import"./index-B79aUuhq.js";import"./index-BnU8gQmp.js";import"./index-BGmssjor.js";import"./index-w7DYvAeG.js";import"./index-aT5Cy1DM.js";import"./index-B6_6V1nH.js";import"./index-enbAmbCv.js";import"./index-CI_7BqOh.js";import"./index-Bc-nlOU4.js";import"./index-Dba6BIUL.js";import"./index-DE3uKpGs.js";import"./index-ByOVihTC.js";import"./index-BjTo22P5.js";import"./action-middleware-BIcjDcNH.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BDYW4Gg_.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CJCGbzN4.js";import"./proxy-BfiJqipx.js";import"./loader-circle-CYtm_8pG.js";import"./createLucideIcon-BwucgYSr.js";import"./button-7ZLxzkMA.js";import"./index-B_jtOnfb.js";import"./label-DLmJ5-aw.js";import"./select-GF9qv-7u.js";import"./chevron-down-BMCnZFX4.js";import"./check-BIYZ8Na1.js";import"./index-BdQq_4o_.js";import"./index-5rNnr-_7.js";import"./index-CWZv5ItF.js";import"./index-BhK-v8zI.js";import"./index-CUolv8kJ.js";import"./textarea-CMoQwGeP.js";import"./wand-sparkles-DbwLD2rs.js";import"./info-DHE8rAUG.js";import"./WizardReviewStep-wMtfyjFi.js";import"./card-D681-naj.js";import"./input-CfitgWXF.js";import"./x-O-FJQAzU.js";import"./scroll-area-CdSgxymG.js";import"./refresh-cw-ByMH3gpb.js";import"./plus-BcscqQhb.js";import"./search-D0MRtVY5.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
