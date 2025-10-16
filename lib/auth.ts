const TOKEN_KEY = "sampark_token"
const USER_KEY = "sampark_user"
const SELECTED_DISTRICT_KEY = "sampark_selected_district"

export type StoredUser = {
  name: string
  designation: string
  state: string
  district: string
  block: string
  role: string
}

export function saveAuth(token: string, user: StoredUser) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem("ed_dash_logged_in", "true")
  } catch {}
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  try {
    const v = localStorage.getItem(USER_KEY)
    return v ? (JSON.parse(v) as StoredUser) : null
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem("ed_dash_logged_in")
    localStorage.removeItem(SELECTED_DISTRICT_KEY)
  } catch {}
}

export function setSelectedDistrict(districtId: string, districtName?: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(SELECTED_DISTRICT_KEY, JSON.stringify({ id: districtId, name: districtName || "" }))
  } catch {}
}

export function getSelectedDistrict(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null
  try {
    const v = localStorage.getItem(SELECTED_DISTRICT_KEY)
    return v ? (JSON.parse(v) as { id: string; name: string }) : null
  } catch {
    return null
  }
}


