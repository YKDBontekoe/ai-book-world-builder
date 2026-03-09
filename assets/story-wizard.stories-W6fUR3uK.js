import{j as m}from"./jsx-runtime-C69Kfkxg.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DGzJo1l6.js";import{S as d,a as s}from"./story-wizard-BRB72DaC.js";import"./iframe-CSC5aW9J.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-Bp3IGpZb.js";import"./index-abslDTta.js";import"./index-CDyxHzOu.js";import"./index-CHl2FWw4.js";import"./index-DrBzbM1A.js";import"./index-B9Jt2J9i.js";import"./index-s6KIjWQD.js";import"./index-BNrAdjnD.js";import"./index-CsXpQCAT.js";import"./index-Asc1tCL2.js";import"./index-B7hzSoXy.js";import"./index-jE6Gis2y.js";import"./index-CmwhTEaX.js";import"./index-BE416a1D.js";import"./action-middleware-BdPDw-qf.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CTwZfzZv.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-P_jP_9jN.js";import"./proxy-CJ0vUqkM.js";import"./loader-circle-BVUpKvgA.js";import"./createLucideIcon-CYj6HwG6.js";import"./button-BBQQS8Mx.js";import"./index-LHNt3CwB.js";import"./label-DAG6feV_.js";import"./select-DPkvzeBP.js";import"./chevron-down-456ETUW_.js";import"./check-Be_3jkys.js";import"./index-BdQq_4o_.js";import"./index-CRa0oz1U.js";import"./index-BPA6jXiK.js";import"./index-BU2eBghp.js";import"./index-DXXo317x.js";import"./textarea-B2XmnEx2.js";import"./wand-sparkles-D1-_ebhI.js";import"./info-B5b2yVy9.js";import"./WizardReviewStep-BFOXu0vy.js";import"./card-C0Ey0RUH.js";import"./input-BwpRnk6I.js";import"./x-DTcVNZGa.js";import"./scroll-area-BilezQkn.js";import"./refresh-cw-BEeR9OjM.js";import"./plus-blr2SKXi.js";import"./search-chaZwcf2.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
