"use client"

import { Download, LogOut, TrendingUp, Users, School } from "lucide-react"
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
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/70 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-lg">
      {/* Animated gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse" />

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-[1600px]">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
            {showBack ? (
              <Button
                variant="outline"
                size="icon"
                className="bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            ) : null}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
              <Image
                src="/logo.png"
                alt="AI Sampark"
                width={160}
                height={53}
                className="h-8 sm:h-12 md:h-14 w-auto relative z-10 transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Center: Title and Subtitle */}
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border border-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient">
                {title || "Chattisgarh"}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-snug font-medium">
              Real Time Classroom Observation 2025
            </p>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="sm:h-9 sm:w-auto sm:px-3 sm:py-2 sm:rounded-lg gap-2 bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              onClick={handleDownloadPDF}
              aria-label="Download PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Download PDF</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="sm:h-9 sm:w-auto sm:px-3 sm:py-2 sm:rounded-lg gap-2 bg-background/50 hover:bg-destructive/10 hover:border-destructive/50 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/20"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
