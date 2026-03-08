import{f,w as j,u as N,e as k}from"./index-Do1wm97G.js";import{j as e}from"./jsx-runtime-vqeZ327E.js";import{B as w}from"./button-DuJSFWNQ.js";import{G as _}from"./glass-card-LNOa-GEg.js";import{c as r}from"./utils-BQHNewu7.js";import{m as C}from"./proxy-C4U5bknV.js";import{C as T}from"./check-Dsng_-xL.js";import{c as h}from"./createLucideIcon-ConE60GQ.js";import{C as I}from"./circle-alert-C5z0PvtA.js";import"./iframe-Bm-3-6Ef.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BgFtLznm.js";import"./index-LHNt3CwB.js";const S=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],g=h("bot",S);const B=[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M13 6h3a2 2 0 0 1 2 2v7",key:"1yeb86"}],["line",{x1:"6",x2:"6",y1:"9",y2:"21",key:"rroup"}]],q=h("git-pull-request",B),F=C.create(_);function m({item:a,onSelect:n,onFix:c,compact:s,isSelected:p,onToggleSelection:x}){const y=t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),n(a))},v=t=>{x&&(t.metaKey||t.ctrlKey)?(t.preventDefault(),t.stopPropagation(),x(a)):n(a)},b=()=>{switch(a.type){case"issue":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-orange-600 dark:text-orange-500",children:[e.jsx(I,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-xs font-mono font-medium opacity-80",children:["#",a.data.number]})]}),e.jsx("span",{className:"text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-full",children:"Issue"})]}),e.jsx("h4",{className:r("font-medium text-sm mt-2 leading-relaxed text-foreground/90",s?"line-clamp-1":"line-clamp-2"),children:a.data.title}),!s&&e.jsxs("div",{className:"flex items-center justify-between mt-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[a.data.user?.avatar_url&&e.jsx("img",{src:a.data.user.avatar_url,alt:a.data.user.login,className:"w-5 h-5 rounded-full ring-1 ring-background/50"}),e.jsx("span",{className:"text-xs text-muted-foreground/80 font-medium",children:a.data.user?.login})]}),c&&e.jsxs(w,{variant:"ghost",size:"sm",onClick:t=>{t.stopPropagation(),c(a.data)},className:"h-6 px-2.5 text-[10px] bg-primary/5 hover:bg-primary/10 text-primary/80 hover:text-primary gap-1.5 rounded-full transition-colors",children:[e.jsx(g,{className:"h-3 w-3"}),"Fix"]})]})]});case"session":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-violet-600 dark:text-violet-500",children:[e.jsx(g,{className:"h-4 w-4"}),e.jsx("span",{className:"text-xs font-mono font-medium opacity-80 truncate max-w-[80px]",children:a.data.id.split("/").pop()})]}),e.jsx("span",{className:"text-[10px] uppercase tracking-wider font-semibold text-violet-600/70 bg-violet-500/10 px-1.5 py-0.5 rounded-full",children:a.data.state.replace("STATE_","").replace("_"," ")})]}),e.jsx("h4",{className:r("font-medium text-sm mt-2 leading-relaxed text-foreground/90",s?"line-clamp-1":"line-clamp-2"),children:a.data.title||a.data.prompt}),!s&&e.jsxs("div",{className:"mt-3 flex items-center gap-2 text-xs text-muted-foreground",children:[e.jsxs("span",{className:"relative flex h-2 w-2",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-violet-500"})]}),"Active Session"]})]});case"pr":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-blue-600 dark:text-blue-500",children:[e.jsx(q,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-xs font-mono font-medium opacity-80",children:["#",a.data.number]})]}),e.jsx("span",{className:"text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-full",children:"PR"})]}),e.jsx("h4",{className:r("font-medium text-sm mt-2 leading-relaxed text-foreground/90",s?"line-clamp-1":"line-clamp-2"),children:a.data.title}),!s&&e.jsxs("div",{className:"flex items-center justify-between mt-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[a.data.user?.avatar_url&&e.jsx("img",{src:a.data.user.avatar_url,alt:a.data.user.login,className:"w-5 h-5 rounded-full ring-1 ring-background/50"}),e.jsx("span",{className:"text-xs text-muted-foreground/80 font-medium",children:a.data.user?.login})]}),e.jsxs("div",{className:"text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground",children:[a.data.base.ref," ← ",a.data.head.ref]})]})]})}};return e.jsxs(F,{layout:!0,initial:{opacity:0,y:10,scale:.98},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,scale:.95},transition:{type:"spring",stiffness:400,damping:25},variant:"liquid",className:r("cursor-pointer active:scale-[0.98] hover:shadow-lg hover:shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none relative",s?"p-3":"p-4",p&&"ring-2 ring-primary bg-primary/5"),onClick:v,tabIndex:0,role:"button",onKeyDown:y,children:[p&&e.jsx("div",{className:"absolute -top-1.5 -right-1.5 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm z-10 animate-in zoom-in-50 duration-200",children:e.jsx(T,{className:"h-3 w-3"})}),b()]})}try{m.displayName="TaskCard",m.__docgenInfo={description:"",displayName:"TaskCard",props:{item:{defaultValue:null,description:"",name:"item",required:!0,type:{name:"TaskItem"}},onSelect:{defaultValue:null,description:"",name:"onSelect",required:!0,type:{name:"(item: TaskItem) => void"}},onFix:{defaultValue:null,description:"",name:"onFix",required:!1,type:{name:"((issue: GitHubIssue) => void)"}},compact:{defaultValue:null,description:"",name:"compact",required:!1,type:{name:"boolean"}},isSelected:{defaultValue:null,description:"",name:"isSelected",required:!1,type:{name:"boolean"}},onToggleSelection:{defaultValue:null,description:"",name:"onToggleSelection",required:!1,type:{name:"((item: TaskItem) => void)"}}}}}catch{}const $={title:"Builder/TaskCard",component:m,parameters:{layout:"centered"},tags:["autodocs"],args:{onSelect:f(),onFix:f()}},u={number:123,title:"Fix the broken button alignment in the header",user:{login:"jules-agent",avatar_url:"https://github.com/shadcn.png"},created_at:"2023-10-25T12:00:00Z",updated_at:"2023-10-25T12:00:00Z",state:"open",html_url:"#",body:"Description",comments:0},i={args:{item:{type:"issue",data:u}},play:async({canvasElement:a,args:n})=>{const s=j(a).getByRole("button",{name:/fix/i});await N.click(s),k(n.onFix).toHaveBeenCalled()}},l={args:{item:{type:"issue",data:{...u,state:"closed",title:"Feature: Add dark mode toggle (Completed)"}}}},o={args:{item:{type:"pr",data:{...u,merged_at:null,head:{ref:"feature/dark-mode",sha:"123"},base:{ref:"main"},title:"feat: add dark mode toggle"}}}},d={args:{item:{type:"session",data:{id:"session-123",title:"Brainstorming new features",state:"IN_PROGRESS",prompt:"Help me design a new feature",createTime:"2023-10-25T12:00:00Z",updateTime:"2023-10-25T12:00:00Z",messages:[]}}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      type: "issue",
      data: baseIssue
    }
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const fixButton = canvas.getByRole("button", {
      name: /fix/i
    });
    await userEvent.click(fixButton);
    expect(args.onFix).toHaveBeenCalled();
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      type: "issue",
      data: {
        ...baseIssue,
        state: "closed",
        title: "Feature: Add dark mode toggle (Completed)"
      }
    }
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      type: "pr",
      data: {
        ...baseIssue,
        merged_at: null,
        head: {
          ref: "feature/dark-mode",
          sha: "123"
        },
        base: {
          ref: "main"
        },
        title: "feat: add dark mode toggle"
      }
    }
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      type: "session",
      data: {
        id: "session-123",
        title: "Brainstorming new features",
        state: "IN_PROGRESS",
        prompt: "Help me design a new feature",
        createTime: "2023-10-25T12:00:00Z",
        updateTime: "2023-10-25T12:00:00Z",
        messages: []
      }
    }
  }
}`,...d.parameters?.docs?.source}}};const J=["Issue","IssueClosed","PullRequest","Session"];export{i as Issue,l as IssueClosed,o as PullRequest,d as Session,J as __namedExportsOrder,$ as default};
