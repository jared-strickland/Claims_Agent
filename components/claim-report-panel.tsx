"use client"

import type React from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Download,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  Wrench,
  History,
  User,
  UserCheck,
  Bot,
  FileText,
  Car,
  ClipboardList,
} from "lucide-react"
import type { ClaimData, MatchedGuidance, UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ClaimStatusTracker } from "./claim-status-tracker"
import { ClaimActionsPanel } from "./claim-actions-panel"
import { Input } from "@/components/ui/input"

const Placeholder = ({ text = "Awaiting data..." }: { text?: string }) => (
  <span className="text-slate-400 dark:text-slate-500 italic text-xs">{text}</span>
)

const ReportSection = ({
  title,
  children,
  icon: Icon,
}: {
  title: string
  children: React.ReactNode
  icon?: React.ElementType
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2 print:grid-cols-4">
    <h3 className="md:col-span-1 text-sm font-semibold text-slate-600 dark:text-slate-400 pt-1 print:col-span-1 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {title}
    </h3>
    <div className="md:col-span-3 print:col-span-3">{children}</div>
  </div>
)

const getConfidenceTier = (confidence: number) => {
  if (confidence >= 90) {
    return {
      text: "High Confidence",
      icon: CheckCircle,
      className:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20",
    }
  }
  if (confidence >= 70) {
    return {
      text: "Medium Confidence",
      icon: AlertTriangle,
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20",
    }
  }
  return {
    text: "Low Confidence",
    icon: HelpCircle,
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
  }
}

const MatchedGuidanceCard = ({
  guidance,
  isSelected,
  onClick,
}: {
  guidance: MatchedGuidance
  isSelected: boolean
  onClick: () => void
}) => {
  const cardColorClasses = {
    high: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
    medium: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
    low: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  }
  const iconClasses = {
    high: "text-green-600",
    medium: "text-yellow-600",
    low: "text-red-600",
  }
  const icons = {
    "Primary Recommendation": CheckCircle,
    "Secondary Option": AlertTriangle,
    "Escalation Scenario": HelpCircle,
  }
  const Icon = icons[guidance.type]

  return (
    <button
      onClick={onClick}
      className={cn(
        "border rounded-lg p-3 text-xs w-full text-left transition-all",
        cardColorClasses[guidance.confidence],
        isSelected
          ? "ring-2 ring-blue-400 border-blue-600 dark:border-blue-400"
          : "hover:shadow-md hover:border-slate-400 dark:hover:border-slate-600",
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 font-bold">
          <Icon className={cn("h-4 w-4", iconClasses[guidance.confidence])} />
          <span>{guidance.type}</span>
        </div>
        {isSelected ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
            <CheckCircle className="h-3 w-3" />
            <span>Selected</span>
          </div>
        ) : (
          <Badge variant="outline" className="font-mono text-xs bg-white/50 dark:bg-black/10">
            {guidance.similarity}% Match
          </Badge>
        )}
      </div>
      <p className="font-semibold text-sm my-1">{guidance.repairType}</p>
      <p className="text-slate-600 dark:text-slate-300 mb-2">{guidance.description}</p>
      <div className="text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/10 p-2 rounded-md">
        <p>
          <span className="font-semibold">Source:</span> {guidance.source}
        </p>
        <p>
          <span className="font-semibold">Justification:</span> {guidance.justification}
        </p>
      </div>
    </button>
  )
}

export function ClaimReportPanel({
  claimData,
  isChatCollapsed,
  userRole,
  onReviewSubmit,
  isEstimateEditable,
  onEstimateChange,
  onSetIsEditable,
  onAgentApprove,
  onCloseCase,
  onAgentResubmit,
  onRouteToShop,
  onAcceptJob,
  onCompleteRepair,
  onReturnJob,
  onAddNote,
  selectedGuidanceIndex,
  onGuidanceSelect,
}: {
  claimData: ClaimData
  isChatCollapsed: boolean
  userRole: UserRole
  onReviewSubmit: (
    action: "approve" | "edit" | "requestInfo",
    payload: { note: string; escalationReason?: string; requestNote?: string },
  ) => void
  isEstimateEditable: boolean
  onEstimateChange: (type: "labor" | "materials", subtype: "body" | "paint", value: string) => void
  onSetIsEditable: (isEditable: boolean) => void
  onAgentApprove: (note: string) => void
  onCloseCase: (note: string) => void
  onAgentResubmit: (note: string) => void
  onRouteToShop: (note: string) => void
  onAcceptJob: (note: string) => void
  onCompleteRepair: (note: string) => void
  onReturnJob: (note: string) => void
  onAddNote: (note: string) => void
  selectedGuidanceIndex: number | null
  onGuidanceSelect: (index: number) => void
}) {
  const getStatusClass = (status: typeof claimData.status) => {
    if (status === "Adjustor Approved") {
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20"
    }
    if (status === "Estimate Revised by Adjuster") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20"
    }
    if (status === "Returned to Agent") {
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20"
    }
    if (status === "Repair Complete") {
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20"
    }
    if (status === "Returned by Repair Shop") {
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20"
    }
    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  }

  const bodyLaborCost = claimData.estimate.labor.body.hours * claimData.estimate.labor.body.rate
  const paintLaborCost = claimData.estimate.labor.paint.hours * claimData.estimate.labor.paint.rate
  const materialsCost = claimData.estimate.materials.paint.hours * claimData.estimate.materials.paint.rate

  const confidenceTier = getConfidenceTier(claimData.aiAssessment.repairMatchConfidence)

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById("claimReportCard")
    if (!reportElement) return
    const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: null })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const ratio = canvas.width / canvas.height
    let imgFinalWidth = pdfWidth - 20
    let imgFinalHeight = imgFinalWidth / ratio
    if (imgFinalHeight > pdfHeight - 20) {
      imgFinalHeight = pdfHeight - 20
      imgFinalWidth = imgFinalHeight * ratio
    }
    pdf.addImage(imgData, "PNG", (pdfWidth - imgFinalWidth) / 2, 10, imgFinalWidth, imgFinalHeight)
    pdf.save(`claim-report-${claimData.id}.pdf`)
  }

  return (
    <TooltipProvider>
      <div className={cn("p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 print:bg-white")}>
        <Card className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 no-print">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Claim Status & History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <ClaimStatusTracker currentStatus={claimData.status} />

              {claimData.history.length > 0 && (
                <Collapsible className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group">
                    <History className="h-4 w-4" />
                    <span>View Full Claim History</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    {claimData.history.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 pl-2">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {event.role === "agent" && <User className="h-4 w-4 text-slate-500" />}
                          {event.role === "adjuster" && <UserCheck className="h-4 w-4 text-slate-500" />}
                          {event.role === "repairShop" && <Wrench className="h-4 w-4 text-slate-500" />}
                          {event.role === "AI" && <Bot className="h-4 w-4 text-slate-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {event.action} <span className="text-slate-500 font-normal">by {event.user}</span>
                          </p>
                          <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                          {event.notes && (
                            <p className="text-xs italic text-slate-500 mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                              "{event.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="max-w-4xl mx-auto mb-6 no-print">
          <ClaimActionsPanel
            claimData={claimData}
            userRole={userRole}
            onReviewSubmit={onReviewSubmit}
            onSetIsEditable={onSetIsEditable}
            onAgentApprove={onAgentApprove}
            onCloseCase={onCloseCase}
            onAgentResubmit={onAgentResubmit}
            onRouteToShop={onRouteToShop}
            onAcceptJob={onAcceptJob}
            onCompleteRepair={onCompleteRepair}
            onReturnJob={onReturnJob}
            onAddNote={onAddNote}
          />
        </div>

        <div id="printable-wrapper" className={cn(isChatCollapsed && "printable-area")}>
          <Card
            id="claimReportCard"
            className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none"
          >
            <div className="flex justify-between items-start mb-6 print:mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Claim Report</h2>
                <p className="text-sm text-slate-500">Claim ID: {claimData.id}</p>
              </div>
              <Button
                onClick={handleDownloadPdf}
                size="sm"
                className="rounded-lg bg-blue-600 hover:bg-blue-700 no-print"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            <div className="space-y-8">
              <ReportSection title="Claim Information" icon={FileText}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div />
                    <Badge className={cn("text-xs font-semibold border rounded-lg", getStatusClass(claimData.status))}>
                      {claimData.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Policyholder</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {claimData.policyholder || <Placeholder />}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Date of Incident</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {claimData.incidentDate || <Placeholder />}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Location of Incident</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {claimData.location || <Placeholder />}
                      </p>
                    </div>
                  </div>
                </div>
              </ReportSection>

              <ReportSection title="Vehicle Information" icon={Car}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Make & Model</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {claimData.vehicleInfo.makeModel || <Placeholder />}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">VIN</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {claimData.vehicleInfo.vin || <Placeholder />}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">License Plate</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {claimData.vehicleInfo.licensePlate || <Placeholder />}
                    </p>
                  </div>
                </div>
              </ReportSection>

              <ReportSection title="Incident Description" icon={ClipboardList}>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {claimData.incidentDescription || <Placeholder />}
                </p>
              </ReportSection>

              <ReportSection title="Damage Photos">
                {claimData.damagePhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {claimData.damagePhotos.map((photo, index) => (
                      <div key={index}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Image
                              src={photo.url || "/placeholder.svg"}
                              alt={photo.caption}
                              width={200}
                              height={150}
                              className="rounded-lg object-cover w-full aspect-[4/3] cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl p-2">
                            <Image
                              src={photo.url || "/placeholder.svg"}
                              alt={photo.caption}
                              width={1200}
                              height={800}
                              className="w-full h-auto object-contain rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                        <p className="text-xs text-slate-500 mt-1 truncate">{photo.caption}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Placeholder text="No photos uploaded yet." />
                )}
              </ReportSection>

              {userRole !== "repairShop" && claimData.aiAssessment.suggestedRepair && (
                <ReportSection title="AI Analysis & Estimate" icon={Wrench}>
                  <div className="space-y-4">
                    {claimData.aiAssessment.suggestedRepair ? (
                      <div className="space-y-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span>Repair Match Confidence</span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {claimData.aiAssessment.repairMatchConfidence}%
                                </p>
                                <Badge className={cn("gap-1 font-semibold border text-xs", confidenceTier.className)}>
                                  <confidenceTier.icon className="h-3 w-3" />
                                  {confidenceTier.text}
                                </Badge>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3 bg-slate-900 text-slate-50 border-slate-700">
                            <p className="text-sm leading-relaxed">
                              This score reflects our confidence that the provided images and incident description match
                              the selected repair recommendation. It's determined by comparing the damage against our
                              database of historical repairs and official service manuals.
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="h-8 text-slate-600 text-xs">Item</TableHead>
                                <TableHead className="h-8 text-right text-slate-600 text-xs">Cost</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {claimData.estimate.parts.map((part) => (
                                <TableRow key={part.name}>
                                  <TableCell className="py-1 font-medium text-sm">{part.name}</TableCell>
                                  <TableCell className="py-1 text-right text-sm">${part.cost.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell className="py-1 font-medium text-sm">
                                  Body Labor ({claimData.estimate.labor.body.hours.toFixed(1)} hrs)
                                </TableCell>
                                <TableCell className="py-1 text-right text-sm">
                                  {isEstimateEditable ? (
                                    <Input
                                      type="number"
                                      value={claimData.estimate.labor.body.hours}
                                      onChange={(e) => onEstimateChange("labor", "body", e.target.value)}
                                      className="h-8 text-right"
                                    />
                                  ) : (
                                    `$${bodyLaborCost.toFixed(2)}`
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="py-1 font-medium text-sm">
                                  Paint Labor ({claimData.estimate.labor.paint.hours.toFixed(1)} hrs)
                                </TableCell>
                                <TableCell className="py-1 text-right text-sm">
                                  {isEstimateEditable ? (
                                    <Input
                                      type="number"
                                      value={claimData.estimate.labor.paint.hours}
                                      onChange={(e) => onEstimateChange("labor", "paint", e.target.value)}
                                      className="h-8 text-right"
                                    />
                                  ) : (
                                    `$${paintLaborCost.toFixed(2)}`
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="py-1 font-medium text-sm">
                                  Paint & Materials ({claimData.estimate.materials.paint.hours.toFixed(1)} hrs)
                                </TableCell>
                                <TableCell className="py-1 text-right text-sm">
                                  {`$${materialsCost.toFixed(2)}`}
                                </TableCell>
                              </TableRow>
                              <TableRow className="h-10 font-bold bg-slate-50 dark:bg-slate-800/50">
                                <TableCell className="py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>Total Estimated Cost</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-slate-500 cursor-help" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs p-3 bg-slate-900 text-slate-50 border-slate-700">
                                        <p className="text-sm leading-relaxed">
                                          This estimate combines analysis of the damage photos with industry-standard
                                          repair procedures and uses local labor and parts rates from regional databases
                                          for {claimData.location} to produce a preliminary cost assessment.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2 text-right text-sm">
                                  ${claimData.estimate.total.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <Placeholder />
                    )}

                    {claimData.aiAssessment.matchedGuidance.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Select a Repair Option:
                        </h4>
                        {claimData.aiAssessment.matchedGuidance.map((guidance, index) => (
                          <MatchedGuidanceCard
                            key={guidance.type}
                            guidance={guidance}
                            isSelected={selectedGuidanceIndex === index}
                            onClick={() => onGuidanceSelect(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ReportSection>
              )}

              {userRole === "repairShop" && (
                <ReportSection title="Approved Estimate" icon={Wrench}>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 text-slate-600 text-xs">Item</TableHead>
                          <TableHead className="h-8 text-right text-slate-600 text-xs">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claimData.estimate.parts.map((part) => (
                          <TableRow key={part.name}>
                            <TableCell className="py-1 font-medium text-sm">{part.name}</TableCell>
                            <TableCell className="py-1 text-right text-sm">${part.cost.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="py-1 font-medium text-sm">
                            Body Labor ({claimData.estimate.labor.body.hours.toFixed(1)} hrs)
                          </TableCell>
                          <TableCell className="py-1 text-right text-sm">{`$${bodyLaborCost.toFixed(2)}`}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1 font-medium text-sm">
                            Paint Labor ({claimData.estimate.labor.paint.hours.toFixed(1)} hrs)
                          </TableCell>
                          <TableCell className="py-1 text-right text-sm">{`$${paintLaborCost.toFixed(2)}`}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-1 font-medium text-sm">
                            Paint & Materials ({claimData.estimate.materials.paint.hours.toFixed(1)} hrs)
                          </TableCell>
                          <TableCell className="py-1 text-right text-sm">{`$${materialsCost.toFixed(2)}`}</TableCell>
                        </TableRow>
                        <TableRow className="h-10 font-bold bg-slate-50 dark:bg-slate-800/50">
                          <TableCell className="py-2 text-sm">Total Estimated Cost</TableCell>
                          <TableCell className="py-2 text-right text-sm">
                            ${claimData.estimate.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </ReportSection>
              )}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              <p className="font-semibold">Known Limitations Disclaimer</p>
              <p>
                AI-generated estimates are based on image quality, historical data, and standardized repair guidance.
                Final repair details and costs must be confirmed by a certified repair shop.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
