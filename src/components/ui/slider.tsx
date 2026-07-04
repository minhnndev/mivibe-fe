import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const sliderValueProps = {
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value !== undefined ? { value } : {}),
  }

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      {...sliderValueProps}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-200 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5 dark:bg-white/15"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-[#0a84ff] data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-5 shrink-0 rounded-full border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/40 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
