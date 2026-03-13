import{j as m}from"./jsx-runtime-v3PPnFJX.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-wY2dnb9N.js";import{S as d,a as s}from"./story-wizard-BTElAbAl.js";import"./iframe-CVmp-LGE.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-0bOuEdbx.js";import"./index-BcSZ9apq.js";import"./index-BpdsdUt0.js";import"./index-DP2JPCiQ.js";import"./index-eAD-unAe.js";import"./index-C93okRDc.js";import"./index-BUdL1V7_.js";import"./index-BhPLX16f.js";import"./index-BL7AoAVt.js";import"./index-DUmpgWhn.js";import"./index-B_UpxpP2.js";import"./index-BUYsglLV.js";import"./index-CTcuSuLV.js";import"./index-DVNjcHVI.js";import"./action-middleware-8HP1IuVf.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CZifkGUG.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CYey9ddg.js";import"./proxy-9lEe98pL.js";import"./loader-circle-D0fD9aDx.js";import"./createLucideIcon-D0ARcZYx.js";import"./button-P0ZPXWfP.js";import"./index-LHNt3CwB.js";import"./label-pPARSInx.js";import"./select-CO9De5iX.js";import"./chevron-down-DKTnPkIy.js";import"./check-BCfuhp94.js";import"./index-BdQq_4o_.js";import"./index-JR2gC8Ri.js";import"./index-B3EeqFF1.js";import"./index-Cw_mm9-k.js";import"./index-Bue5nedy.js";import"./textarea-BCr1VdVN.js";import"./wand-sparkles-BttGAtY1.js";import"./info-BJv76aaW.js";import"./WizardReviewStep-CDTbXt4L.js";import"./card-DVwcRkZD.js";import"./input-BLiB4izW.js";import"./x-CvACNui4.js";import"./scroll-area-C5UpRHvP.js";import"./refresh-cw-BsYgJMMk.js";import"./plus-CSnOlDa8.js";import"./search-BZkfAg3m.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
