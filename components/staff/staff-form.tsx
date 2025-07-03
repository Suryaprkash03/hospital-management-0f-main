"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Eye, EyeOff, RefreshCw } from "lucide-react"
import type { StaffMember, StaffRole } from "@/lib/types"
import { validateEmail, validatePhoneNumber } from "@/lib/patient-utils"
import { validateLicenseNumber, departments, specializations, labTests, nursingWards } from "@/lib/staff-utils"
import { useAuth } from "@/contexts/auth-context"
import { useStaff } from "@/hooks/use-staff"

interface StaffFormProps {
  staff?: StaffMember | null
  onSubmit: (staffData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function StaffForm({ staff, onSubmit, onCancel, loading = false }: StaffFormProps) {
  const { user } = useAuth()
  const { addStaffMember, updateStaffMember } = useStaff()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "" as StaffRole,
    department: "",
    status: "active",
    hireDate: "",
    password: "", // Add this line

    // Doctor fields
    specialization: "",
    licenseNumber: "",
    biography: "",
    consultationFee: "",
    experience: "",

    // Nurse fields
    assignedWards: [] as string[],
    shift: "",
    nursingLicense: "",

    // Receptionist fields
    deskLocation: "",
    languages: [] as string[],

    // Lab Technician fields
    assignedTests: [] as string[],
    certifications: [] as string[],
  })

  const [showPassword, setShowPassword] = useState(false)
  const [passwordGenerated, setPasswordGenerated] = useState(false)

  const [newLanguage, setNewLanguage] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        email: staff.email || "",
        phone: staff.phone || "",
        role: staff.role || ("" as StaffRole),
        department: staff.department || "",
        status: staff.status || "active",
        hireDate: staff.hireDate ? staff.hireDate.toISOString().split("T")[0] : "",
        password: "", // Always empty for existing staff

        specialization: staff.specialization || "",
        licenseNumber: staff.licenseNumber || "",
        biography: staff.biography || "",
        consultationFee: staff.consultationFee?.toString() || "",
        experience: staff.experience?.toString() || "",

        assignedWards: staff.assignedWards || [],
        shift: staff.shift || "",
        nursingLicense: staff.nursingLicense || "",

        deskLocation: staff.deskLocation || "",
        languages: staff.languages || [],

