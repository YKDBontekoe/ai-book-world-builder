import{j as m}from"./jsx-runtime-C0vBJiyz.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-cZf-sklO.js";import{S as d,a as s}from"./story-wizard-Do2_JVvn.js";import"./iframe-BqHyg_5c.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BAmepMCs.js";import"./index-DiXz_o9j.js";import"./index-rL-MudJU.js";import"./index-D6TQY3H7.js";import"./index-Bj7lDq7U.js";import"./index-CvjagOKD.js";import"./index-Byt-xvCA.js";import"./index-BqqEQmhA.js";import"./index-CyQcZBgG.js";import"./index-nskfe47G.js";import"./index-04aE8ixm.js";import"./index-DBT26r5l.js";import"./index-Dkz_8tSe.js";import"./index-BzMJlwiD.js";import"./action-middleware-DgCvMx6K.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BIHEF3o8.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Cyb4B5tQ.js";import"./proxy-BeEVUh5g.js";import"./loader-circle-DuNgOvhd.js";import"./createLucideIcon-C26MfO_O.js";import"./button-BItAuJMU.js";import"./index-LHNt3CwB.js";import"./label-CKxTcJ7Q.js";import"./select-DGushPQC.js";import"./chevron-down-ehalzsDi.js";import"./check-B3nQ37ZG.js";import"./index-BdQq_4o_.js";import"./index--1Vi6AjD.js";import"./index-CZNTeRzW.js";import"./index-dg6lJ-UZ.js";import"./index-DVm3cYJJ.js";import"./textarea-CdJGzAN6.js";import"./wand-sparkles-DPph7FiV.js";import"./info-CgQycEDo.js";import"./WizardReviewStep-DFv6Hfdz.js";import"./card-C7Fl4qOg.js";import"./input-CqoSH68l.js";import"./x-B4bJOflm.js";import"./scroll-area--wYI74ms.js";import"./refresh-cw-D3YEeK38.js";import"./plus-BVlv6Z40.js";import"./search-DnwvXBho.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
