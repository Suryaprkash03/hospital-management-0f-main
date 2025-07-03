"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, Bell, Shield, Building, Database, Key, Download, Upload, Trash2, Save, Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    department: profile?.department || "",
    specialization: profile?.specialization || "",
    bio: "",
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reportAlerts: true,
    billingAlerts: true,
    systemAlerts: true,
    marketingEmails: false,
  })

  // Hospital settings state (admin only)
  const [hospitalSettings, setHospitalSettings] = useState({
    hospitalName: "City General Hospital",
    hospitalAddress: "123 Medical Center Drive, Healthcare City, HC 12345",
    hospitalPhone: "+1 (555) 123-4567",
    hospitalEmail: "info@citygeneralhospital.com",
    website: "www.citygeneralhospital.com",
    timezone: "America/New_York",
    currency: "USD",
    language: "en",
    workingHours: "24/7",
    emergencyContact: "+1 (555) 911-HELP",
  })

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginAlerts: true,
  })

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      await updateProfile(profileData)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = () => {
    // In a real app, this would update the user's notification preferences in the database
    toast.success("Notification preferences updated")
  }

  const handleHospitalSettingsUpdate = () => {
    // In a real app, this would update hospital settings (admin only)
    toast.success("Hospital settings updated")
  }

  const handlePasswordChange = () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    // In a real app, this would update the user's password
    toast.success("Password updated successfully")
    setSecuritySettings({
      ...securitySettings,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleExportData = () => {
    toast.success("Data export initiated. You'll receive an email when ready.")
  }

  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    toast.error("Account deletion requires admin approval")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white/70 backdrop-blur-sm border border-slate-200">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger
                value="hospital"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4" />
                Hospital
              </TabsTrigger>
            )}
            <TabsTrigger
              value="data"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white"
            >
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-slate-700">Profile Information</CardTitle>
                <CardDescription>Update your personal information and professional details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-slate-500 to-gray-600 text-white">
                      {profile?.firstName?.[0]}
                      {profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-slate-500">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Role-specific fields */}
                {(user?.role === "doctor" || user?.role === "nurse") && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={profileData.department}
                        onValueChange={(value) => setProfileData({ ...profileData, department: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-slate-400">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {user?.role === "doctor" && (
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                          className="border-slate-200 focus:border-slate-400"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows={3}
                    className="border-slate-200 focus:border-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    className="border-slate-200 focus:border-slate-400"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-slate-700">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about important updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-slate-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-slate-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-slate-500">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-slate-500">Get reminded about upcoming appointments</p>
                    </div>
                    <Switch
                      checked={notifications.appointmentReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, appointmentReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Report Alerts</Label>
                      <p className="text-sm text-slate-500">Get notified when reports are uploaded or reviewed</p>
                    </div>
                    <Switch
                      checked={notifications.reportAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, reportAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Billing Alerts</Label>
                      <p className="text-sm text-slate-500">Get notified about payment and billing updates</p>
                    </div>
                    <Switch
                      checked={notifications.billingAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, billingAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-slate-500">Get notified about system maintenance and updates</p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-slate-500">Receive promotional emails and newsletters</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNotificationUpdate}
                    className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-slate-700">Password & Security</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-slate-500">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select
                      value={securitySettings.sessionTimeout}
                      onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}
                    >
                      <SelectTrigger className="w-48 border-slate-200 focus:border-slate-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospital Settings (Admin Only) */}
          {user?.role === "admin" && (
            <TabsContent value="hospital" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-slate-700">Hospital Information</CardTitle>
                  <CardDescription>Manage hospital details and system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Hospital Name</Label>
                      <Input
                        id="hospitalName"
                        value={hospitalSettings.hospitalName}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, hospitalName: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={hospitalSettings.website}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, website: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalAddress">Address</Label>
                    <Textarea
                      id="hospitalAddress"
                      value={hospitalSettings.hospitalAddress}
                      onChange={(e) => setHospitalSettings({ ...hospitalSettings, hospitalAddress: e.target.value })}
                      rows={3}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalPhone">Phone</Label>
                      <Input
                        id="hospitalPhone"
                        value={hospitalSettings.hospitalPhone}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, hospitalPhone: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospitalEmail">Email</Label>
                      <Input
                        id="hospitalEmail"
                        type="email"
                        value={hospitalSettings.hospitalEmail}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, hospitalEmail: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={hospitalSettings.timezone}
                        onValueChange={(value) => setHospitalSettings({ ...hospitalSettings, timezone: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-slate-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={hospitalSettings.currency}
                        onValueChange={(value) => setHospitalSettings({ ...hospitalSettings, currency: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-slate-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={hospitalSettings.language}
                        onValueChange={(value) => setHospitalSettings({ ...hospitalSettings, language: value })}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-slate-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="workingHours">Working Hours</Label>
                      <Input
                        id="workingHours"
                        value={hospitalSettings.workingHours}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, workingHours: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={hospitalSettings.emergencyContact}
                        onChange={(e) => setHospitalSettings({ ...hospitalSettings, emergencyContact: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleHospitalSettingsUpdate}
                      className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Hospital Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-slate-700">Data Management</CardTitle>
                <CardDescription>Export your data or manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-700">Export Data</h4>
                      <p className="text-sm text-slate-500">
                        Download a copy of your data including appointments, reports, and billing information
                      </p>
                    </div>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-700">Import Data</h4>
                      <p className="text-sm text-slate-500">Import data from another system or restore from backup</p>
                    </div>
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <div className="space-y-1">
                      <h4 className="font-medium text-red-700">Delete Account</h4>
                      <p className="text-sm text-red-600/70">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-slate-700">Account Information</CardTitle>
                <CardDescription>View your account details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded border">{user?.uid}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-slate-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
