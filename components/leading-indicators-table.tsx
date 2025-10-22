"use client"

import { useState, useMemo, useCallback } from "react"
import { Info, TrendingUp, BarChart3, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHeader } from "@/components/ui/sortable-table-header"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { useTable } from "@/hooks/use-table"
import { exportToCSV } from "@/lib/table-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type { DWLeadingIndicator, DWDistrictWiseResponse } from "@/lib/types"

type Props = {
  items: DWLeadingIndicator[]
  criteria: DWDistrictWiseResponse["data"]["leadingIndicatorsGreenCriteria"]
  titleSuffix?: string
  onRowClick?: (item: { id?: string; name: string }) => void
}

export function LeadingIndicatorsTable({ items, criteria, titleSuffix, onRowClick }: Props) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState("")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState({
    teacherAcceptance: true,
    lessonsTaught: true,
    activeSchools: true,
    dailyUsage: true,
    teachersTrained: true,
    smartSchools: true,
  })

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

  // Reset to first page when search or filter changes
  useMemo(() => {
    resetPagination()
  }, [search, performanceFilter, resetPagination])

  const handleExport = useCallback(() => {
    const exportData = sortedData.map((row) => ({
      District: row.district,
      "Teacher Acceptance": row.teacherAcceptance === "" ? "NA" : row.teacherAcceptance,
      "Lessons Taught/Month": row.lessonsTaught === "" ? "NA" : row.lessonsTaught,
      "Active Schools %": row.activeSchools === "" ? "NA" : row.activeSchools,
      "Daily Usage (min)": row.dailyUsage === "" ? "NA" : row.dailyUsage,
      "# Teachers Trained": row.teachersTrained === "" ? "NA" : row.teachersTrained,
      "# Smart Schools": row.smartSchools === "" ? "NA" : row.smartSchools,
    }))
    exportToCSV(exportData, `leading-indicators-${new Date().toISOString().split("T")[0]}`)
  }, [sortedData])

  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [columnId]: visible }))
  }, [])

  const columns = [
    { id: "teacherAcceptance", label: "Teacher Acceptance", visible: visibleColumns.teacherAcceptance },
    { id: "lessonsTaught", label: "Lessons Taught/Month", visible: visibleColumns.lessonsTaught },
    { id: "activeSchools", label: "Active Schools %", visible: visibleColumns.activeSchools },
    { id: "dailyUsage", label: "Daily Usage (min)", visible: visibleColumns.dailyUsage },
    { id: "teachersTrained", label: "# Teachers Trained", visible: visibleColumns.teachersTrained },
    { id: "smartSchools", label: "# Smart Schools", visible: visibleColumns.smartSchools },
  ]

  const renderCell = (row: any, key: string, value: string | number) => {
    const v = value
    const n = Number(v)
    const isNum = Number.isFinite(n)
    let cls = ""

    if (row.district === "State Average/Total" || row.district === "District Average/Total" || row.district === "Block Averages") {
      cls = "bg-primary/10 text-primary border border-primary/20"
    } else {
      switch (key) {
        case "teacherAcceptance":
          cls = isNum
            ? n >= criteria.teacherFeedback
              ? "bg-success/20 text-black border border-success/30"
              : "bg-warning/20 text-black border border-warning/30"
            : "bg-muted/20 text-foreground border border-border"
          break
        case "lessonsTaught":
          cls = isNum
            ? n >= criteria.usage_per_school
              ? "bg-success/20 text-black border border-success/30"
              : "bg-warning/20 text-black border border-warning/30"
            : "bg-muted/20 text-foreground border border-border"
          break
        case "activeSchools":
          cls = isNum
            ? n >= criteria.stvUtilization
              ? "bg-success/20 text-black border border-success/30"
              : "bg-warning/20 text-black border border-warning/30"
            : "bg-muted/20 text-foreground border border-border"
          break
        case "dailyUsage":
          cls = isNum
            ? n >= criteria.usage_in_minutes_per_day
              ? "bg-success/20 text-black border border-success/30"
              : "bg-warning/20 text-black border border-warning/30"
            : "bg-muted/20 text-foreground border border-border"
          break
        default:
          cls = "bg-muted/20 text-foreground border border-border"
      }
    }

    const displayValue = v === "" ? "NA" : typeof v === "number" && key === "teachersTrained" ? v.toLocaleString() : v

    return (
      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium ${cls}`}>
        {displayValue}
      </span>
    )
  }

  // Mobile Card View Component
  const MobileCard = ({ row }: { row: any }) => {
    const isClickable =
      onRowClick &&
      row.district !== "State Average/Total" &&
      row.district !== "District Average/Total"

    return (
      <Card
        className={`p-4 border-border bg-card hover:shadow-md transition-all duration-200 ${
          row.district === "State Average/Total" ||
          row.district === "District Average/Total" ||
          row.district === "Block Averages"
            ? "bg-primary/5 border-primary/30"
            : ""
        } ${isClickable ? "cursor-pointer hover:border-primary/50" : ""}`}
        onClick={() => {
          if (isClickable) onRowClick({ id: (row as any).id, name: row.district })
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-foreground">{row.district}</h3>
          {isClickable && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visibleColumns.teacherAcceptance && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Teacher Acceptance</p>
              {renderCell(row, "teacherAcceptance", row.teacherAcceptance)}
            </div>
          )}
          {visibleColumns.lessonsTaught && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lessons/Month</p>
              {renderCell(row, "lessonsTaught", row.lessonsTaught)}
            </div>
          )}
          {visibleColumns.activeSchools && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Schools %</p>
              {renderCell(row, "activeSchools", row.activeSchools)}
            </div>
          )}
          {visibleColumns.dailyUsage && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily Usage</p>
              {renderCell(row, "dailyUsage", row.dailyUsage)}
            </div>
          )}
          {visibleColumns.teachersTrained && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Teachers Trained</p>
              {renderCell(row, "teachersTrained", row.teachersTrained)}
            </div>
          )}
          {visibleColumns.smartSchools && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Smart Schools</p>
              {renderCell(row, "smartSchools", row.smartSchools)}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <section>
      <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg flex-shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Leading Indicators (2025-26){titleSuffix ? ` - ${titleSuffix}` : ""}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline" />
            Average per school in the last 30 days
          </p>
        </div>
      </div>

      <Card className="border-border bg-card p-4 md:p-6">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search districts..."
          filters={[
            {
              id: "performance",
              label: "Filter by performance",
              value: performanceFilter,
              options: [
                { value: "all", label: "All Performance" },
                { value: "high", label: "High (≥70%)" },
                { value: "medium", label: "Medium (50-69%)" },
                { value: "low", label: "Low (<50%)" },
              ],
              onChange: setPerformanceFilter,
            },
          ]}
          columns={columns}
          onColumnVisibilityChange={toggleColumnVisibility}
          onExport={handleExport}
          totalResults={mapped.length}
          filteredResults={filteredData.length}
        />

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="mt-6 space-y-3">
            {paginatedData.length === 0 ? (
              <TableEmptyState />
            ) : (
              paginatedData.map((row, idx) => <MobileCard key={idx} row={row} />)
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="mt-6 overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="border-b border-border">
                    <SortableTableHeader
                      label="District"
                      sortKey="district"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="left"
                      className="sticky left-0 bg-card z-10"
                    />
                    {visibleColumns.teacherAcceptance && (
                      <SortableTableHeader
                        label="Teacher Acceptance"
                        sortKey="teacherAcceptance"
                        currentSortKey={sortConfig?.key}
                        currentSortDirection={sortConfig?.direction}
                        onSort={handleSort}
                        align="center"
                      />
                    )}
                    {visibleColumns.lessonsTaught && (
                      <SortableTableHeader
                        label="Lessons Taught/Month"
                        sortKey="lessonsTaught"
                        currentSortKey={sortConfig?.key}
                        currentSortDirection={sortConfig?.direction}
                        onSort={handleSort}
                        align="center"
                      />
                    )}
                    {visibleColumns.activeSchools && (
                      <SortableTableHeader
                        label="Active Schools %"
                        sortKey="activeSchools"
                        currentSortKey={sortConfig?.key}
                        currentSortDirection={sortConfig?.direction}
                        onSort={handleSort}
                        align="center"
                      />
                    )}
                    {visibleColumns.dailyUsage && (
                      <SortableTableHeader
                        label="Daily Usage (min)"
                        sortKey="dailyUsage"
                        currentSortKey={sortConfig?.key}
                        currentSortDirection={sortConfig?.direction}
                        onSort={handleSort}
                        align="center"
                      />
                    )}
                    {visibleColumns.teachersTrained && (
                      <SortableTableHeader
                        label="# Teachers Trained"
                        sortKey="teachersTrained"
                        currentSortKey={sortConfig?.key}
                        currentSortDirection={sortConfig?.direction}
                        onSort={handleSort}
                        align="center"
                      />
                    )}
                    {visibleColumns.smartSchools && (
                      <SortableTableHeader
                        label="# Smart Schools"
                        sortKey="smartSchools"
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
                      <td colSpan={7} className="p-0">
                        <TableEmptyState />
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-primary/10 group transition-colors ${
                          onRowClick &&
                          row.district !== "State Average/Total" &&
                          row.district !== "District Average/Total"
                            ? "cursor-pointer"
                            : ""
                        } ${
                          row.district === "Block Averages" ||
                          row.district === "State Average/Total" ||
                          row.district === "District Average/Total"
                            ? "bg-primary/5 font-medium"
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            onRowClick &&
                            row.district !== "State Average/Total" &&
                            row.district !== "District Average/Total"
                          )
                            onRowClick({ id: (row as any).id, name: row.district })
                        }}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-transparent transition-colors z-10 whitespace-nowrap">
                          {row.district}
                        </td>
                        {visibleColumns.teacherAcceptance && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "teacherAcceptance", row.teacherAcceptance)}
                          </td>
                        )}
                        {visibleColumns.lessonsTaught && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "lessonsTaught", row.lessonsTaught)}
                          </td>
                        )}
                        {visibleColumns.activeSchools && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "activeSchools", row.activeSchools)}
                          </td>
                        )}
                        {visibleColumns.dailyUsage && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "dailyUsage", row.dailyUsage)}
                          </td>
                        )}
                        {visibleColumns.teachersTrained && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "teachersTrained", row.teachersTrained)}
                          </td>
                        )}
                        {visibleColumns.smartSchools && (
                          <td className="px-4 py-3 text-center">
                            {renderCell(row, "smartSchools", row.smartSchools)}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
