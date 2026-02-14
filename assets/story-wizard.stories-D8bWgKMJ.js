import{j as m}from"./jsx-runtime-B4PVlZy_.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Ck8cS7lB.js";import{S as d,a as s}from"./story-wizard-CG0KPyG4.js";import"./iframe-DgVc9n_f.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-4qATknZ8.js";import"./index-Ba8fFwLm.js";import"./index-5lUZluoO.js";import"./index-BqWcGma0.js";import"./index-CTKZe3pF.js";import"./index-B3dcYLFS.js";import"./index-C88rZ0yR.js";import"./index-CUU92fN8.js";import"./index-BSt2roDB.js";import"./index-ngO0Mem5.js";import"./index-C8SDLOxy.js";import"./index-DWV9Lx7H.js";import"./index-C4EiuF-U.js";import"./index-Dk18mqll.js";import"./action-middleware-CkBgHPKE.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D5Eo9I8J.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B478rpCj.js";import"./proxy-DfU-vRHO.js";import"./loader-circle-DZXhox_d.js";import"./createLucideIcon-BY0Q0qSD.js";import"./button-oVY6zDEW.js";import"./index-B_jtOnfb.js";import"./label-DSS6kBW4.js";import"./select-h0qUdy8o.js";import"./chevron-down-CZ2PocvT.js";import"./check-GYFWAd4u.js";import"./index-BdQq_4o_.js";import"./index-DouWbQWG.js";import"./index-Cn24KbuR.js";import"./index-DWwYCi0E.js";import"./index-B-JnPYUp.js";import"./textarea-Do6wrEje.js";import"./wand-sparkles-BGv1G6sj.js";import"./info-D1DRHdmg.js";import"./WizardReviewStep-CRCIw7dX.js";import"./card-BOChXxJo.js";import"./input-WUuUsRHT.js";import"./x-BjP5x2e6.js";import"./scroll-area-D1vJjVee.js";import"./refresh-cw-CKvWu_8B.js";import"./plus-CwO4bvHx.js";import"./search-Cr-M9ZBC.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
