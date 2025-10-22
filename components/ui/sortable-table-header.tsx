"use client"

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import type { SortDirection } from "@/lib/table-utils"

interface SortableTableHeaderProps {
  label: string
  sortKey: string
  currentSortKey?: string | null
  currentSortDirection?: SortDirection
  onSort: (key: string) => void
  align?: "left" | "center" | "right"
  className?: string
}

export function SortableTableHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  align = "left",
  className = "",
}: SortableTableHeaderProps) {
  const isActive = currentSortKey === sortKey
  const alignClass = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"

  return (
    <th className={`px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider ${className}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-2 ${alignClass} w-full hover:text-foreground transition-colors group`}
      >
        <span className="whitespace-nowrap">{label}</span>
        <span className="flex items-center">
          {!isActive && (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
          {isActive && currentSortDirection === "asc" && (
            <ArrowUp className="w-3.5 h-3.5 text-primary" />
          )}
          {isActive && currentSortDirection === "desc" && (
            <ArrowDown className="w-3.5 h-3.5 text-primary" />
          )}
        </span>
      </button>
    </th>
  )
}
