import{j as m}from"./jsx-runtime-CGYRSBw4.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CKvJqw2Z.js";import{S as d,a as s}from"./story-wizard-0Zk1xkh0.js";import"./iframe-DKi0q6R5.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CNkoA_2V.js";import"./index-BC9Ngs91.js";import"./index-CrbTsqzP.js";import"./index-Bw8HukQI.js";import"./index-B5w69X5P.js";import"./index-Dy968tug.js";import"./index--NBioK5C.js";import"./index-Bf6Qr_RM.js";import"./index-B8pdGerc.js";import"./index-BCzyWZdg.js";import"./index-D104Y-dt.js";import"./index-B_FwyW7_.js";import"./index-C0gan1oM.js";import"./index-BEeYCyI-.js";import"./action-middleware-RF651Khh.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Dcmu0VC_.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DB8KPYN3.js";import"./proxy-B6fvelua.js";import"./loader-circle-TM_nkhPC.js";import"./createLucideIcon-CyUZzB_z.js";import"./button-BN4HoG2x.js";import"./index-B_jtOnfb.js";import"./label-5cnHidT9.js";import"./select-Eb52CCUS.js";import"./chevron-down-DAqQ9JEz.js";import"./check-CPMYn-R6.js";import"./index-BdQq_4o_.js";import"./index-BF_tNVue.js";import"./index-9gXe0pF_.js";import"./index-BjEB8rET.js";import"./index-tVHn528P.js";import"./textarea-CpQB-dkq.js";import"./wand-sparkles-CTv8runl.js";import"./info-D8Yr0mJf.js";import"./WizardReviewStep-D0t8Lwec.js";import"./card-BHdKVLuV.js";import"./input-CUrHq8Ru.js";import"./x-BgnxFWS-.js";import"./scroll-area-CKeTsq4V.js";import"./refresh-cw-CdMgvduZ.js";import"./plus-BvjbeNSj.js";import"./search-Cl_fo_Zu.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
