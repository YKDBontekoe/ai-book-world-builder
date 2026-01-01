import{j as e}from"./jsx-runtime-qYsGxdCn.js";import{r as a}from"./iframe-DgWAtHA5.js";import{B as i}from"./button-DjJ8Vzqf.js";import{C as t,a as p,b as m}from"./collapsible-C39lqQ5A.js";import{c as l}from"./createLucideIcon-tZ9J9ef4.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B5stgNyu.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./index-Dc_FVRD7.js";import"./index-BCFK3JKf.js";import"./index-8Kb12gA3.js";import"./index-Blrm11BC.js";import"./index-Ch3N86xd.js";import"./index-DVeLGuu0.js";import"./index-CJ1kvovU.js";import"./index-Cl13qY8u.js";const d=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],c=l("chevrons-up-down",d),S={title:"Design System/Atoms/Collapsible",component:t,tags:["autodocs"],parameters:{layout:"centered"}},s={render:o=>{const[r,n]=a.useState(!1);return e.jsxs(t,{open:r,onOpenChange:n,className:"w-[350px] space-y-2",...o,children:[e.jsxs("div",{className:"flex items-center justify-between space-x-4 px-4",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"@peduarte starred 3 repositories"}),e.jsx(p,{asChild:!0,children:e.jsxs(i,{variant:"ghost",size:"sm",className:"w-9 p-0",children:[e.jsx(c,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Toggle"})]})})]}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/primitives"}),e.jsxs(m,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@radix-ui/colors"}),e.jsx("div",{className:"rounded-md border px-4 py-3 font-mono text-sm",children:"@stitches/react"})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
