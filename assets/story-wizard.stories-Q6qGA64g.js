import{j as m}from"./jsx-runtime-BqMHplYq.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DI8yeEJM.js";import{S as d,a as s}from"./story-wizard-DDm-84CF.js";import"./iframe-pnfdOAao.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-wJIMe7vq.js";import"./index-htS22kSG.js";import"./index-wXesEuaP.js";import"./index-B172zj8H.js";import"./index-BxqNI3-i.js";import"./index-D3Gtn2-x.js";import"./index-CBdgZC4s.js";import"./index-BQy3jVnE.js";import"./index-BbUa8As1.js";import"./index-C3Y6C-qS.js";import"./index-D8-Vn9xX.js";import"./index-C0FHRjCR.js";import"./index-BovDJZCB.js";import"./index-DGmBwAAV.js";import"./action-middleware-tSdN1BVD.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-v2-dP1-_.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C4QKbUNI.js";import"./proxy-D6HCxkb-.js";import"./loader-circle-Dk6LSy_g.js";import"./createLucideIcon-DbOKiGRk.js";import"./button-DmU-ulww.js";import"./index-B_jtOnfb.js";import"./label-JWzjN_oE.js";import"./select-CgYo9DZ5.js";import"./chevron-down-0vBdy68x.js";import"./check-pxLp3YIA.js";import"./index-BdQq_4o_.js";import"./index-DNLcMg6o.js";import"./index-DDdM_I8Y.js";import"./index-DU8HlRkb.js";import"./index-NvFxXyTA.js";import"./textarea-IVepHmqx.js";import"./wand-sparkles-COf4t7xz.js";import"./info-Csf4AJgu.js";import"./WizardReviewStep-BxlZ9k_a.js";import"./card-BwrV-HsR.js";import"./input-DVrU4imw.js";import"./x-BTSdMOYo.js";import"./scroll-area-CQd1JVAv.js";import"./refresh-cw-K0tNwMRO.js";import"./plus-CXNbNbwr.js";import"./search-DEfXtgUV.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
