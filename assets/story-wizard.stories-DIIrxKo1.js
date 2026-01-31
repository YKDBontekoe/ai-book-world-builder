import{j as m}from"./jsx-runtime-BuxLgQwZ.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-vdIvAH0B.js";import{S as d,a as s}from"./story-wizard-_xQxFENT.js";import"./iframe-CCnkOCyz.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Cu4XKYQz.js";import"./index-EGUtr8My.js";import"./index-C7wlqEVT.js";import"./index-8iUg8tsb.js";import"./index-Bv1LZLjQ.js";import"./index-BemyzzSN.js";import"./index-DWUauKts.js";import"./index-CntjN1GG.js";import"./index-7ZTN-89_.js";import"./index-BrXdy2lw.js";import"./index-Cwa01qOi.js";import"./index-DPQyh1T4.js";import"./index-37B2xxnJ.js";import"./index-BkaP_kfn.js";import"./action-middleware-Bc2S2Hw4.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-D3FZTdPT.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Crb_C0Ic.js";import"./proxy-YMjbK0sk.js";import"./loader-circle-BLKU--NC.js";import"./createLucideIcon-GdoVF7Dr.js";import"./button-PhDdbbhB.js";import"./index-B_jtOnfb.js";import"./label-THupTRbm.js";import"./select-CQdBuJGt.js";import"./chevron-down-i6va2nwC.js";import"./check-C3kMnAel.js";import"./index-BdQq_4o_.js";import"./index-BrNBdaxk.js";import"./index-D3g9IZWi.js";import"./index-BpObx3Xy.js";import"./index-DpQS94dt.js";import"./textarea-Beczx_ty.js";import"./wand-sparkles-D6OIU7qk.js";import"./info-FBffDbe9.js";import"./WizardReviewStep-B0vB86hZ.js";import"./card-Cop_p4gP.js";import"./input-Dd-NcVK0.js";import"./x-Blq_0PD9.js";import"./scroll-area-15TgsjsX.js";import"./refresh-cw-DcPVwWuJ.js";import"./plus-CavYY_u4.js";import"./search-3Vt2iU9T.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
