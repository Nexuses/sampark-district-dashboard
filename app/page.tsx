"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { LeadingIndicatorsTable } from "@/components/leading-indicators-table"
import { ClassObservationTable } from "@/components/class-observation-table"
import { LaggingIndicatorsTable } from "@/components/lagging-indicators-table"
import { LoginCard } from "@/components/login-card"
import { useEffect, useMemo, useState } from "react"
import { fetchDistrictWiseLeadingIndicators } from "@/lib/api"
import type { DWDistrictWiseResponse } from "@/lib/types"
import { getUser } from "@/lib/auth"

export default function Page() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [insights, setInsights] = useState<DWDistrictWiseResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string>("")
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SAMPARK_API_URL?.trim() || "", [])

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
      <main className={`container mx-auto px-4 ${isAuthed ? "pt-28" : "pt-16"} pb-8 space-y-12 max-w-[1600px]`}>
        {!isAuthed ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <LoginCard onSuccess={() => setIsAuthed(true)} />
          </div>
        ) : (
          <>
            <div id="section-1">
              {loadError ? (
                <div className="text-sm text-error">{loadError}</div>
              ) : loading ? (
                <div className="text-sm text-muted-foreground">Loading dashboard…</div>
              ) : insights ? (
                <LeadingIndicatorsTable
                  items={insights.leadingIndicators as any}
                  criteria={insights.leadingIndicatorsGreenCriteria as any}
                  titleSuffix={insights.stateData?.name}
                />
              ) : null}
            </div>
            <div id="section-2">
              {insights ? <ClassObservationTable items={insights.leadingIndicators as any} /> : null}
            </div>
            <div id="section-3">
              {insights ? (
                <LaggingIndicatorsTable items={insights.laggingIndicators2024 as any} subjects={insights.laggingIndicatorSubjects as any} />
              ) : null}
            </div>

            <section className="border-t border-border pt-8 pb-4">
              <div className="max-w-7xl">
                <h3 className="text-base font-semibold text-foreground mb-4">Performance Indicators</h3>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-success/20 border border-success/30" />
                    <span className="text-foreground">Above District Average</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-error/20 border border-error/30" />
                    <span className="text-foreground">Below District Average</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20" />
                    <span className="text-foreground">State Average/Total</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
