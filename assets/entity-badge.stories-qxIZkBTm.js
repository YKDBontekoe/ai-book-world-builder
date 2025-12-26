import{j as c,c as u}from"./utils-D5Nu-l_t.js";import{c as g}from"./index-_1tKuJZU.js";import{r as f}from"./iframe-BTDh_Umq.js";import{B as v}from"./book-open-YojY6LDe.js";import{c as o}from"./createLucideIcon-CU5NqNbo.js";import{C as k}from"./calendar-Lcnmh6vX.js";import{U as x}from"./users-DwHKgRGM.js";import"./preload-helper-PPVm8Dsz.js";const b=[["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",key:"cabbwy"}],["rect",{x:"4",y:"2",width:"16",height:"20",rx:"2",key:"1uxh74"}]],M=o("building",b);const w=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],z=o("map-pin",w);const E=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],I=o("package",E),N=g("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",{variants:{type:{character:"bg-[var(--entity-character-bg)] text-[var(--entity-character)]",location:"bg-[var(--entity-location-bg)] text-[var(--entity-location)]",item:"bg-[var(--entity-item-bg)] text-[var(--entity-item)]",event:"bg-[var(--entity-event-bg)] text-[var(--entity-event)]",organization:"bg-[var(--entity-organization-bg)] text-[var(--entity-organization)]",default:"bg-muted text-muted-foreground"}},defaultVariants:{type:"default"}}),B={character:x,location:z,item:I,event:k,organization:M,default:v},_={character:"Character",location:"Location",item:"Item",event:"Event",organization:"Organization",default:"Entity"},i=f.forwardRef(({className:s,type:r="default",showIcon:l=!0,children:d,...p},m)=>{const y=B[r],h=_[r];return c.jsxs("span",{ref:m,className:u(N({type:r}),s),...p,children:[l&&c.jsx(y,{className:"h-3 w-3","aria-hidden":"true"}),d??h]})});i.displayName="EntityBadge";i.__docgenInfo={description:`A badge component for entity types with consistent colors and icons.
Used to display entity types (character, location, item, event, organization).`,methods:[],displayName:"EntityBadge",props:{type:{required:!1,tsType:{name:"union",raw:`| "character"
| "location"
| "item"
| "event"
| "organization"
| "default"`,elements:[{name:"literal",value:'"character"'},{name:"literal",value:'"location"'},{name:"literal",value:'"item"'},{name:"literal",value:'"event"'},{name:"literal",value:'"organization"'},{name:"literal",value:'"default"'}]},description:"Entity type determines color and icon",defaultValue:{value:'"default"',computed:!1}},showIcon:{required:!1,tsType:{name:"boolean"},description:"Whether to show the icon",defaultValue:{value:"true",computed:!1}}},composes:["VariantProps"]};const O={title:"UI/EntityBadge",component:i,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{type:{control:"select",options:["character","location","item","event","organization","default"]}}},e={args:{type:"default",children:"Entity Name"}},t={args:{type:"character",children:"Sherlock Holmes"}},a={args:{type:"location",children:"Baker Street"}},n={args:{type:"item",children:"Magnifying Glass",showIcon:!1}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    type: "default",
    children: "Entity Name"
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    type: "character",
    children: "Sherlock Holmes"
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    type: "location",
    children: "Baker Street"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    type: "item",
    children: "Magnifying Glass",
    showIcon: false
  }
}`,...n.parameters?.docs?.source}}};const P=["Default","Character","Location","NoIcon"];export{t as Character,e as Default,a as Location,n as NoIcon,P as __namedExportsOrder,O as default};
