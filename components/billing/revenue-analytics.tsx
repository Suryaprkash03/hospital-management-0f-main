"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, DollarSign, CreditCard, Building2 } from "lucide-react"
import { useBilling, usePayments } from "@/hooks/use-billing"
import { formatCurrency } from "@/lib/billing-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function RevenueAnalytics() {
  const { invoices } = useBilling()
  const { payments } = usePayments()

  // Calculate daily revenue for the last 7 days
  const getDailyRevenue = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayRevenue = invoices
        .filter((inv) => {
          const invDate = new Date(inv.invoiceDate).toISOString().split("T")[0]
          return invDate === date && inv.status === "paid"
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      return {
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        amount: dayRevenue,
      }
    })
  }

  // Calculate payment method distribution
  const getPaymentMethodDistribution = () => {
    const methodCounts = payments.reduce(
      (acc, payment) => {
        const method = payment.paymentMethod
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 }
        }
        acc[method].count += 1
        acc[method].amount += payment.amount
        return acc
      },
      {} as Record<string, { count: number; amount: number }>,
    )

    return Object.entries(methodCounts).map(([method, data]) => ({
      method: method.replace("_", " ").toUpperCase(),
      count: data.count,
      amount: data.amount,
      percentage: ((data.count / payments.length) * 100).toFixed(1),
    }))
  }

  // Calculate department revenue
  const getDepartmentRevenue = () => {
    const deptRevenue = invoices
      .filter((inv) => inv.status === "paid" && inv.department)
      .reduce(
        (acc, inv) => {
          const dept = inv.department || "Other"
          acc[dept] = (acc[dept] || 0) + inv.totalAmount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(deptRevenue)
      .map(([department, amount]) => ({ department, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }

  // Calculate monthly revenue trend
  const getMonthlyRevenue = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return {
        month: date.toISOString().slice(0, 7),
        name: date.toLocaleDateString("en-US", { month: "short" }),
      }
    }).reverse()

    return last6Months.map(({ month, name }) => {
      const monthRevenue = invoices
        .filter((inv) => {
          const invMonth = new Date(inv.invoiceDate).toISOString().slice(0, 7)
          return invMonth === month && inv.status === "paid"
        })
        .reduce((sum, inv) => sum + inv.totalAmount, 0)

      return { month: name, amount: monthRevenue }
    })
  }

  const dailyRevenue = getDailyRevenue()
  const paymentMethods = getPaymentMethodDistribution()
  const departmentRevenue = getDepartmentRevenue()
  const monthlyRevenue = getMonthlyRevenue()

  const totalRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.totalAmount, 0)

  const thisMonthRevenue = invoices
    .filter((inv) => {
      const invDate = new Date(inv.invoiceDate)
      const thisMonth = new Date()
      return (
        invDate.getMonth() === thisMonth.getMonth() &&
        invDate.getFullYear() === thisMonth.getFullYear() &&
        inv.status === "paid"
      )
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
            <p className="text-xs text-muted-foreground">Current month revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Payment transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoice</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                invoices.length > 0 ? totalRevenue / invoices.filter((inv) => inv.status === "paid").length : 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Average invoice value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
            <CardDescription>Revenue generated per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Transactions"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue trend over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Department Revenue</CardTitle>
            <CardDescription>Top performing departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentRevenue.map((dept, index) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{dept.department}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(dept.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
          <CardDescription>Detailed breakdown of payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method, index) => (
              <div key={method.method} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{method.method}</h4>
                  <Badge style={{ backgroundColor: COLORS[index % COLORS.length] }}>{method.percentage}%</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                  <p className="font-bold">{formatCurrency(method.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
