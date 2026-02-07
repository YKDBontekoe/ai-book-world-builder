import{j as m}from"./jsx-runtime-CRTS2pSQ.js";import{w as l,e as i,u}from"./index-Do1wm97G.js";import{T}from"./tooltip-BTdOydwJ.js";import{S as d,a as s}from"./story-wizard-DkNPaGbl.js";import"./iframe-4EalZlLH.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DzDG0yS2.js";import"./index-XQ_9Xsl6.js";import"./index-Carj_XuS.js";import"./index-DlUX9JRt.js";import"./index-BXvuf7Bl.js";import"./index-BhcriIC7.js";import"./index-C3th7uxk.js";import"./index-BP45tq4g.js";import"./index-B_Z_1G6x.js";import"./index-GPtZgYQy.js";import"./index-BJBblE7A.js";import"./index-DhV0R46R.js";import"./index-CW-hSPb9.js";import"./index-MwyrEz0v.js";import"./action-middleware-DjbsMG_H.js";import"./query-builder-DqlqoWZ8.js";import"./db-BM4m06C0.js";import"./db-NsvaeLHo.js";import"./tslib.es6-C91NJfYC.js";import"./index-dkHIN2kG.js";import"./___vite-browser-external_commonjs-proxy-DMh1aSo_.js";import"./WizardGeneratingStep-C-xy8c9z.js";import"./proxy-BiwKmkW8.js";import"./loader-circle-DZa2Uz6u.js";import"./createLucideIcon-Brcsk5SP.js";import"./button-DJ_24-1t.js";import"./index-B_jtOnfb.js";import"./label-3_wy7dv1.js";import"./select-BEnCayA2.js";import"./chevron-down-BH6qLHxH.js";import"./check-aV1VLDAP.js";import"./index-BdQq_4o_.js";import"./index-BQnt6zPh.js";import"./index-DBOYm_Vl.js";import"./index-DROD58J0.js";import"./index-BazLPd69.js";import"./textarea-DTUsJ7aw.js";import"./wand-sparkles-rXQ70uMG.js";import"./info-DzaOe0Yg.js";import"./WizardReviewStep-BkF26VI4.js";import"./card-CwrwKfy-.js";import"./input-ClsDxVSN.js";import"./x-C0TtRA2X.js";import"./scroll-area-CTwGBX3Q.js";import"./refresh-cw-BKkPJcU8.js";import"./plus-D8rYEUDZ.js";import"./search-BgTcUMuq.js";const gt={title:"Features/Writer/StoryWizard",component:d,parameters:{layout:"fullscreen"},decorators:[r=>m.jsx(T,{children:m.jsx(r,{})})],args:{projectId:"test-project-id",onComplete:()=>console.log("Complete")}},t={},e={args:{templates:[s[0],{...s[1],label:"Custom Template",description:"This is a custom template injected via props."}]}},o={play:async({canvasElement:r})=>{const a=l(r),p=a.getByText("The Hero's Journey");await i(p).toBeInTheDocument(),await u.click(p);const n=a.getByPlaceholderText(/e.g. A cyberpunk detective/i);await i(n.value).toContain("A young farm boy discovers he is the heir");const c=a.getByText("Fantasy");await i(c).toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
