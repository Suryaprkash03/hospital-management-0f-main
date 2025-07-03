"use client"

import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ClipboardList,
  Package2,
  Stethoscope,
  LogOut,
  Code,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navigation = {
  admin: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Staff",
      href: "/dashboard/staff",
      icon: UserCheck,
    },
    {
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "Visits",
      href: "/dashboard/visits",
      icon: ClipboardList,
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package2,
    },
    {
      title: "Medical Records",
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "Billing & Payments",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
  doctor: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Visits",
      href: "/dashboard/visits",
      icon: ClipboardList,
    },
    {
      title: "Medical Records",
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "My Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
  ],
  nurse: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Visits",
      href: "/dashboard/visits",
      icon: ClipboardList,
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: Package2,
    },
    {
      title: "Medical Records",
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
  receptionist: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "Billing & Payments",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
  patient: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
    },
    {
      title: "My Records",
      href: "/dashboard/reports",
      icon: FileText,
    },
    {
      title: "Health Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

const roleColors = {
  admin: "from-red-500 to-pink-600",
  doctor: "from-blue-500 to-cyan-600",
  nurse: "from-green-500 to-emerald-600",
  receptionist: "from-purple-500 to-violet-600",
  patient: "from-orange-500 to-amber-600",
}

const roleIcons = {
  admin: Settings,
  doctor: Stethoscope,
  nurse: UserCheck,
  receptionist: Users,
  patient: Users,
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const userRole = user?.role || "patient"
  const navItems = navigation[userRole as keyof typeof navigation] || navigation.patient
  const RoleIcon = roleIcons[userRole as keyof typeof roleIcons]
  const roleGradient = roleColors[userRole as keyof typeof roleColors]

  return (
    <Sidebar className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
      <SidebarHeader className="p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${roleGradient} shadow-lg`}
          >
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Hospital MS
            </span>
            <div className="flex items-center gap-2">
              <RoleIcon className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 capitalize tracking-wide">{userRole}</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? `bg-gradient-to-r ${roleGradient} text-white shadow-lg shadow-${userRole === "admin" ? "red" : userRole === "doctor" ? "blue" : userRole === "nurse" ? "green" : userRole === "receptionist" ? "purple" : "orange"}-500/25`
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <item.icon
                          className={`h-4 w-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                        />
                        <span className="truncate">{item.title}</span>
                        {isActive && (
                          <div className="absolute right-2 h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200/60 space-y-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} />
            <AvatarFallback className={`bg-gradient-to-br ${roleGradient} text-white text-xs font-semibold`}>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "user@hospital.com"}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Zenquix Technologies Branding */}
        <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <Code className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            <p className="text-xs text-gray-800 text-center">
            © 2025{" "}
            <Link href="https://zenquix.com/" className="hover:opacity-80 transition-opacity">
            <img src="https://zenquix.com/static/media/zqx-full-clr.8dc0b367f464703e5c99.png" alt="Zenquix-Logo" className="w-[40%] mb-0.5 inline" />
            </Link>
          </p>
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail className="bg-gradient-to-b from-slate-200 to-slate-300" />
    </Sidebar>
  )
}
