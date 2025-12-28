import{j as e}from"./jsx-runtime-DIo8mxN6.js";import{r as a}from"./iframe-CaZYac9U.js";import{B as i}from"./button-DIX6Be0b.js";import{C as t,a as p,b as m}from"./collapsible-BEOjunz5.js";import{c as l}from"./createLucideIcon-BzZuwm2t.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BCsN-gIg.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-0P4VjF1w.js";import"./index-DbmCKJ90.js";import"./index-Bh8fh9bI.js";import"./index-CSa0GPyE.js";import"./index-D4uQh_xL.js";import"./index-DI258tBo.js";import"./index-CpPyuxds.js";const d=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],c=l("chevrons-up-down",d),S={title:"Design System/Atoms/Collapsible",component:t,tags:["autodocs"],parameters:{layout:"centered"}},s={render:o=>{const[r,n]=a.useState(!1);return e.jsxs(t,{open:r,onOpenChange:n,className:"w-[350px] space-y-2",...o,children:[e.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),e.jsx(p,{asChild:!0,children:e.jsxs(i,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[e.jsx(c,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Toggle"})]})})]}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),e.jsxs(m,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const _=["Default"];export{s as Default,_ as __namedExportsOrder,S as default};
