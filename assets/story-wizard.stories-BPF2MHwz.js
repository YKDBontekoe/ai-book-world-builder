import{j as m}from"./jsx-runtime-B8UBgp0p.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-C4iB0WJ1.js";import{S as d,a as s}from"./story-wizard-C_L4pqus.js";import"./iframe-CB_gLzfD.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BmlsNqlt.js";import"./index-Dl74vPAf.js";import"./index-CfFu5C2F.js";import"./index-D-66jMqu.js";import"./index-B4d85rqU.js";import"./index-qdjtXmUo.js";import"./index-WZfThibQ.js";import"./index-DZOo6cMw.js";import"./index-mzvDb_3D.js";import"./index-D_9ByIf7.js";import"./index-DLV9hP7E.js";import"./index-BzJE3w7l.js";import"./index-Bu10Jmoa.js";import"./index-zCYitH0z.js";import"./action-middleware-CTOuNEjv.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CUxctePb.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CseHIlUQ.js";import"./proxy-BLY0UH9f.js";import"./loader-circle-D1xRIacw.js";import"./createLucideIcon-WZr9sXJ3.js";import"./button-C9zEX5hP.js";import"./index-B_jtOnfb.js";import"./label-CJn_817J.js";import"./select-CdlY6y1Y.js";import"./chevron-down-zxbOOX65.js";import"./check-DZSNSXKg.js";import"./index-BdQq_4o_.js";import"./index-CtiuIIlM.js";import"./index-DXRm8KcN.js";import"./index-FCoFZlEQ.js";import"./index-CvVYDwWE.js";import"./textarea-DOvrABdT.js";import"./wand-sparkles-BtSoVt9V.js";import"./info-DOnfPRUR.js";import"./WizardReviewStep-Bd_TTqUj.js";import"./card-Gu4tUFcu.js";import"./input-C0l1d95_.js";import"./x-CWyeMVtc.js";import"./scroll-area-CORBGRMS.js";import"./refresh-cw-CC2yH7vX.js";import"./plus-ruVM6IJO.js";import"./search-DYmfRDy9.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
