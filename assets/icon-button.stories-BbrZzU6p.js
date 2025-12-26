import{j as e,c as g}from"./utils-D5Nu-l_t.js";import{c as x}from"./index-_1tKuJZU.js";import{r as S}from"./iframe-BTDh_Umq.js";import{B as v}from"./button-BmZMEW1m.js";import{T as j,a as T,b,c as y}from"./tooltip-D4_6_-zB.js";import{S as o}from"./search-BKZO5KVO.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BzI8yaLo.js";import"./index-Dc_FVRD7.js";import"./index-BCa6MPdI.js";import"./index-Di2coAxp.js";import"./index-Bdc3FUs0.js";import"./index-V1Gm2mhc.js";import"./index-C9b-gCQb.js";import"./index-CZcFpUpR.js";import"./index-CvpRiO1k.js";import"./index-LbgGHtaQ.js";import"./index-CIIBfzgg.js";import"./index-DVm4D9gG.js";import"./index-Bke8lIlH.js";import"./index-BbPGv6-d.js";import"./createLucideIcon-CU5NqNbo.js";const z=x("inline-flex items-center justify-center transition-colors",{variants:{size:{xs:"h-6 w-6 [&_svg]:h-3 [&_svg]:w-3",sm:"h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",md:"h-10 w-10 [&_svg]:h-5 [&_svg]:w-5"}},defaultVariants:{size:"sm"}}),t=S.forwardRef(({className:i,icon:p,tooltip:n,tooltipSide:m="top",srLabel:c,size:d,variant:u="ghost",...h},f)=>{const l=e.jsxs(v,{ref:f,variant:u,className:g(z({size:d}),i),...h,children:[e.jsx(p,{"aria-hidden":"true"}),c&&e.jsx("span",{className:"sr-only",children:c})]});return n?e.jsxs(j,{children:[e.jsx(T,{asChild:!0,children:l}),e.jsx(b,{side:m,children:n})]}):l});t.displayName="IconButton";t.__docgenInfo={description:`An icon-only button component with optional tooltip.
Provides consistent sizing and accessibility for icon buttons.`,methods:[],displayName:"IconButton",props:{icon:{required:!0,tsType:{name:"ReactElementType",raw:"React.ElementType"},description:"Icon component to render"},tooltip:{required:!1,tsType:{name:"string"},description:"Optional tooltip text"},tooltipSide:{required:!1,tsType:{name:"union",raw:'"top" | "bottom" | "left" | "right"',elements:[{name:"literal",value:'"top"'},{name:"literal",value:'"bottom"'},{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:"Tooltip position",defaultValue:{value:'"top"',computed:!1}},srLabel:{required:!1,tsType:{name:"string"},description:"Screen reader label"},variant:{defaultValue:{value:'"ghost"',computed:!1},required:!1}},composes:["Omit","VariantProps"]};const J={title:"UI/IconButton",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[i=>e.jsx(y,{children:e.jsx(i,{})})]},r={args:{icon:o,"aria-label":"Search"}},a={args:{icon:o,tooltip:"Search database",srLabel:"Search"}},s={render:()=>e.jsxs("div",{className:"flex gap-4 items-center",children:[e.jsx(t,{icon:o,size:"xs",tooltip:"Extra Small"}),e.jsx(t,{icon:o,size:"sm",tooltip:"Small"}),e.jsx(t,{icon:o,size:"md",tooltip:"Medium"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Search,
    "aria-label": "Search"
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Search,
    tooltip: "Search database",
    srLabel: "Search"
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4 items-center">
            <IconButton icon={Search} size="xs" tooltip="Extra Small" />
            <IconButton icon={Search} size="sm" tooltip="Small" />
            <IconButton icon={Search} size="md" tooltip="Medium" />
        </div>
}`,...s.parameters?.docs?.source}}};const K=["Default","WithTooltip","Sizes"];export{r as Default,s as Sizes,a as WithTooltip,K as __namedExportsOrder,J as default};
