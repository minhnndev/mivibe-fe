"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-neutral-300 p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#34c759] data-[state=unchecked]:bg-neutral-300 data-[size=sm]:h-5 data-[size=sm]:w-9",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        data-size={size}
        className="pointer-events-none block size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 data-[size=sm]:size-4 data-[size=sm]:data-[state=checked]:translate-x-4"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
