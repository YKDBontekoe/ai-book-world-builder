import{j as m}from"./jsx-runtime-dGw-uGrz.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Be39RT3d.js";import{S as d,a as s}from"./story-wizard-Bbr-3LJI.js";import"./iframe-ByxnmpUm.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DPMRlrXR.js";import"./index-C56ChSjS.js";import"./index-B0bN6IDR.js";import"./index-rfwnw8oQ.js";import"./index-IbIs5H2s.js";import"./index-D4Z-fUtS.js";import"./index-FbCRe1M5.js";import"./index-kE3tqPYN.js";import"./index-BrEUrFOU.js";import"./index-Bpj6wXzW.js";import"./index-DklgEKxi.js";import"./index-D41od0Bu.js";import"./index-BrC9d7fz.js";import"./index-CjsyfrQc.js";import"./action-middleware-CA4wqSwZ.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-C52gpoLO.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DQ2RiNze.js";import"./proxy-CvULV2RS.js";import"./loader-circle-BXVum4So.js";import"./createLucideIcon-Cj8GLNdE.js";import"./button-Ds8v4qf7.js";import"./index-B_jtOnfb.js";import"./label-CtSmdg2T.js";import"./select-k90m6u_L.js";import"./chevron-down-Dql8QIp_.js";import"./check-4AiGvKUn.js";import"./index-BdQq_4o_.js";import"./index-CTnm0OFg.js";import"./index-x0JeF16E.js";import"./index-BUZSs_Nu.js";import"./index-DXyzp1T7.js";import"./textarea-CxegTjxl.js";import"./wand-sparkles-gEhhQC3-.js";import"./info-CMzFHXKC.js";import"./WizardReviewStep-BjacMMxy.js";import"./card-Fdz-oWlQ.js";import"./input-xzQh_oom.js";import"./x-La2JCZ3x.js";import"./scroll-area-BIZbjUOL.js";import"./refresh-cw-Dts9EyB3.js";import"./plus-B3M8L8-8.js";import"./search-Br9_vdjX.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
