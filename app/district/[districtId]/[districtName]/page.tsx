"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadingIndicatorsTable } from "@/components/leading-indicators-table"
import { ClassObservationTable } from "@/components/class-observation-table"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { fetchDistrictLevelLeadingIndicators } from "@/lib/api"
import type { DWDistrictLevelResponse } from "@/lib/types"
import { getUser, setSelectedDistrict } from "@/lib/auth"

export default function DistrictPage() {
  const params = useParams() as { districtId: string; districtName: string }
  const [data, setData] = useState<DWDistrictLevelResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SAMPARK_API_URL?.trim() || "", [])
  const router = useRouter()

  useEffect(() => {
    async function run() {
      if (!apiBase || !params?.districtId) return
      const u = getUser()
      if (!u?.state) return
      setSelectedDistrict(params.districtId, decodeURIComponent(params?.districtName || ""))
      setLoading(true)
      setError("")
      try {
        const res = await fetchDistrictLevelLeadingIndicators(apiBase, {
          state_id: u.state,
          district_id: params.districtId,
          session: "2025-2026",
        })
        if (res?.error) {
          setError(typeof res.error === "string" ? res.error : "Failed to load district")
          return
        }
        setData(res.data)
      } catch (e: any) {
        setError(e?.message || "Network error")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [apiBase, params?.districtId])

  return (
    <div className="min-h-screen bg-background">
      <div id="dashboard-header">
        <DashboardHeader title={`Chattisgarh - District ${decodeURIComponent(params?.districtName || "")}`} />
      </div>
      <main className="container mx-auto px-4 pt-28 pb-8 space-y-12 max-w-[1600px]">
        <div className="flex items-center mt-4 mb-8">
          <Button variant="outline" size="default" className="gap-2 bg-transparent px-4 py-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        {error ? (
          <div className="text-sm text-error">{error}</div>
        ) : loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : data ? (
          <>
            <div id="section-1">
              <LeadingIndicatorsTable
                items={data.leadingIndicators as any}
                criteria={data.leadingIndicatorsGreenCriteria as any}
                titleSuffix={data.districtData?.name}
                onRowClick={(item) => {
                  if (!item?.id) return
                  const slug = encodeURIComponent((item.name || "").toLowerCase().replace(/\s+/g, "-"))
                  router.push(`/block/${item.id}/${slug}`)
                }}
              />
            </div>
            <div id="section-2">
              <ClassObservationTable
                items={data.leadingIndicators as any}
                onRowClick={(item) => {
                  if (!item?.id) return
                  const slug = encodeURIComponent((item.name || "").toLowerCase().replace(/\s+/g, "-"))
                  router.push(`/block/${item.id}/${slug}`)
                }}
              />
            </div>
            {/* Lagging indicators are not shown on page 2 */}
          </>
        ) : null}
      </main>
    </div>
  )
}


