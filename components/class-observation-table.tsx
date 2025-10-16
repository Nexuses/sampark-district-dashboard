"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { DWDistrictWiseResponse } from "@/lib/types"
type Props = {
  items: DWDistrictWiseResponse["data"]["leadingIndicators"]
}

function getPerformanceColor(value: number, stateAverage: number): string {
  if (value > stateAverage) {
    return "bg-success/20 text-black border border-success/30"
  } else if (value < stateAverage) {
    return "bg-error/20 text-black border border-error/30"
  }
  return "bg-warning/20 text-black border border-warning/30"
}

export function ClassObservationTable({ items }: Props) {
  const [search, setSearch] = useState("")
  const [performanceFilter, setPerformanceFilter] = useState("all")

  const mapped = useMemo(() => {
    return (items || []).map((it) => {
      const ca = it.continuousAssessment || ({} as any)
      const childrenAssessed = typeof ca.childrenAssessed === "number" ? ca.childrenAssessed : Number(ca.childrenAssessed || 0)
      const grade = typeof ca.childrenAboveAverage === "number" ? ca.childrenAboveAverage : parseFloat((ca.childrenAboveAverage || "").toString())
      return {
        district: it.name || "",
        childrenAssessed: Number.isFinite(childrenAssessed) ? childrenAssessed : 0,
        gradeAppropriate: Number.isFinite(grade) ? grade : 0,
      }
    })
  }, [items])

  const stateAverage = useMemo(() => {
    const stateRow = mapped.find((r) => r.district === "State Average/Total")
    return stateRow ? stateRow.gradeAppropriate : 0
  }, [mapped])

  const filteredData = useMemo(() => {
    return mapped.filter((row) => {
      const matchesSearch = row.district.toLowerCase().includes(search.toLowerCase())
      if (performanceFilter === "high") {
        return matchesSearch && row.gradeAppropriate >= stateAverage
      }
      if (performanceFilter === "medium") {
        return matchesSearch && row.gradeAppropriate < stateAverage && row.gradeAppropriate >= stateAverage * 0.75
      }
      if (performanceFilter === "low") {
        return matchesSearch && row.gradeAppropriate < stateAverage * 0.75
      }
      return matchesSearch
    })
  }, [mapped, search, performanceFilter, stateAverage])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Class Observation (2025-26)</h2>
          <p className="text-sm text-muted-foreground mt-1">% of grade appropriate learners</p>
        </div>
      </div>

      <Card className="border-border bg-card p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-background border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by performance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Performance</SelectItem>
              <SelectItem value="high">High (≥50%)</SelectItem>
              <SelectItem value="medium">Medium (40-49%)</SelectItem>
              <SelectItem value="low">Low (&lt;40%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10">
                    District
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Children Assessed
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    % of Grade Appropriate Learners
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-muted/50 transition-colors ${
                      row.district === "State Average/Total" ? "bg-primary/5 font-medium" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-card z-10 whitespace-nowrap">
                      {row.district}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      {row.childrenAssessed.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${
                          row.district === "State Average/Total"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : row.gradeAppropriate >= stateAverage
                            ? "bg-success/20 text-black border border-success/30"
                            : "bg-error/20 text-black border border-error/30"
                        }`}
                      >
                        {row.gradeAppropriate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            This metric shows the percentage of students performing at or above their grade level based on classroom
            observations.
          </p>
        </div>
      </Card>
    </section>
  )
}
