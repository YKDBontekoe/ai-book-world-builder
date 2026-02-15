import{j as m}from"./jsx-runtime-C6RcY9gk.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CxV6G55Q.js";import{S as d,a as s}from"./story-wizard-D3Bx742a.js";import"./iframe-CbHz4TPC.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Blp1WBB8.js";import"./index-neg68-Rz.js";import"./index-aVfNZgsV.js";import"./index-KWgtUndh.js";import"./index-BfFx54Hn.js";import"./index-Cy99vI5G.js";import"./index-DswnesxJ.js";import"./index-DtSPOtC1.js";import"./index-BqBbPQB0.js";import"./index-CF6eusL4.js";import"./index-Bylne91B.js";import"./index-CgvSnsg-.js";import"./index-CN4qWtxt.js";import"./index-BZQ44WC-.js";import"./action-middleware-D6KijER9.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CGFX2qzT.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BA68WifN.js";import"./proxy-CKD5HVgg.js";import"./loader-circle-BRx6eujP.js";import"./createLucideIcon-xWXve78o.js";import"./button-DMoudUT7.js";import"./index-B_jtOnfb.js";import"./label-DddeC7FQ.js";import"./select-rLixP8xz.js";import"./chevron-down-z8SjJYOy.js";import"./check-DdV6L6DZ.js";import"./index-BdQq_4o_.js";import"./index-B4V4X6p_.js";import"./index-DX5XIvGI.js";import"./index-C1lgQ2JT.js";import"./index-Bd1BwKh9.js";import"./textarea-IPupAHuy.js";import"./wand-sparkles-ArC_Farl.js";import"./info-Cs6v0rC5.js";import"./WizardReviewStep-5PJFBzge.js";import"./card-DPxJRLfF.js";import"./input-C9EMJOcl.js";import"./x-RJvdaH31.js";import"./scroll-area-BLvSIqeB.js";import"./refresh-cw-B3f0b4OD.js";import"./plus-DfYDLdkq.js";import"./search-uFeaNRPv.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
