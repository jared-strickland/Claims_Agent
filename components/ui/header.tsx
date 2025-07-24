import type React from "react"
export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex-shrink-0 flex items-center h-16 px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      {children}
    </header>
  )
}
