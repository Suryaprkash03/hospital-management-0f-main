interface ChartData {
  name: string
  value: number
  color?: string
}

interface SimpleChartProps {
  data: ChartData[]
  type: "bar" | "line" | "pie"
  title?: string
  height?: number
}

export function SimpleChart({ data, type, title, height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  if (type === "bar") {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="space-y-3" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600 truncate">{item.name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color || "#3B82F6",
                  }}
                >
                  <span className="text-white text-xs font-medium">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "pie") {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="grid grid-cols-2 gap-4 w-full">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <div className="text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500">
                    {item.value} ({Math.round((item.value / total) * 100)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Line chart as simple trend indicators
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex items-end justify-between gap-1 px-4" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="bg-blue-500 rounded-t"
              style={{
                height: `${(item.value / maxValue) * (height - 60)}px`,
                width: "20px",
                backgroundColor: item.color || "#3B82F6",
              }}
            />
            <div className="text-xs text-gray-600 text-center">
              <div className="truncate w-12">{item.name}</div>
              <div className="font-medium">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
