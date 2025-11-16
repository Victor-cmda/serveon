import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=checked]:shadow-md data-[state=checked]:shadow-primary/25 data-[state=unchecked]:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 dark:data-[state=unchecked]:bg-input/60 inline-flex h-[1.25rem] w-9 shrink-0 items-center rounded-full border border-transparent shadow-sm transition-all duration-200 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 hover:data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background shadow-sm dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-[1.05rem] rounded-full ring-0 transition-all duration-200 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
