import{j as m}from"./jsx-runtime-gWqxOHfm.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-C5Wj6tBw.js";import{S as d,a as s}from"./story-wizard-BoclbOgl.js";import"./iframe-B5acc_Oy.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-zssMrYYx.js";import"./index-BOSWEicU.js";import"./index-CQb9d69D.js";import"./index-DCli83h7.js";import"./index-CHf8abN9.js";import"./index-3yurjf8k.js";import"./index-Cp8OvSgh.js";import"./index-CHpeOj_B.js";import"./index-wFIemuVW.js";import"./index-VuGqE6c8.js";import"./index-CCMnWQ7J.js";import"./index-H7MGTXT2.js";import"./index-BiUrd9Sn.js";import"./index-vQDZMmLn.js";import"./action-middleware-BnlbJcqV.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DLP0LdL2.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-BlPTK-I8.js";import"./proxy-DoKb6SxC.js";import"./loader-circle-2pQSeKC2.js";import"./createLucideIcon-DOBLy2tE.js";import"./button-D4KFjpHf.js";import"./index-LHNt3CwB.js";import"./label-BPGxRPx6.js";import"./select-Cs0ANmr9.js";import"./chevron-down-BRxYmhHj.js";import"./check-CisbE5Eq.js";import"./index-BdQq_4o_.js";import"./index-C-eSPUVU.js";import"./index-CimMIDQD.js";import"./index-DlkORyqS.js";import"./index-Dbf0gh3C.js";import"./textarea-XJy-Yhbi.js";import"./wand-sparkles-C5C05Tr3.js";import"./info-K6hbVAjG.js";import"./WizardReviewStep-CJkLTuC-.js";import"./card-Dy_-VGx5.js";import"./input-D1biTcDG.js";import"./x-B4hqFP6T.js";import"./scroll-area-dowlgg6T.js";import"./refresh-cw-DJgyDqbH.js";import"./plus-hEywfVLy.js";import"./search-6U-8f-VO.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
