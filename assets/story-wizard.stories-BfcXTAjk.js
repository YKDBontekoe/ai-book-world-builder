import{j as m}from"./jsx-runtime-DXCqn064.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-CHjXx071.js";import{S as d,a as s}from"./story-wizard-DtyhNlK_.js";import"./iframe-D5sPmvY8.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-BQHNewu7.js";import"./index-Dc_FVRD7.js";import"./index-BZpdh3id.js";import"./index-yO9o-0vK.js";import"./index-BO4FoUAO.js";import"./index-Bcr1sLB5.js";import"./index-DC0zUBft.js";import"./index-DsEKuvOT.js";import"./index-DBGr1o_E.js";import"./index-Bw9VXLf4.js";import"./index-DSPIKlYO.js";import"./index-CqGBxYCe.js";import"./index-x58arTxy.js";import"./index-D6i0aVgU.js";import"./index-C1GdSRrl.js";import"./index-fLC8hCQn.js";import"./action-middleware-D0dDl6tp.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-CeuBHqql.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C4CwOe15.js";import"./proxy-B4Bz0PJl.js";import"./loader-circle-xb6mNmAC.js";import"./createLucideIcon-D30sOfAK.js";import"./button-Dmc-6LZT.js";import"./index-LHNt3CwB.js";import"./label-BWy6rxGN.js";import"./select-BjWb7FkM.js";import"./chevron-down-DAMfRQ0k.js";import"./check-CT_UHJNm.js";import"./index-BdQq_4o_.js";import"./index-C6lkA-TP.js";import"./index-CDgPURqS.js";import"./index-D9CEcAdU.js";import"./index-DDJ0KnAX.js";import"./textarea-D7gOjFWj.js";import"./wand-sparkles-uK4sHxAT.js";import"./info-pzD7QqlC.js";import"./WizardReviewStep-BZne5E_K.js";import"./card-_JTNCVXl.js";import"./input-vDhAppEl.js";import"./x-jmXQAbtO.js";import"./scroll-area-CncYvboQ.js";import"./refresh-cw-Bm89KPpN.js";import"./plus-CaHdwJ5H.js";import"./search-TaMZbTjq.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
