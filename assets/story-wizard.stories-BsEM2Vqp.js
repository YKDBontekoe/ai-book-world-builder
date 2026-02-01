import{j as m}from"./jsx-runtime-BeoWBU-7.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-OIX9is9a.js";import{S as d,a as s}from"./story-wizard-LvLJtgA4.js";import"./iframe-DJvMmxOz.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-6OnZqyup.js";import"./index-PJA0UKoX.js";import"./index-C5-OcYOP.js";import"./index-8zpExIgt.js";import"./index-DFUxkd2P.js";import"./index-DahIcpTz.js";import"./index-DIu4VFGp.js";import"./index-DS0BUa-s.js";import"./index-DckW3Ka0.js";import"./index-_z8gH6NQ.js";import"./index-ni14vWku.js";import"./index-mXdllWr-.js";import"./index-CCMPiguM.js";import"./index-DoIA1o6U.js";import"./action-middleware-DbltG0Yk.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DV7DWBi8.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DKlVCTtj.js";import"./proxy-DNB5rmPL.js";import"./loader-circle-BuagWZOe.js";import"./createLucideIcon-Cuafk744.js";import"./button-4SYpMOms.js";import"./index-B_jtOnfb.js";import"./label-Bdq7Kd6u.js";import"./select-Bd9YWsfL.js";import"./chevron-down-INsrJOhA.js";import"./check-BL_9sFed.js";import"./index-BdQq_4o_.js";import"./index-BnyBc_9D.js";import"./index-DS3Ab1o2.js";import"./index-DVYoO4RM.js";import"./index-CnxCB2Xt.js";import"./textarea-Bs54HWvj.js";import"./wand-sparkles-D6kboX3F.js";import"./info-Clf8RHdQ.js";import"./WizardReviewStep-C2R7nbfU.js";import"./card-DMPx-eBN.js";import"./input-BGMCc-yx.js";import"./x-WQ0uB8Jm.js";import"./scroll-area-BxbXhRfg.js";import"./refresh-cw-CuNeSWCw.js";import"./plus-DuSrVETg.js";import"./search-DQ5KxUKK.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
