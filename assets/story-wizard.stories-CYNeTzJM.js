import{j as m}from"./jsx-runtime-CjXMCCMY.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DTJeUQnh.js";import{S as d,a as s}from"./story-wizard-CkzZxv1N.js";import"./iframe-DBjsy9jC.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CmX3xzop.js";import"./index-DJc7JYCP.js";import"./index-84ixZTpt.js";import"./index-CsC1K12S.js";import"./index-B2kbB7Q5.js";import"./index-BKj7uqd3.js";import"./index-BERZZeLe.js";import"./index-CF3tRaCH.js";import"./index-A1U3pHKc.js";import"./index-4GtUsitV.js";import"./index-Bas82Z5s.js";import"./index-CUkJHeN7.js";import"./index-CM38PrTl.js";import"./index-A7XIZBHG.js";import"./action-middleware-D3tzIUbz.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DiAJxddx.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DzRpyvh6.js";import"./proxy-Bk77pFzG.js";import"./loader-circle-CgD6NW-G.js";import"./createLucideIcon-AQNfKgHk.js";import"./button-DNeZXcvH.js";import"./index-B_jtOnfb.js";import"./label-D_0mnlKU.js";import"./select-XCnRp3Rh.js";import"./chevron-down-slItoz05.js";import"./check-RWQEDmFf.js";import"./index-BdQq_4o_.js";import"./index-BIFa8Q-F.js";import"./index-BMr8DoID.js";import"./index-YvN5oCWL.js";import"./index-CXPN2yVY.js";import"./textarea-1YuyHoWu.js";import"./wand-sparkles-DAEtw4Rd.js";import"./info-TxsHIXTO.js";import"./WizardReviewStep-BrqmRp2Y.js";import"./card-CQd-wzsE.js";import"./input-B2QLhptQ.js";import"./x-B0gj_PoI.js";import"./scroll-area-Bdrx-KMu.js";import"./refresh-cw-CCIv7X-r.js";import"./plus-I9zD_ZDk.js";import"./search-D5uFHKbA.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
