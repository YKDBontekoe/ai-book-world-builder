import{j as m}from"./jsx-runtime-B8zZSjZv.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DwdQ0suT.js";import{S as d,a as s}from"./story-wizard-BVruAcnM.js";import"./iframe-B_dc1Z9I.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-DlLR1Oe8.js";import"./index-CInp9FOn.js";import"./index-BFC6xNkT.js";import"./index-ISYcmL2b.js";import"./index-Dhu_BDV_.js";import"./index-BM6YYvct.js";import"./index-BO-Tcjx2.js";import"./index-BckaVOf4.js";import"./index-B8J-vvnF.js";import"./index-zJmteUwn.js";import"./index-CnZ5jL7i.js";import"./index-DH1EVKQc.js";import"./index-CPZ3vgmJ.js";import"./index-sQdE53Q4.js";import"./action-middleware-psGWKb7i.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DUF_hFIX.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-B5Rns6yc.js";import"./proxy-DlJ6AWCy.js";import"./loader-circle-BcCC6WQi.js";import"./createLucideIcon-Bxztcd5O.js";import"./button-CaXaImvC.js";import"./index-LHNt3CwB.js";import"./label-T_VDVOOr.js";import"./select-CtpOOHHs.js";import"./chevron-down-UxiAJ2Wi.js";import"./check-DD2W7_7v.js";import"./index-BdQq_4o_.js";import"./index-B3WgE84_.js";import"./index-CmepyaFP.js";import"./index-C2QOY1Ai.js";import"./index-Bt_UsRTo.js";import"./textarea--bbTQ5Pj.js";import"./wand-sparkles-OYXu1tXJ.js";import"./info-BEJ1feZO.js";import"./WizardReviewStep-CuFV--3Z.js";import"./card-Cm3-SFsM.js";import"./input-fJv8CC0l.js";import"./x-Dv8WgrnA.js";import"./scroll-area-6_bzBWeL.js";import"./refresh-cw-Cx6Ixz0Z.js";import"./plus-cEnwrZsh.js";import"./search-BNRozxWi.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
