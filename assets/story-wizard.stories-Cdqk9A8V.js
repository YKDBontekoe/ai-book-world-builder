import{j as m}from"./jsx-runtime-3CBL4obj.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BpGw1kGe.js";import{S as d,a as s}from"./story-wizard-DpaBZF_i.js";import"./iframe-DI7hYFKK.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DX6lDHX7.js";import"./index-BsypjDkV.js";import"./index-5CguED3x.js";import"./index-BHtpV8NL.js";import"./index-agbpOv0K.js";import"./index-DySUNkEX.js";import"./index-CrDqU0rN.js";import"./index-D_jZXnSt.js";import"./index-Dt849vrX.js";import"./index-CAsD6nR7.js";import"./index-D0T45onH.js";import"./index-DVozV4Ib.js";import"./index-g0thLw1n.js";import"./index-DO7plwiL.js";import"./action-middleware-Dr7SvY-K.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-Dj0-l14q.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-D1V7ksQg.js";import"./proxy-rtsCpKrJ.js";import"./loader-circle-DVaU8fdB.js";import"./createLucideIcon-CyzxDYpB.js";import"./button-CgZHTQf9.js";import"./index-B_jtOnfb.js";import"./label-DGENa6Zq.js";import"./select-jTx9BCRl.js";import"./chevron-down-BIrNvXP8.js";import"./check-DL6a8Oij.js";import"./index-BdQq_4o_.js";import"./index-C7dz5GgA.js";import"./index-CWjvWXQi.js";import"./index-D0ut87JN.js";import"./index-xPj7u5sD.js";import"./textarea-BVZHGNv_.js";import"./wand-sparkles-CtOolKaT.js";import"./info-BQlOs2qn.js";import"./WizardReviewStep-Dme5T533.js";import"./card-Bu1qIDtf.js";import"./input-B8PymI4X.js";import"./x-Cf4np8l1.js";import"./scroll-area-CaNK7UZb.js";import"./refresh-cw-DIWysSDa.js";import"./plus-CpKwLzm2.js";import"./search-DfRT_vga.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
