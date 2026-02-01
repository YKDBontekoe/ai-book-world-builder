import{j as m}from"./jsx-runtime-BAVIqWo4.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BjgEvvFB.js";import{S as d,a as s}from"./story-wizard-KyH2J2dV.js";import"./iframe-B8sIMU29.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-9M6G6-Yg.js";import"./index-wHXYENMU.js";import"./index-D3kZZAcx.js";import"./index-DaiPUpXu.js";import"./index-H1a7EyZi.js";import"./index-CuarFvXK.js";import"./index-CriYhS2B.js";import"./index-Bo3xxGeH.js";import"./index-B2YY2iD1.js";import"./index-C1ssLes9.js";import"./index-BwKF2tp5.js";import"./index-DJIjLRIC.js";import"./index-BcYGymFF.js";import"./index-C3glsaU2.js";import"./action-middleware-Ds12h1yg.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-DrI-1xVx.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-DzjhL2tJ.js";import"./proxy-CJfGLGNq.js";import"./loader-circle-DYNNntK-.js";import"./createLucideIcon-CDjnItVU.js";import"./button-Cdm0mkCk.js";import"./index-B_jtOnfb.js";import"./label-DU7KPHxA.js";import"./select-CXkxcyXq.js";import"./chevron-down-dzLv1SJL.js";import"./check-uMDZpVni.js";import"./index-BdQq_4o_.js";import"./index-CTdnCunl.js";import"./index-BCIT-6eE.js";import"./index-Bh-XUxxQ.js";import"./index-J6bKWw1c.js";import"./textarea-CvDYGGaI.js";import"./wand-sparkles-DerGupdE.js";import"./info-DBvC2mKN.js";import"./WizardReviewStep-DmxkDHQ7.js";import"./card-BE2lV1fU.js";import"./input-efE2KwZ6.js";import"./x-D8XeGTtp.js";import"./scroll-area-YU4UdYib.js";import"./refresh-cw-brPhOqSg.js";import"./plus-SRe0ptTK.js";import"./search-C-eBBPZF.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
