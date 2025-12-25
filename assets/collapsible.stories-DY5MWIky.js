import{j as e}from"./utils-D4iu72I1.js";import{r as n}from"./iframe-DiGQ4VQL.js";import{B as i}from"./button-CEpTzI9N.js";import{C as t,a as p,b as l}from"./collapsible-8uXoPIZx.js";import{c as m}from"./createLucideIcon-B-uFpxoE.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D4FQ5KSD.js";import"./index-CSurU0Gp.js";import"./index-Dc_FVRD7.js";import"./index-B2n0C2m9.js";import"./index-u8a2XBr5.js";import"./index-flljTFEo.js";import"./index-BGw5349_.js";import"./index-BPYz3fQL.js";import"./index-DcisPete.js";import"./index-BLLn6sV5.js";const d=m("ChevronsUpDown",[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]]),T={title:"UI/Collapsible",component:t,tags:["autodocs"],parameters:{layout:"centered"}},s={render:r=>{const[o,a]=n.useState(!1);return e.jsxs(t,{open:o,onOpenChange:a,className:"w-[350px] space-y-2",...r,children:[e.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),e.jsx(p,{asChild:!0,children:e.jsxs(i,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[e.jsx(d,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Toggle"})]})})]}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),e.jsxs(l,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2" {...args}>
                <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold">
                        @peduarte starred 3 repositories
                    </h4>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    @radix-ui/primitives
                </div>
                <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        @radix-ui/colors
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        @stitches/react
                    </div>
                </CollapsibleContent>
            </Collapsible>;
  }
}`,...s.parameters?.docs?.source}}};const B=["Default"];export{s as Default,B as __namedExportsOrder,T as default};
