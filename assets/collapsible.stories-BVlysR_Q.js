import{j as e}from"./jsx-runtime-BL1G0UBN.js";import{r as a}from"./iframe-B1DPfApy.js";import{B as i}from"./button-CZHnO0Y6.js";import{C as o,a as p,b as m}from"./collapsible-DdDrOVKa.js";import{c as l}from"./createLucideIcon-D-GiPIwB.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-DCXoGaQy.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-Crc00y0D.js";import"./index-BoAQPH2g.js";import"./index-d2l5AdIB.js";import"./index-D10frT1F.js";import"./index-CY78SEpJ.js";import"./index-Ip0yYb7v.js";import"./index-DQUuw0zn.js";const d=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],c=l("chevrons-up-down",d),_={title:"Design System/Atoms/Collapsible",component:o,tags:["autodocs"],parameters:{layout:"centered"}},s={render:t=>{const[r,n]=a.useState(!1);return e.jsxs(o,{...t,open:r,onOpenChange:n,className:"w-[350px] space-y-2",...t,children:[e.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),e.jsx(p,{asChild:!0,children:e.jsxs(i,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[e.jsx(c,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Toggle"})]})})]}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),e.jsxs(m,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Collapsible {...args} open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2" {...args}>
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
}`,...s.parameters?.docs?.source}}};const E=["Default"];export{s as Default,E as __namedExportsOrder,_ as default};
