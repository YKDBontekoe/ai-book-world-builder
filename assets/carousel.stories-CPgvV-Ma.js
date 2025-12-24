import{j as e}from"./utils-D4ASBRhw.js";import{C as t,a as l,b as o,c as m,d as i}from"./carousel-B2xNjeTL.js";import{C as c,d}from"./card-DW0WRCEY.js";import"./iframe-BfvBqUT1.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Bu5TdSnw.js";import"./index-BmPtopuU.js";import"./index-qDb45jKs.js";import"./createLucideIcon-DDk6ii6k.js";const y={title:"UI/Carousel",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[s=>e.jsx("div",{className:"w-[400px]",children:e.jsx(s,{})})]},r={render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(l,{children:Array.from({length:5}).map((x,a)=>e.jsx(o,{children:e.jsx("div",{className:"p-1",children:e.jsx(c,{children:e.jsx(d,{className:"flex aspect-square items-center justify-center p-6",children:e.jsx("span",{className:"text-4xl font-semibold",children:a+1})})})})},a))}),e.jsx(m,{}),e.jsx(i,{})]})},n={args:{orientation:"vertical",opts:{align:"start"}},render:s=>e.jsxs(t,{className:"w-full max-w-xs",...s,children:[e.jsx(l,{className:"-mt-1 h-[200px]",children:Array.from({length:5}).map((x,a)=>e.jsx(o,{className:"pt-1 md:basis-1/2",children:e.jsx("div",{className:"p-1",children:e.jsx(c,{children:e.jsx(d,{className:"flex items-center justify-center p-6",children:e.jsx("span",{className:"text-3xl font-semibold",children:a+1})})})})},a))}),e.jsx(m,{}),e.jsx(i,{})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
