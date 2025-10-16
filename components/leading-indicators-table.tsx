"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { DWLeadingIndicator, DWDistrictWiseResponse } from "@/lib/types"
type Props = {
  items: DWLeadingIndicator[]
  criteria: DWDistrictWiseResponse["data"]["leadingIndicatorsGreenCriteria"]
  titleSuffix?: string
  onRowClick?: (item: { id?: string; name: string }) => void
}

// Rendering is neutral; we do not color by thresholds for API-driven values.

export function LeadingIndicatorsTable({ items, criteria, titleSuffix, onRowClick }: Props) {
  const [search, setSearch] = useState("")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  
  const mapped = useMemo(() => {
    return (items || []).map((it) => {
      const valueOrEmpty = (v: unknown): string | number => {
        if (v === undefined || v === null || v === "NA") return ""
        if (typeof v === "string" || typeof v === "number") return v
        return String(v)
      }
      return {
        id: (it as any)?.id as string | undefined,
        district: it.name || "",
        teacherAcceptance: valueOrEmpty(it.teacherFeedback?.rating),
        lessonsTaught: valueOrEmpty(it.usage_per_school),
        activeSchools: valueOrEmpty((it as any)?.stvUtilization),
        dailyUsage: valueOrEmpty(it.usage_in_minutes_per_day),
        teachersTrained: valueOrEmpty(it.trainedTeachers),
        smartSchools: valueOrEmpty(it.smartSchools),
      }
    })
  }, [items])

  //

  const filteredData = useMemo(() => {
    return mapped.filter((row) => {
      const matchesSearch = row.district.toLowerCase().includes(search.toLowerCase())
      const numericDaily = Number(row.dailyUsage)
      const hasNumber = Number.isFinite(numericDaily)
      if (performanceFilter === "high") {
        return matchesSearch && hasNumber && numericDaily >= criteria.usage_in_minutes_per_day
      }
      if (performanceFilter === "medium") {
        return matchesSearch && hasNumber && numericDaily < criteria.usage_in_minutes_per_day && numericDaily >= criteria.usage_in_minutes_per_day / 2
      }
      if (performanceFilter === "low") {
        return matchesSearch && hasNumber && numericDaily < criteria.usage_in_minutes_per_day / 2
      }
      return matchesSearch
    })
  }, [mapped, search, performanceFilter, criteria])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Leading Indicators (2025-26){titleSuffix ? ` - ${titleSuffix}` : ""}</h2>
          <p className="text-sm text-muted-foreground mt-1">Average per school in the last 30 days</p>
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
              <SelectItem value="high">High (≥70%)</SelectItem>
              <SelectItem value="medium">Medium (50-69%)</SelectItem>
              <SelectItem value="low">Low (&lt;50%)</SelectItem>
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Teacher Acceptance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Lessons Taught/Month</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Active Schools %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Daily Usage (min)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"># Teachers Trained</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"># Smart Schools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-primary/10 group transition-colors ${
                      onRowClick && row.district !== "State Average/Total" && row.district !== "District Average/Total" ? "cursor-pointer" : ""
                    } ${
                      row.district === "Block Averages" || row.district === "State Average/Total" || row.district === "District Average/Total"
                        ? "bg-primary/5 font-medium"
                        : ""
                    }`}
                    onClick={() => {
                      if (onRowClick && row.district !== "State Average/Total" && row.district !== "District Average/Total") onRowClick({ id: (row as any).id, name: row.district })
                    }}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-transparent transition-colors z-10 whitespace-nowrap">
                      {row.district}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const v = row.teacherAcceptance
                        const n = Number(v)
                        const isNum = Number.isFinite(n)
                        const cls = row.district === "State Average/Total"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isNum
                          ? (n >= criteria.teacherFeedback ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30")
                          : "bg-muted/20 text-foreground border border-border"
                        return (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
                            {v === "" ? "NA" : v}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const v = row.lessonsTaught
                        const n = Number(v)
                        const isNum = Number.isFinite(n)
                        const cls = row.district === "State Average/Total"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isNum
                          ? (n >= criteria.usage_per_school ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30")
                          : "bg-muted/20 text-foreground border border-border"
                        return (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
                            {v === "" ? "NA" : v}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const v = row.activeSchools
                        const n = Number(v)
                        const isNum = Number.isFinite(n)
                        const cls = row.district === "State Average/Total"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isNum
                          ? (n >= criteria.stvUtilization ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30")
                          : "bg-muted/20 text-foreground border border-border"
                        return (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
                            {v === "" ? "NA" : v}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const v = row.dailyUsage
                        const n = Number(v)
                        const isNum = Number.isFinite(n)
                        const cls = row.district === "State Average/Total"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isNum
                          ? (n >= criteria.usage_in_minutes_per_day ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30")
                          : "bg-muted/20 text-foreground border border-border"
                        return (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
                            {v === "" ? "NA" : v}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium bg-muted/20 text-foreground border border-border">
                        {row.teachersTrained === "" ? "NA" : (typeof row.teachersTrained === "number" ? row.teachersTrained.toLocaleString() : row.teachersTrained)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium bg-muted/20 text-foreground border border-border">{row.smartSchools === "" ? "NA" : row.smartSchools}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Notes:</p>
            <p>Lessons Taught/Month: Average per school in the last 30 days</p>
            <p>
              Active Schools %: % of schools that have taught more than 4 lessons in the last 30 days, showing good
              usage of Sampark TV device
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
