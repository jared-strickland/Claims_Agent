"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import type { ClaimData } from "@/lib/types"

export function ClaimDashboardPanel({
  claimData,
  setClaimData,
}: {
  claimData: ClaimData
  setClaimData: React.Dispatch<React.SetStateAction<ClaimData>>
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setClaimData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <Card>
          <CardHeader>
            <CardTitle>Claim Info</CardTitle>
          </CardHeader>{" "}
          {/* Corrected JSX closing tag */}
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Claim ID: {claimData.id}</span>
              <Badge variant={claimData.status === "In Triage" ? "default" : "secondary"}>{claimData.status}</Badge>
            </div>
            <div className="space-y-1">
              <Label htmlFor="policyholder">Policyholder</Label>
              <Input id="policyholder" value={claimData.policyholder} onChange={handleInputChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="incidentDate">Date of Incident</Label>
              <Input id="incidentDate" type="date" value={claimData.incidentDate} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incident Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="incidentDescription"
              value={claimData.incidentDescription}
              onChange={handleInputChange}
              rows={5}
              placeholder="Description from the chat will appear here..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Damage Photos</CardTitle>
          </CardHeader>
          <CardContent>
            {claimData.damagePhotos.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {claimData.damagePhotos.map((photo, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="aspect-square rounded-md overflow-hidden cursor-pointer">
                        <Image
                          src={photo.url || "/placeholder.svg"}
                          alt={photo.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.name}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No photos uploaded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Damage Type:</strong>{" "}
              <span className="text-blue-600 dark:text-blue-400">{claimData.aiAssessment.damageType}</span>
            </p>
            <p>
              <strong>Estimated Cost:</strong>{" "}
              <span className="text-blue-600 dark:text-blue-400">{claimData.aiAssessment.estimatedCost}</span>
            </p>
            <div>
              <strong>Flags:</strong>
              {claimData.aiAssessment.flags.length > 0 ? (
                <ul className="list-disc list-inside">
                  {claimData.aiAssessment.flags.map((flag, i) => (
                    <li key={i} className="text-blue-600 dark:text-blue-400">
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500"> None</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Escalate to Adjuster</Button>
            <Button variant="secondary">Forward to Partner</Button>
            <Button variant="outline">Mark as Complete</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
              {claimData.timeline.map((event, index) => (
                <div key={event.id} className="relative mb-6">
                  <div className="absolute -left-[34px] top-1 h-6 w-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <event.icon className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{event.timestamp}</p>
                  <h4 className="font-semibold text-sm">{event.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
