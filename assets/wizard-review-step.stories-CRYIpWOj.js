import{w as p,e as t,u as n}from"./index-Do1wm97G.js";import{W as l}from"./WizardReviewStep-Dpd8VvE6.js";import"./jsx-runtime-DRsE930w.js";import"./iframe-DAB5Pumi.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./button-DZYrieD7.js";import"./index-D3OP_GHN.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./card-DThqdhnJ.js";import"./input-BYp9uvjR.js";import"./x-CxKWsC7Q.js";import"./createLucideIcon-B0a6p038.js";import"./label-BL14MFM9.js";import"./index-CWbsfNxy.js";import"./index-JBBz1j2A.js";import"./scroll-area-CAtLokB9.js";import"./index-DoRUtFzs.js";import"./index-BdOH863e.js";import"./index-B42sZT9q.js";import"./index-C6X81oOe.js";import"./index-OK0vJ5Mh.js";import"./index-BdQq_4o_.js";import"./index-Dc_FVRD7.js";import"./textarea-D9l8uqpJ.js";import"./proxy-C0bIPX6f.js";import"./refresh-cw-BT3QmOxM.js";import"./check-B7fZLig9.js";import"./plus-Ch0KR3Bi.js";const P={title:"Features/Writer/WizardReviewStep",component:l,parameters:{layout:"centered"},args:{plan:{title:"The Crystal Key",logline:"A young girl discovers a key that unlocks a parallel universe.",summary:"In a world where magic is banned, Elara finds a crystal key...",chapters:[{title:"The Discovery",summary:"Elara finds the key in her grandmother's attic."},{title:"The Door",summary:"Elara finds the door that the key fits."},{title:"The Other Side",summary:"Elara steps through into the magical realm."}]},onUpdatePlan:()=>{},onUpdateChapter:()=>{},onDeleteChapter:()=>{},onAddChapter:()=>{},onRestart:()=>{},onCreateStory:()=>{}}},i={play:async({canvasElement:r})=>{const e=p(r);await t(e.getByLabelText("Story Title")).toHaveValue("The Crystal Key"),await t(e.getByLabelText("Logline")).toHaveValue("A young girl discovers a key that unlocks a parallel universe.");const a=e.getByLabelText("Story Title");await n.clear(a),await n.type(a,"Updated Title"),await t(a).toHaveValue("Updated Title");const s=e.getByLabelText("Chapter 1 Title");await n.clear(s),await n.type(s,"Updated Chapter 1"),await t(s).toHaveValue("Updated Chapter 1"),await t(e.getByText("Create Story")).toBeInTheDocument(),await t(e.getByText("Restart")).toBeInTheDocument(),await t(e.getByText("Add Chapter")).toBeInTheDocument()}},o={args:{plan:{title:"The Chronicles of the Eternal Empire: Rise of the Phoenix",logline:"A sprawling epic about the rise and fall of an intergalactic empire spanning thousands of years and involving complex political maneuvering.",summary:"In the year 3000, humanity has spread to the stars. The Eternal Empire rules with an iron fist... ".repeat(10),chapters:Array.from({length:10}).map((r,e)=>({title:`Chapter ${e+1}: The Beginning of the End part ${e+1}`,summary:"This is a detailed summary of the chapter events... ".repeat(5)}))}},play:async({canvasElement:r})=>{const e=p(r);await t(e.getByLabelText("Chapter 10 Title")).toBeInTheDocument();const a=e.getByLabelText("Chapter 10 Title");await n.type(a," - Edited"),await t(a).toHaveValue("Chapter 10: The Beginning of the End part 10 - Edited")}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Verify initial render
    await expect(canvas.getByLabelText("Story Title")).toHaveValue("The Crystal Key");
    await expect(canvas.getByLabelText("Logline")).toHaveValue("A young girl discovers a key that unlocks a parallel universe.");

    // Interact with title
    const titleInput = canvas.getByLabelText("Story Title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated Title");
    await expect(titleInput).toHaveValue("Updated Title");

    // Interact with chapter title
    const chapterInput = canvas.getByLabelText("Chapter 1 Title");
    await userEvent.clear(chapterInput);
    await userEvent.type(chapterInput, "Updated Chapter 1");
    await expect(chapterInput).toHaveValue("Updated Chapter 1");

    // Verify buttons exist
    await expect(canvas.getByText("Create Story")).toBeInTheDocument();
    await expect(canvas.getByText("Restart")).toBeInTheDocument();
    await expect(canvas.getByText("Add Chapter")).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    plan: {
      title: "The Chronicles of the Eternal Empire: Rise of the Phoenix",
      logline: "A sprawling epic about the rise and fall of an intergalactic empire spanning thousands of years and involving complex political maneuvering.",
      summary: "In the year 3000, humanity has spread to the stars. The Eternal Empire rules with an iron fist... ".repeat(10),
      chapters: Array.from({
        length: 10
      }).map((_, i) => ({
        title: \`Chapter \${i + 1}: The Beginning of the End part \${i + 1}\`,
        summary: "This is a detailed summary of the chapter events... ".repeat(5)
      }))
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Verify scrollable content renders
    await expect(canvas.getByLabelText("Chapter 10 Title")).toBeInTheDocument();

    // Test scrolling/interaction with bottom elements
    const lastChapterTitle = canvas.getByLabelText("Chapter 10 Title");
    await userEvent.type(lastChapterTitle, " - Edited");
    await expect(lastChapterTitle).toHaveValue("Chapter 10: The Beginning of the End part 10 - Edited");
  }
}`,...o.parameters?.docs?.source}}};const z=["Default","LongContent"];export{i as Default,o as LongContent,z as __namedExportsOrder,P as default};
