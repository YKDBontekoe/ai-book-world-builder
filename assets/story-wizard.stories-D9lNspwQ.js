import{j as m}from"./jsx-runtime-DmkqtAf6.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BEBUV7ny.js";import{S as d,a as s}from"./story-wizard-Dy7WO5US.js";import"./iframe-CiUay8hi.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Drj8K9B8.js";import"./index-BtU5JWex.js";import"./index-WcjpMP0g.js";import"./index-DogP4YQq.js";import"./index-CNICJDh0.js";import"./index-DVrVLwpb.js";import"./index-C-D0K-MA.js";import"./index-BVjuynwm.js";import"./index-B8N_hj7Z.js";import"./index-CDs5tS9u.js";import"./index-CzV7gm_L.js";import"./index-QQXvntuN.js";import"./index-CmEe6D_u.js";import"./index-DKqmWvr2.js";import"./action-middleware-CpJBavLC.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D3ZVVGJq.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-VTzAk0oq.js";import"./proxy-t1NIjtCe.js";import"./loader-circle-Cwen-0TO.js";import"./createLucideIcon-dJcQXwbW.js";import"./button-Bk5ELVoK.js";import"./index-B_jtOnfb.js";import"./label-BLhAkVoG.js";import"./select-DERR5oP3.js";import"./chevron-down-DMbZX13S.js";import"./check-CiwScQMj.js";import"./index-BdQq_4o_.js";import"./index-D0fspgv8.js";import"./index-kY8SLz8U.js";import"./index-D8WxT7e9.js";import"./index-CdBf_ATH.js";import"./textarea-BfPg-FkV.js";import"./wand-sparkles-BJnDwBRJ.js";import"./info-C4_hPBYa.js";import"./WizardReviewStep-BtC0cTZs.js";import"./card-BTOnku8V.js";import"./input-B1UylJXI.js";import"./x-BO_NMAcQ.js";import"./scroll-area-CEIOpVje.js";import"./refresh-cw-Ccgn5eEL.js";import"./plus-ChuCtNqX.js";import"./search-wvSGBV2R.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
