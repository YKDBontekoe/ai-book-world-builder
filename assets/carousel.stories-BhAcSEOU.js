import{j as e}from"./utils-7sxzoe8d.js";import{C as l,d as o}from"./card-4sBKZUiQ.js";import{C as t,a as m,b as i,c,d}from"./carousel-5W9bjF7J.js";import"./iframe-BXPUxhQJ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-CdqZhgXS.js";import"./button-egBPX6tA.js";import"./index-da7Mk42a.js";import"./createLucideIcon-B9-RP8qa.js";const y={title:"UI/Carousel",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[s=>e.jsx("div",{className:"w-[400px]",children:e.jsx(s,{})})]},r={render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(m,{children:Array.from({length:5}).map((x,a)=>e.jsx(i,{children:e.jsx("div",{className:"p-1",children:e.jsx(l,{children:e.jsx(o,{className:"flex aspect-square items-center justify-center p-6",children:e.jsx("span",{className:"text-4xl font-semibold",children:a+1})})})})},a))}),e.jsx(c,{}),e.jsx(d,{})]})},n={args:{orientation:"vertical",opts:{align:"start"}},render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(m,{className:"-mt-1 h-[200px]",children:Array.from({length:5}).map((x,a)=>e.jsx(i,{className:"pt-1 md:basis-1/2",children:e.jsx("div",{className:"p-1",children:e.jsx(l,{children:e.jsx(o,{className:"flex items-center justify-center p-6",children:e.jsx("span",{className:"text-3xl font-semibold",children:a+1})})})})},a))}),e.jsx(c,{}),e.jsx(d,{})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => <Carousel className="w-full max-w-xs" {...args}>
            <CarouselContent>
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
}`,...n.parameters?.docs?.source}}};const w=["Default","OrientationVertical"];export{r as Default,n as OrientationVertical,w as __namedExportsOrder,y as default};
