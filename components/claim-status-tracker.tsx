"use client"

import type React from "react"

import {
  CheckCircle,
  CircleDot,
  Wrench,
  Search,
  FileCheck,
  Pencil,
  MessageSquareWarning,
  MessageSquareReply,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClaimStatus } from "@/lib/types"

// The 5 main visual stages of the claim lifecycle
const stages: { name: string; icon: React.ElementType }[] = [
  { name: "Claim Created", icon: CircleDot },
  { name: "AI Estimate", icon: FileCheck },
  { name: "Adjuster Approval", icon: Search },
  { name: "Repair", icon: Wrench },
  { name: "Claim Closed", icon: CheckCircle },
]

// Maps each specific status to the index of the VISUAL stage it corresponds to.
// This determines which stage is "active".
const statusToIndexMap: Record<ClaimStatus, number> = {
  "Claim Created": 0,
  "AI Estimate Suggested": 1,
  "Returned to Agent": 1,
  "Pending Adjuster Review": 2,
  "Estimate Revised by Adjuster": 2,
  "Returned by Repair Shop": 2,
  "Adjustor Approved": 2, // Changed from 3 to 2
  "Routed to Repair Shop": 3,
  "Repair In Progress": 3,
  // When repair is complete, the next action is to close the claim. So the "Claim Closed" stage becomes active.
  "Repair Complete": 4,
  "Claim Closed": 4,
}

// Overrides the default stage label/icon for a specific status to provide more detail.
const statusDisplayOverride: Partial<Record<ClaimStatus, { name: string; icon: React.ElementType }>> = {
  "AI Estimate Suggested": { name: "AI Estimate Suggested", icon: FileCheck },
  "Estimate Revised by Adjuster": { name: "Estimate Revised", icon: Pencil },
  "Returned to Agent": { name: "Returned to Agent", icon: MessageSquareWarning },
  "Returned by Repair Shop": { name: "Returned by Shop", icon: MessageSquareReply },
  "Adjustor Approved": { name: "Adjuster Approved", icon: CheckCircle },
  "Routed to Repair Shop": { name: "At Repair Shop", icon: Wrench },
  "Repair In Progress": { name: "Repair In Progress", icon: Wrench },
}

export function ClaimStatusTracker({ currentStatus }: { currentStatus: ClaimStatus }) {
  const activeIndex = statusToIndexMap[currentStatus]
  const isFinallyClosed = currentStatus === "Claim Closed"
  const isFuture = (index: number) => index > activeIndex || (isFinallyClosed && index === activeIndex)

  return (
    <div className="flex items-center justify-between w-full">
      {stages.map((stage, index) => {
        const isCompleted = index < activeIndex || (isFinallyClosed && index === activeIndex)
        const isCurrent = index === activeIndex && !isFinallyClosed

        // Determine the correct label and icon for the current state
        let display = { ...stage }
        if (isCurrent && statusDisplayOverride[currentStatus]) {
          display = { ...stage, ...statusDisplayOverride[currentStatus] }
        }
        // Special case: When the active step is "Claim Closed" because the repair is complete,
        // we want to show "Repair Complete" on the previous (now completed) step.
        if (currentStatus === "Repair Complete" && index === 3) {
          display = { name: "Repair Complete", icon: CheckCircle }
        }

        const Icon = display.icon

        return (
          <div key={stage.name} className="flex items-center w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted ? "bg-blue-600 border-blue-600 text-white" : "",
                  isCurrent ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100 dark:ring-blue-500/20" : "",
                  isFuture(index)
                    ? "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                    : "",
                  // Special coloring for certain statuses when they are the current step
                  isCurrent &&
                    (currentStatus === "Estimate Revised by Adjuster"
                      ? "border-yellow-500 text-yellow-500 ring-yellow-100 dark:ring-yellow-500/20"
                      : currentStatus === "Returned to Agent"
                        ? "border-orange-500 text-orange-500 ring-orange-100 dark:ring-orange-500/20"
                        : currentStatus === "Returned by Repair Shop"
                          ? "border-purple-500 text-purple-500 ring-purple-100 dark:ring-purple-500/20"
                          : ""),
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p
                className={cn(
                  "text-xs mt-2 text-center w-24",
                  isFuture(index)
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-300 font-medium",
                )}
              >
                {display.name}
              </p>
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 transition-all",
                  isCompleted ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
