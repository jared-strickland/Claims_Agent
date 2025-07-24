"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { PanelLeftClose, PanelRightClose } from "lucide-react"

export function Header({
  isChatCollapsed,
  onToggle,
  children,
}: {
  isChatCollapsed: boolean
  onToggle: () => void
  children?: React.ReactNode
}) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 no-print">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
          {isChatCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>
      {children}
    </header>
  )
}
