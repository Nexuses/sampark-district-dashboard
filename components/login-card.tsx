"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import type { GetOtpRequest, GetOtpResponse, ValidateOtpRequest, ValidateOtpResponse } from "@/lib/types"
import { saveAuth } from "@/lib/auth"

export function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_SAMPARK_API_URL?.trim() || "", [])

  useEffect(() => {
    const alreadyLoggedIn = typeof window !== "undefined" && localStorage.getItem("ed_dash_logged_in") === "true"
    if (alreadyLoggedIn) {
      onSuccess()
    }
  }, [onSuccess])

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const digitsOnly = phone.replace(/\D/g, "")
    if (digitsOnly.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.")
      return
    }
    if (!apiBase) {
      setError("API is not configured.")
      return
    }

    try {
      setIsSubmitting(true)
      const body: GetOtpRequest = { phone_number: digitsOnly }
      const res = await fetch(`${apiBase}/server/api/getOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const json = (await res.json()) as Partial<GetOtpResponse>
        if (!res.ok || json?.error) {
          setError(json?.message || "Failed to request OTP.")
          return
        }
        setStep("otp")
      } else {
        const text = (await res.text()).trim()
        // Treat non-JSON responses as errors and surface the server message
        if (!res.ok || text) {
          setError(text || "Failed to request OTP.")
          return
        }
        setStep("otp")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const trimmed = otp.trim()
    if (!trimmed) {
      setError("Please enter the OTP.")
      setIsSubmitting(false)
      return
    }
    if (!apiBase) {
      setError("API is not configured.")
      setIsSubmitting(false)
      return
    }

    try {
      const body: ValidateOtpRequest = { phone_number: phone.replace(/\D/g, ""), otp: trimmed }
      const res = await fetch(`${apiBase}/server/api/validateOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        const json = (await res.json()) as Partial<ValidateOtpResponse>
        if (!res.ok || json?.error || !json?.data) {
          setError(json?.message || "Invalid OTP.")
          return
        }
        const token = (json.data as any)?.token
        const userinfo = (json.data as any)?.userinfo
        const userinfoIsObject = userinfo && typeof userinfo === "object" && !Array.isArray(userinfo)
        if (!token || !userinfoIsObject) {
          const serverMsg = (typeof userinfo === "string" && userinfo) || json?.message || "Invalid OTP."
          setError(serverMsg)
          return
        }
        saveAuth(token as string, userinfo as any)
        onSuccess()
      } else {
        const text = (await res.text()).trim()
        setError(text || "Invalid OTP.")
        return
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-lg bg-card/60 backdrop-blur-xl border-border p-6 md:p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <Image src="/logo.png" alt="Logo" width={180} height={60} className="h-14 w-auto" priority />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to access the dashboard</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mobile Number</label>
              <InputOTP
                maxLength={10}
                value={phone}
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                containerClassName="justify-center"
                className="[&_input]:hidden"
              >
                <div className="overflow-x-auto">
                  <InputOTPGroup className="gap-2 justify-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-10 w-10 sm:h-11 sm:w-11 bg-background/60 data-[active=true]:border-warning data-[active=true]:ring-warning/40"
                    />
                  ))}
                  </InputOTPGroup>
                </div>
              </InputOTP>
              <p className="mt-2 text-xs text-muted-foreground text-center">Enter your 10-digit mobile number.</p>
            </div>
            {error ? <p className="text-sm text-error text-center">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Requesting OTP...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 text-center">OTP</label>
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 4))}
                containerClassName="justify-center"
                className="[&_input]:hidden"
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} className="h-11 w-11 bg-background/60" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error ? <p className="text-sm text-error text-center">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Verifying...
                </span>
              ) : (
                "Verify & Sign in"
              )}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setOtp("")
                setError("")
              }}
              className="text-xs text-muted-foreground underline"
            >
              Use a different number
            </button>
          </form>
        )}

        {/* Removed environment instruction text as requested */}
      </Card>
    </div>
  )
}


