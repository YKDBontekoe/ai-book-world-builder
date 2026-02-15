import{j as m}from"./jsx-runtime-RBP-C-Za.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-B8HHYp1E.js";import{S as d,a as s}from"./story-wizard-C5JQP0ou.js";import"./iframe-3BBzYrHW.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-roDOsb3l.js";import"./index-BZMyXTnI.js";import"./index-BOQeKTm1.js";import"./index-B5y92LIM.js";import"./index-DJVP_wCo.js";import"./index-Cen_ue0V.js";import"./index-Dz2I4dyz.js";import"./index-OWanAPeq.js";import"./index-B8EfoWed.js";import"./index-BHJfePF_.js";import"./index-C2u-zblP.js";import"./index-CStfMv6v.js";import"./index-BTMRZZSf.js";import"./index-2G2kZ0aB.js";import"./action-middleware-BLTjT7V5.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Y4XfoUS6.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-E-6-_qSw.js";import"./proxy-CSdu_gbo.js";import"./loader-circle-DYALuiND.js";import"./createLucideIcon-v1LrQwS-.js";import"./button-tU2_sj_C.js";import"./index-B_jtOnfb.js";import"./label-BTeK21Yz.js";import"./select-BywnJesE.js";import"./chevron-down-Bf_mHb9H.js";import"./check-CSOs9Aqx.js";import"./index-BdQq_4o_.js";import"./index-DvRPls5z.js";import"./index-Bq3IcaEW.js";import"./index-DvtZdEcH.js";import"./index-B1eDWeKI.js";import"./textarea-DGYTvcDd.js";import"./wand-sparkles-DRK6p6RX.js";import"./info-CT_RDXNe.js";import"./WizardReviewStep-D_vM0UXx.js";import"./card-BLmd8Onc.js";import"./input-BvLoB0Bo.js";import"./x-DyNni4iY.js";import"./scroll-area-CXj72hKz.js";import"./refresh-cw-ChHJpyh3.js";import"./plus-DnGt-WLB.js";import"./search-CReeBi1F.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
