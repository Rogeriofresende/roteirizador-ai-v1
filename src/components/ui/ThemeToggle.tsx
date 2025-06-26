"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/Button"

export function useTheme() {
  const [theme, setTheme] = React.useState<"theme-light" | "dark">("theme-light")
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    const storedTheme = localStorage.getItem("vite-ui-theme")
    if (storedTheme === "dark" || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark")
    }
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      document.body.classList.remove("theme-light", "dark")
      document.body.classList.add(theme)
      localStorage.setItem("vite-ui-theme", theme)
    }
  }, [theme, isMounted])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "dark" ? "theme-light" : "dark"))
  }

  return { theme, toggleTheme, isMounted }
}

export function ThemeToggle() {
  const { toggleTheme, theme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 