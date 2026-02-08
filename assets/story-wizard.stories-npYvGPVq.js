import{j as m}from"./jsx-runtime-DqKe8gXE.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-D-PAl2fm.js";import{S as d,a as s}from"./story-wizard-C2AXsN1C.js";import"./iframe-BMZYL4ma.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-CuPv1lLK.js";import"./index-B1IQ-vke.js";import"./index-Bxn04e9U.js";import"./index-DppINr9S.js";import"./index-DkMKuHn_.js";import"./index-CsmL3HuK.js";import"./index-_Cuvro-r.js";import"./index-DyWiYfbR.js";import"./index-CgiKHpn9.js";import"./index-D30WBt_p.js";import"./index-DSOOjd24.js";import"./index-B3Q95TJJ.js";import"./index-00kFLA4l.js";import"./index-BFf_4Et4.js";import"./action-middleware-DsOdYzrq.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-BU7mv8jj.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CFd2uVLi.js";import"./proxy-C1uhXwSk.js";import"./loader-circle-BCbIb7Aq.js";import"./createLucideIcon-CLmi2UlH.js";import"./button-4fwNr5pd.js";import"./index-B_jtOnfb.js";import"./label-CECTUNyf.js";import"./select-CMeIT7cN.js";import"./chevron-down-B-wj6eeI.js";import"./check-Che57aLL.js";import"./index-BdQq_4o_.js";import"./index-CQsSol5u.js";import"./index-D4eiPnZy.js";import"./index-BTFRMrb4.js";import"./index-CBotu3Vz.js";import"./textarea-DdcOmoQK.js";import"./wand-sparkles-BJPS_ZyW.js";import"./info-DukGFGA-.js";import"./WizardReviewStep-CYrwgPvl.js";import"./card-CfbSEjzX.js";import"./input-DaeCHtw8.js";import"./x-DrPSrKor.js";import"./scroll-area-5He0OxZn.js";import"./refresh-cw-DCea-GC0.js";import"./plus-D2YvSLuS.js";import"./search-DGKtoPOl.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
