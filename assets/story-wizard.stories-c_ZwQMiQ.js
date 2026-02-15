import{j as m}from"./jsx-runtime-C6hFcrge.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-uR3SAFJO.js";import{S as d,a as s}from"./story-wizard-Czzo_1yL.js";import"./iframe-2O0mJxCQ.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-ClPlS4My.js";import"./index-C7b7kv3G.js";import"./index-C7En5Nis.js";import"./index-RSUIAPKt.js";import"./index-BxMhHZ37.js";import"./index-R3YJaKZD.js";import"./index-BUEiXpJQ.js";import"./index-DkM521hE.js";import"./index-DEpkzy9s.js";import"./index-C4o_VJ5t.js";import"./index-dI4hZTdg.js";import"./index-_cMu97tE.js";import"./index-C1iJrwME.js";import"./index-4aVHQ-QO.js";import"./action-middleware-BgLiV754.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-B6mXCsmT.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-D0f_cu6y.js";import"./proxy-ByqJEYCN.js";import"./loader-circle-6R6iXcA5.js";import"./createLucideIcon-Co_59vb3.js";import"./button-yCONEFtL.js";import"./index-B_jtOnfb.js";import"./label-D6kHrk8Y.js";import"./select-C3t3R4Df.js";import"./chevron-down-Bx8hdPn1.js";import"./check-p6y9APZJ.js";import"./index-BdQq_4o_.js";import"./index-DZnNZsv9.js";import"./index-cT8MDLiY.js";import"./index-tJcbmCTF.js";import"./index-A4i329Me.js";import"./textarea-wryJL3Zh.js";import"./wand-sparkles-4lQNSVdW.js";import"./info-DmrC5Iv_.js";import"./WizardReviewStep-Dt8slrrH.js";import"./card-BOi4CMAb.js";import"./input-CXSzjcTU.js";import"./x-BZ6btdeE.js";import"./scroll-area-Bx_k_-3W.js";import"./refresh-cw-B-E-BpF1.js";import"./plus-CLVhOQ57.js";import"./search-r7d_vKDn.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
