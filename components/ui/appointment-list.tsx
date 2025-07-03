import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Appointment {
  id: string;
  startTime: string;
  patientName?: string;
  doctorName?: string;
  type?: string;
  room?: string;
  status?: string;
  location?: string;
  date?: string;
}

interface AppointmentListProps {
  title: string;
  appointments: Appointment[];
  showPatient?: boolean;
  showDoctor?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function AppointmentList({
  title,
  appointments,
  showPatient = true,
  showDoctor = true,
  showStatus = true,
  className,
}: AppointmentListProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
      case "checked-in":
        return "bg-blue-100 text-blue-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{appointments.length} appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.date
                    ? format(
                        typeof appointment.date === "string"
                          ? parseISO(appointment.date)
                          : appointment.date,
                        "dd MMM yyyy"
                      )
                    : "No date"}{" "}
                  – {appointment.startTime}
                </div>
                <div className="space-y-1">
                  {showPatient && appointment.patientName && (
                    <div className="flex items-center text-sm font-medium">
                      <User className="h-4 w-4 mr-1" />
                      {appointment.patientName}
                    </div>
                  )}
                  {showDoctor && appointment.doctorName && (
                    <div className="text-sm text-muted-foreground">
                      {appointment.doctorName}
                    </div>
                  )}
  
                </div>
              </div>
              {showStatus && appointment.status && (
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
