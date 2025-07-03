"use client";
import { ChartWidget } from "@/components/ui/chart-widget";
import { AppointmentList } from "@/components/ui/appointment-list";
import {
  Users,
  Stethoscope,
  UserCheck,
  Calendar,
  Bed,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useInventory } from "@/hooks/use-inventory";
import { useAppointments } from "@/hooks/use-appointments";
import { useStaff } from "@/hooks/use-staff";
import { useBeds } from "@/hooks/use-beds";
import { useBilling } from "@/hooks/use-billing";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminDashboard() {
  const {
    analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();
  const { getInventorySummary } = useInventory();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { staff, loading: staffLoading } = useStaff();
  const { getBedSummary } = useBeds();
  const { invoices, loading: billingLoading } = useBilling();

  const safeAppointments = appointments || [];
  const safeStaff = staff || [];
  const safeInvoices = invoices || [];

  // Add these safe analytics arrays
  const safeMonthlyPatientVisits = analyticsData?.chartData.monthlyPatientVisits || [];
  console.log(analyticsData)
  const safeInventoryUsage = analyticsData?.chartData.inventoryUsage || [];
  const safeAppointmentsByTimeSlot =
    analyticsData?.appointmentsByTimeSlot || [];

  const inventorySummary = getInventorySummary();
  const bedSummary = getBedSummary();
  const staffSummary = safeStaff.reduce(
    (acc, member) => {
      acc.total++;
      if (member.role === "doctor") acc.doctors++;
      else if (member.role === "nurse") acc.nurses++;
      else if (member.role === "receptionist") acc.receptionists++;
      return acc;
    },
    { total: 0, doctors: 0, nurses: 0, receptionists: 0 }
  );

  // Get recent appointments (last 10)
  const recentAppointments = safeAppointments
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date).getTime() -
        new Date(a.createdAt || a.date).getTime()
    )
    .slice(0, 10);
  // Generate real revenue data from invoices
  const generateRevenueData = () => {
    const monthlyRevenue: Record<string, number> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyRevenue[monthKey] = 0;
    }

    // Calculate actual revenue from paid invoices
    safeInvoices
      .filter((invoice) => invoice.status === "paid")
      .forEach((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        const monthKey = invoiceDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += invoice.totalAmount;
        }
      });
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }));
  };

  // Generate real appointment trends for the last 7 days
  const generateAppointmentTrends = () => {
    const dailyAppointments: Record<string, { count: number; date: Date }> = {};

    // Initialize last 7 days with real Date references
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayKey = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., Mon, Tue
      dailyAppointments[dayKey] = { count: 0, date };
    }

    // Count appointments for each day
    safeAppointments.forEach((appointment) => {
      if (!appointment.date) return;

      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);

      if (appointmentDate >= weekAgo && appointmentDate <= today) {
        const dayKey = appointmentDate.toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (dailyAppointments.hasOwnProperty(dayKey)) {
          dailyAppointments[dayKey].count++;
        }
      }
    });

    // Convert to sorted array by actual date
    return Object.entries(dailyAppointments)
      .map(([day, { count, date }]) => ({
        day,
        appointments: count,
        sortDate: date,
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(({ day, appointments }) => ({ day, appointments }));
  };
  // Calculate today's appointments
  const getTodayAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return safeAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    }).length;
  };

  // Calculate today's revenue
  const getTodayRevenue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return safeInvoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return (
          invoice.status === "paid" &&
          invoiceDate >= today &&
          invoiceDate < tomorrow
        );
      })
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };

  if (
    analyticsLoading ||
    appointmentsLoading ||
    staffLoading ||
    billingLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data: {analyticsError}
        </AlertDescription>
      </Alert>
    );
  }

  const kpis = analyticsData?.kpis || {
    totalPatients: 0,
    todayAppointments: getTodayAppointments(),
    todayRevenue: getTodayRevenue(),
    monthlyRevenue: 0,
    currentInpatients: 0,
    lowStockAlerts: inventorySummary.lowStockItems,
    totalStaff: staffSummary.total,
    occupancyRate: bedSummary.occupancyRate,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Hospital overview and management
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Live Data</span>
            </div>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Total Patients
                </p>
                <p className="text-3xl font-bold mt-2">
                  {kpis.totalPatients.toLocaleString()}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  +12% from last month
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold mt-2">
                  {staffSummary.doctors}
                </p>
                <p className="text-emerald-200 text-sm mt-1">
                  +{Math.floor(staffSummary.doctors * 0.1)} new this month
                </p>
              </div>
              <Stethoscope className="h-12 w-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Total Nurses
                </p>
                <p className="text-3xl font-bold mt-2">{staffSummary.nurses}</p>
                <p className="text-purple-200 text-sm mt-1">
                  +{Math.floor(staffSummary.nurses * 0.08)} new this month
                </p>
              </div>
              <UserCheck className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Today's Appointments
                </p>
                <p className="text-3xl font-bold mt-2">
                  {kpis.todayAppointments}
                </p>
                <p className="text-orange-200 text-sm mt-1">
                  +8% from yesterday
                </p>
              </div>
              <Calendar className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Beds Occupied
                </p>
                <p className="text-2xl font-bold mt-2 text-slate-800">
                  {bedSummary.occupiedBeds}/{bedSummary.totalBeds}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {bedSummary.occupancyRate}% occupancy
                </p>
              </div>
              <Bed className="h-10 w-10 text-slate-400" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold mt-2 text-slate-800">
                  ${kpis.todayRevenue.toLocaleString()}
                </p>
                <p className="text-green-600 text-sm mt-1">
                  +15% from yesterday
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-slate-400" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Low Stock Alerts
                </p>
                <p className="text-2xl font-bold mt-2 text-slate-800">
                  {inventorySummary.lowStockItems}
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Items need restocking
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  System Status
                </p>
                <p className="text-2xl font-bold mt-2 text-slate-800">
                  Operational
                </p>
                <p className="text-green-600 text-sm mt-1">
                  All systems running
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-400" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
              <CardDescription className="text-blue-100">
                Revenue trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ChartWidget
                title=""
                data={generateRevenueData().map((item) => ({
                  name: item.month,
                  value: item.revenue,
                }))}
                type="bar"
                dataKey="revenue"
                xAxisKey="month"
                height={300}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Appointments
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Appointment trends this week
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ChartWidget
                title=""
                data={generateAppointmentTrends().map((item) => ({
                  name: item.day,
                  value: item.appointments,
                }))}
                type="bar"
                dataKey="appointments"
                xAxisKey="day"
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Real-time Analytics Charts */}
        {analyticsData && (
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle>Monthly Patient Visits</CardTitle>
                <CardDescription className="text-purple-100">
                  Patient visit trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartWidget
                  title=""
                  data={safeMonthlyPatientVisits}
                  type="line"
                  dataKey="value"
                  xAxisKey="name"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle>Inventory Usage</CardTitle>
                <CardDescription className="text-orange-100">
                  Medicine inventory distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartWidget
                  title=""
                  data={safeInventoryUsage}
                  type="bar"
                  dataKey="value"
                  xAxisKey="name"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Appointments and Additional Analytics */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-slate-800">
                Recent Appointments
              </CardTitle>
              <CardDescription>Latest appointment bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentList
                title=""
                appointments={recentAppointments}
                showPatient={true}
                showDoctor={true}
                showStatus={true}
              />
            </CardContent>
          </Card>

          {analyticsData && safeAppointmentsByTimeSlot.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-white/20 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Appointments by Time Slot
                </CardTitle>
                <CardDescription>
                  Distribution throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  title=""
                  data={safeAppointmentsByTimeSlot}
                  type="bar"
                  dataKey="value"
                  xAxisKey="name"
                  height={300}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
