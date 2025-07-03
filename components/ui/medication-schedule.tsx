import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Pill, Check } from "lucide-react"

interface MedicationItem {
  patient: string
  medication: string
  time: string
  status: "completed" | "pending" | "scheduled"
}

interface MedicationScheduleProps {
  medications: MedicationItem[]
  className?: string
}

export function MedicationSchedule({ medications, className }: MedicationScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      default:
        return <Pill className="h-3 w-3" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Medication Schedule</CardTitle>
        <CardDescription>{medications.length} medications scheduled</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {medications.map((med, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Pill className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{med.patient}</div>
                  <div className="text-sm text-muted-foreground">{med.medication}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {med.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(med.status)}>
                  {getStatusIcon(med.status)}
                  <span className="ml-1 capitalize">{med.status}</span>
                </Badge>
                {med.status === "pending" && (
                  <Button size="sm" variant="outline">
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
