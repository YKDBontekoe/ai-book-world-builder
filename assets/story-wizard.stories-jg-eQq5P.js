import{j as m}from"./jsx-runtime-atCdkYsa.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-cLdHuy80.js";import{S as d,a as s}from"./story-wizard-Djy7gP-2.js";import"./iframe-kXNx4bIt.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BYrRBcAW.js";import"./index-CsehGmxt.js";import"./index-DhJWfGkA.js";import"./index-Rul3CaYc.js";import"./index-hUNgZLaw.js";import"./index-CXXKQW-u.js";import"./index-BUo0L0nG.js";import"./index-B4GVZjx8.js";import"./index-CVKxwWG_.js";import"./index-DDXbibSw.js";import"./index-TF2UGSdi.js";import"./index-BzHM_JIZ.js";import"./index-CBMbVJBn.js";import"./index-CLogUsMu.js";import"./action-middleware-CPHkzl5Z.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DRoCiqiy.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Di4sH7U5.js";import"./proxy-4wJ3cP5F.js";import"./loader-circle-BQ01EYTN.js";import"./createLucideIcon-B7LAOh_M.js";import"./button-IGKZofhT.js";import"./index-B_jtOnfb.js";import"./label-CBqUhNeT.js";import"./select-CvctYInI.js";import"./chevron-down-FAZMbNFH.js";import"./check-DmxmOlSG.js";import"./index-BdQq_4o_.js";import"./index-BOcl38dy.js";import"./index-ePKvSEcx.js";import"./index-DN6efI_R.js";import"./index-DrkE2qt1.js";import"./textarea-BwS4sM4f.js";import"./wand-sparkles-Djt9K2BD.js";import"./info-66fmdrNG.js";import"./WizardReviewStep-D1ogV9A1.js";import"./card-Bv1uNj8d.js";import"./input-KIZ4z5gJ.js";import"./x-CyOLP6Vj.js";import"./scroll-area-pN_T4hPz.js";import"./refresh-cw-LBB6EpYv.js";import"./plus-BP-vE9X-.js";import"./search-CWIkvmJs.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
