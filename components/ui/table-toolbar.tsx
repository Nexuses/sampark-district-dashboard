"use client"

import { Search, Filter, Download, X, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface TableToolbarProps {
  // Search
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Filters
  filters?: Array<{
    id: string
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }>

  // Column visibility
  columns?: Array<{ id: string; label: string; visible: boolean }>
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void

  // Export
  onExport?: () => void
  exportLabel?: string

  // Results info
  totalResults?: number
  filteredResults?: number
}

export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  columns,
  onColumnVisibilityChange,
  onExport,
  exportLabel = "Export to CSV",
  totalResults,
  filteredResults,
}: TableToolbarProps) {
  const showResultsInfo = totalResults !== undefined && filteredResults !== undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-background border-border"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          {filters.map((filter) => (
            <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-full md:w-[200px] bg-background border-border">
                <Filter className="w-4 h-4 mr-2 shrink-0" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Column Visibility */}
          {columns && onColumnVisibilityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="border-border bg-background">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.visible}
                    onCheckedChange={(checked) => onColumnVisibilityChange(column.id, checked)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {onExport && (
            <Button
              variant="outline"
              size="default"
              onClick={onExport}
              className="border-border bg-background whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {showResultsInfo && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredResults} of {totalResults} results
          {filteredResults < totalResults && (
            <span className="ml-1 text-primary font-medium">(filtered)</span>
          )}
        </div>
      )}
    </div>
  )
}
