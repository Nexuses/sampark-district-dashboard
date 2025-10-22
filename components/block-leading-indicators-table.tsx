"use client"

import { useMemo, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHeader } from "@/components/ui/sortable-table-header"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { useTable } from "@/hooks/use-table"
import { exportToCSV } from "@/lib/table-utils"
import type { LeadingIndicator as BlockLeading, DataInsightsResponse } from "@/lib/types"

type Props = {
  items: BlockLeading[]
  titleSuffix?: string
  criteria: DataInsightsResponse["data"]["leadingIndicatorsGreenCriteria"]
}

export function BlockLeadingIndicatorsTable({ items, titleSuffix, criteria }: Props) {
  const [search, setSearch] = useState("")
  const [visibleColumns, setVisibleColumns] = useState({
    diseCode: true,
    lastSyncDays: true,
    lessonsPerMonth: true,
    dailyUsageMin: true,
    teachersTrained: true,
  })

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

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mapped
    return mapped.filter((r) => r.schoolName.toLowerCase().includes(q) || r.diseCode.toLowerCase().includes(q))
  }, [mapped, search])

  const {
    paginatedData,
    sortedData,
    page,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
    sortConfig,
    handleSort,
    resetPagination,
  } = useTable({
    data: filteredData,
    initialPageSize: 25,
    initialSort: null,
  })

  // Reset to first page when search changes
  useMemo(() => {
    resetPagination()
  }, [search, resetPagination])

  const handleExport = useCallback(() => {
    const exportData = sortedData.map((row) => ({
      "DISE Code": row.diseCode,
      "School Name": row.schoolName,
      "Last Sync Days": row.lastSyncDays === "" ? "NA" : row.lastSyncDays,
      "Lessons Taught/Month": row.lessonsPerMonth === "" ? "NA" : row.lessonsPerMonth,
      "Daily Usage (min)": row.dailyUsageMin === "" ? "NA" : row.dailyUsageMin,
      "Teachers Trained": row.teachersTrained === "" ? "NA" : row.teachersTrained,
    }))
    exportToCSV(exportData, `block-leading-indicators-${new Date().toISOString().split("T")[0]}`)
  }, [sortedData])

  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [columnId]: visible }))
  }, [])

  const columns = [
    { id: "diseCode", label: "DISE Code", visible: visibleColumns.diseCode },
    { id: "lastSyncDays", label: "Last Sync Days", visible: visibleColumns.lastSyncDays },
    { id: "lessonsPerMonth", label: "Lessons Taught/Month", visible: visibleColumns.lessonsPerMonth },
    { id: "dailyUsageMin", label: "Daily Usage (min)", visible: visibleColumns.dailyUsageMin },
    { id: "teachersTrained", label: "Teachers Trained", visible: visibleColumns.teachersTrained },
  ]

  const renderCell = (key: string, value: string | number) => {
    const v = value
    let cls = "bg-muted/20 text-foreground border border-border"

    if (v !== "") {
      const n = Number(v)
      if (Number.isFinite(n)) {
        switch (key) {
          case "lastSyncDays":
            cls = n <= criteria.lastSyncDays ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30"
            break
          case "lessonsPerMonth":
            cls = n >= criteria.lessonsPerMonthPerDevice ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30"
            break
          case "dailyUsageMin":
            cls = n >= criteria.usageInMinutesPerDay ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30"
            break
          case "teachersTrained":
            cls = n >= criteria.trainedTeachers ? "bg-success/20 text-black border border-success/30" : "bg-warning/20 text-black border border-warning/30"
            break
        }
      }
    }

    return (
      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-medium ${cls}`}>
        {v === "" ? "NA" : v}
      </span>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-primary rounded-full" />
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Leading Indicators (2025-26){titleSuffix ? ` - ${titleSuffix}` : ""}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">School-level metrics</p>
        </div>
      </div>

      <Card className="border-border bg-card p-4 md:p-6">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search schools or DISE code..."
          columns={columns}
          onColumnVisibilityChange={toggleColumnVisibility}
          onExport={handleExport}
          totalResults={mapped.length}
          filteredResults={filteredData.length}
        />

        <div className="mt-6 overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="border-b border-border">
                  {visibleColumns.diseCode && (
                    <SortableTableHeader
                      label="DISE Code"
                      sortKey="diseCode"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="left"
                      className="sticky left-0 bg-card z-10"
                    />
                  )}
                  <SortableTableHeader
                    label="School Name"
                    sortKey="schoolName"
                    currentSortKey={sortConfig?.key}
                    currentSortDirection={sortConfig?.direction}
                    onSort={handleSort}
                    align="left"
                  />
                  {visibleColumns.lastSyncDays && (
                    <SortableTableHeader
                      label="Last Sync Days"
                      sortKey="lastSyncDays"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.lessonsPerMonth && (
                    <SortableTableHeader
                      label="Lessons Taught/Month"
                      sortKey="lessonsPerMonth"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.dailyUsageMin && (
                    <SortableTableHeader
                      label="Daily Usage (min)"
                      sortKey="dailyUsageMin"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.teachersTrained && (
                    <SortableTableHeader
                      label="Teachers Trained"
                      sortKey="teachersTrained"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <TableEmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-primary/10 group transition-colors">
                      {visibleColumns.diseCode && (
                        <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-transparent z-10 whitespace-nowrap">
                          {row.diseCode}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{row.schoolName}</td>
                      {visibleColumns.lastSyncDays && (
                        <td className="px-4 py-3 text-center text-sm text-foreground">
                          {renderCell("lastSyncDays", row.lastSyncDays)}
                        </td>
                      )}
                      {visibleColumns.lessonsPerMonth && (
                        <td className="px-4 py-3 text-center text-sm text-foreground">
                          {renderCell("lessonsPerMonth", row.lessonsPerMonth)}
                        </td>
                      )}
                      {visibleColumns.dailyUsageMin && (
                        <td className="px-4 py-3 text-center text-sm text-foreground">
                          {renderCell("dailyUsageMin", row.dailyUsageMin)}
                        </td>
                      )}
                      {visibleColumns.teachersTrained && (
                        <td className="px-4 py-3 text-center text-sm text-foreground">
                          {renderCell("teachersTrained", row.teachersTrained)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {paginatedData.length > 0 && (
          <div className="mt-6">
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalItems={filteredData.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </Card>
    </section>
  )
}
