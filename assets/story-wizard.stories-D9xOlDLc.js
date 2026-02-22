import{j as m}from"./jsx-runtime-gEaQAkLD.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DVB_b0I0.js";import{S as d,a as s}from"./story-wizard-DPlaydGw.js";import"./iframe-B00sjqNY.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-WDaxn2ML.js";import"./index-DF4ltA2I.js";import"./index-Cd9u-5Lw.js";import"./index-BuVfDS3x.js";import"./index-C7aDhbmD.js";import"./index-C9kin8T5.js";import"./index-DG17aN__.js";import"./index-VG0xd9iG.js";import"./index-BNwI-r9c.js";import"./index-DXvJe4Ms.js";import"./index-DBygqXlJ.js";import"./index-B-VBr2ov.js";import"./index-BIKi7TkW.js";import"./index-D35rrhpc.js";import"./action-middleware-CKTpet5b.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BskeW8m5.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CmVaPdro.js";import"./proxy--FkpH1os.js";import"./loader-circle-BkPw_WKa.js";import"./createLucideIcon-JvA2gSwJ.js";import"./button-wtKZpEL8.js";import"./index-LHNt3CwB.js";import"./label-Cl-08sAO.js";import"./select-IDjjo4pH.js";import"./chevron-down-ChRupDBC.js";import"./check-nSOwsnm2.js";import"./index-BdQq_4o_.js";import"./index-BR8mEUOF.js";import"./index-BrB4RR86.js";import"./index-Nqi3gje7.js";import"./index-Dnzj_mpL.js";import"./textarea-BFIeSRnf.js";import"./wand-sparkles-BKsFdxbR.js";import"./info-D0ZmkNet.js";import"./WizardReviewStep-8BOGiI52.js";import"./card-lTLtcytK.js";import"./input-ovOKFUwh.js";import"./x-y8F4nvWA.js";import"./scroll-area-lZfBFGSf.js";import"./refresh-cw-DCjPWCTU.js";import"./plus-BQM6GAeO.js";import"./search-BKT6Nf7D.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
