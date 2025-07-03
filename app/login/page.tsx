import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="container flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Hospital Management System
            </h1>
          </div>
          <p className="text-sm text-slate-600">Sign in to access your account</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-elegant-lg p-6">
          <LoginForm />
        </div>

        {/* Zenquix Technologies Footer */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            Developed by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Zenquix Technologies
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
