import{j as m}from"./jsx-runtime-BpLr2oZ1.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DJEcJnrj.js";import{S as d,a as s}from"./story-wizard-BlOeI2xI.js";import"./iframe-C57FHSzO.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-Cls5K7kg.js";import"./index-P4xdoJ2b.js";import"./index-dA7ICFu5.js";import"./index-DEIQH9HA.js";import"./index-DwijlnKY.js";import"./index-odqEBGv7.js";import"./index-D8gioLdF.js";import"./index-JxbRAtJT.js";import"./index-B9jhh0x9.js";import"./index-ChuHrI-M.js";import"./index-DoJ1ZbWL.js";import"./index-D4Xd2s1z.js";import"./index-B00tToE9.js";import"./index-DWcPbX_M.js";import"./action-middleware-Bw4VjNxx.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BaUeH0Wv.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Atffw3B7.js";import"./proxy-gSVCr6vJ.js";import"./loader-circle-C4UhjDaz.js";import"./createLucideIcon-C0oC6Cun.js";import"./button-D5DsbruA.js";import"./index-h6qoG7Gi.js";import"./label-4jjJgqge.js";import"./select-BLpxgllB.js";import"./chevron-down-5uzzj1pI.js";import"./check-Bb1nW9ct.js";import"./index-BdQq_4o_.js";import"./index-qeZnGztT.js";import"./index-phN11RkZ.js";import"./index-DNhbgfVo.js";import"./index-Be1-goXT.js";import"./textarea-Bxw3UvR8.js";import"./wand-sparkles-DYnqbaJj.js";import"./info-BETBJkl8.js";import"./WizardReviewStep-D3eu2O4g.js";import"./card-BDsJc6FV.js";import"./input-DEKUyP82.js";import"./x-DnVyjf2u.js";import"./scroll-area-BGr_gIdj.js";import"./refresh-cw-CWy1v6XU.js";import"./plus-DJVR-fZR.js";import"./search-BnJ5mvu7.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
