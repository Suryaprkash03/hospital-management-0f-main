import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, AlertCircle } from "lucide-react"

interface Patient {
  id: number
  name: string
  room?: string
  condition?: string
  priority?: "high" | "medium" | "low"
  status?: string
}

interface PatientListProps {
  title: string
  patients: Patient[]
  showRoom?: boolean
  showCondition?: boolean
  showPriority?: boolean
  className?: string
}

export function PatientList({
  title,
  patients,
  showRoom = true,
  showCondition = true,
  showPriority = true,
  className,
}: PatientListProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{patients.length} patients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{patient.name}</div>
                  {showRoom && patient.room && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {patient.room}
                    </div>
                  )}
                  {showCondition && patient.condition && (
                    <div className="text-sm text-muted-foreground">{patient.condition}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showPriority && patient.priority && (
                  <Badge className={getPriorityColor(patient.priority)}>
                    {patient.priority === "high" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {patient.priority}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
