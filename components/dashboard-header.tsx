"use client"

import { Download, LogOut } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { generatePDF } from "@/lib/pdf-generator"
import { clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function DashboardHeader({ title, showBack }: { title?: string; showBack?: boolean }) {
  const router = useRouter()
  const handleDownloadPDF = async () => {
    try {
      const t = toast({ title: "Generating PDF…", description: "Please wait while we prepare your download." })
      await generatePDF()
      t.update({ id: t.id, title: "PDF ready", description: "Your download should start shortly.", open: true })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({ title: "Failed to generate PDF", description: "Please try again.", variant: "destructive" })
    }
  }

  const handleLogout = () => {
    try {
      clearAuth()
    } catch {}
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/70 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-[1600px]">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
            {showBack ? (
              <Button variant="outline" size="icon" className="bg-transparent" onClick={() => router.back()} aria-label="Go back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : null}
            <Image
              src="/logo.png"
              alt="AI Sampark"
              width={160}
              height={53}
              className="h-8 sm:h-12 md:h-14 w-auto"
              priority
            />
          </div>

          {/* Center: Title and Subtitle */}
          <div className="flex-1 text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-tight">
              {title || "Chattisgarh"}
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-snug">
              Real Time Classroom Observation 2025
            </p>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="sm:h-8 sm:w-auto sm:px-3 sm:py-2 sm:rounded-md gap-2 bg-transparent"
              onClick={handleDownloadPDF}
              aria-label="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="sm:h-8 sm:w-auto sm:px-3 sm:py-2 sm:rounded-md gap-2 bg-transparent"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
