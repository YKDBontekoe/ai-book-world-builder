import{j as e,c as g}from"./utils-CzMi8qyf.js";import{c as x}from"./index-CyzXGfxu.js";import{r as S}from"./iframe-Bqr9UhCY.js";import{B as v}from"./button-BtWy7mYr.js";import{T as j,a as T,b,c as y}from"./tooltip-C8U97H43.js";import{S as o}from"./search-C7IqN0Ge.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DA7WJ5yL.js";import"./index-Dc_FVRD7.js";import"./index-BBHt8sj9.js";import"./index-BbYFnHNR.js";import"./index-BR_qko59.js";import"./index-S8GLyTb1.js";import"./index-Dtt_yPbt.js";import"./index-B3R_FQhz.js";import"./index-Bcq752Q7.js";import"./index-CecDCLm_.js";import"./index-C3ek4q37.js";import"./index-B1vSaYph.js";import"./index-SNZ0J-5t.js";import"./index-DSIy9zlZ.js";import"./createLucideIcon-CqRjrJmV.js";const z=x("inline-flex items-center justify-center transition-colors",{variants:{size:{xs:"h-6 w-6 [&_svg]:h-3 [&_svg]:w-3",sm:"h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",md:"h-10 w-10 [&_svg]:h-5 [&_svg]:w-5"}},defaultVariants:{size:"sm"}}),t=S.forwardRef(({className:i,icon:p,tooltip:n,tooltipSide:m="top",srLabel:c,size:d,variant:u="ghost",...h},f)=>{const l=e.jsxs(v,{ref:f,variant:u,className:g(z({size:d}),i),...h,children:[e.jsx(p,{"aria-hidden":"true"}),c&&e.jsx("span",{className:"sr-only",children:c})]});return n?e.jsxs(j,{children:[e.jsx(T,{asChild:!0,children:l}),e.jsx(b,{side:m,children:n})]}):l});t.displayName="IconButton";t.__docgenInfo={description:`An icon-only button component with optional tooltip.
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
