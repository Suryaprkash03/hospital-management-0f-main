"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText, Clock, AlertTriangle } from "lucide-react"
import type { BillingSummary } from "@/lib/types"
import { formatCurrency } from "@/lib/billing-utils"

interface BillingSummaryCardsProps {
  summary: BillingSummary
}

export function BillingSummaryCards({ summary }: BillingSummaryCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      description: `From ${summary.totalInvoices} invoices`,
      icon: DollarSign,
      trend: summary.monthlyRevenue > 0 ? "up" : "neutral",
      trendValue: formatCurrency(summary.monthlyRevenue),
      trendLabel: "This month",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(summary.todayRevenue),
      description: "Revenue generated today",
      icon: TrendingUp,
      trend: "up",
      trendValue: "",
      trendLabel: "",
    },
    {
      title: "Paid Invoices",
      value: summary.paidInvoices.toString(),
      description: `${((summary.paidInvoices / summary.totalInvoices) * 100).toFixed(1)}% of total`,
      icon: FileText,
      trend: "up",
      trendValue: "",
      trendLabel: "",
    },
    {
      title: "Pending Invoices",
      value: summary.pendingInvoices.toString(),
      description: "Awaiting payment",
      icon: Clock,
      trend: summary.pendingInvoices > 0 ? "neutral" : "up",
      trendValue: "",
      trendLabel: "",
    },
    {
      title: "Overdue Invoices",
      value: summary.overdueInvoices.toString(),
      description: "Past due date",
      icon: AlertTriangle,
      trend: summary.overdueInvoices > 0 ? "down" : "up",
      trendValue: "",
      trendLabel: "",
    },
    {
      title: "Average Invoice",
      value: formatCurrency(summary.averageInvoiceAmount),
      description: "Per invoice amount",
      icon: DollarSign,
      trend: "neutral",
      trendValue: "",
      trendLabel: "",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
            {card.trendValue && (
              <div className="flex items-center mt-2">
                {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                <span
                  className={`text-xs ${
                    card.trend === "up"
                      ? "text-green-600"
                      : card.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {card.trendValue} {card.trendLabel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
