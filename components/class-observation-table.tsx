"use client"

import { useState, useMemo, useCallback } from "react"
import { Info, Eye, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHeader } from "@/components/ui/sortable-table-header"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { useTable } from "@/hooks/use-table"
import { exportToCSV } from "@/lib/table-utils"
import type { DWDistrictWiseResponse } from "@/lib/types"

type Props = {
  items: DWDistrictWiseResponse["data"]["leadingIndicators"]
  onRowClick?: (item: { id?: string; name: string }) => void
}

export function ClassObservationTable({ items, onRowClick }: Props) {
  const [search, setSearch] = useState("")
  const [performanceFilter, setPerformanceFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState({
    childrenAssessed: true,
    gradeAppropriate: true,
  })

  const mapped = useMemo(() => {
    return (items || []).map((it: any) => {
      const ca = it.continuousAssessment || ({} as any)
      const childrenAssessed = typeof ca.childrenAssessed === "number" ? ca.childrenAssessed : Number(ca.childrenAssessed || 0)
      const grade = typeof ca.childrenAboveAverage === "number" ? ca.childrenAboveAverage : parseFloat((ca.childrenAboveAverage || "").toString())
      return {
        id: it?.id as string | undefined,
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
      "Children Assessed": row.childrenAssessed.toLocaleString(),
      "% of Grade Appropriate Learners": `${row.gradeAppropriate.toFixed(1)}%`,
    }))
    exportToCSV(exportData, `class-observation-${new Date().toISOString().split("T")[0]}`)
  }, [sortedData])

  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [columnId]: visible }))
  }, [])

  const columns = [
    { id: "childrenAssessed", label: "Children Assessed", visible: visibleColumns.childrenAssessed },
    { id: "gradeAppropriate", label: "% of Grade Appropriate Learners", visible: visibleColumns.gradeAppropriate },
  ]

  return (
    <section>
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/10 border border-success/30 flex-shrink-0">
          <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
            Class Observation (2025-26)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline" />
            % of grade appropriate learners
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
                { value: "high", label: "High (≥50%)" },
                { value: "medium", label: "Medium (40-49%)" },
                { value: "low", label: "Low (<40%)" },
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
                  {visibleColumns.childrenAssessed && (
                    <SortableTableHeader
                      label="Children Assessed"
                      sortKey="childrenAssessed"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.gradeAppropriate && (
                    <SortableTableHeader
                      label="% of Grade Appropriate Learners"
                      sortKey="gradeAppropriate"
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
                    <td colSpan={3} className="p-0">
                      <TableEmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-primary/10 group transition-colors ${
                        row.district === "State Average/Total" || row.district === "District Average/Total"
                          ? "bg-primary/5 font-medium"
                          : ""
                      } ${
                        onRowClick &&
                        row.district !== "State Average/Total" &&
                        row.district !== "District Average/Total"
                          ? "cursor-pointer"
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
                      {visibleColumns.childrenAssessed && (
                        <td className="px-4 py-3 text-center text-sm text-foreground">
                          {Number.isFinite(row.childrenAssessed) ? row.childrenAssessed.toLocaleString() : "NA"}
                        </td>
                      )}
                      {visibleColumns.gradeAppropriate && (
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
                            {Number.isFinite(row.gradeAppropriate) ? `${row.gradeAppropriate.toFixed(1)}%` : "NA"}
                          </span>
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
