import{j as e}from"./jsx-runtime-Bm5EMGcn.js";import{C as o,d as l}from"./card-BRzpnpJy.js";import{C as t,a as i,b as m,c,d}from"./carousel-yfO3Vk16.js";import"./iframe-JtlKyfFV.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./button-Ais7jSyn.js";import"./index-CUx2g0Z3.js";import"./createLucideIcon-7D6wQpt_.js";const b={title:"Design System/Atoms/Carousel",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[s=>e.jsx("div",{className:"w-[400px]",children:e.jsx(s,{})})]},r={render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(i,{children:Array.from({length:5}).map((x,a)=>e.jsx(m,{children:e.jsx("div",{className:"p-1",children:e.jsx(o,{children:e.jsx(l,{className:"flex aspect-square items-center justify-center p-6",children:e.jsx("span",{className:"text-4xl font-semibold",children:a+1})})})})},a))}),e.jsx(c,{}),e.jsx(d,{})]})},n={args:{orientation:"vertical",opts:{align:"start"}},render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(i,{className:"-mt-1 h-[200px]",children:Array.from({length:5}).map((x,a)=>e.jsx(m,{className:"pt-1 md:basis-1/2",children:e.jsx("div",{className:"p-1",children:e.jsx(o,{children:e.jsx(l,{className:"flex items-center justify-center p-6",children:e.jsx("span",{className:"text-3xl font-semibold",children:a+1})})})})},a))}),e.jsx(c,{}),e.jsx(d,{})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => <Carousel className="w-full max-w-xs" {...args}>
            <CarouselContent>
                {/* biome-ignore lint/suspicious/noArrayIndexKey: Static storybook example */}
                {Array.from({
        length: 5
      }).map((_, index) => <CarouselItem key={index}>
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    opts: {
      align: "start"
    }
  },
  render: args => <Carousel className="w-full max-w-xs" {...args}>
            <CarouselContent className="-mt-1 h-[200px]">
                {/* biome-ignore lint/suspicious/noArrayIndexKey: Static storybook example */}
                {Array.from({
        length: 5
      }).map((_, index) => <CarouselItem key={index} className="pt-1 md:basis-1/2">
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex items-center justify-center p-6">
                                    <span className="text-3xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
}`,...n.parameters?.docs?.source}}};const w=["Default","OrientationVertical"];export{r as Default,n as OrientationVertical,w as __namedExportsOrder,b as default};
