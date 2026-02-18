import{j as m}from"./jsx-runtime-BohsArqH.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-avWnm_cv.js";import{S as d,a as s}from"./story-wizard-CYuhhGw_.js";import"./iframe-DTvbRuBo.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CiB0LXSo.js";import"./index-Dc_FVRD7.js";import"./index-BUUGCRZF.js";import"./index-Dlu4N8C4.js";import"./index-BtSuZ60O.js";import"./index-DSb5mu4X.js";import"./index-DLo5puCU.js";import"./index-CPLw3J1w.js";import"./index-C6DkfKbV.js";import"./index-shNnazJg.js";import"./index-BtX_2QKB.js";import"./index-D6zHc0lO.js";import"./index-BLJhY0Av.js";import"./index-BMCffKaf.js";import"./index-BO_Q0ICX.js";import"./index-m7QYi-el.js";import"./action-middleware-BGKKPFzm.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DMSB7HiQ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Beo-Hp5h.js";import"./proxy-BOeFPPOC.js";import"./loader-circle-CBb0uPFi.js";import"./createLucideIcon-UJbeLKgj.js";import"./button-0xU21Ont.js";import"./index-h6qoG7Gi.js";import"./label-DqtfHTx2.js";import"./select-2xp0K_Zx.js";import"./chevron-down-D2mfptwC.js";import"./check-DEbwUFot.js";import"./index-BdQq_4o_.js";import"./index-DfyI9NF-.js";import"./index-CBsOYFBu.js";import"./index-B_WIVT5_.js";import"./index-J8Lm3uRS.js";import"./textarea-Ba7AKgGK.js";import"./wand-sparkles-9RgfutBb.js";import"./info-C5aG7HTb.js";import"./WizardReviewStep-BJ2oyUic.js";import"./card-BOblcIz2.js";import"./input-CldW2zsS.js";import"./x-C8ltx8Jd.js";import"./scroll-area-nL9Cjh93.js";import"./refresh-cw-gd6Jvaba.js";import"./plus-D0bw_KDw.js";import"./search-B95lo5et.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
