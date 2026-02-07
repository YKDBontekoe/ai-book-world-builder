import{j as m}from"./jsx-runtime-Db4AuHVV.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B4Js8dNh.js";import{S as d,a as s}from"./story-wizard-J6y5zxGo.js";import"./iframe-B05GXxog.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-8ZLkOq_a.js";import"./index-HOFTEj-G.js";import"./index-6SwOjFBI.js";import"./index-BTsVOdfX.js";import"./index-JWLKt3T2.js";import"./index-DqF82BIM.js";import"./index-DtkQVcb4.js";import"./index-B8qphpax.js";import"./index-eO210Wqa.js";import"./index-lfFjKqQp.js";import"./index-B9k9xDpO.js";import"./index-i_ExfOr1.js";import"./index-DecROoJJ.js";import"./index-CD7x5YGo.js";import"./action-middleware-Cmdm_asS.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CBbwzQL3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-D-5Nw7XY.js";import"./proxy-BRTTqk5i.js";import"./loader-circle-DTxqRcuZ.js";import"./createLucideIcon-B6NwdbP-.js";import"./button-Cji_nwsR.js";import"./index-B_jtOnfb.js";import"./label-DO7A4Dqe.js";import"./select-CuCBWbOW.js";import"./chevron-down-DIN2LvyX.js";import"./check-B3-3UfBF.js";import"./index-BdQq_4o_.js";import"./index-zZG3Pwqn.js";import"./index-DWf8IXBh.js";import"./index-T3dOsugL.js";import"./index-B96IWsS_.js";import"./textarea-BTY9G3iM.js";import"./wand-sparkles-BSZqQhrr.js";import"./info-CkWiTnUF.js";import"./WizardReviewStep-D4NVj849.js";import"./card-C8i16EYV.js";import"./input-CwXbcgmB.js";import"./x-CmHK8_La.js";import"./scroll-area-Dlib2xku.js";import"./refresh-cw-CGvJbz6H.js";import"./plus-CxSi43If.js";import"./search-CoR3UWiK.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
