"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import type { LeadingIndicator as BlockLeading, DataInsightsResponse } from "@/lib/types"

type Props = {
  items: BlockLeading[]
  titleSuffix?: string
  criteria: DataInsightsResponse["data"]["leadingIndicatorsGreenCriteria"]
}

export function BlockLeadingIndicatorsTable({ items, titleSuffix, criteria }: Props) {
  const [search, setSearch] = useState("")

  const mapped = useMemo(() => {
    const valueOrEmpty = (v: unknown): string | number => {
      if (v === undefined || v === null || v === "NA") return ""
      if (typeof v === "string" || typeof v === "number") return v
      return String(v)
    }
    return (items || []).map((it) => ({
      diseCode: (it as any).diseCode || "",
      schoolName: it.name || "",
      lastSyncDays: valueOrEmpty((it as any).lastSyncDays),
      lessonsPerMonth: valueOrEmpty(it.lessonsPerMonthPerDevice),
      dailyUsageMin: valueOrEmpty(it.usageInMinutesPerDay),
      teachersTrained: valueOrEmpty(it.trainedTeachers),
    }))
  }, [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mapped
    return mapped.filter((r) => r.schoolName.toLowerCase().includes(q) || r.diseCode.toLowerCase().includes(q))
  }, [mapped, search])

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Leading Indicators (2025-26){titleSuffix ? ` - ${titleSuffix}` : ""}</h2>
          <p className="text-sm text-muted-foreground mt-1">School-level metrics</p>
        </div>
      </div>

      <Card className="border-border bg-card p-4 md:p-6">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10">DISE Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">School Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Last Sync Days</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Lessons Taught/Month</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Daily Usage (min)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Teachers Trained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row, idx) => (
                  <tr key={idx} className="hover:bg-primary/10 group transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-transparent z-10 whitespace-nowrap">{row.diseCode}</td>
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{row.schoolName}</td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${
                        row.lastSyncDays === "" ? "border-border bg-muted/20" :
                        Number(row.lastSyncDays) <= criteria.lastSyncDays ? "border-success/30 bg-success/20" : "border-warning/30 bg-warning/20"
                      }`}>{row.lastSyncDays === "" ? "NA" : row.lastSyncDays}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${
                        row.lessonsPerMonth === "" ? "border-border bg-muted/20" :
                        Number(row.lessonsPerMonth) >= criteria.lessonsPerMonthPerDevice ? "border-success/30 bg-success/20" : "border-warning/30 bg-warning/20"
                      }`}>{row.lessonsPerMonth === "" ? "NA" : row.lessonsPerMonth}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${
                        row.dailyUsageMin === "" ? "border-border bg-muted/20" :
                        Number(row.dailyUsageMin) >= criteria.usageInMinutesPerDay ? "border-success/30 bg-success/20" : "border-warning/30 bg-warning/20"
                      }`}>{row.dailyUsageMin === "" ? "NA" : row.dailyUsageMin}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-foreground">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md border ${
                        row.teachersTrained === "" ? "border-border bg-muted/20" :
                        Number(row.teachersTrained) >= criteria.trainedTeachers ? "border-success/30 bg-success/20" : "border-warning/30 bg-warning/20"
                      }`}>{row.teachersTrained === "" ? "NA" : row.teachersTrained}</span>
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


