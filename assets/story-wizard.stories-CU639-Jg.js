import{j as m}from"./jsx-runtime-CbrddTSd.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DrPK1SVw.js";import{S as d,a as s}from"./story-wizard-COcXw1Jq.js";import"./iframe-DTFC9e7v.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CZZaryzl.js";import"./index-COnoe9nM.js";import"./index-BcS3WsrC.js";import"./index-BO5H03Iq.js";import"./index-Bst0KKyt.js";import"./index-DUJUrbtt.js";import"./index-1otynvzu.js";import"./index-D_QeQMxG.js";import"./index-Nf6eCFcF.js";import"./index-DoAf1m7G.js";import"./index-D0K28-T7.js";import"./index-DyyjC8yZ.js";import"./index-CCBLogqr.js";import"./index-C7z5KzJB.js";import"./action-middleware-BJ8GBWr1.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DmZCnmgQ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DTIMBe9U.js";import"./proxy-CrLNVvzd.js";import"./loader-circle-BF3hQ5yU.js";import"./createLucideIcon-Tvb3czMT.js";import"./button-B9JnPEpe.js";import"./index-B_jtOnfb.js";import"./label-DQutukTt.js";import"./select-BRVq1eh-.js";import"./chevron-down-DB0R_DHN.js";import"./check-Bk672Mqu.js";import"./index-BdQq_4o_.js";import"./index-DNMAkODZ.js";import"./index-D6Vik2eh.js";import"./index-CAaHynCy.js";import"./index-BdVEyyPc.js";import"./textarea-Lkgjjepa.js";import"./wand-sparkles-vKSp52qD.js";import"./info-BYPaL4af.js";import"./WizardReviewStep--d_91MDB.js";import"./card-D9ecRakr.js";import"./input-5qLFUjnc.js";import"./x-BrytJs8L.js";import"./scroll-area-BXSq3hE1.js";import"./refresh-cw-wGmn718S.js";import"./plus-BsFCB-PV.js";import"./search-BW6Q5stU.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