        assignedTests: staff.assignedTests || [],
        certifications: staff.certifications || [],
      })
    } else {
      // For new staff, generate password automatically
      generateRandomPassword()
    }
  }, [staff])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!validatePhoneNumber(formData.phone)) newErrors.phone = "Invalid phone number format"
    if (!formData.role) newErrors.role = "Role is required"
    if (!formData.department) newErrors.department = "Department is required"
    if (!formData.hireDate) newErrors.hireDate = "Hire date is required"

    // Password validation for new staff only
    if (!staff && !formData.password.trim()) {
      newErrors.password = "Password is required for new staff"
    } else if (!staff && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // Role-specific validation
    if (formData.role === "doctor") {
      if (!formData.specialization) newErrors.specialization = "Specialization is required"
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required"
      else if (!validateLicenseNumber(formData.licenseNumber, "doctor")) {
        newErrors.licenseNumber = "Invalid license number format"
      }
    }

    if (formData.role === "nurse") {
      if (!formData.shift) newErrors.shift = "Shift is required"
      if (formData.assignedWards.length === 0) newErrors.assignedWards = "At least one ward must be assigned"
    }

    if (formData.role === "receptionist") {
      if (!formData.deskLocation) newErrors.deskLocation = "Desk location is required"
    }

    if (formData.role === "lab_technician") {
      if (formData.assignedTests.length === 0) newErrors.assignedTests = "At least one test must be assigned"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        hireDate: new Date(formData.hireDate),
        createdBy: user?.uid || "",
      }

      // Add password for new staff or if password is provided for existing staff
      if (!staff || formData.password.trim()) {
        submitData.password = formData.password
        submitData.mustChangePassword = !staff // New staff must change password
        submitData.firstLogin = !staff
      }

      // Add role-specific fields
      if (formData.role === "doctor") {
        submitData.specialization = formData.specialization
        submitData.licenseNumber = formData.licenseNumber
        submitData.biography = formData.biography
        submitData.consultationFee = formData.consultationFee ? Number.parseFloat(formData.consultationFee) : undefined
        submitData.experience = formData.experience ? Number.parseInt(formData.experience) : undefined
      }

      if (formData.role === "nurse") {
        submitData.assignedWards = formData.assignedWards
        submitData.shift = formData.shift
        submitData.nursingLicense = formData.nursingLicense
      }

      if (formData.role === "receptionist") {
        submitData.deskLocation = formData.deskLocation
        submitData.languages = formData.languages
      }

      if (formData.role === "lab_technician") {
        submitData.assignedTests = formData.assignedTests
        submitData.certifications = formData.certifications
      }

      if (staff) {
        if (staff.id) {
          await updateStaffMember(staff.id, submitData)
        }
      } else {
        await addStaffMember(submitData)
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }))
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }))
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c !== certification),
    }))
  }

  const handleWardChange = (ward: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedWards: checked ? [...prev.assignedWards, ward] : prev.assignedWards.filter((w) => w !== ward),
    }))
  }

  const handleTestChange = (test: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedTests: checked ? [...prev.assignedTests, test] : prev.assignedTests.filter((t) => t !== test),
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
        <CardDescription>
          {staff ? "Update staff member information" : "Enter staff details to create a new record"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(123) 456-7890"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="lab_technician">Lab Technician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange("hireDate", e.target.value)}
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && <p className="text-sm text-red-500">{errors.hireDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password {!staff && "*"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder={staff ? "Leave empty to keep current password" : "Enter password (min 8 characters)"}
                    className={errors.password ? "border-red-500 pr-20" : "pr-20"}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateRandomPassword}
                      className="h-6 w-6 p-0"
                      title="Generate random password"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-6 w-6 p-0"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                {!staff && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <strong>Note:</strong> Admin can set any password. Staff will be required to change it on first
                    login.
                  </p>
                )}
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {formData.role === "doctor" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Doctor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => handleChange("specialization", value)}
                  >
                    <SelectTrigger className={errors.specialization ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange("licenseNumber", e.target.value)}
                    placeholder="MD123456"
                    className={errors.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && <p className="text-sm text-red-500">{errors.licenseNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => handleChange("consultationFee", e.target.value)}
                    placeholder="150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  value={formData.biography}
                  onChange={(e) => handleChange("biography", e.target.value)}
                  placeholder="Brief professional biography..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {formData.role === "nurse" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nurse Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift *</Label>
                  <Select value={formData.shift} onValueChange={(value) => handleChange("shift", value)}>
                    <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.shift && <p className="text-sm text-red-500">{errors.shift}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nursingLicense">Nursing License</Label>
                  <Input
                    id="nursingLicense"
                    value={formData.nursingLicense}
                    onChange={(e) => handleChange("nursingLicense", e.target.value)}
                    placeholder="RN12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assigned Wards *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {nursingWards.map((ward) => (
                    <div key={ward} className="flex items-center space-x-2">
                      <Checkbox
                        id={ward}
                        checked={formData.assignedWards.includes(ward)}
                        onCheckedChange={(checked) => handleWardChange(ward, checked as boolean)}
                      />
                      <Label htmlFor={ward} className="text-sm">
                        {ward}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.assignedWards && <p className="text-sm text-red-500">{errors.assignedWards}</p>}
              </div>
            </div>
          )}

          {formData.role === "receptionist" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Receptionist Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deskLocation">Desk Location *</Label>
                  <Input
                    id="deskLocation"
                    value={formData.deskLocation}
                    onChange={(e) => handleChange("deskLocation", e.target.value)}
                    placeholder="Front Desk A"
                    className={errors.deskLocation ? "border-red-500" : ""}
                  />
                  {errors.deskLocation && <p className="text-sm text-red-500">{errors.deskLocation}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
                  />
                  <Button type="button" onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeLanguage(language)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {formData.role === "lab_technician" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lab Technician Information</h3>

              <div className="space-y-2">
                <Label>Assigned Tests *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {labTests.map((test) => (
                    <div key={test} className="flex items-center space-x-2">
                      <Checkbox
                        id={test}
                        checked={formData.assignedTests.includes(test)}
                        onCheckedChange={(checked) => handleTestChange(test, checked as boolean)}
                      />
                      <Label htmlFor={test} className="text-sm">
                        {test}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.assignedTests && <p className="text-sm text-red-500">{errors.assignedTests}</p>}
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCertification(cert)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : staff ? "Update Staff" : "Add Staff"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
