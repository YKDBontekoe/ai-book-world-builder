import{j as m}from"./jsx-runtime-BSms4suT.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BIO30ud_.js";import{S as d,a as s}from"./story-wizard-CtTRxMJm.js";import"./iframe-CD-8zb5r.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-9042-JMB.js";import"./index-wjyY_OjV.js";import"./index-kn2LKOXl.js";import"./index-5RG1qkiA.js";import"./index-xicVLTDX.js";import"./index-BNBdEQqE.js";import"./index-C5wBOo5L.js";import"./index-BcjXf5X-.js";import"./index-BgGKTfEX.js";import"./index-B2PVYRwO.js";import"./index-CUmMvYST.js";import"./index-CSYPLBAn.js";import"./index-BTM6jdZC.js";import"./index-CyvIFlIL.js";import"./action-middleware-BabcuNwe.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BMjvtKZ0.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-AqnoKbt-.js";import"./proxy-Q0AlP_pG.js";import"./loader-circle-CUj4luSu.js";import"./createLucideIcon-DVZ3ZsuI.js";import"./button-haVztOmM.js";import"./index-B_jtOnfb.js";import"./label-DeomhOC2.js";import"./select-vMRGSByg.js";import"./chevron-down-CHmLbtC7.js";import"./check-B8PkoilP.js";import"./index-BdQq_4o_.js";import"./index-B4ILPnoe.js";import"./index-Dl-JzEOv.js";import"./index-h_rD6U-O.js";import"./index-CKfB2_zL.js";import"./textarea-I6cg4dQb.js";import"./wand-sparkles-L81IJfkj.js";import"./info-D4wnKIwj.js";import"./WizardReviewStep-BYlyPMrd.js";import"./card-B5hGjsKB.js";import"./input-CWaUrigN.js";import"./x-B0IDGG6V.js";import"./scroll-area-B2xUmzuW.js";import"./refresh-cw-B2N_jaJY.js";import"./plus-CvP4n_ir.js";import"./search-Ckqp7WXu.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
