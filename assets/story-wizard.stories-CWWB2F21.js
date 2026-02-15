import{j as m}from"./jsx-runtime-Nby8SREz.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B_TryQ-G.js";import{S as d,a as s}from"./story-wizard-BPw27BYs.js";import"./iframe-mssY3CHl.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-ClOQyb2a.js";import"./index-DmoqK9Bn.js";import"./index-BCZDImQB.js";import"./index-Dw7edML7.js";import"./index-BjWWTq0n.js";import"./index-D2QCrMnd.js";import"./index-BsFBEeAG.js";import"./index-Bmq803mC.js";import"./index-DMt4-H_9.js";import"./index-Cc-XlzDq.js";import"./index-i5ByVN-g.js";import"./index-DmU-4Oc-.js";import"./index-DV39Y47d.js";import"./index-DHxlM2Lo.js";import"./action-middleware-CSa5MW8h.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CNE1sjrU.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DoGhTlSK.js";import"./proxy-CpyACJNr.js";import"./loader-circle-CZx5YktV.js";import"./createLucideIcon-DmmouRi7.js";import"./button-Ccilm7JA.js";import"./index-B_jtOnfb.js";import"./label-2nWjuneZ.js";import"./select-Dbril4Xj.js";import"./chevron-down-Bs62u7t5.js";import"./check-DdXW0oTj.js";import"./index-BdQq_4o_.js";import"./index-Km3bUMWY.js";import"./index-0SP2jI6Q.js";import"./index-C-aIsIcZ.js";import"./index-BtQK95Fl.js";import"./textarea-toOgq5DD.js";import"./wand-sparkles-CwVG2xq-.js";import"./info-CNnx5B9V.js";import"./WizardReviewStep-DutbCnVb.js";import"./card-mr1Yxd9x.js";import"./input-D2QJ9gxH.js";import"./x-C1r8z4hK.js";import"./scroll-area-1B2cFa3h.js";import"./refresh-cw-e5tDldm3.js";import"./plus-CPy7opiw.js";import"./search-C7NdYlB2.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
