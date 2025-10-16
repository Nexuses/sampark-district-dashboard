"use client"

import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { DWDistrictWiseResponse } from "@/lib/types"
type Props = {
  items: DWDistrictWiseResponse["data"]["laggingIndicators2024"]
  subjects: DWDistrictWiseResponse["data"]["laggingIndicatorSubjects"]
}

function getPerformanceColor(value: number, stateAverage: number): string {
  if (value > stateAverage) {
    return "bg-success/20 text-black border border-success/30"
  } else if (value < stateAverage) {
    return "bg-error/20 text-black border border-error/30"
  }
  return "bg-warning/20 text-black border border-warning/30"
}

export function LaggingIndicatorsTable({ items, subjects }: Props) {
  const [search, setSearch] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const mapped = useMemo(() => {
    return (items || []).map((it: any) => {
      const toNum = (v: unknown): number => {
        const n = typeof v === "string" ? parseFloat(v) : (v as number)
        return Number.isFinite(n) ? (n as number) : 0
      }
      return {
        district: it.name || "",
        mathBase: toNum(it?.Math?.base_line_competence),
        mathEnd: toNum(it?.Math?.end_line_competence),
        languageBase: toNum(it?.Language?.base_line_competence),
        languageEnd: toNum(it?.Language?.end_line_competence),
      }
    })
  }, [items])

  const stateAverages = useMemo(() => {
    const stateRow = mapped.find((r) => r.district === "State Average/Total")
    return {
      mathBase: stateRow?.mathBase ?? 0,
      mathEnd: stateRow?.mathEnd ?? 0,
      languageBase: stateRow?.languageBase ?? 0,
      languageEnd: stateRow?.languageEnd ?? 0,
    }
  }, [mapped])

  const filteredData = useMemo(() => {
    return mapped.filter((row) => row.district.toLowerCase().includes(search.toLowerCase()))
  }, [mapped, search])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Lagging Indicators (2024-25)</h2>
          <p className="text-sm text-muted-foreground mt-1">% of Children achieving Base-level/End-level Competence</p>
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
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-background border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="math">Math Only</SelectItem>
              <SelectItem value="language">Language Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="border-b border-border">
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10 align-bottom"
                  >
                    District
                  </th>
                  <th
                    colSpan={2}
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border ${
                      subjectFilter === "language" ? "hidden" : ""
                    }`}
                  >
                    Math Competence
                  </th>
                  <th
                    colSpan={2}
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      subjectFilter === "math" ? "hidden" : ""
                    }`}
                  >
                    Language Competence
                  </th>
                </tr>
                <tr className="border-b border-border">
                  <th
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      subjectFilter === "language" ? "hidden" : ""
                    }`}
                  >
                    Base-level
                  </th>
                  <th
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border ${
                      subjectFilter === "language" ? "hidden" : ""
                    }`}
                  >
                    End-level
                  </th>
                  <th
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      subjectFilter === "math" ? "hidden" : ""
                    }`}
                  >
                    Base-level
                  </th>
                  <th
                    className={`px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                      subjectFilter === "math" ? "hidden" : ""
                    }`}
                  >
                    End-level
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
                    <td className={`px-4 py-3 text-center ${subjectFilter === "language" ? "hidden" : ""}`}>
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${
                          row.district === "State Average/Total"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : getPerformanceColor(row.mathBase, stateAverages.mathBase)
                        }`}
                      >
                        {row.mathBase.toFixed(1)}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-center border-r border-border ${
                        subjectFilter === "language" ? "hidden" : ""
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${
                          row.district === "State Average/Total"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : getPerformanceColor(row.mathEnd, stateAverages.mathEnd)
                        }`}
                      >
                        {row.mathEnd.toFixed(1)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center ${subjectFilter === "math" ? "hidden" : ""}`}>
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${
                          row.district === "State Average/Total"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : getPerformanceColor(row.languageBase, stateAverages.languageBase)
                        }`}
                      >
                        {row.languageBase.toFixed(1)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-center ${subjectFilter === "math" ? "hidden" : ""}`}>
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${
                          row.district === "State Average/Total"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : getPerformanceColor(row.languageEnd, stateAverages.languageEnd)
                        }`}
                      >
                        {row.languageEnd.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </section>
  )
}
