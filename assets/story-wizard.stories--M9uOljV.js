import{j as m}from"./jsx-runtime-BAVzbVhX.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DFoT83hV.js";import{S as d,a as s}from"./story-wizard-DRKCk4Ln.js";import"./iframe-CByi7qZn.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-7TL6jD31.js";import"./index-ByydxSr3.js";import"./index--foRoTC9.js";import"./index-Dmn6eQQz.js";import"./index-e7CgYsLX.js";import"./index-CWcguGNR.js";import"./index-ByyKfa9w.js";import"./index-BqhwROC8.js";import"./index-VrrKyszD.js";import"./index-D198r9MQ.js";import"./index-QTrx0Izt.js";import"./index-m9UGWKOS.js";import"./index-DBy56GOR.js";import"./index-CzDzOZge.js";import"./action-middleware-C0L22ToB.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D1KAY5fo.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DYG2JnUF.js";import"./proxy-C0ad6BUL.js";import"./loader-circle-C7FFK8rE.js";import"./createLucideIcon-BRG1VBpw.js";import"./button-D9m7WzvM.js";import"./index-LHNt3CwB.js";import"./label-Bux4t_Kn.js";import"./select-CDDpKsXe.js";import"./chevron-down-Bq7TI9Zp.js";import"./check-DsiRabu2.js";import"./index-BdQq_4o_.js";import"./index-BZSgKaLv.js";import"./index-CVZHuwHr.js";import"./index-BUeic24E.js";import"./index-CSic868a.js";import"./textarea-BFXDfn3H.js";import"./wand-sparkles-C_IHSvvS.js";import"./info-HTSFKl5n.js";import"./WizardReviewStep-B9Xd2z5b.js";import"./card-OUm-sT63.js";import"./input-B6p4JJG1.js";import"./x-Wpa8A6wW.js";import"./scroll-area-1sJZ-kYE.js";import"./refresh-cw-BsNr6ljl.js";import"./plus-CQRWYPUY.js";import"./search-B9UYEE1B.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
