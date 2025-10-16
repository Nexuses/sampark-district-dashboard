import { getToken } from "./auth"
import type { DataInsightsRequest, DataInsightsResponse, DWDistrictWiseResponse } from "./types"

function toFormUrlEncoded(body: Record<string, string>) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) params.append(k, String(v))
  }
  return params.toString()
}

export async function fetchDataInsights(apiBase: string, payload: DataInsightsRequest): Promise<DataInsightsResponse> {
  const token = getToken()
  const res = await fetch(`${apiBase}/server/api/v2/dataInsights`, {
    method: "POST",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toFormUrlEncoded(payload as unknown as Record<string, string>),
  })

  const contentType = res.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    const text = await res.text()
    throw new Error(text || "Unexpected response type")
  }
  const json = (await res.json()) as DataInsightsResponse
  return json
}

export async function fetchDistrictWiseLeadingIndicators(apiBase: string, params: {
  state_id: string
  session: string
  des: string
}): Promise<DWDistrictWiseResponse> {
  const token = getToken()
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${apiBase}/server/api/v2/districtWiseLeadingIndicators?${qs}`, {
    method: "GET",
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
    },
  })
  const contentType = res.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    const text = await res.text()
    throw new Error(text || "Unexpected response type")
  }
  const json = (await res.json()) as DWDistrictWiseResponse
  return json
}


