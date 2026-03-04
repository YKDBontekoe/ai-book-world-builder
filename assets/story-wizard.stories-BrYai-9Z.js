import{j as m}from"./jsx-runtime-BQGPxzBC.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-Cn2Hzs_e.js";import{S as d,a as s}from"./story-wizard-EUgKZ9Xn.js";import"./iframe-CdWhXxov.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-B4h2nE1V.js";import"./index-oijJBewc.js";import"./index-C6gces-K.js";import"./index-DOA1RiyO.js";import"./index-DVr3oBf0.js";import"./index-DNNaxmRs.js";import"./index-Cd6KWbhR.js";import"./index-CyjlD8Wa.js";import"./index-CFrkWyVW.js";import"./index-k2DmymPj.js";import"./index-DmXqLjQJ.js";import"./index-BBzG55B0.js";import"./index-BtfVuzNx.js";import"./index-C9P4EHML.js";import"./action-middleware-CdDXHmpe.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CPOt0VJN.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-Pym08rZm.js";import"./proxy-rtG_7vsS.js";import"./loader-circle-BVDMG1pX.js";import"./createLucideIcon-msSLaNXI.js";import"./button-DFRkNW_u.js";import"./index-LHNt3CwB.js";import"./label-WhRWNP65.js";import"./select-Bsqtg9vU.js";import"./chevron-down-CYUxlvpu.js";import"./check-DHpWEl0F.js";import"./index-BdQq_4o_.js";import"./index-BIOqZWRh.js";import"./index-DVWjw4j0.js";import"./index-0cbgj31Y.js";import"./index-buIfl1ld.js";import"./textarea-DHVNWP-T.js";import"./wand-sparkles-1pj-JGrA.js";import"./info-06BWN5qm.js";import"./WizardReviewStep-DVEI_RXJ.js";import"./card-jtmmeTQF.js";import"./input-6-rsyIzk.js";import"./x-CORz1G63.js";import"./scroll-area-C1CD_syl.js";import"./refresh-cw-CQgCnPNo.js";import"./plus-oBESKYmR.js";import"./search-ugA-NOct.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
