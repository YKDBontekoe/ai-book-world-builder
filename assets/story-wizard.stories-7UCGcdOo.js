import{j as m}from"./jsx-runtime-DLjnuRra.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-gYd8zqPS.js";import{S as d,a as s}from"./story-wizard-I6375tCl.js";import"./iframe-CzKw2PhZ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CSmS9_oV.js";import"./index-pTF_SHrm.js";import"./index-B8Wg2qJO.js";import"./index-Bxnc_nDC.js";import"./index-DCjgrdwg.js";import"./index-CKjsMCxP.js";import"./index-ekRX-oJ7.js";import"./index-IalC6HUf.js";import"./index-BYdqAmrz.js";import"./index-DBAvkJfD.js";import"./index-BtvOULDm.js";import"./index-BbMoYWOi.js";import"./index-CMCll_2W.js";import"./index-CmZ2c_vN.js";import"./action-middleware-CANY7il-.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-szj-Bvrn.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Df3wm0B3.js";import"./proxy-D99Vw-sS.js";import"./loader-circle-B21YmDtW.js";import"./createLucideIcon-C2_UjhNa.js";import"./button-BZY79k5r.js";import"./index-B_jtOnfb.js";import"./label-GQJ8DegO.js";import"./select-B0JRabpb.js";import"./chevron-down-Bhhx0kLG.js";import"./check-BmFziGm0.js";import"./index-BdQq_4o_.js";import"./index-DOu-hCXJ.js";import"./index-Bq6NLOs8.js";import"./index-Ce61J7VB.js";import"./index-DSr_TSbQ.js";import"./textarea-CTjyk8lN.js";import"./wand-sparkles-2VVdJEIy.js";import"./info-DefCy-Hr.js";import"./WizardReviewStep-B-Tyzwj-.js";import"./card-JRz8OR5b.js";import"./input-kH5I8zlE.js";import"./x-BtsDAzNQ.js";import"./scroll-area-BWq0xlDD.js";import"./refresh-cw-BDWn9_vH.js";import"./plus-D_8JXV5q.js";import"./search-iaFCx5EM.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
