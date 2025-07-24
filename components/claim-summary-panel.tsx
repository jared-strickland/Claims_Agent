"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { ClaimData } from "@/lib/types"

export function ClaimSummaryPanel({
  claimData,
  onDataChange,
}: {
  claimData: ClaimData
  onDataChange: (data: ClaimData) => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onDataChange({
      ...claimData,
      [e.target.id]: e.target.value,
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Auto-Filled Data</CardTitle>
        <CardDescription>Edit as needed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input id="policyNumber" value={claimData.policyNumber} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="claimantName">Claimant Name</Label>
            <Input id="claimantName" value={claimData.claimantName} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incidentDescription">Incident Description</Label>
            <Textarea id="incidentDescription" value={claimData.incidentDescription} onChange={handleChange} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="damageType">Damage Type</Label>
            <Input id="damageType" value={claimData.damageType} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input id="incidentDate" type="date" value={claimData.incidentDate} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidentTime">Incident Time</Label>
              <Input id="incidentTime" type="time" value={claimData.incidentTime} onChange={handleChange} />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit Claim</Button>
      </CardFooter>
    </Card>
  )
}
