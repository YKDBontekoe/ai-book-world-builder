import{j as m}from"./jsx-runtime-haXVpJsq.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-D1mNvNxS.js";import{S as d,a as s}from"./story-wizard-lKtiTTFJ.js";import"./iframe-9qYWz21E.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BjLfZ6h6.js";import"./index-hboDB4v0.js";import"./index-CAAeHrwv.js";import"./index-CYOjpXNf.js";import"./index-C7Temo80.js";import"./index-Dmr1i3Rs.js";import"./index-BxJpZtEk.js";import"./index-BrWl24io.js";import"./index-DONbOXhd.js";import"./index-BX5qoUMu.js";import"./index-4rDlFa5k.js";import"./index-DDL49Rkp.js";import"./index-p-XlXSnI.js";import"./index-8ALDAOcO.js";import"./action-middleware-N44mpc77.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DssIOpKL.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DQSjOusJ.js";import"./proxy-D0TicOqE.js";import"./loader-circle-DREm496W.js";import"./createLucideIcon-cUDmXEri.js";import"./button-Cp62xj1W.js";import"./index-LHNt3CwB.js";import"./label-CWk3U99Z.js";import"./select-DFVJVhBD.js";import"./chevron-down-BJHWbZtV.js";import"./check-Bq8xRZta.js";import"./index-BdQq_4o_.js";import"./index-BeV5MUOZ.js";import"./index-BHiC0F-_.js";import"./index-5qO0JfXX.js";import"./index-XhxB1hBv.js";import"./textarea-C3JqDf3R.js";import"./wand-sparkles-6CDk5Rg2.js";import"./info-CdEewBBN.js";import"./WizardReviewStep-OKxamUwZ.js";import"./card-BuhQLLzt.js";import"./input-Ct6GsM_G.js";import"./x-DXzm_sE7.js";import"./scroll-area-CKzk97lW.js";import"./refresh-cw-DMiT3YI7.js";import"./plus-B34U5okS.js";import"./search-CHEbcWkY.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
