"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after a short delay
    const timer = setTimeout(() => {
      router.push("/login")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="container flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card className="mx-auto max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Registration Disabled</CardTitle>
            <CardDescription>
              Public registration is not available. Staff accounts are created by administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>If you need an account, please contact your system administrator.</p>
              <p className="mt-2">You will be redirected to the login page shortly.</p>
            </div>
            <Button onClick={() => router.push("/login")} className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
