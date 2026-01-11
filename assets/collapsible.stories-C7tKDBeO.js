import{j as e}from"./jsx-runtime-DKlPnLLt.js";import{r as a}from"./iframe-6u70a02n.js";import{B as i}from"./button-Dl8zUqn0.js";import{C as o,a as p,b as m}from"./collapsible-s712ik5I.js";import{c as l}from"./createLucideIcon-_5BFdibK.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-C7Fof1k8.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-DaXfhsmN.js";import"./index-DlFisTsK.js";import"./index-VwR34qp0.js";import"./index-CNFqL-Gw.js";import"./index-D1Ipy6Wb.js";import"./index-2yPm4_Ze.js";import"./index-tThnq_so.js";const d=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],c=l("chevrons-up-down",d),_={title:"Design System/Atoms/Collapsible",component:o,tags:["autodocs"],parameters:{layout:"centered"}},s={render:t=>{const[r,n]=a.useState(!1);return e.jsxs(o,{...t,open:r,onOpenChange:n,className:"w-[350px] space-y-2",...t,children:[e.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),e.jsx(p,{asChild:!0,children:e.jsxs(i,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[e.jsx(c,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Toggle"})]})})]}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),e.jsxs(m,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
