import{j as m}from"./jsx-runtime-DPCUFE-U.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DfwbB27I.js";import{S as d,a as s}from"./story-wizard-CK6EHMwU.js";import"./iframe-BGZFTLqf.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BMQvfS8C.js";import"./index-BuCKkhWS.js";import"./index-BlqSDoWO.js";import"./index-CUPcueC1.js";import"./index-Pm_VrG1v.js";import"./index-BV_uC_KO.js";import"./index--A3LXAXh.js";import"./index-BCplRyks.js";import"./index-DznRsOS7.js";import"./index-C4UK7eBu.js";import"./index-BTYRvM36.js";import"./index-Cdz2N7EX.js";import"./index-D0UBQVQY.js";import"./index-BltST5mB.js";import"./action-middleware-Co-3XdJU.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CS_gZQoi.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DDvyEe3g.js";import"./proxy-BCfu02kJ.js";import"./loader-circle-C9YlCNCR.js";import"./createLucideIcon-kNmXubMo.js";import"./button-DVbiz7rQ.js";import"./index-LHNt3CwB.js";import"./label-DPKzeeQd.js";import"./select-DcPfNnno.js";import"./chevron-down-BEbzdRc9.js";import"./check-ChOSrxg-.js";import"./index-BdQq_4o_.js";import"./index-BYy3RTHj.js";import"./index-DyzS_KtE.js";import"./index-DKyPiD7t.js";import"./index-of92AeU_.js";import"./textarea-BgENk-gf.js";import"./wand-sparkles-qVvYq49p.js";import"./info-BOK38cOZ.js";import"./WizardReviewStep-DBVjx3wf.js";import"./card-DthrY9IJ.js";import"./input-D6qe4sJT.js";import"./x-BqEmaBUY.js";import"./scroll-area-0S6uwKd_.js";import"./refresh-cw-BeDr2iwQ.js";import"./plus-6_KVIRH7.js";import"./search-1IT_NOl1.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
