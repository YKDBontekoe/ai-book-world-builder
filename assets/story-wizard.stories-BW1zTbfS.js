import{j as m}from"./jsx-runtime-DowF-6Yc.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BqZtsskO.js";import{S as d,a as s}from"./story-wizard-XQVznhoz.js";import"./iframe-n-Y9I6Tw.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-6ssZARGc.js";import"./index-DVLT828e.js";import"./index-DvU8Y_4B.js";import"./index-B7-MsUwg.js";import"./index-1fAGTcvh.js";import"./index-BQMMRMs6.js";import"./index-DhjhXDMB.js";import"./index-Ckx6Uc3k.js";import"./index-wKhbbEAW.js";import"./index-DGwL_5W1.js";import"./index-6PAQhhq3.js";import"./index-DckqqWVU.js";import"./index-Bjy5URBH.js";import"./index-D_W9UsDd.js";import"./action-middleware-D8hPiwpe.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CBxNiwz3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CkEI9f0q.js";import"./proxy-BskNVSnh.js";import"./loader-circle-C0WOWkrW.js";import"./createLucideIcon-Bo_DPrt_.js";import"./button-YmYj-yOv.js";import"./index-B_jtOnfb.js";import"./label-Dc4VLm9E.js";import"./select-BYJl_K7W.js";import"./chevron-down-CnGakZGf.js";import"./check-B0bkEAmU.js";import"./index-BdQq_4o_.js";import"./index-Bhq6_yJK.js";import"./index-Bn1gTC0g.js";import"./index-CmQATIbw.js";import"./index-519Z5AX1.js";import"./textarea-B35Vdqp0.js";import"./wand-sparkles-DsdALPnO.js";import"./info-DqpODdIE.js";import"./WizardReviewStep-B1KaO4bD.js";import"./card-KtT58uOF.js";import"./input-C86-dBoS.js";import"./x-BGf17Aks.js";import"./scroll-area-VRU3Ywl0.js";import"./refresh-cw-DHicIx4t.js";import"./plus-CPTwlrAI.js";import"./search-BrD5X39H.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
