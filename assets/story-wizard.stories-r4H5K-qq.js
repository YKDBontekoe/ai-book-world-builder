import{j as m}from"./jsx-runtime-DkdgTblK.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BaLOfZjx.js";import{S as d,a as s}from"./story-wizard-BM-DYTsZ.js";import"./iframe-CbO5XjPK.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Rpko3tBN.js";import"./index-BgXt8vCL.js";import"./index-CWkDqWDD.js";import"./index-CUuGIqoW.js";import"./index-D0D1uWAp.js";import"./index-C2E-RG_0.js";import"./index-BJ5QPKSB.js";import"./index-BKwvodDe.js";import"./index-BrtSflKV.js";import"./index-CLC8oWNx.js";import"./index-ZYgc6JCr.js";import"./index-CxP4JEx2.js";import"./index-BsnMvw-B.js";import"./index-DPY-RskL.js";import"./action-middleware-qtcgFAG-.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-ZqT0D5GQ.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-D5V2xOvS.js";import"./proxy-Bj3pACc-.js";import"./loader-circle-CGRZzDQK.js";import"./createLucideIcon-CIm5XqvR.js";import"./button-BMXHrBbq.js";import"./index-B_jtOnfb.js";import"./label-Bxup0Zvs.js";import"./select-Doo37wN3.js";import"./chevron-down-DsgInIBe.js";import"./check-CN4Q33Xm.js";import"./index-BdQq_4o_.js";import"./index-BPccXfzW.js";import"./index-Dv48yATU.js";import"./index-CSE0Bs1D.js";import"./index-C37_LKoD.js";import"./textarea-OCLuR1e3.js";import"./wand-sparkles-D0EQpIIJ.js";import"./info-BCb9fYhu.js";import"./WizardReviewStep-BBznIQz7.js";import"./card-B-Y5TC1K.js";import"./input-DymLJmZM.js";import"./x-Cnw_J4Qu.js";import"./scroll-area-B7iWRo8X.js";import"./refresh-cw-DZeXeoM9.js";import"./plus-CIOOMcP_.js";import"./search-DTsfTNCU.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
