import{j as m}from"./jsx-runtime-CMt8_htI.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-DAEK2DqN.js";import{S as d,a as s}from"./story-wizard-B81QODT7.js";import"./iframe-BWEgCO7C.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-D2zZ0D9V.js";import"./index-C45IGOev.js";import"./index-cs--GqGA.js";import"./index-CcWzrtcr.js";import"./index-CN6c56oH.js";import"./index-B_L5lIjh.js";import"./index-DPO_fZAK.js";import"./index-icn0nV8V.js";import"./index-jSEMrUVz.js";import"./index-BoWuEwMs.js";import"./index-CmIRoUQC.js";import"./index-CAfoO0br.js";import"./index-BEoc-gXz.js";import"./index-Bj3jloxE.js";import"./action-middleware-DXCX_ZJM.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DAjoX0cx.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CYX1jEi4.js";import"./proxy-CRAHQTPo.js";import"./loader-circle-CEykp3N6.js";import"./createLucideIcon-CEp9wFGP.js";import"./button-DVEUXDcb.js";import"./index-B_jtOnfb.js";import"./label-Cj0dGghl.js";import"./select-lBvD2xFx.js";import"./chevron-down-1VL2xV9u.js";import"./check-Dyw5hMJp.js";import"./index-BdQq_4o_.js";import"./index-CpRZhwn5.js";import"./index-C327kOBO.js";import"./index-DoF_obAN.js";import"./index-DQ0Kqjrc.js";import"./textarea-D1HFL4pA.js";import"./wand-sparkles-C_v-UzJ9.js";import"./info-qzqNzhrN.js";import"./WizardReviewStep-WdbVKGfu.js";import"./card-qHhPQky_.js";import"./input-BmX9M3sN.js";import"./x-B0bmZz41.js";import"./scroll-area-C3HChD58.js";import"./refresh-cw-DBNowKCb.js";import"./plus-BcPLO6eA.js";import"./search-BdlcHl3v.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
