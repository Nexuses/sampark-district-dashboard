"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { LeadingIndicatorsTable } from "@/components/leading-indicators-table"
import { ClassObservationTable } from "@/components/class-observation-table"
import { LaggingIndicatorsTable } from "@/components/lagging-indicators-table"
import { LoginCard } from "@/components/login-card"
import { Card } from "@/components/ui/card"
import { Info, TrendingUp, TrendingDown, Target } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchDistrictWiseLeadingIndicators } from "@/lib/api"
import type { DWDistrictWiseResponse } from "@/lib/types"
import { getUser } from "@/lib/auth"

export default function Page() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [insights, setInsights] = useState<DWDistrictWiseResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string>("")
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SAMPARK_API_URL?.trim() || "", [])
  const router = useRouter()

  useEffect(() => {
    const ok = typeof window !== "undefined" && localStorage.getItem("ed_dash_logged_in") === "true"
    if (ok) setIsAuthed(true)
  }, [])

  useEffect(() => {
    async function run() {
      if (!isAuthed || !apiBase) return
      const u = getUser()
      if (!u?.state) return
      setLoading(true)
      setLoadError("")
      try {
        const res = await fetchDistrictWiseLeadingIndicators(apiBase, {
          state_id: u.state,
          session: "2025-2026",
          des: "111",
        })
        if (res?.error) {
          setLoadError(typeof res.error === "string" ? res.error : "Failed to load dashboard")
          return
        }
        setInsights(res.data)
      } catch (e: any) {
        setLoadError(e?.message || "Network error")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [isAuthed, apiBase])

  return (
    <div className="min-h-screen bg-background">
      {isAuthed ? (
        <div id="dashboard-header">
          <DashboardHeader title={insights?.stateData?.name} />
        </div>
      ) : null}
      <main className={`container mx-auto px-4 ${isAuthed ? "pt-28" : "pt-16"} pb-8 space-y-6 max-w-[1600px]`}>
        {!isAuthed ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <LoginCard onSuccess={() => setIsAuthed(true)} />
          </div>
        ) : (
          <>
            {loadError ? (
              <div className="text-sm text-error">{loadError}</div>
            ) : loading ? (
              <div className="text-sm text-muted-foreground">Loading dashboard…</div>
            ) : insights ? (
              <>
                {/* Leading Indicators Table */}
                <div id="section-1">
                  <LeadingIndicatorsTable
                    items={insights.leadingIndicators as any}
                    criteria={insights.leadingIndicatorsGreenCriteria as any}
                    titleSuffix={insights.stateData?.name}
                    onRowClick={(item) => {
                      if (!item?.id) return
                      const slug = encodeURIComponent((item.name || "").toLowerCase().replace(/\s+/g, "-"))
                      router.push(`/district/${item.id}/${slug}`)
                    }}
                  />
                </div>
              </>
            ) : null}

            {insights ? (
              <>
                {/* Class Observation Table */}
                <div id="section-2">
                  <ClassObservationTable
                    items={insights.leadingIndicators as any}
                    onRowClick={(item) => {
                      if (!item?.id) return
                      const slug = encodeURIComponent((item.name || "").toLowerCase().replace(/\s+/g, "-"))
                      router.push(`/district/${item.id}/${slug}`)
                    }}
                  />
                </div>

                {/* Lagging Indicators Table */}
                <div id="section-3">
                  <LaggingIndicatorsTable
                    items={insights.laggingIndicators2024 as any}
                    subjects={insights.laggingIndicatorSubjects as any}
                  />
                </div>
              </>
            ) : null}

            <section className="border-t border-border pt-8 pb-4">
              <Card className="border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Performance Indicators Guide
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border hover:border-success/50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">Above Average</span>
                      <p className="text-xs text-muted-foreground">High performing districts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border hover:border-error/50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-error/20 border border-error/30 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-4 h-4 text-error" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">Below Average</span>
                      <p className="text-xs text-muted-foreground">Needs improvement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">State Average/Total</span>
                      <p className="text-xs text-muted-foreground">Benchmark value</p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
