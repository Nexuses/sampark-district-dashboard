"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp } from "lucide-react"

type ChartData = {
  district: string
  teacherAcceptance: number
  dailyUsage: number
  activeSchools: number
}

type Props = {
  data: ChartData[]
  maxItems?: number
}

export function PerformanceChart({ data, maxItems = 10 }: Props) {
  const chartData = useMemo(() => {
    // Filter out state average and sort by daily usage
    const filtered = data
      .filter((item) => item.district !== "State Average/Total" && item.district !== "District Average/Total")
      .sort((a, b) => b.dailyUsage - a.dailyUsage)
      .slice(0, maxItems)

    return filtered.map((item) => ({
      district: item.district.length > 15 ? item.district.substring(0, 15) + "..." : item.district,
      "Teacher Acceptance": Number(item.teacherAcceptance) || 0,
      "Daily Usage (min)": Number(item.dailyUsage) || 0,
      "Active Schools %": Number(item.activeSchools) || 0,
    }))
  }, [data, maxItems])

  if (chartData.length === 0) {
    return null
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-start gap-3 sm:gap-4 mb-6">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg flex-shrink-0">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Top Performing Districts
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline" />
            Comparison of key performance metrics across districts
          </p>
        </div>
      </div>

      <Card className="border-border bg-card p-4 sm:p-6">
        <div className="w-full h-[400px] sm:h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="district"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: "600", marginBottom: "8px" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="Teacher Acceptance"
                fill="hsl(var(--chart-1))"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="Daily Usage (min)"
                fill="hsl(var(--chart-2))"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="Active Schools %"
                fill="hsl(var(--chart-3))"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This chart shows the top {maxItems} districts sorted by daily usage.
            Higher values indicate better performance in each metric.
          </p>
        </div>
      </Card>
    </section>
  )
}
