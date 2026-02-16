import{j as m}from"./jsx-runtime-TE-mvFOb.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-54FsY4mC.js";import{S as d,a as s}from"./story-wizard-droM4Y5b.js";import"./iframe-BDfIik_K.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-L0xOMGe2.js";import"./index-DnsaOOjt.js";import"./index-CF1oDbdv.js";import"./index-BMzh1u6h.js";import"./index-Cnu04RHD.js";import"./index-B7XsfP9N.js";import"./index-Dd9FDRUT.js";import"./index-BODUAb7F.js";import"./index-yFCVAp56.js";import"./index-BxpatyGq.js";import"./index-B7us-hA3.js";import"./index-qYcqD75m.js";import"./index-BX3dPqu6.js";import"./index-o2cd_P53.js";import"./action-middleware-CXSPm5dy.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-IT7fKpI0.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CKoekIX4.js";import"./proxy-CU0TEIND.js";import"./loader-circle-C-BYKiEn.js";import"./createLucideIcon-DAxE44x-.js";import"./button-CiftiPUJ.js";import"./index-B_jtOnfb.js";import"./label-Bus-L-5q.js";import"./select-DIphzNgz.js";import"./chevron-down-BLY97Mpv.js";import"./check-kCPpP4Oe.js";import"./index-BdQq_4o_.js";import"./index-Dvkevdlh.js";import"./index-CLjIDyI4.js";import"./index-Bh7Oj3dL.js";import"./index-BKw_xccc.js";import"./textarea-DVyYhQvn.js";import"./wand-sparkles-CbE07isA.js";import"./info-CYQx-K6H.js";import"./WizardReviewStep-ClXn2Q9K.js";import"./card-B0_Au0Zl.js";import"./input-C5P7IXO9.js";import"./x-42L5DgcV.js";import"./scroll-area-CshVkkKJ.js";import"./refresh-cw-DRr9SvzD.js";import"./plus-CQF3ocHC.js";import"./search-TT8qKb9s.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
