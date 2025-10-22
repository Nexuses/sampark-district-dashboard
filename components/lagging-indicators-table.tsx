"use client"

import { useState, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import { SortableTableHeader } from "@/components/ui/sortable-table-header"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { useTable } from "@/hooks/use-table"
import { exportToCSV } from "@/lib/table-utils"
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
  const [visibleColumns, setVisibleColumns] = useState({
    mathBase: true,
    mathEnd: true,
    languageBase: true,
    languageEnd: true,
  })

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
  }, [search, subjectFilter, resetPagination])

  // Update column visibility based on subject filter
  useMemo(() => {
    if (subjectFilter === "math") {
      setVisibleColumns({
        mathBase: true,
        mathEnd: true,
        languageBase: false,
        languageEnd: false,
      })
    } else if (subjectFilter === "language") {
      setVisibleColumns({
        mathBase: false,
        mathEnd: false,
        languageBase: true,
        languageEnd: true,
      })
    } else {
      setVisibleColumns({
        mathBase: true,
        mathEnd: true,
        languageBase: true,
        languageEnd: true,
      })
    }
  }, [subjectFilter])

  const handleExport = useCallback(() => {
    const exportData = sortedData.map((row) => ({
      District: row.district,
      "Math Base-level": row.mathBase.toFixed(1),
      "Math End-level": row.mathEnd.toFixed(1),
      "Language Base-level": row.languageBase.toFixed(1),
      "Language End-level": row.languageEnd.toFixed(1),
    }))
    exportToCSV(exportData, `lagging-indicators-${new Date().toISOString().split("T")[0]}`)
  }, [sortedData])

  const toggleColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns((prev) => ({ ...prev, [columnId]: visible }))
  }, [])

  const columns = [
    { id: "mathBase", label: "Math Base-level", visible: visibleColumns.mathBase },
    { id: "mathEnd", label: "Math End-level", visible: visibleColumns.mathEnd },
    { id: "languageBase", label: "Language Base-level", visible: visibleColumns.languageBase },
    { id: "languageEnd", label: "Language End-level", visible: visibleColumns.languageEnd },
  ]

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
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search districts..."
          filters={[
            {
              id: "subject",
              label: "Filter by subject",
              value: subjectFilter,
              options: [
                { value: "all", label: "All Subjects" },
                { value: "math", label: "Math Only" },
                { value: "language", label: "Language Only" },
              ],
              onChange: setSubjectFilter,
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
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-card z-10 align-bottom"
                  >
                    <button
                      onClick={() => handleSort("district")}
                      className="flex items-center gap-2 justify-start w-full hover:text-foreground transition-colors group"
                    >
                      <span>District</span>
                    </button>
                  </th>
                  {(visibleColumns.mathBase || visibleColumns.mathEnd) && (
                    <th
                      colSpan={
                        visibleColumns.mathBase && visibleColumns.mathEnd
                          ? 2
                          : visibleColumns.mathBase || visibleColumns.mathEnd
                          ? 1
                          : 0
                      }
                      className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border"
                    >
                      Math Competence
                    </th>
                  )}
                  {(visibleColumns.languageBase || visibleColumns.languageEnd) && (
                    <th
                      colSpan={
                        visibleColumns.languageBase && visibleColumns.languageEnd
                          ? 2
                          : visibleColumns.languageBase || visibleColumns.languageEnd
                          ? 1
                          : 0
                      }
                      className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Language Competence
                    </th>
                  )}
                </tr>
                <tr className="border-b border-border">
                  {visibleColumns.mathBase && (
                    <SortableTableHeader
                      label="Base-level"
                      sortKey="mathBase"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.mathEnd && (
                    <SortableTableHeader
                      label="End-level"
                      sortKey="mathEnd"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                      className="border-r border-border"
                    />
                  )}
                  {visibleColumns.languageBase && (
                    <SortableTableHeader
                      label="Base-level"
                      sortKey="languageBase"
                      currentSortKey={sortConfig?.key}
                      currentSortDirection={sortConfig?.direction}
                      onSort={handleSort}
                      align="center"
                    />
                  )}
                  {visibleColumns.languageEnd && (
                    <SortableTableHeader
                      label="End-level"
                      sortKey="languageEnd"
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
                    <td colSpan={5} className="p-0">
                      <TableEmptyState />
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-primary/10 group transition-colors ${
                        row.district === "State Average/Total" ? "bg-primary/5 font-medium" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground sticky left-0 bg-transparent transition-colors z-10 whitespace-nowrap">
                        {row.district}
                      </td>
                      {visibleColumns.mathBase && (
                        <td className="px-4 py-3 text-center">
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
                      )}
                      {visibleColumns.mathEnd && (
                        <td className="px-4 py-3 text-center border-r border-border">
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
                      )}
                      {visibleColumns.languageBase && (
                        <td className="px-4 py-3 text-center">
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
                      )}
                      {visibleColumns.languageEnd && (
                        <td className="px-4 py-3 text-center">
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
