"use client"

import { useAuth } from "@/contexts/auth-context"
import { PatientOnboarding } from "@/components/onboarding/patient-onboarding"
import { DoctorOnboarding } from "@/components/onboarding/doctor-onboarding"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (!loading && user?.profileCompleted) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) return <FullPageLoader />
  if (!user) return null

  const renderOnboarding = () => {
    switch (user.role) {
      case "patient":
        return <PatientOnboarding />
      case "doctor":
        return <DoctorOnboarding />
      default:
        // For other roles, we can create similar onboarding components
        return <PatientOnboarding />
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="container flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to HMS</h1>
          <p className="text-sm text-muted-foreground">Let&apos;s complete your profile to get started</p>
        </div>
        {renderOnboarding()}
      </div>
    </div>
  )
}
