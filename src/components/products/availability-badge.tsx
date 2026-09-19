import { Badge } from "@/components/ui/badge"

type AvailabilityBadgeProps = {
  isAvailable: boolean
}

export function AvailabilityBadge({ isAvailable }: AvailabilityBadgeProps) {
  return (
    <Badge variant={isAvailable ? "success" : "destructive"}>
      {isAvailable ? "Dostępny" : "Niedostępny"}
    </Badge>
  )
}
