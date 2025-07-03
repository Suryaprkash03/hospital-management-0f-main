"use client"

import { useAuth } from "@/contexts/auth-context"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.profileCompleted) {
          router.push("/dashboard")
        } else {
          router.push("/onboarding")
        }
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return <FullPageLoader />
}
