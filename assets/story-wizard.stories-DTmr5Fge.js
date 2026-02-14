import{j as m}from"./jsx-runtime-Duzmd1ix.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-zWBgjP5D.js";import{S as d,a as s}from"./story-wizard-G47B2Lxy.js";import"./iframe-BGsdVG_Y.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BwVTlFz5.js";import"./index-DWlKEUXp.js";import"./index-Uy34xtx9.js";import"./index-D-96TcNV.js";import"./index-IkIP_1oj.js";import"./index-BGEZNe9h.js";import"./index-DGjEqfnB.js";import"./index-Ce249L8q.js";import"./index-wPKz5oqo.js";import"./index-CnJo2nP5.js";import"./index-CyKpZR7N.js";import"./index-CaGafu41.js";import"./index-DZoYgsh0.js";import"./index-C3eJZWSn.js";import"./action-middleware-BCFhKueR.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CPH6tvuI.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-CUKa6u95.js";import"./proxy-B6-XxH6S.js";import"./loader-circle-YYym6sud.js";import"./createLucideIcon-CPC8rMbY.js";import"./button-BQgsakop.js";import"./index-B_jtOnfb.js";import"./label-BUX2YXCf.js";import"./select-wwsV7FUK.js";import"./chevron-down-BV3Td1Fk.js";import"./check-BwAoW2_A.js";import"./index-BdQq_4o_.js";import"./index-DoJl9sQz.js";import"./index-CBO5Pu07.js";import"./index-B89nTROd.js";import"./index-BhHJVXkY.js";import"./textarea-CrETGMmm.js";import"./wand-sparkles-ly7IQ-Nq.js";import"./info-DHb_jS4H.js";import"./WizardReviewStep-CT5VIAYj.js";import"./card-_4cIO9Pt.js";import"./input-D1-JUq3z.js";import"./x-CandCxvP.js";import"./scroll-area-l6zGi6ck.js";import"./refresh-cw-B7RZYjyp.js";import"./plus-BN_zdiPI.js";import"./search-CIQWW6tw.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
