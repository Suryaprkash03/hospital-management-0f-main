"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submitted with:", email)
    setLoading(true)

    try {
      await login(email, password)
      console.log("Login successful, redirecting to dashboard")

      // Wait a bit for auth state to settle
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Force redirect to dashboard using window.location for reliability
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Login form error:", error)
      // Error is handled in the auth context
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Staff Login</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot your password?
          </Button>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Staff accounts are created by administrators.</p>
          <p>Contact your system administrator if you need assistance.</p>
        </div>
      </CardContent>
    </Card>
  )
}
