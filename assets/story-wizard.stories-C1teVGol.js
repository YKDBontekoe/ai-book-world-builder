import{j as m}from"./jsx-runtime-B5bMYH5q.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-vf0jh51F.js";import{S as d,a as s}from"./story-wizard-DBBZ-Hwz.js";import"./iframe-BlEOQwor.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-YiGyp7XA.js";import"./index-BeSgeB3V.js";import"./index-DsX5Htib.js";import"./index-DV--xMlV.js";import"./index-Da0xlvVc.js";import"./index-Dx8O13nX.js";import"./index-DVsxkOLj.js";import"./index-r0wSRmEb.js";import"./index-XgXbDvux.js";import"./index-DcK7N-8V.js";import"./index-D0zEiJst.js";import"./index-qk3NDDqe.js";import"./index-CDwyl19b.js";import"./index-Cyt5575m.js";import"./action-middleware-CsstFhkj.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-laZV9c12.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-fz-7H-Jb.js";import"./proxy-CsNQLmfx.js";import"./loader-circle-C_KngPJZ.js";import"./createLucideIcon-CD_oLR-B.js";import"./button-DJUyscoQ.js";import"./index-B_jtOnfb.js";import"./label-WJG8nj7f.js";import"./select-CkghT_qV.js";import"./chevron-down-CcOuEABp.js";import"./check-Dm3VqSTZ.js";import"./index-BdQq_4o_.js";import"./index-CKbSrjcc.js";import"./index-CipyrijB.js";import"./index-DB49AUxw.js";import"./index-CpOhgl3O.js";import"./textarea-lV7dEAoT.js";import"./wand-sparkles-DYQDT-e5.js";import"./info-CEHKLcy-.js";import"./WizardReviewStep-Cb65GSIi.js";import"./card-BatAGW1n.js";import"./input-CxKD2Tuq.js";import"./x-Dvg08-Qr.js";import"./scroll-area-DgjLycD3.js";import"./refresh-cw-CgXgkKXK.js";import"./plus-BL-p06En.js";import"./search-DqpLRdKV.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
