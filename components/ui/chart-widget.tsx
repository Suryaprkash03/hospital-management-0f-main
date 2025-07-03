"use client"
import { SimpleChart } from "./simple-chart"

interface ChartWidgetProps {
  title: string
  description?: string
  data: any[]
  type: "bar" | "line" | "pie"
  dataKey: string
  xAxisKey?: string
  height?: number
}

export function ChartWidget({ title, description, data, type, dataKey, xAxisKey, height = 300 }: ChartWidgetProps) {
  // Ensure we have valid data
  const chartData = data && data.length > 0 ? data : []

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Data will appear here once available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
      )}
      <SimpleChart data={chartData} type={type} dataKey={dataKey} xAxisKey={xAxisKey} height={height} />
    </div>
  )
}
