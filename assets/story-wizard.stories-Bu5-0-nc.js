import{j as m}from"./jsx-runtime-DGjLl6rI.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-1LZ0W7bZ.js";import{S as d,a as s}from"./story-wizard--QHkmpYQ.js";import"./iframe-64kN9HIJ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DUL--8Qj.js";import"./index-vdUSFkK-.js";import"./index-B0h-x9de.js";import"./index-DTjN399e.js";import"./index-BOX5ahEU.js";import"./index-Bb4Xdmn-.js";import"./index-HMz3CrRY.js";import"./index-BLkiE8CQ.js";import"./index-C1IEsg_i.js";import"./index-YcPpA5Z1.js";import"./index-CUO31gsu.js";import"./index-ZrHbIcXf.js";import"./index-CHmbDDWG.js";import"./index-39MRN6g8.js";import"./action-middleware-B1-nZAx_.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CZnKgASC.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B026ZD26.js";import"./proxy-Cpi-C7mL.js";import"./loader-circle-BGq6vyjl.js";import"./createLucideIcon-nsml03zS.js";import"./button-BtlvCjVc.js";import"./index-LHNt3CwB.js";import"./label-Ml675_rp.js";import"./select-XVZQbmQH.js";import"./chevron-down-CHrhuX-w.js";import"./check-3saB-7Fw.js";import"./index-BdQq_4o_.js";import"./index-DKE-JYV1.js";import"./index-D-sJTxMc.js";import"./index-Dn8jnCXw.js";import"./index-CEBQ0TUL.js";import"./textarea-D44CyPcf.js";import"./wand-sparkles-B4gWSnYa.js";import"./info-CI-zNQ82.js";import"./WizardReviewStep-CzBDMwI_.js";import"./card-B5ARL3T4.js";import"./input-Cp2fiQzA.js";import"./x-DJIe43Lv.js";import"./scroll-area-C6XxJLRt.js";import"./refresh-cw-zRHPvCsP.js";import"./plus-BYWfNF9n.js";import"./search-DVtZD7Dt.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
