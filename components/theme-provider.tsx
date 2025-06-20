"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme =
  | "light"
  | "dark"
  | "blue-light"
  | "blue-dark"
  | "purple-light"
  | "purple-dark"
  | "green-light"
  | "green-dark"
  | "orange-light"
  | "orange-dark"
  | "rose-light"
  | "rose-dark"
  | "slate-light"
  | "slate-dark"

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as Theme
    if (
      savedTheme &&
      [
        "light",
        "dark",
        "blue-light",
        "blue-dark",
        "purple-light",
        "purple-dark",
        "green-light",
        "green-dark",
        "orange-light",
        "orange-dark",
        "rose-light",
        "rose-dark",
        "slate-light",
        "slate-dark",
      ].includes(savedTheme)
    ) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove(
      "light",
      "dark",
      "blue-light",
      "blue-dark",
      "purple-light",
      "purple-dark",
      "green-light",
      "green-dark",
      "orange-light",
      "orange-dark",
      "rose-light",
      "rose-dark",
      "slate-light",
      "slate-dark",
    )
    root.classList.add(theme)

    // Save theme to localStorage
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const value = {
    theme,
    setTheme,
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
