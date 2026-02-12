import{j as m}from"./jsx-runtime-CdJRt2Qf.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-rtMyQvdS.js";import{S as d,a as s}from"./story-wizard-Cv1hdcXg.js";import"./iframe-Dvz_IukK.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DRwq3pQu.js";import"./index-D1Ord_zq.js";import"./index-1vEXleAz.js";import"./index-DMimFHJI.js";import"./index-DWIvij46.js";import"./index-DaykjF39.js";import"./index-C1-H1nlp.js";import"./index-Dx0L6URR.js";import"./index-BUM9TAM9.js";import"./index-DxWTGHcd.js";import"./index-CG1ay5YP.js";import"./index-CmdxBIyC.js";import"./index-DtpsZAl6.js";import"./index-CB8r6O12.js";import"./action-middleware-BgMFIm4a.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BabwY33m.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep--dd-wu76.js";import"./proxy-CmvoTKIj.js";import"./loader-circle-DfV_Equt.js";import"./createLucideIcon-DdWgeLJC.js";import"./button-CoJFh53m.js";import"./index-B_jtOnfb.js";import"./label-BNaop7na.js";import"./select-DkoSdbtT.js";import"./chevron-down-DJrAeIrR.js";import"./check-Bpals56g.js";import"./index-BdQq_4o_.js";import"./index-6HGUogPi.js";import"./index-WWlwPjzT.js";import"./index-CskuuZh0.js";import"./index-CnpIo-Vx.js";import"./textarea-nv0LysDw.js";import"./wand-sparkles-7FEpoJiE.js";import"./info-DOmipjDQ.js";import"./WizardReviewStep-Duqpe74E.js";import"./card-zT55d4xW.js";import"./input-CMYDRTBd.js";import"./x-DIqbdBzG.js";import"./scroll-area-BHZdEktl.js";import"./refresh-cw-CDy6nZ_v.js";import"./plus-BkbL91Id.js";import"./search-BsngRn4G.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
