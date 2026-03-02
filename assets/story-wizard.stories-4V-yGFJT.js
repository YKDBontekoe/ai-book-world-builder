import{j as m}from"./jsx-runtime-Zge6MUb8.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-IYO2skba.js";import{S as d,a as s}from"./story-wizard-Cp6gyF5q.js";import"./iframe-CwjkZJPM.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BTs5GNUV.js";import"./index-Bq1__o1m.js";import"./index-DfZTMD4d.js";import"./index-D-cmZXUb.js";import"./index-C1WMrhLE.js";import"./index-BePZnK_-.js";import"./index-C6svBIJk.js";import"./index-D2zOXbAL.js";import"./index-BXj4GDv9.js";import"./index-Dk4SuiZY.js";import"./index-D1fOtOl6.js";import"./index-Cry4Hfib.js";import"./index-C3dKdg1Y.js";import"./index-Dv9smlaa.js";import"./action-middleware-C6i2JC2j.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DwmPlsdt.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-D5OiTbS5.js";import"./proxy-LuKdhk7I.js";import"./loader-circle-C1Z64-WV.js";import"./createLucideIcon-Brg_cKdp.js";import"./button-Cz4K4JXc.js";import"./index-LHNt3CwB.js";import"./label-BPLtTmui.js";import"./select-Dks90J1r.js";import"./chevron-down-CwgMFg6p.js";import"./check-RprRgQTi.js";import"./index-BdQq_4o_.js";import"./index-DMqsR9Yd.js";import"./index-D76mOxJg.js";import"./index-CQFiooH5.js";import"./index-WzrL_LSc.js";import"./textarea-BHIfS-Gm.js";import"./wand-sparkles-ChIz8TLA.js";import"./info-CgNCT_x7.js";import"./WizardReviewStep-C9U1mI4U.js";import"./card-BLicldmB.js";import"./input-31z2ine-.js";import"./x-z7JZmNtj.js";import"./scroll-area-BsE8gIu2.js";import"./refresh-cw-CgMSo5jV.js";import"./plus-D27miJfD.js";import"./search-C2SHfpld.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
