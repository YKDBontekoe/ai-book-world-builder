import{j as m}from"./jsx-runtime-CgTA2Ffm.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-D-VYLX6o.js";import{S as d,a as s}from"./story-wizard-BQcanSxt.js";import"./iframe-CSaT3Zrw.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-CqEzyjUb.js";import"./index-HmFr_79w.js";import"./index-DUmdXOWJ.js";import"./index-CLnKk84U.js";import"./index-Bb2K0iPa.js";import"./index-De-FYIKH.js";import"./index-C6xjriww.js";import"./index-C5AbpTkB.js";import"./index-CaXhoJxI.js";import"./index-BBcrdBKy.js";import"./index-BKDLGC1i.js";import"./index-bhjg92NJ.js";import"./index-Ox8GkSdl.js";import"./index-sBYOLbcJ.js";import"./action-middleware-CgvcrNpU.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CfeXKMdd.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-cj9RZMJQ.js";import"./proxy-DIx0MAaE.js";import"./loader-circle-1KQ9aMC8.js";import"./createLucideIcon-sA0og_Sf.js";import"./button-CWqQdz3F.js";import"./index-h6qoG7Gi.js";import"./label-xVog4mZB.js";import"./select-tKAQRGqe.js";import"./chevron-down-CdHMhfo3.js";import"./check-BWyo5Bav.js";import"./index-BdQq_4o_.js";import"./index-CpKUUkQH.js";import"./index-RcxhhmbX.js";import"./index-D4ca4eTZ.js";import"./index-Bdo1A7HX.js";import"./textarea-0WO-d-5f.js";import"./wand-sparkles-Cc4eZiQr.js";import"./info-DAV2fW78.js";import"./WizardReviewStep-Dn9vksPE.js";import"./card-Bu3AKeGD.js";import"./input-Dle3rFGi.js";import"./x-TiXj8MUd.js";import"./scroll-area-DtLpJYGW.js";import"./refresh-cw-Cv7o1dCj.js";import"./plus-B8FAoCJR.js";import"./search-DE5Dsu8i.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
