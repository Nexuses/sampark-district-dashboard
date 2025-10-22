"use client"

import { useState, useMemo, useCallback } from "react"
import { sortData, paginateData, getTotalPages, type SortConfig, type SortDirection } from "@/lib/table-utils"

interface UseTableOptions<T> {
  data: T[]
  initialPageSize?: number
  initialSort?: SortConfig | null
}

export function useTable<T>({ data, initialPageSize = 25, initialSort = null }: UseTableOptions<T>) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort)

  // Sort data
  const sortedData = useMemo(() => {
    return sortData(data, sortConfig)
  }, [data, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    return paginateData(sortedData, page, pageSize)
  }, [sortedData, page, pageSize])

  // Total pages
  const totalPages = useMemo(() => {
    return getTotalPages(data.length, pageSize)
  }, [data.length, pageSize])

  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" }
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" }
      }
      return null
    })
    setPage(1) // Reset to first page when sorting
  }, [])

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }, [totalPages])

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPage(1)
  }, [])

  return {
    // Data
    paginatedData,
    sortedData,
    totalItems: data.length,

    // Pagination
    page,
    pageSize,
    totalPages,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    resetPagination,

    // Sorting
    sortConfig,
    handleSort,
    setSortConfig,
  }
}
