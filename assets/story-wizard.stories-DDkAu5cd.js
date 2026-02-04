import{j as m}from"./jsx-runtime-FIJ09FDt.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-C_LbW3nw.js";import{S as d,a as s}from"./story-wizard-CtJn98Dg.js";import"./iframe-DAdFXrCf.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DREQ9gaq.js";import"./index-CBcMi7J1.js";import"./index-DJAjHqZT.js";import"./index-KCYCeRbK.js";import"./index-ClzAxnP8.js";import"./index-DI-rvW6d.js";import"./index-Cil1qDnT.js";import"./index-SxQNTRCZ.js";import"./index-DkaG6PYM.js";import"./index-isXsSFXO.js";import"./index-LkiIJJ-Y.js";import"./index-B7MTAA0Q.js";import"./index-Cy1EwABf.js";import"./index-DZOsmnT4.js";import"./action-middleware-c4UueO9m.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DBExD3z3.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Cld3b4Ad.js";import"./proxy-DTkY8dkn.js";import"./loader-circle-DefB6_gd.js";import"./createLucideIcon-Bf49YJue.js";import"./button-DROeuOeO.js";import"./index-B_jtOnfb.js";import"./label-BCA__vfx.js";import"./select-CV_g-HJs.js";import"./chevron-down-CbrO4W5k.js";import"./check-DDwO7BZh.js";import"./index-BdQq_4o_.js";import"./index-yV1YEGre.js";import"./index-YAduKmeG.js";import"./index-BgZnB_cI.js";import"./index-DCVbcItp.js";import"./textarea-Du9IInnN.js";import"./wand-sparkles-BITr0n9i.js";import"./info-ANT59HpM.js";import"./WizardReviewStep-D6UIe09x.js";import"./card-BDkvBsao.js";import"./input-BS991YOH.js";import"./x-qkYvdSL1.js";import"./scroll-area-Brz0VMdQ.js";import"./refresh-cw-BlKIA_ki.js";import"./plus-CoD8b8IG.js";import"./search-Br4YuSVs.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
