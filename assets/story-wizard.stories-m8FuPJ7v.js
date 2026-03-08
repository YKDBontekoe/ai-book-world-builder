import{j as m}from"./jsx-runtime-ILbw8RiX.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-p1WdWicW.js";import{S as d,a as s}from"./story-wizard-DYeIMDav.js";import"./iframe-BkGwNZ96.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BlaE1Qts.js";import"./index-B7JCdvYQ.js";import"./index-0jvow8Ha.js";import"./index-BoUDT5dP.js";import"./index-DHOd-v8T.js";import"./index-D9bzVerJ.js";import"./index-hUvqupoG.js";import"./index-CItkcF_G.js";import"./index-BL_wcrO1.js";import"./index-DHB3Vr2a.js";import"./index-vhBk7u78.js";import"./index-C8QI7q99.js";import"./index-BKJlzYgP.js";import"./index-jALAB25L.js";import"./action-middleware-CUKU5Xpv.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BERCWpWP.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Ckj4e2xx.js";import"./proxy-D5hNzH9A.js";import"./loader-circle-DPkG4vca.js";import"./createLucideIcon-MEvqka1i.js";import"./button-DXfWov83.js";import"./index-LHNt3CwB.js";import"./label-D2xL3Tfm.js";import"./select-BYQysndw.js";import"./chevron-down-soqAe4Mn.js";import"./check-DfjOPwx7.js";import"./index-BdQq_4o_.js";import"./index-B67_6N_K.js";import"./index-DclIsEwG.js";import"./index-gV3f_EKf.js";import"./index-DI6S68uK.js";import"./textarea-CvVaKHKg.js";import"./wand-sparkles-BYJGxvCN.js";import"./info-BEOEM8xE.js";import"./WizardReviewStep-BospuXWv.js";import"./card-DJnZslBW.js";import"./input-klTLNPGi.js";import"./x-Db-0GQSv.js";import"./scroll-area-BouvaxNX.js";import"./refresh-cw-DjbksiSj.js";import"./plus-DsZlMjn4.js";import"./search-v7Zv4xqi.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
