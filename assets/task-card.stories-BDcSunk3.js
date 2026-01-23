import{f as u,w as f,u as y,e as j}from"./index-Do1wm97G.js";import{j as e}from"./jsx-runtime-DkXG0dSe.js";import{B as N}from"./button-BofJMbJo.js";import{G as v}from"./glass-card-C5AhUBNT.js";import{c as t}from"./utils-CDN07tui.js";import{c as x}from"./createLucideIcon-CuyU1kur.js";import{C as b}from"./circle-alert-BYL3e4fL.js";import"./iframe-CQhYFeFS.js";import"./preload-helper-PPVm8Dsz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-C3dospmp.js";import"./index-B_jtOnfb.js";const k=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],p=x("bot",k);const _=[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M13 6h3a2 2 0 0 1 2 2v7",key:"1yeb86"}],["line",{x1:"6",x2:"6",y1:"9",y2:"21",key:"rroup"}]],w=x("git-pull-request",_);function c({item:a,onSelect:o,onFix:d,compact:s}){const g=()=>{switch(a.type){case"issue":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-orange-500",children:[e.jsx(b,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-xs font-mono",children:["#",a.data.number]})]}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:"Issue"})]}),e.jsx("h4",{className:t("font-medium text-sm mt-1",s?"line-clamp-1":"line-clamp-2"),children:a.data.title}),!s&&e.jsxs("div",{className:"flex items-center justify-between mt-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[a.data.user?.avatar_url&&e.jsx("img",{src:a.data.user.avatar_url,alt:a.data.user.login,className:"w-4 h-4 rounded-full"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:a.data.user?.login})]}),d&&e.jsxs(N,{variant:"ghost",size:"sm",onClick:h=>{h.stopPropagation(),d(a.data)},className:"h-6 px-2 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary gap-1",children:[e.jsx(p,{className:"h-3 w-3"}),"Fix"]})]})]});case"session":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-violet-500",children:[e.jsx(p,{className:"h-4 w-4"}),e.jsx("span",{className:"text-xs font-mono truncate max-w-[80px]",children:a.data.id.split("/").pop()})]}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:a.data.state.replace("STATE_","").replace("_"," ")})]}),e.jsx("h4",{className:t("font-medium text-sm mt-1",s?"line-clamp-1":"line-clamp-2"),children:a.data.title||a.data.prompt}),!s&&e.jsx("div",{className:"mt-3 text-xs text-muted-foreground",children:"Active Session"})]});case"pr":return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-blue-500",children:[e.jsx(w,{className:"h-4 w-4"}),e.jsxs("span",{className:"text-xs font-mono",children:["#",a.data.number]})]}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:"PR"})]}),e.jsx("h4",{className:t("font-medium text-sm mt-1",s?"line-clamp-1":"line-clamp-2"),children:a.data.title}),!s&&e.jsxs("div",{className:"flex items-center justify-between mt-3",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[a.data.user?.avatar_url&&e.jsx("img",{src:a.data.user.avatar_url,alt:a.data.user.login,className:"w-4 h-4 rounded-full"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:a.data.user?.login})]}),e.jsxs("div",{className:"text-[10px] px-1.5 py-0.5 rounded bg-muted",children:[a.data.base.ref," ← ",a.data.head.ref]})]})]})}};return e.jsx(v,{variant:"liquid",className:t("cursor-pointer active:scale-95 transition-transform",s?"p-2":"p-3"),onClick:()=>o(a),children:g()})}try{c.displayName="TaskCard",c.__docgenInfo={description:"",displayName:"TaskCard",props:{item:{defaultValue:null,description:"",name:"item",required:!0,type:{name:"TaskItem"}},onSelect:{defaultValue:null,description:"",name:"onSelect",required:!0,type:{name:"(item: TaskItem) => void"}},onFix:{defaultValue:null,description:"",name:"onFix",required:!1,type:{name:"((issue: GitHubIssue) => void)"}},compact:{defaultValue:null,description:"",name:"compact",required:!1,type:{name:"boolean"}}}}}catch{}const M={title:"Builder/TaskCard",component:c,parameters:{layout:"centered"},tags:["autodocs"],args:{onSelect:u(),onFix:u()}},m={number:123,title:"Fix the broken button alignment in the header",user:{login:"jules-agent",avatar_url:"https://github.com/shadcn.png"},created_at:"2023-10-25T12:00:00Z",updated_at:"2023-10-25T12:00:00Z",state:"open",html_url:"#",body:"Description",comments:0},r={args:{item:{type:"issue",data:m}},play:async({canvasElement:a,args:o})=>{const s=f(a).getByRole("button",{name:/fix/i});await y.click(s),j(o.onFix).toHaveBeenCalled()}},n={args:{item:{type:"issue",data:{...m,state:"closed",title:"Feature: Add dark mode toggle (Completed)"}}}},i={args:{item:{type:"pr",data:{...m,merged_at:null,head:{ref:"feature/dark-mode",sha:"123"},base:{ref:"main"},title:"feat: add dark mode toggle"}}}},l={args:{item:{type:"session",data:{id:"session-123",title:"Brainstorming new features",state:"STATE_RUNNING",prompt:"Help me design a new feature",createTime:"2023-10-25T12:00:00Z",updateTime:"2023-10-25T12:00:00Z",messages:[]}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    item: {
      type: "session",
      data: {
        id: "session-123",
        title: "Brainstorming new features",
        state: "STATE_RUNNING",
        prompt: "Help me design a new feature",
        createTime: "2023-10-25T12:00:00Z",
        updateTime: "2023-10-25T12:00:00Z",
        messages: []
      }
    }
  }
}`,...l.parameters?.docs?.source}}};const Z=["Issue","IssueClosed","PullRequest","Session"];export{r as Issue,n as IssueClosed,i as PullRequest,l as Session,Z as __namedExportsOrder,M as default};
