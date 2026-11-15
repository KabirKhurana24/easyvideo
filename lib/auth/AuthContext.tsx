"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Organization } from "@/types";
import { DUMMY_USERS, DUMMY_ORGANIZATIONS, DemoUser } from "@/lib/data/seededUsers";

interface AuthContextType {
  user: DemoUser | null;
  organization: Organization;
  isAuthenticated: boolean;
  loginAs: (user: DemoUser) => void;
  loginWithEmail: (email: string, password?: string) => { success: boolean; error?: string };
  signupWithEmail: (
    fullName: string,
    email: string,
    password?: string,
    role?: "admin" | "editor" | "reviewer"
  ) => { success: boolean; error?: string };
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  isAdmin: boolean;
  isEditor: boolean;
  isReviewer: boolean;
  canPublish: boolean;
  canEditScenes: boolean;
  canApproveQA: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "easyvideo_auth_user_id";
const STORAGE_KEY_ORG = "easyvideo_auth_org_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start unauthenticated so application opens with Login / Signup & Demo selection view
  const [user, setUser] = useState<DemoUser | null>(null);
  const [organization, setOrganization] = useState<Organization>(DUMMY_ORGANIZATIONS[0]);

  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEY_USER);
      const savedOrgId = localStorage.getItem(STORAGE_KEY_ORG);

      if (savedUserId === "logged_out") {
        setUser(null);
      } else if (savedUserId) {
        const foundUser = DUMMY_USERS.find((u) => u.id === savedUserId);
        if (foundUser) {
          setUser(foundUser);
        }
      }

      if (savedOrgId) {
        const foundOrg = DUMMY_ORGANIZATIONS.find((o) => o.id === savedOrgId);
        if (foundOrg) setOrganization(foundOrg);
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
  }, []);

  const loginAs = (demoUser: DemoUser) => {
    setUser(demoUser);
    try {
      localStorage.setItem(STORAGE_KEY_USER, demoUser.id);
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  };

  const loginWithEmail = (email: string, _password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Please enter an email address." };
    }

    // Check if matching any demo user
    const matched = DUMMY_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      loginAs(matched);
      return { success: true };
    }

    // Allow custom email login as an admin / editor
    const namePart = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName = namePart
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Demo User";

    const customUser: DemoUser = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      fullName: formattedName,
      role: "admin",
      avatarUrl: formattedName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "DU",
      title: "Content Director",
      department: "Learning & Development",
      organizationId: organization.id,
      description: "Custom authenticated user with full administrative privileges.",
    };

    loginAs(customUser);
    return { success: true };
  };

  const signupWithEmail = (
    fullName: string,
    email: string,
    _password?: string,
    role: "admin" | "editor" | "reviewer" = "editor"
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    if (!cleanEmail) {
      return { success: false, error: "Please enter an email address." };
    }

    const initials = cleanName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "DU";

    const newUser: DemoUser = {
      id: `user_${Date.now()}`,
      email: cleanEmail,
      fullName: cleanName,
      role: role,
      avatarUrl: initials,
      title: role === "admin" ? "Director of Learning" : role === "editor" ? "Instructional Designer" : "QA Reviewer",
      department: "Learning & Development",
      organizationId: organization.id,
      description: `Authenticated ${role} user account.`,
    };

    loginAs(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.setItem(STORAGE_KEY_USER, "logged_out");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
  };

  const switchOrganization = (orgId: string) => {
    const foundOrg = DUMMY_ORGANIZATIONS.find((o) => o.id === orgId);
    if (foundOrg) {
      setOrganization(foundOrg);
      try {
        localStorage.setItem(STORAGE_KEY_ORG, orgId);
      } catch (e) {
        console.warn("Could not write to localStorage:", e);
      }
    }
  };

  const role = user?.role || "admin";
  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const isReviewer = role === "reviewer";

  const canPublish = isAdmin;
  const canEditScenes = isAdmin || isEditor;
  const canApproveQA = isAdmin || isReviewer;

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        loginAs,
        loginWithEmail,
        signupWithEmail,
        logout,
        switchOrganization,
        isAdmin,
        isEditor,
        isReviewer,
        canPublish,
        canEditScenes,
        canApproveQA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
