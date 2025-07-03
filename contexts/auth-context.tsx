"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, UserProfile, UserRole, AuthContextType } from "@/lib/types"
import { toast } from "sonner"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role: userData.role,
              profileCompleted: userData.profileCompleted,
              createdAt: userData.createdAt,
            })
            setProfile(userData)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          toast.error("Failed to load user profile")
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true) // Add loading state during login
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Wait for the auth state to be properly set
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe()
            resolve(user)
          }
        })
      })

      // Update login count and last login
      const userDocRef = doc(db, "users", result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          loginCount: (userData.loginCount || 0) + 1,
        })
      }

      console.log("Login successful:", result.user.email)
      toast.success("Successfully logged in!")

      // Force a small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error: any) {
      console.error("Login error:", error)
      let errorMessage = "Failed to login"

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later"
          break
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password"
          break
        default:
          errorMessage = error.message || "Failed to login"
      }

      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, role: UserRole) => {
    try {
      console.log("Attempting to register:", email, role)
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Firebase user created:", firebaseUser.uid)

      const userData: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        firstName: "",
        lastName: "",
        phone: "",
        profileCompleted: false,
        createdAt: new Date(),
      }

      console.log("Saving user data to Firestore:", userData)
      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
      })

      console.log("User registration completed successfully")
      toast.success("Account created successfully!")
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = "Failed to create account"

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters"
          break
        default:
          errorMessage = error.message || "Failed to create account"
      }

      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success("Successfully logged out!")
    } catch (error: any) {
      toast.error(error.message || "Failed to logout")
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), profileData)

      // Update local state
      if (profile) {
        const updatedProfile = { ...profile, ...profileData }
        setProfile(updatedProfile)
        setUser((prev) => (prev ? { ...prev, profileCompleted: updatedProfile.profileCompleted } : null))
      }

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
