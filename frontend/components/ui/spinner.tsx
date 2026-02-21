import { CircleNotch } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <CircleNotch
      role="status"
      aria-label="Loading"
      size={16}
      weight="bold"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
