import{j as m}from"./jsx-runtime-usw_gOfb.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DR6vsy5l.js";import{S as d,a as s}from"./story-wizard-C07mhVPF.js";import"./iframe-D2iXtKHo.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-CNx3kIse.js";import"./index-B9pZE_X5.js";import"./index-G6Q9_q7I.js";import"./index-sZPzJJhj.js";import"./index-w8dz4eww.js";import"./index-ByrReQ0h.js";import"./index-DLCAVgA8.js";import"./index-DoDcbpXe.js";import"./index-Dr39ZafO.js";import"./index-TJinFXXI.js";import"./index-YQaSPrPr.js";import"./index-BE87RNAP.js";import"./index-8MQRjrEc.js";import"./index-CfHmk76X.js";import"./action-middleware-DgyLVVx7.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CLmgotd1.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BbbIMgqM.js";import"./proxy-B0JE3aif.js";import"./loader-circle-LtkA0PzT.js";import"./createLucideIcon-jFesFxqH.js";import"./button-lIsSvoXE.js";import"./index-LHNt3CwB.js";import"./label-Dl2HcIzL.js";import"./select-vrt3htWK.js";import"./chevron-down-qu3BMWfW.js";import"./check-DjXh1CuR.js";import"./index-BdQq_4o_.js";import"./index-DDn7Cvyn.js";import"./index-C3OKIRbO.js";import"./index-DcC3bs1E.js";import"./index-CdO3XEyI.js";import"./textarea-BOilYQAY.js";import"./wand-sparkles-Bx_rvhXC.js";import"./info-ncipXZfj.js";import"./WizardReviewStep-APC9M1La.js";import"./card-D0wB4EQc.js";import"./input-C4cyxhkp.js";import"./x-Dw9nxxdZ.js";import"./scroll-area-VRhNrCjr.js";import"./refresh-cw-Axjo9smo.js";import"./plus-CgGj0EbD.js";import"./search-D7CrNHGi.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
