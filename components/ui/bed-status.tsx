import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, User, Wrench } from "lucide-react"

interface BedInfo {
  room: string
  status: "occupied" | "available" | "maintenance"
  patient?: string | null
}

interface BedStatusProps {
  beds: BedInfo[]
  className?: string
}

export function BedStatus({ beds, className }: BedStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-red-100 text-red-800"
      case "available":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "occupied":
        return <User className="h-3 w-3" />
      case "maintenance":
        return <Wrench className="h-3 w-3" />
      default:
        return <Bed className="h-3 w-3" />
    }
  }

  const occupiedBeds = beds.filter((bed) => bed.status === "occupied").length
  const availableBeds = beds.filter((bed) => bed.status === "available").length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bed Status</CardTitle>
        <CardDescription>
          {occupiedBeds} occupied • {availableBeds} available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {beds.map((bed) => (
            <div key={bed.room} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{bed.room}</span>
                <Badge className={getStatusColor(bed.status)}>
                  {getStatusIcon(bed.status)}
                  <span className="ml-1 capitalize">{bed.status}</span>
                </Badge>
              </div>
              {bed.patient && <div className="text-xs text-muted-foreground">{bed.patient}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
