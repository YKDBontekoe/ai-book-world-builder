import{j as r}from"./jsx-runtime-C6RcY9gk.js";import{w,u as k,e as j}from"./index-Do1wm97G.js";import{r as s}from"./iframe-CbHz4TPC.js";import{c as i}from"./utils-CDN07tui.js";import{m as L}from"./proxy-CKD5HVgg.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";function n({options:e,value:t,onChange:a,className:v,size:S="sm",layoutId:x,isLoading:b=!1,variant:o="default",ariaLabel:V}){const C=s.useId(),h=x??`segmented-control-${C}`;return r.jsx("div",{role:"group","aria-label":V,className:i("flex p-1 rounded-lg relative isolate w-fit transition-colors duration-200","glass",o==="success"&&"border border-green-500/50",o==="error"&&"border border-red-500/50",b&&"opacity-70 pointer-events-none cursor-wait",v),children:e.map(u=>{const f=u.id===t;return r.jsxs("button",{onClick:()=>a(u.id),disabled:b,className:i("relative z-10 px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",f?i("text-foreground",o==="success"&&"text-green-700 dark:text-green-400",o==="error"&&"text-red-700 dark:text-red-400"):"text-muted-foreground hover:text-foreground/80",S==="md"&&"py-2 px-4 text-base"),type:"button","aria-pressed":f,children:[f&&r.jsx(L.div,{layoutId:h,className:i("absolute inset-0 bg-background shadow-sm rounded-lg -z-10",o==="success"&&"bg-green-500/10",o==="error"&&"bg-red-500/10"),transition:{type:"spring",stiffness:400,damping:25}}),u.label]},u.id)})})}try{n.displayName="SegmentedControl",n.__docgenInfo={description:"",displayName:"SegmentedControl",props:{options:{defaultValue:null,description:"",name:"options",required:!0,type:{name:"readonly SegmentedControlOption<T>[]"}},value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(value: T) => void"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string"}},size:{defaultValue:{value:"sm"},description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'}]}},layoutId:{defaultValue:null,description:"",name:"layoutId",required:!1,type:{name:"string"}},isLoading:{defaultValue:{value:"false"},description:"",name:"isLoading",required:!1,type:{name:"boolean"}},variant:{defaultValue:{value:"default"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:'"default"'},{value:'"success"'},{value:'"error"'}]}},ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string"}}}}}catch{}const R={title:"Molecules/SegmentedControl",component:n,tags:["autodocs"],argTypes:{size:{control:{type:"select"},options:["sm","md"]},variant:{control:{type:"select"},options:["default","success","error"]},isLoading:{control:{type:"boolean"}}}},l=[{id:"daily",label:"Daily"},{id:"weekly",label:"Weekly"},{id:"monthly",label:"Monthly"},{id:"yearly",label:"Yearly"}],d={render:e=>{const[t,a]=s.useState("daily");return r.jsx(n,{...e,options:l,value:t,onChange:a})},play:async({canvasElement:e})=>{const t=w(e),a=t.getByRole("button",{name:"Weekly"});await k.click(a);const v=t.getByRole("button",{name:"Weekly"});await j(v).toHaveAttribute("aria-pressed","true")}},c={render:e=>{const[t,a]=s.useState("daily");return r.jsx(n,{...e,size:"md",options:l,value:t,onChange:a})}},m={render:e=>{const[t,a]=s.useState("login");return r.jsx(n,{...e,options:[{id:"login",label:"Login"},{id:"register",label:"Register"}],value:t,onChange:a})}},p={render:e=>{const[t,a]=s.useState("daily");return r.jsx(n,{...e,options:l,value:t,onChange:a,isLoading:!0})}},g={render:e=>{const[t,a]=s.useState("daily");return r.jsx(n,{...e,options:l,value:t,onChange:a,variant:"success"})}},y={render:e=>{const[t,a]=s.useState("daily");return r.jsx(n,{...e,options:l,value:t,onChange:a,variant:"error"})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("daily");
    return <SegmentedControl {...args} options={options} value={value} onChange={setValue} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const weeklyButton = canvas.getByRole("button", {
      name: "Weekly"
    });
    await userEvent.click(weeklyButton);
    const weeklyButtonAfter = canvas.getByRole("button", {
      name: "Weekly"
    });
    await expect(weeklyButtonAfter).toHaveAttribute("aria-pressed", "true");
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("daily");
    return <SegmentedControl {...args} size="md" options={options} value={value} onChange={setValue} />;
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("login");
    return <SegmentedControl {...args} options={[{
      id: "login",
      label: "Login"
    }, {
      id: "register",
      label: "Register"
    }]} value={value} onChange={setValue} />;
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("daily");
    return <SegmentedControl {...args} options={options} value={value} onChange={setValue} isLoading={true} />;
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("daily");
    return <SegmentedControl {...args} options={options} value={value} onChange={setValue} variant="success" />;
  }
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState("daily");
    return <SegmentedControl {...args} options={options} value={value} onChange={setValue} variant="error" />;
  }
}`,...y.parameters?.docs?.source}}};const W=["Default","Medium","TwoOptions","Loading","Success","WithError"];export{d as Default,p as Loading,c as Medium,g as Success,m as TwoOptions,y as WithError,W as __namedExportsOrder,R as default};
