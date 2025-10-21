/**
 * Table utilities for sorting, filtering, and exporting data
 */

export type SortDirection = "asc" | "desc" | null

export interface SortConfig {
  key: string
  direction: SortDirection
}

/**
 * Sort data by a specific key and direction
 */
export function sortData<T>(data: T[], sortConfig: SortConfig | null): T[] {
  if (!sortConfig || !sortConfig.direction) return data

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key]
    const bValue = (b as any)[sortConfig.key]

    // Handle empty values
    if (aValue === "" || aValue === null || aValue === undefined) return 1
    if (bValue === "" || bValue === null || bValue === undefined) return -1

    // Handle numeric values
    const aNum = Number(aValue)
    const bNum = Number(bValue)
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum
    }

    // Handle string values
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })
}

/**
 * Paginate data
 */
export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnMapping?: Record<string, string>
) {
  if (data.length === 0) return

  // Get headers
  const headers = Object.keys(data[0])
  const csvHeaders = headers.map((h) => columnMapping?.[h] || h).join(",")

  // Get rows
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        const stringValue = String(value === "" || value === null || value === undefined ? "" : value)
        return `"${stringValue.replace(/"/g, '""')}"`
      })
      .join(",")
  )

  // Combine headers and rows
  const csv = [csvHeaders, ...csvRows].join("\n")

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Calculate total pages
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize)
}
