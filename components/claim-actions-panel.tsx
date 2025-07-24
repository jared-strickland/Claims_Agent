"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, Edit, MessageSquareWarning, Send, ShieldCheck, Wrench, MessageSquareReply, Pencil } from "lucide-react"
import type { ClaimData, UserRole } from "@/lib/types"

// Main Panel Component
export function ClaimActionsPanel({
  claimData,
  userRole,
  onReviewSubmit,
  onSetIsEditable,
  onAgentApprove,
  onCloseCase,
  onAgentResubmit,
  onRouteToShop,
  onAcceptJob,
  onCompleteRepair,
  onReturnJob,
  onAddNote,
}: {
  claimData: ClaimData
  userRole: UserRole
  onReviewSubmit: (action: "approve" | "edit" | "requestInfo", payload: { note: string; requestNote?: string }) => void
  onSetIsEditable: (isEditable: boolean) => void
  onAgentApprove: (note: string) => void
  onCloseCase: (note: string) => void
  onAgentResubmit: (note: string) => void
  onRouteToShop: (note: string) => void
  onAcceptJob: (note: string) => void
  onCompleteRepair: (note: string) => void
  onReturnJob: (note: string) => void
  onAddNote: (note: string) => void
}) {
  const [note, setNote] = useState("")
  const [action, setAction] = useState<"approve" | "edit" | "requestInfo">("approve")
  const [requestNote, setRequestNote] = useState("")
  const [returnNote, setReturnNote] = useState("")
  const [showReturnForm, setShowReturnForm] = useState(false)

  const canAddNote = !["Claim Closed"].includes(claimData.status)

  useEffect(() => {
    onSetIsEditable(action === "edit")
  }, [action, onSetIsEditable])

  const handleReturnClick = () => {
    if (showReturnForm && returnNote.trim()) {
      onReturnJob(returnNote)
      setShowReturnForm(false)
      setReturnNote("")
    } else {
      setShowReturnForm(true)
    }
  }

  const isSubmitDisabled = () => {
    if (action === "edit" && note.trim() === "") return true
    if (action === "requestInfo" && requestNote.trim() === "") return true
    return false
  }

  const getButtonText = () => {
    switch (action) {
      case "edit":
        return "Resubmit Estimate"
      case "requestInfo":
        return "Return to Agent"
      default:
        return "Submit Review"
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitDisabled()) return
    onReviewSubmit(action, { note, requestNote })
  }

  if (userRole === "agent") {
    const renderContent = () => {
      switch (claimData.status) {
        case "AI Estimate Suggested":
          return (
            <div className="space-y-3">
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                Review the AI estimate and forward to an adjuster for final approval.
              </p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an optional note for the adjuster..."
              />
              <Button
                onClick={() => {
                  onAgentApprove(note)
                  setNote("")
                }}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Forward to Adjuster
              </Button>
            </div>
          )
        case "Returned to Agent":
          return (
            <div className="space-y-3">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                  <MessageSquareWarning className="h-5 w-5" />
                  <span>Action Required</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 my-2">
                  An adjuster has returned this claim with the following request:
                </p>
                <p className="text-sm font-semibold italic bg-slate-100 dark:bg-slate-800/50 p-2 rounded-md">
                  "{claimData.returnDetails?.note}"
                </p>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a response note for the adjuster..."
              />
              <Button
                onClick={() => {
                  onAgentResubmit(note)
                  setNote("")
                }}
                className="w-full"
              >
                Resubmit to Adjuster
              </Button>
            </div>
          )
        case "Adjustor Approved":
          return (
            <div className="space-y-3">
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                The estimate is approved. Route it to the designated repair shop.
              </p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an optional note for the repair shop..."
              />
              <Button
                onClick={() => {
                  onRouteToShop(note)
                  setNote("")
                }}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Route to Repair Shop
              </Button>
            </div>
          )
        case "Repair Complete":
          return (
            <div className="space-y-3">
              <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                The repair is complete. You can now close this claim.
              </p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add final closing notes..."
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Close Case
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white text-slate-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                      This action will mark the claim as resolved and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onCloseCase(note)
                        setNote("")
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Confirm & Close Claim
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        default:
          return (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (note.trim()) {
                  onAddNote(note)
                  setNote("")
                }
              }}
              className="space-y-2"
            >
              <Label htmlFor="agent-note">Add Note</Label>
              <Textarea
                id="agent-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note to the claim history..."
              />
              <Button type="submit" disabled={!note.trim()} className="w-full">
                <Pencil className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </form>
          )
      }
    }

    return (
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-900/50">
        <CardHeader>
          <CardTitle className="text-base text-slate-800 dark:text-slate-200">Agent Actions</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    )
  }

  if (userRole === "adjuster") {
    if (claimData.status === "Pending Adjuster Review" || claimData.status === "Returned by Repair Shop") {
      return (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle className="text-base text-slate-800 dark:text-slate-200">Adjuster Review Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <RadioGroup value={action} onValueChange={(value) => setAction(value as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve" className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-green-600" /> Approve Estimate & Route Claim
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="flex items-center gap-2 font-medium">
                    <Edit className="w-4 h-4 text-orange-500" /> Edit Estimate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="requestInfo" id="requestInfo" />
                  <Label htmlFor="requestInfo" className="flex items-center gap-2 font-medium">
                    <MessageSquareWarning className="w-4 h-4 text-yellow-600" /> Request More Info
                  </Label>
                </div>
              </RadioGroup>

              {action === "requestInfo" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="request-note" className="font-semibold">
                    Information Request <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="request-note"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="e.g., Please upload a clearer photo of the dent..."
                    className="mt-1"
                  />
                </div>
              )}

              {(action === "approve" || action === "edit") && (
                <div>
                  <Label htmlFor="adjuster-note" className="font-semibold">
                    {action === "approve" ? "Add Adjuster Note (Optional)" : "Add Adjuster Note"}
                    {action !== "approve" && <span className="text-red-500"> *</span>}
                  </Label>
                  <Textarea
                    id="adjuster-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={"e.g., Estimate is consistent..."}
                    className="mt-1"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitDisabled()}>
                {getButtonText()}
              </Button>
            </form>
          </CardContent>
        </Card>
      )
    }
  }

  if (userRole === "repairShop") {
    if (claimData.status === "Routed to Repair Shop" || claimData.status === "Repair In Progress") {
      return (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-green-200 dark:border-green-900/50">
          <CardHeader>
            <CardTitle className="text-base text-slate-800 dark:text-slate-200">Repair Shop Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="shop-note">Add Note (Optional)</Label>
              <Textarea
                id="shop-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the record..."
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    onAcceptJob(note)
                    setNote("")
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Estimate
                </Button>
                <Button
                  onClick={() => {
                    onCompleteRepair(note)
                    setNote("")
                  }}
                  variant="secondary"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Mark Repair Complete
                </Button>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
              <Label>Return Estimate</Label>
              <Textarea
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Provide a reason for returning the estimate (e.g., hidden damage found, parts unavailable)..."
              />
              <Button
                onClick={handleReturnClick}
                variant="outline"
                className="w-full bg-transparent"
                disabled={!returnNote.trim()}
              >
                <MessageSquareReply className="w-4 h-4 mr-2" />
                Submit Return Note
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  // Fallback for roles without specific actions in the current status
  if (!canAddNote) return null

  return (
    <Card className="bg-slate-50 dark:bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-base text-slate-800 dark:text-slate-200">Add Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (note.trim()) {
              onAddNote(note)
              setNote("")
            }
          }}
          className="space-y-2"
        >
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to the claim history..."
          />
          <Button type="submit" disabled={!note.trim()} className="w-full">
            <Pencil className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
