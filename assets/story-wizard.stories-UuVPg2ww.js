import{j as m}from"./jsx-runtime-H7YKCUoI.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DF_fjAaV.js";import{S as d,a as s}from"./story-wizard-CoWUAOtg.js";import"./iframe-C1eWj751.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index--l_zax8G.js";import"./index-ChDCMf87.js";import"./index-BhfM26ga.js";import"./index-CCnMO8rZ.js";import"./index-BzzrBX6Q.js";import"./index-CF4b-47Q.js";import"./index-CmYtoWcr.js";import"./index-CyQDJTgJ.js";import"./index-DtdIdD5s.js";import"./index-U1R-gPbR.js";import"./index-BKPLKqcw.js";import"./index-D8gTESde.js";import"./index-CIy-l6hJ.js";import"./index-DAXCSHrd.js";import"./action-middleware-C8UMcUyh.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Ur3l4VFt.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CGRz-nlk.js";import"./proxy-DnSDpt_L.js";import"./loader-circle-BxKEdZT0.js";import"./createLucideIcon-B6sB1XFv.js";import"./button-CXuTN8IB.js";import"./index-LHNt3CwB.js";import"./label-d4LRTVsu.js";import"./select-C3FoZa8S.js";import"./chevron-down-BM2jaQLU.js";import"./check-BwCQep3c.js";import"./index-BdQq_4o_.js";import"./index-BYwhodq0.js";import"./index-Bj2uwYgJ.js";import"./index-wNJ6bmNQ.js";import"./index-CYbOSZrK.js";import"./textarea-Dm1x7RD7.js";import"./wand-sparkles-D-DVW8df.js";import"./info-CGhTtM_H.js";import"./WizardReviewStep-B_BazVa8.js";import"./card-DqkTakcz.js";import"./input-XGc6zHu5.js";import"./x-7k_iU1cO.js";import"./scroll-area-0G8kRzZF.js";import"./refresh-cw-CGNOyGT-.js";import"./plus-BupYMztV.js";import"./search-DB4iYq49.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
