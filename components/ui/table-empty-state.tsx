"use client"

import { FileQuestion } from "lucide-react"

interface TableEmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function TableEmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  icon,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        {icon || <FileQuestion className="w-12 h-12 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">{description}</p>
    </div>
  )
}
