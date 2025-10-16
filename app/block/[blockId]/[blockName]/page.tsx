"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { BlockLeadingIndicatorsTable } from "@/components/block-leading-indicators-table"
import { fetchDataInsights } from "@/lib/api"
import type { DataInsightsResponse } from "@/lib/types"
import { getUser, getSelectedDistrict } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BlockPage() {
  const params = useParams() as { blockId: string; blockName: string }
  const [data, setData] = useState<DataInsightsResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SAMPARK_API_URL?.trim() || "", [])
  const router = useRouter()

  useEffect(() => {
    async function run() {
      if (!apiBase || !params?.blockId) return
      const u = getUser()
      const d = getSelectedDistrict()
      if (!u?.state || !d?.id) return
      setLoading(true)
      setError("")
      try {
        const res = await fetchDataInsights(apiBase, {
          state_id: u.state,
          district_id: d.id,
          block_id: params.blockId,
          session: "2025-2026",
        })
        if ((res as any)?.error) {
          setError(typeof (res as any).error === "string" ? (res as any).error : "Failed to load block")
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
  }, [apiBase, params?.blockId])

  const heading = useMemo(() => {
    const district = getSelectedDistrict()?.name || ""
    const block = decodeURIComponent(params?.blockName || "")
    return `Chattisgarh - District ${district} - Block ${block}`
  }, [params?.blockName])

  return (
    <div className="min-h-screen bg-background">
      <div id="dashboard-header">
        <DashboardHeader title={heading} />
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
              <BlockLeadingIndicatorsTable items={data.leadingIndicators as any} criteria={data.leadingIndicatorsGreenCriteria as any} titleSuffix={getSelectedDistrict()?.name} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}


