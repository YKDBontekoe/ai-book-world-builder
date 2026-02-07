import{j as m}from"./jsx-runtime-0OksyS6h.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BaUGJWFN.js";import{S as d,a as s}from"./story-wizard-QwNAvar6.js";import"./iframe-KnHGdWlU.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Cy3n518v.js";import"./index-0bc2fLEX.js";import"./index-D09xNdRz.js";import"./index-BwfVeljS.js";import"./index-ngayDJsV.js";import"./index-DSkjD3Qm.js";import"./index-B6Yvo9H7.js";import"./index-D9Rq6zY7.js";import"./index-BzRhrm4I.js";import"./index-BiU-jlPP.js";import"./index-CI7Slkie.js";import"./index-ChbpuK8l.js";import"./index-DskTgtjK.js";import"./index-CYVAiRfA.js";import"./action-middleware-BWtUj5Kg.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BeBtXhYv.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C2pr1n1Q.js";import"./proxy-BUx5c1AA.js";import"./loader-circle-B1mClU_f.js";import"./createLucideIcon-BgmyJ04y.js";import"./button-D-ry8dHb.js";import"./index-B_jtOnfb.js";import"./label-Q_7YI4lu.js";import"./select-D0HF5kg9.js";import"./chevron-down-DLG84ps7.js";import"./check-BW4YLoER.js";import"./index-BdQq_4o_.js";import"./index-D579ULto.js";import"./index-BIy9ucr8.js";import"./index-BPwlxpEG.js";import"./index-DiJTW0Fe.js";import"./textarea-dMOOMZEG.js";import"./wand-sparkles-CuB-ZVuj.js";import"./info-Dz7sMEUj.js";import"./WizardReviewStep-BoLdmLo3.js";import"./card-COfMMJpf.js";import"./input-DM8fF7xU.js";import"./x-CraE0Pb_.js";import"./scroll-area-HOPNGwa1.js";import"./refresh-cw-vqok02wL.js";import"./plus-BNc7yqze.js";import"./search-DSWUqXen.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
