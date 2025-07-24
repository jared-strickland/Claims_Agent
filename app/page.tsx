"use client"

import { useState, useCallback } from "react"
import { nanoid } from "nanoid"
import { AiChatPanel, script } from "@/components/ai-chat-panel"
import { ClaimReportPanel } from "@/components/claim-report-panel"
import { Header } from "@/components/header"
import type { ClaimData, UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"

const blankClaimData: ClaimData = {
  id: "CL-CAZ8WZEF",
  policyholder: "",
  incidentDate: "",
  location: "",
  status: "Claim Created",
  vehicleInfo: { makeModel: "", vin: "", licensePlate: "" },
  incidentDescription: "",
  damagePhotos: [],
  aiAssessment: {
    incidentType: "",
    vehicleStatus: "",
    damageArea: "",
    damageDescription: "",
    suggestedRepair: "",
    repairMatchConfidence: 0,
    notes: "",
    reference: "",
    justification: [],
    matchedGuidance: [],
  },
  estimate: {
    parts: [],
    labor: { body: { hours: 0, rate: 95 }, paint: { hours: 0, rate: 95 } },
    materials: { paint: { hours: 0, rate: 45 } },
    total: 0,
    notes: "",
    watermark: "",
  },
  repairRouting: { shopName: "", routingStatus: "Not Yet Routed" },
  adjusterNote: "",
  history: [],
}

export default function DashboardPage() {
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [claimData, setClaimData] = useState<ClaimData>(blankClaimData)
  const [userRole, setUserRole] = useState<UserRole>("agent")
  const [isEstimateEditable, setIsEstimateEditable] = useState(false)
  const [selectedGuidanceIndex, setSelectedGuidanceIndex] = useState<number | null>(null)

  const addHistoryEvent = (action: string, role: UserRole | "AI", user: string, notes?: string) => {
    if (notes && notes.trim() === "") {
      notes = undefined
    }
    setClaimData((prev) => ({
      ...prev,
      history: [...prev.history, { id: nanoid(), timestamp: new Date().toISOString(), action, role, user, notes }].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    }))
  }

  const handleScriptNavigate = useCallback(
    (newStepIndex: number) => {
      let updatedData = { ...blankClaimData, id: claimData.id }
      const historyToAdd: any[] = []
      let guidanceAvailable = false

      for (let i = 0; i <= newStepIndex; i++) {
        const step = script[i]
        if (step && step.update) {
          const { history, aiAssessment, estimate, vehicleInfo, repairRouting, ...restOfUpdate } = step.update
          if (history) historyToAdd.push(...history)

          updatedData = {
            ...updatedData,
            ...restOfUpdate,
            vehicleInfo: { ...updatedData.vehicleInfo, ...vehicleInfo },
            aiAssessment: { ...updatedData.aiAssessment, ...aiAssessment },
            estimate: { ...updatedData.estimate, ...estimate },
            repairRouting: { ...updatedData.repairRouting, ...repairRouting },
          }

          if (aiAssessment?.matchedGuidance?.length) {
            guidanceAvailable = true
          }
        }
      }

      setClaimData({
        ...updatedData,
        history: [...blankClaimData.history, ...historyToAdd].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
      })

      if (guidanceAvailable) {
        setSelectedGuidanceIndex(0) // Default to the primary recommendation
      } else {
        setSelectedGuidanceIndex(null)
      }

      setIsEstimateEditable(false)
    },
    [claimData.id],
  )

  const handleGuidanceSelect = (index: number) => {
    const selectedGuidance = claimData.aiAssessment.matchedGuidance[index]
    if (!selectedGuidance || !selectedGuidance.estimate) return

    setSelectedGuidanceIndex(index)

    setClaimData((prev) => ({
      ...prev,
      estimate: selectedGuidance.estimate,
      aiAssessment: {
        ...prev.aiAssessment,
        suggestedRepair: selectedGuidance.repairType,
        repairMatchConfidence: selectedGuidance.similarity,
      },
    }))

    const userMap = {
      agent: "Alex Chen, Agent",
      adjuster: "Jane Mitchell, Adjuster",
      repairShop: "Rivera Auto Body",
    }
    addHistoryEvent(`Selected repair option: "${selectedGuidance.repairType}"`, userRole, userMap[userRole])
  }

  const handleEstimateChange = (type: "labor" | "materials", subtype: "body" | "paint", value: string) => {
    setClaimData((prev) => {
      const newEstimate = { ...prev.estimate }
      if (type === "labor") {
        newEstimate.labor[subtype].hours = Number(value) || 0
        if (subtype === "paint") {
          newEstimate.materials.paint.hours = Number(value) || 0
        }
      }
      const bodyLaborCost = newEstimate.labor.body.hours * newEstimate.labor.body.rate
      const paintLaborCost = newEstimate.labor.paint.hours * newEstimate.labor.paint.rate
      const materialsCost = newEstimate.materials.paint.hours * newEstimate.materials.paint.rate
      newEstimate.total = bodyLaborCost + paintLaborCost + materialsCost
      return { ...prev, estimate: newEstimate }
    })
  }

  const handleAgentApprove = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Pending Adjuster Review" }))
    addHistoryEvent("Forwarded to Adjuster", "agent", "Alex Chen, Agent", note)
    setUserRole("adjuster")
  }

  const handleAgentResubmit = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Pending Adjuster Review" }))
    addHistoryEvent("Re-submitted to Adjuster", "agent", "Alex Chen, Agent", note)
    setUserRole("adjuster")
  }

  const handleReviewSubmit = (
    action: "approve" | "edit" | "requestInfo",
    payload: { note: string; requestNote?: string },
  ) => {
    const today = new Date().toLocaleDateString()
    const adjusterName = "Jane Mitchell, Adjuster"
    switch (action) {
      case "approve":
        setClaimData((prev) => ({
          ...prev,
          status: "Adjustor Approved",
          adjusterNote: payload.note,
          adjusterApproval: { name: adjusterName, date: today, type: "Approved" },
        }))
        addHistoryEvent("Estimate Approved", "adjuster", adjusterName, payload.note)
        break
      case "edit":
        setClaimData((prev) => ({
          ...prev,
          status: "Estimate Revised by Adjuster",
          adjusterNote: payload.note,
          adjusterApproval: { name: adjusterName, date: today, type: "Revised" },
        }))
        addHistoryEvent("Estimate Edited", "adjuster", adjusterName, payload.note)
        setIsEstimateEditable(false)
        break
      case "requestInfo":
        setClaimData((prev) => ({
          ...prev,
          status: "Returned to Agent",
          returnDetails: { note: payload.requestNote!, date: today },
        }))
        addHistoryEvent("Returned for Information", "adjuster", adjusterName, payload.requestNote)
        break
    }
    setUserRole("agent")
  }

  const handleCloseCase = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Claim Closed" }))
    addHistoryEvent("Claim Closed", "agent", "Alex Chen, Agent", note)
  }

  const handleRouteToShop = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Routed to Repair Shop" }))
    addHistoryEvent("Routed to Repair Shop", "agent", "Alex Chen, Agent", note)
    setUserRole("repairShop")
  }

  const handleAcceptJob = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Repair In Progress" }))
    addHistoryEvent("Job Accepted by Repair Shop", "repairShop", "Rivera Auto Body", note)
  }

  const handleCompleteRepair = (note: string) => {
    setClaimData((prev) => ({ ...prev, status: "Repair Complete" }))
    addHistoryEvent("Repair Marked as Complete", "repairShop", "Rivera Auto Body", note)
    setUserRole("agent")
  }

  const handleReturnJob = (note: string) => {
    setClaimData((prev) => ({
      ...prev,
      status: "Returned by Repair Shop",
      shopReturnDetails: { note, date: new Date().toISOString() },
    }))
    addHistoryEvent("Estimate Returned by Shop", "repairShop", "Rivera Auto Body", note)
    setUserRole("adjuster")
  }

  const handleAddNote = (note: string) => {
    const userMap = {
      agent: "Alex Chen, Agent",
      adjuster: "Jane Mitchell, Adjuster",
      repairShop: "Rivera Auto Body",
    }
    addHistoryEvent("Note Added", userRole, userMap[userRole], note)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950">
      <Header isChatCollapsed={isChatCollapsed} onToggle={() => setIsChatCollapsed(!isChatCollapsed)}>
        {/* The ToggleGroup has been removed from here */}
      </Header>
      <main className="flex-1 flex overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 no-print",
            isChatCollapsed ? "w-0 p-0" : "w-full lg:w-[450px] p-4",
            "hidden lg:flex overflow-hidden",
          )}
        >
          {!isChatCollapsed && <AiChatPanel onScriptNavigate={handleScriptNavigate} />}
        </div>
        <div className="flex-1 h-full overflow-y-auto">
          <ClaimReportPanel
            claimData={claimData}
            isChatCollapsed={isChatCollapsed}
            userRole={userRole}
            onReviewSubmit={handleReviewSubmit}
            isEstimateEditable={isEstimateEditable}
            onEstimateChange={handleEstimateChange}
            onSetIsEditable={setIsEstimateEditable}
            onAgentApprove={handleAgentApprove}
            onCloseCase={handleCloseCase}
            onAgentResubmit={handleAgentResubmit}
            onRouteToShop={handleRouteToShop}
            onAcceptJob={handleAcceptJob}
            onCompleteRepair={handleCompleteRepair}
            onReturnJob={handleReturnJob}
            onAddNote={handleAddNote}
            selectedGuidanceIndex={selectedGuidanceIndex}
            onGuidanceSelect={handleGuidanceSelect}
          />
        </div>
      </main>
    </div>
  )
}
